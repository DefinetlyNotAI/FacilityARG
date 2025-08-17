import hashlib
import os
import numpy as np
import librosa
import soundfile as sf
from PIL import Image

EXPECTED_FILENAME = 'fryingalive.wav'
EXPECTED_HASH = 'DA9DDC0BAE143B4E9D7138B251ED6CEC317051D3B292F874E2A916B8FF377D5D'
OUTPUT_IMAGE = 'An old poem.png'

def sha256_file(filepath):
    h = hashlib.sha256()
    with open(filepath, 'rb') as f:
        while chunk := f.read(8192):
            h.update(chunk)
    return h.hexdigest().upper()

def generate_spectrogram(audio_path, output_image_path,
                         n_fft=64, hop_length=256, target_size=(10602, 33)):
    audio, sr = sf.read(audio_path)

    # Compute STFT and convert to dB
    S = librosa.stft(audio, n_fft=n_fft, hop_length=hop_length)
    S_mag = np.abs(S)
    S_db = librosa.amplitude_to_db(S_mag, ref=np.max)

    # Normalize for image
    S_db_norm = (S_db - S_db.min()) / (S_db.max() - S_db.min()) * 255
    S_img = S_db_norm.astype(np.uint8)
    S_img = np.flipud(S_img)

    # Resize and save image
    image = Image.fromarray(S_img)
    image = image.resize(target_size, resample=Image.NEAREST)
    image.save(output_image_path)
    print(f"[✓] The ritual succeeded. Image written to '{output_image_path}'.")

def main():
    if not os.path.exists(EXPECTED_FILENAME):
        print(f"[✗] You dare come empty-handed to the flame? Put the oil beside me.")
        return

    file_hash = sha256_file(EXPECTED_FILENAME)
    if file_hash != EXPECTED_HASH:
        print(f"[✗] This is not the offering I asked for.\n    Expected: {EXPECTED_HASH}\n    Received: {file_hash}")
        print("[✗] Did you think I wouldn't notice? Provide the REAL oil.")
        return

    print("[-] I smell it... the sizzle, the sear...")
    print("‘Provide me the oil,’ you whispered. And so I shall render it visible.")
    generate_spectrogram(EXPECTED_FILENAME, OUTPUT_IMAGE)

if __name__ == "__main__":
    main()
