import os
import random
import tempfile
import time

import numpy as np
import pyttsx3
import scipy
from pydub import AudioSegment, effects
from scipy.io.wavfile import write

SAMPLE_RATE = 44100
DURATION = 180  # seconds


def norm(audio):
    return audio / np.max(np.abs(audio))


# 1. Shrill 2–4kHz spike tones (pain reflex zone)
def pain_spike():
    t = np.linspace(0, DURATION, int(SAMPLE_RATE * DURATION), endpoint=False)
    tones = sum(np.sin(2 * np.pi * f * t + np.random.rand()) for f in [2200, 3000, 4200])
    envelope = scipy.signal.sawtooth(2 * np.pi * 0.3 * t)
    return norm(tones * envelope) * 0.6


# 2. Panning oscillation
def vestibular_disruption():
    t = np.linspace(0, DURATION, int(SAMPLE_RATE * DURATION), endpoint=False)
    base = np.sin(2 * np.pi * 400 * t)
    pan = np.sin(2 * np.pi * 0.25 * t)  # slow panning
    left = base * (1 + pan) * 0.5
    right = base * (1 - pan) * 0.5
    return np.stack((left, right), axis=-1) * 0.6


# 3. Repeating glitch burst
def glitch_loop():
    burst = np.random.randn(2048) * scipy.signal.windows.hann(2048)
    repeated = np.tile(burst, int((SAMPLE_RATE * DURATION) / len(burst)))
    return norm(repeated[:int(SAMPLE_RATE * DURATION)]) * 0.4


# 4. Fake alarm pulse (modulated resonance)
def alarm_pulse():
    t = np.linspace(0, DURATION, int(SAMPLE_RATE * DURATION), endpoint=False)
    mod = (np.sin(2 * np.pi * 0.5 * t) > 0).astype(float)
    pulse = np.sin(2 * np.pi * 1000 * t) * mod
    return norm(pulse) * 0.5


# 5. Background rising hiss (fake tinnitus)
def tinnitus_rise():
    t = np.linspace(0, DURATION, int(SAMPLE_RATE * DURATION), endpoint=False)
    noise = np.random.randn(len(t)) * 0.05
    ramp = np.linspace(0, 1, len(t)) ** 2
    return noise * ramp


# 6. Sudden jarring clicks
def aggression_clicks():
    track = np.zeros(int(SAMPLE_RATE * DURATION))
    for i in range(0, len(track), SAMPLE_RATE // 10):
        if np.random.rand() > 0.3:
            track[i: i + 100] = np.random.uniform(-1, 1, 100)
    return track * 0.8


def generate_sine_wave(freq, duration, volume=1.0):
    t = np.linspace(0, duration, int(SAMPLE_RATE * duration), False)
    wave = np.sin(2 * np.pi * freq * t) * volume
    return wave.astype(np.float32)


def generate_unsettling_dissonance():
    freqs = [110, 113.5, 117.1, 99.3]  # Slight detuning causes brain stress
    layers = [generate_sine_wave(f, DURATION, 0.1) for f in freqs]
    return mix_tracks(*layers)


def generate_dissonant_waves():
    t = np.linspace(0, DURATION, int(SAMPLE_RATE * DURATION), False)
    base = np.sin(2 * np.pi * 220 * t)
    clash = np.sin(2 * np.pi * 233.08 * t)  # Minor second = dissonance
    return ((base + clash) * 0.1).astype(np.float32)


def generate_formant_ghosts():
    base = np.random.uniform(-0.2, 0.2, int(SAMPLE_RATE * DURATION))
    smoothed = np.convolve(base, np.ones(5000) / 5000, mode='same')
    return smoothed[::-1] * 0.3


def apply_echo(track, delay_time=0.3, decay=0.4):
    echo_samples = int(SAMPLE_RATE * delay_time)
    echo = np.zeros(len(track) + echo_samples)
    echo[:len(track)] += track
    echo[echo_samples:] += track * decay
    return echo[:len(track)]


def insert_random_dropouts(track, count=50):
    for _ in range(count):
        start = random.randint(0, len(track) - SAMPLE_RATE / 10)
        track[start:start + SAMPLE_RATE / 20] *= random.uniform(0.01, 0.1)
    return track


def generate_infrasound():
    return generate_sine_wave(18, DURATION, 0.2)


def generate_binaural(freq_left, freq_right):
    t = np.linspace(0, DURATION, int(SAMPLE_RATE * DURATION), False)
    left = np.sin(2 * np.pi * freq_left * t)
    right = np.sin(2 * np.pi * freq_right * t)
    return (np.array([left, right]).T * 0.2).astype(np.float32)


def generate_heartbeat():
    beat = np.concatenate([
        generate_sine_wave(40, 0.08, 0.9),
        np.zeros(int(SAMPLE_RATE * 0.3)),
        generate_sine_wave(40, 0.05, 0.6),
        np.zeros(int(SAMPLE_RATE * 1.5))
    ])
    beats = np.tile(beat, int(DURATION / 2))
    return beats[:int(SAMPLE_RATE * DURATION)]


def generate_reverse_whispers():
    whispers_ = np.random.uniform(-0.1, 0.1, int(SAMPLE_RATE * DURATION))
    whispers_ = np.convolve(whispers_, np.ones(1000) / 1000, mode='same')
    return whispers_[::-1]


def generate_glitches():
    glitches_ = np.zeros(int(SAMPLE_RATE * DURATION))
    for _ in range(200):
        start = random.randint(0, len(glitches_) - 100)
        glitches_[start:start + 100] = np.random.uniform(-1, 1, 100) * 0.4
    return glitches_


def generate_phantom_voice_layer():
    raw_noise = np.random.uniform(-1, 1, int(SAMPLE_RATE * DURATION))
    modulator = np.sin(2 * np.pi * 3.7 * np.linspace(0, DURATION, int(SAMPLE_RATE * DURATION)))  # creepy slow LFO
    blurred = np.convolve(raw_noise * modulator, np.ones(4000) / 4000, mode='same')
    whispered_form = blurred * np.random.choice([1, -1], size=blurred.shape) * 0.2
    return whispered_form.astype(np.float32)


def generate_guilt_rhythm():
    base_beat = np.concatenate([
        generate_sine_wave(45, 0.09, 0.9),
        np.zeros(int(SAMPLE_RATE * 0.3)),
        generate_sine_wave(46, 0.05, 0.6),
        np.zeros(int(SAMPLE_RATE * 1.2))
    ])
    # Slight tempo variation every few seconds
    pulses = []
    for _ in range(int(DURATION / 2.5)):
        offset = random.uniform(0.95, 1.05)
        stretched = np.interp(np.linspace(0, len(base_beat), int(len(base_beat) * offset)), np.arange(len(base_beat)),
                              base_beat)
        pulses.append(stretched)
    track = np.concatenate(pulses)
    return track[:int(SAMPLE_RATE * DURATION)]


def generate_low_static_presence():
    white = np.random.normal(0, 0.03, int(SAMPLE_RATE * DURATION))
    lowpass = np.convolve(white, np.ones(3000) / 3000, mode='same')  # smooth into nothing
    presence = lowpass + generate_sine_wave(0.1, DURATION, 0.05)  # inaudible 0.1Hz LFO modulates feeling
    return presence.astype(np.float32)


def generate_mimicry_loop(track):
    clone = np.copy(track)
    chunk_size = SAMPLE_RATE * 2
    for _ in range(15):
        start = random.randint(0, len(track) - int(chunk_size))
        insert_point = random.randint(0, len(track) - int(chunk_size))
        clone[insert_point:insert_point + int(chunk_size // 2)] += track[start:start + int(chunk_size // 2)] * 0.4
    return clone


def generate_spectral_teeth():
    num_teeth = 120
    length = int(SAMPLE_RATE * DURATION)
    noise = np.zeros(length)
    for _ in range(num_teeth):
        start = random.randint(0, length - 200)
        freq = random.randint(8000, 16000)  # painful range
        tone = generate_sine_wave(freq, 0.01, 0.8)
        noise[start:start + len(tone)] += tone
    return noise


def summon_pain(existing_track):
    phantom = generate_phantom_voice_layer()
    guilt = generate_guilt_rhythm()
    static = generate_low_static_presence()
    teeth = generate_spectral_teeth()
    mimic = generate_mimicry_loop(existing_track)
    return mix_tracks(existing_track, phantom, guilt, static, teeth, mimic)


def mix_tracks(*tracks):
    length = max(len(t) for t in tracks)
    mix = np.zeros(length)
    for t in tracks:
        mix[:len(t)] += t
    return normalize(mix)


def normalize(audio):
    max_val = np.max(np.abs(audio))
    return (audio / max_val) if max_val > 0 else audio


def generate_synthetic_baby_cry():
    cry = np.zeros(int(SAMPLE_RATE * DURATION))
    for i in range(0, len(cry), int(SAMPLE_RATE * 0.7)):
        burst = generate_sine_wave(np.random.uniform(400, 600), 0.2, 0.9)
        burst *= np.hanning(len(burst))
        end = min(i + len(burst), len(cry))
        cry[i:end] += burst[:end - i]
    return normalize(cry)


def generate_reversed_disjointed_tts():
    phrases = [
        "It's watching.",
        "They are inside.",
        "No one is listening.",
        "You forgot something.",
        "They lied to you."
    ]
    combined = AudioSegment.silent(duration=0)
    tts = pyttsx3.init()
    tts.setProperty('rate', 140)
    for text in phrases:
        with tempfile.NamedTemporaryFile(delete=False, suffix=".wav") as tf:
            tmp_path = tf.name
        tts.save_to_file(text, tmp_path)
        tts.runAndWait()
        time.sleep(0.2)
        try:
            seg = AudioSegment.from_file(tmp_path).reverse().apply_gain(-10)
            combined += seg
        finally:
            if os.path.exists(tmp_path):
                os.remove(tmp_path)
    final = combined * int((DURATION * 1000) / len(combined))
    return np.array(final.get_array_of_samples()).astype(np.float32).reshape(-1, 2).mean(axis=1) / 32768


def generate_kafka_tts_distorted():
    kafka_excerpt = (
        "A cage went in search of a bird. I am a memory that remembers nothing. "
        "I write differently than I speak, I speak differently than I think, I think differently than I should."
    )
    tts = pyttsx3.init()
    tts.setProperty('rate', 125)
    with tempfile.NamedTemporaryFile(delete=False, suffix=".wav") as tf:
        tts_path = tf.name
    tts.save_to_file(kafka_excerpt, tts_path)
    tts.runAndWait()
    time.sleep(0.5)
    raw = AudioSegment.from_file(tts_path)
    os.remove(tts_path)
    distorted = raw.low_pass_filter(3000).high_pass_filter(400).reverse()
    distorted += AudioSegment.silent(duration=500)
    distorted = effects.speedup(distorted, playback_speed=1.1).apply_gain(-6)
    looped = distorted * int((DURATION * 1000) / len(distorted))
    return np.array(looped.get_array_of_samples()).astype(np.float32) / 32768


def generate_sonic_overload():
    low = generate_sine_wave(50, DURATION, 0.4)
    high = generate_sine_wave(19000, DURATION, 0.3)
    return normalize(low + high)


def generate_dissonance_base():
    freqs = [110, 113.5, 117.1, 99.3]
    return normalize(sum(generate_sine_wave(f, DURATION, 0.1) for f in freqs))

def save_to_mp3(audio_np, filename, sample_rate=SAMPLE_RATE):
    # Normalize and convert float32 to 16-bit PCM
    audio_np = audio_np / np.max(np.abs(audio_np))
    audio_int16 = (audio_np * 32767).astype(np.int16)
    # Write temp WAV then convert to MP3 using pydub
    temp_wav = filename.replace('.mp3', '.wav')
    write(temp_wav, sample_rate, audio_int16)
    wav_audio = AudioSegment.from_wav(temp_wav)
    wav_audio.export(filename, format="mp3")
    print(f"Saved {filename}")

def main():
    print("Generating individual layers...")

    baby_cry = generate_synthetic_baby_cry()
    reversed_tts = generate_reversed_disjointed_tts()
    kafka_distorted = generate_kafka_tts_distorted()

    pain = pain_spike()
    vestibular = vestibular_disruption()  # stereo
    glitch = glitch_loop()
    alarm = alarm_pulse()
    tinnitus = tinnitus_rise()
    clicks = aggression_clicks()

    dissonance = generate_unsettling_dissonance()
    formants = generate_formant_ghosts()
    infrasound = generate_infrasound()
    binaural = generate_binaural(200, 210)  # close freq binaural beat
    heartbeat = generate_heartbeat()
    reverse_whispers = generate_reverse_whispers()
    glitches = generate_glitches()
    phantom_voice = generate_phantom_voice_layer()
    guilt_rhythm = generate_guilt_rhythm()
    static_presence = generate_low_static_presence()
    spectral_teeth = generate_spectral_teeth()

    print("Mixing layers...")

    # Mix mono layers first
    mono_mix = mix_tracks(
        baby_cry,
        reversed_tts,
        kafka_distorted,
        pain,
        glitch,
        alarm,
        tinnitus,
        clicks,
        dissonance,
        formants,
        infrasound,
        heartbeat,
        reverse_whispers,
        glitches,
        phantom_voice,
        guilt_rhythm,
        static_presence,
        spectral_teeth,
    )

    # Add mimicry and spectral complexity
    complex_mix = summon_pain(mono_mix)

    # vestibular and binaural are stereo:
    # Mix stereo by adding mono to both channels
    stereo_length = max(len(vestibular), len(binaural), len(complex_mix))
    stereo_mix = np.zeros((stereo_length, 2), dtype=np.float32)

    # Fill stereo with vestibular and binaural (both stereo)
    stereo_mix[:len(vestibular), :] += vestibular
    stereo_mix[:len(binaural), :] += binaural

    # Add complex_mix mono to both channels
    stereo_mix[:len(complex_mix), 0] += complex_mix
    stereo_mix[:len(complex_mix), 1] += complex_mix

    # Normalize final mix
    final_mix = normalize(stereo_mix)

    print("Exporting final mix...")
    save_to_mp3(final_mix.flatten(), "CRYCRYLITTLETREE.mp3")

if __name__ == "__main__":
    main()
