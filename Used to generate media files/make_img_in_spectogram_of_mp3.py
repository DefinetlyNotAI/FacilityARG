import numpy as np
import librosa
from PIL import Image
import soundfile as sf

def image_to_audio_exact(image_path, sr=22050, hop_length=256):
    img = Image.open(image_path).convert('L')
    time_frames, freq_bins = img.size  # (width, height)

    # Calculate n_fft from freq_bins (height)
    n_fft = 2 * (freq_bins - 1)
    # Confirm n_fft is power of two (should be 64)
    if (n_fft & (n_fft - 1)) != 0:
        raise ValueError("n_fft must be power of two; got {}".format(n_fft))

    # Convert image to numpy and normalize
    img_data = np.array(img) / 255.0

    # Flip vertically for correct freq orientation
    img_data = np.flipud(img_data)

    # Scale magnitude (adjust 100 if needed)
    magnitude = img_data * 100

    # Add random phase to avoid artifacts
    random_phase = np.exp(1j * 2 * np.pi * np.random.rand(*magnitude.shape))
    S_complex = magnitude * random_phase

    duration = (time_frames * hop_length) / sr

    # ISTFT to audio waveform
    audio = librosa.istft(S_complex, hop_length=hop_length, win_length=n_fft, length=int(duration * sr))

    # Normalize amplitude
    audio = audio / np.max(np.abs(audio)) * 0.3

    print(f"Image dimensions (time x freq): {time_frames} x {freq_bins}")
    print(f"n_fft: {n_fft}, hop_length: {hop_length}, duration: {duration:.2f} seconds")

    return audio, sr

def main():
    image_path = 'poem_obfuscated.png'
    output_audio_path = 'boilingalive.wav'

    audio, sr = image_to_audio_exact(image_path, hop_length=256)
    sf.write(output_audio_path, audio, sr)
    print(f"Audio saved to {output_audio_path}")

if __name__ == '__main__':
    main()
