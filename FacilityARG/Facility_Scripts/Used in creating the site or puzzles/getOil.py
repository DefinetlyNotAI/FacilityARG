import numpy as np
import librosa
from PIL import Image
import soundfile as sf
import sys

def audio_to_image(audio_path, img_height=33, hop_length=256):
    audio, sr = sf.read(audio_path)

    n_fft = 2 * (img_height - 1)
    S = librosa.stft(audio, n_fft=n_fft, hop_length=hop_length, win_length=n_fft)
    magnitude = np.abs(S)

    magnitude = magnitude / np.max(magnitude) * 255.0
    magnitude = np.flipud(magnitude)
    img_data = magnitude.astype(np.uint8).T

    return Image.fromarray(img_data, mode='L')

def main():
    audio_path = "fryingalive.wav"
    output_image_path = "reconstructed.png"
    original_img_height = 33

    img = audio_to_image(
        audio_path,
        img_height=original_img_height,
        hop_length=256
    )
    img.save(output_image_path)
    print("SUCCESS: Image reconstructed.")

# ---------------- PUZZLE LAYER ---------------- #

PUZZLE_STEPS = [
    "Normalize values",
    "Load audio file",
    "Flip vertically",
    "Extract magnitude",
    "Compute STFT",
    "Save image",
    "Transpose matrix"
]

CORRECT_ORDER = [2, 5, 4, 1, 3, 7, 6]

def run_puzzle():
    print("Arrange the steps in the correct execution order.")
    print("Enter numbers separated by spaces.\n")

    for i, step in enumerate(PUZZLE_STEPS, start=1):
        print(f"{i}. {step}")

    try:
        user_input = input("\nOrder: ").strip()
        user_order = list(map(int, user_input.split()))
    except ValueError:
        print("FAIL: Invalid input.")
        sys.exit(1)

    if user_order != CORRECT_ORDER:
        print("FAIL: Incorrect order.")
        sys.exit(1)

    print("Order accepted.\n")
    main()

if __name__ == "__main__":
    run_puzzle()
