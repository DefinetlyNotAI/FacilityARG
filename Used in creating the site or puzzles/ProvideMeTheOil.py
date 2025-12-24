import hashlib
import os
import numpy as np
import soundfile as sf
from PIL import Image
from scipy.signal import stft

EXPECTED_FILENAME = "fryingalive.wav"
EXPECTED_HASH = "DA9DDC0BAE143B4E9D7138B251ED6CEC317051D3B292F874E2A916B8FF377D5D"
OUTPUT_IMAGE = "An old poem.png"


def sha256_file(filepath):
    h = hashlib.sha256()
    with open(filepath, "rb") as f:
        for chunk in iter(lambda: f.read(8192), b""):
            h.update(chunk)
    return h.hexdigest().upper()


def amplitude_to_db(magnitude, eps=1e-10):
    return 20 * np.log10(np.maximum(magnitude, eps))


def generate_spectrogram(
    audio_path,
    output_image_path,
    n_fft=64,
    hop_length=256,
    target_size=(10602, 33),
):
    audio, sr = sf.read(audio_path)

    if audio.ndim > 1:
        audio = np.mean(audio, axis=1)

    _, _, Zxx = stft(
        audio,
        fs=sr,
        nperseg=n_fft,
        noverlap=n_fft - hop_length,
        boundary=None,
    )

    S_mag = np.abs(Zxx)
    S_db = amplitude_to_db(S_mag)

    S_db_norm = (S_db - S_db.min()) / (S_db.max() - S_db.min())
    S_img = (S_db_norm * 255).astype(np.uint8)
    S_img = np.flipud(S_img)

    image = Image.fromarray(S_img)
    image = image.resize(target_size, resample=Image.NEAREST)
    image.save(output_image_path)

    print(f"[✓] The ritual succeeded. Image written to '{output_image_path}'.")


def main():
    if not os.path.exists(EXPECTED_FILENAME):
        print("[✗] You dare come empty-handed to the flame?")
        return

    file_hash = sha256_file(EXPECTED_FILENAME)
    if file_hash != EXPECTED_HASH:
        print("[✗] This is not the offering I asked for.")
        print(f"    Expected: {EXPECTED_HASH}")
        print(f"    Received: {file_hash}")
        return

    print("[-] I smell it... the sizzle, the sear...")
    print("‘Provide me the oil,’ you whispered. And so I shall render it visible.")
    generate_spectrogram(EXPECTED_FILENAME, OUTPUT_IMAGE)


if __name__ == "__main__":
    main()
