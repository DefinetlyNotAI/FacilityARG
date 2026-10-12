import numpy as np
from scipy.io.wavfile import write
from pydub import AudioSegment, effects
from pydub.playback import play
import pyttsx3
import tempfile
import os
import random
import time

SAMPLE_RATE = 44100
DURATION = 180  # seconds

def generate_sine_wave(freq, duration, volume=0.5):
    t = np.linspace(0, duration, int(SAMPLE_RATE * duration), False)
    wave = np.sin(2 * np.pi * freq * t)
    return (wave * volume).astype(np.float32)

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
    vowels = ['a', 'e', 'i', 'o', 'u']
    base = np.random.uniform(-0.2, 0.2, int(SAMPLE_RATE * DURATION))
    smoothed = np.convolve(base, np.ones(5000)/5000, mode='same')
    return smoothed[::-1] * 0.3

def apply_echo(track, delay_time=0.3, decay=0.4):
    echo_samples = int(SAMPLE_RATE * delay_time)
    echo = np.zeros(len(track) + echo_samples)
    echo[:len(track)] += track
    echo[echo_samples:] += track * decay
    return echo[:len(track)]

def insert_random_dropouts(track, count=50):
    for _ in range(count):
        start = random.randint(0, len(track) - SAMPLE_RATE//10)
        track[start:start + SAMPLE_RATE//20] *= random.uniform(0.01, 0.1)
    return track


def generate_infrasound():
    return generate_sine_wave(18, DURATION, 0.2)

def generate_binaural(freq_left, freq_right):
    t = np.linspace(0, DURATION, int(SAMPLE_RATE * DURATION), False)
    left = np.sin(2 * np.pi * freq_left * t)
    right = np.sin(2 * np.pi * freq_right * t)
    stereo = np.array([left, right]).T
    return (stereo * 0.2).astype(np.float32)

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
    whispers = np.random.uniform(-0.1, 0.1, int(SAMPLE_RATE * DURATION))
    whispers = np.convolve(whispers, np.ones(1000)/1000, mode='same')  # smear them
    return whispers[::-1]

def generate_glitches():
    glitches = np.zeros(int(SAMPLE_RATE * DURATION))
    for _ in range(200):
        start = random.randint(0, len(glitches) - 100)
        glitches[start:start+100] = np.random.uniform(-1, 1, 100) * 0.4
    return glitches
    
def generate_phantom_voice_layer():
    raw_noise = np.random.uniform(-1, 1, int(SAMPLE_RATE * DURATION))
    modulator = np.sin(2 * np.pi * 3.7 * np.linspace(0, DURATION, int(SAMPLE_RATE * DURATION)))  # creepy slow LFO
    blurred = np.convolve(raw_noise * modulator, np.ones(4000)/4000, mode='same')
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
        stretched = np.interp(np.linspace(0, len(base_beat), int(len(base_beat) * offset)), np.arange(len(base_beat)), base_beat)
        pulses.append(stretched)
    track = np.concatenate(pulses)
    return track[:int(SAMPLE_RATE * DURATION)]

def generate_low_static_presence():
    white = np.random.normal(0, 0.03, int(SAMPLE_RATE * DURATION))
    lowpass = np.convolve(white, np.ones(3000)/3000, mode='same')  # smooth into nothing
    presence = lowpass + generate_sine_wave(0.1, DURATION, 0.05)  # inaudible 0.1Hz LFO modulates feeling
    return presence.astype(np.float32)

def generate_mimicry_loop(track):
    clone = np.copy(track)
    chunk_size = SAMPLE_RATE * 2
    for _ in range(15):
        start = random.randint(0, len(track) - int(chunk_size))
        insert_point = random.randint(0, len(track) - int(chunk_size))
        clone[insert_point:insert_point+int(chunk_size//2)] += track[start:start+int(chunk_size//2)] * 0.4
    return clone

def generate_spectral_teeth():
    num_teeth = 120
    length = int(SAMPLE_RATE * DURATION)
    noise = np.zeros(length)
    for _ in range(num_teeth):
        start = random.randint(0, length - 200)
        freq = random.randint(8000, 16000)  # painful range
        tone = generate_sine_wave(freq, 0.01, 0.8)
        noise[start:start+len(tone)] += tone
    return noise

def summon_pain(existing_track):
    phantom = generate_phantom_voice_layer()
    guilt = generate_guilt_rhythm()
    static = generate_low_static_presence()
    teeth = generate_spectral_teeth()
    mimic = generate_mimicry_loop(existing_track)
    return mix_tracks(existing_track, phantom, guilt, static, teeth, mimic)


def mix_tracks(*tracks):
    final = np.zeros(len(tracks[0]))
    for track in tracks:
        final[:len(track)] += track
    # Normalize
    max_val = np.max(np.abs(final))
    if max_val > 0:
        final = final / max_val
    return final

def normalize(audio):
    max_val = np.max(np.abs(audio))
    return (audio / max_val) if max_val > 0 else audio

def generate_sine_wave(freq, duration, volume=1.0):
    t = np.linspace(0, duration, int(SAMPLE_RATE * duration), False)
    wave = np.sin(2 * np.pi * freq * t) * volume
    return wave.astype(np.float32)

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
            if os.path.exists(tmp_path): os.remove(tmp_path)
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

def generate_formant_ghosts():
    base = np.random.uniform(-0.2, 0.2, int(SAMPLE_RATE * DURATION))
    smoothed = np.convolve(base, np.ones(5000)/5000, mode='same')
    return smoothed[::-1] * 0.3

def generate_reverse_whispers():
    whispers = np.random.uniform(-0.1, 0.1, int(SAMPLE_RATE * DURATION))
    whispers = np.convolve(whispers, np.ones(1000)/1000, mode='same')
    return whispers[::-1]

def generate_glitches():
    glitches = np.zeros(int(SAMPLE_RATE * DURATION))
    for _ in range(200):
        start = random.randint(0, len(glitches) - 100)
        glitches[start:start+100] = np.random.uniform(-1, 1, 100) * 0.4
    return glitches

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

def insert_random_dropouts(track, count=50):
    for _ in range(count):
        start = random.randint(0, len(track) - SAMPLE_RATE//10)
        track[start:start + SAMPLE_RATE//20] *= random.uniform(0.01, 0.1)
    return track

def mix_tracks(*tracks):
    length = min(len(t) for t in tracks)
    mix = sum(t[:length] for t in tracks)
    return normalize(mix)

if __name__ == "__main__":
    # Core horror sound layers
    dissonance = generate_dissonance_base()
    ghosts = generate_formant_ghosts()
    whispers = generate_reverse_whispers()
    glitches = generate_glitches()
    binaural = generate_binaural(432, 430.5)
    heartbeat = insert_random_dropouts(generate_heartbeat())

    subconscious_mix = mix_tracks(dissonance, ghosts, whispers, glitches, heartbeat)
    full_stereo = np.array([subconscious_mix, binaural[:, 1]]).T
    write("subconscious_mix.wav", SAMPLE_RATE, full_stereo.astype(np.float32))

    # Synthetic voice-based torment
    baby = generate_synthetic_baby_cry()
    reversed_tts = generate_reversed_disjointed_tts()
    kafka = generate_kafka_tts_distorted()
    overload = generate_sonic_overload()

    synthetic_mix = mix_tracks(baby, reversed_tts, kafka, overload)
    write("pure_synth_torture.wav", SAMPLE_RATE, synthetic_mix.astype(np.float32))

    print("✅ Both subconscious and synthetic torment tracks generated.")
