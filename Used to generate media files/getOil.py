import numpy as np
import librosa
from PIL import Image
import soundfile as sf

def audio_to_image(audio_path, img_height=33, hop_length=256):
    """
    Reconstruct an image from an audio file that was generated via image_to_audio_exact.
    
    Args:
        audio_path: path to WAV file
        img_height: original image height (number of frequency bins)
        hop_length: hop length used in original STFT
    Returns:
        PIL.Image object
    """
    audio, sr = sf.read(audio_path)

    # Determine n_fft from image height
    n_fft = 2 * (img_height - 1)

    # Compute STFT
    S = librosa.stft(audio, n_fft=n_fft, hop_length=hop_length, win_length=n_fft)

    # Get magnitude
    magnitude = np.abs(S)

    # Normalize to 0-255
    magnitude = magnitude / np.max(magnitude) * 255.0

    # Flip vertically to undo the original flip
    magnitude = np.flipud(magnitude)

    # Convert to uint8
    img_data = magnitude.astype(np.uint8)

    # Transpose to match original (width = time frames, height = freq bins)
    img_data = img_data.T

    img = Image.fromarray(img_data, mode='L')
    return img

def main():
    audio_path = 'fryingalive.wav'
    output_image_path = 'reconstructed.png'
    
    # Set the original image height used in the encoding
    original_img_height = 33  # replace with actual height if known

    img = audio_to_image(audio_path, img_height=original_img_height, hop_length=256)
    img.save(output_image_path)
    print(f"Image reconstructed and saved to {output_image_path}")

if __name__ == "__main__":
    main()
