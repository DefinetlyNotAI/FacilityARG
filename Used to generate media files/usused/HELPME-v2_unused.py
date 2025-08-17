import numpy as np
import scipy.signal
import scipy.io.wavfile as wav

SAMPLE_RATE = 44100
DURATION = 90  # Extend to 90 seconds
OUTPUT_FILE = "/mnt/data/sonic_torture_V2_maxpain.wav"

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
            track[i:i+100] = np.random.uniform(-1, 1, 100)
    return track * 0.8

# Mix
def mix_brutality():
    mono_layers = [
        pain_spike(),
        glitch_loop(),
        alarm_pulse(),
        tinnitus_rise(),
        aggression_clicks()
    ]
    stereo_layers = [
        vestibular_disruption()
    ]

    mono_stereo = [np.stack((l, l), axis=-1) for l in mono_layers]
    all_layers = stereo_layers + mono_stereo
    total = sum(all_layers)
    total = norm(total) * 0.98  # final normalization
    return total

# Save
mixed = mix_brutality()
int_audio = np.int16(mixed * 32767)
wav.write(OUTPUT_FILE, SAMPLE_RATE, int_audio)
OUTPUT_FILE
