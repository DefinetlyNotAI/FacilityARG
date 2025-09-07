import os
import base64

from pathlib import Path


def lost():
    base = '== GENERATED ITEMS ==/lost'
    os.makedirs(base, exist_ok=True)

    # Create "lost" nested folders (up to 24 levels deep)
    path = base
    for _ in range(24):
        path = os.path.join(path, "lost")
        os.makedirs(path, exist_ok=True)

    # Create "mus" folder
    mus_path = os.path.join(base, "mus")
    os.makedirs(mus_path, exist_ok=True)

    # Map of input .b64 files → output decoded files
    files = [
        ("data/lost-1.data.b64", os.path.join(path, "FINDME.txt")),
        ("data/lost-2.data.b64", os.path.join(mus_path, "mud.mp3")),
        ("data/lost-3.data.b64", os.path.join(mus_path, "penumbra_phantasm.mp4")),
        ("data/lost-4.data.b64", os.path.join(mus_path, "_as_a_child_.mp3+1")),
        ("data/lost-5.data.b64", os.path.join(mus_path, "_log_the_apple_tree_.m4v")),
        ("data/lost-6.data.b64", os.path.join(mus_path, "§.webm")),
    ]

    # Decode and write files
    for src, dst in files:
        with open(Path(__file__).parent / src, "rb") as f:
            data = base64.b64decode(f.read())
        with open(dst, "wb") as f:
            f.write(data)


if __name__ == "__main__":
    lost()
