from pydub import AudioSegment
import os
import sys

def reverse_file(path_in):
    if not os.path.exists(path_in):
        print(f"[!] File not found: {path_in}")
        return

    try:
        audio = AudioSegment.from_file(path_in)
    except Exception as e:
        print(f"[!] Failed to load {path_in}: {e}")
        return

    reversed_audio = audio.reverse()

    base, ext = os.path.splitext(path_in)
    out_path = f"{base}_reversed{ext}"

    try:
        reversed_audio.export(out_path, format=ext.replace(".", ""))
        print(f"[+] Reversed: {path_in} -> {out_path}")
    except Exception as e:
        print(f"[!] Failed to export {out_path}: {e}")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python reverseMP3.py <path1> <path2> ...")
        sys.exit(1)

    for audio_path in sys.argv[1:]:
        reverse_file(audio_path)
