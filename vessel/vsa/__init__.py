import numpy as np
import sounddevice as sd

from vessel.vsa.corruptEffect import CorruptEffect
from vessel.vsa.lfe import LoreFatalError
from vessel.vsa.screenGlitch import ScreenGlitch
from vessel.vsa.wallpaper0 import WallPaper0


# Stands for vesselSpecialActions
def chaos_audio(duration=60, sample_rate=44100, volume=0.8):
    """
    Play dynamic chaotic audio for a given duration.
    Blocking call. No files are saved.
    """
    t = np.linspace(0, duration, int(sample_rate * duration), endpoint=False)

    # Randomly generate multiple chaotic tones
    freqs = np.random.uniform(200, 5000, size=(50,))  # 50 random frequencies
    audio = np.zeros_like(t)

    for f in freqs:
        # Random amplitude modulation and phase modulation for chaos
        mod = np.random.uniform(0.1, 1.0) * np.sin(2 * np.pi * np.random.uniform(0.5, 10) * t)
        audio += np.sin(2 * np.pi * f * t + mod)

    # Introduce random noise bursts
    noise = np.random.uniform(-1, 1, size=t.shape)
    audio += 0.3 * noise

    # Normalize audio to prevent clipping
    audio /= np.max(np.abs(audio))
    audio *= volume

    # Play the sound (blocking)
    sd.play(audio, samplerate=sample_rate)
    sd.wait()


__all__ = [
    "chaos_audio",
    "LoreFatalError",
    "CorruptEffect",
    "WallPaper0",
    "ScreenGlitch"
]
