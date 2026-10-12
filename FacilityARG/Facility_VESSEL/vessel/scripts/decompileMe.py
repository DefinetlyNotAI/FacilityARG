import base64
from pathlib import Path


def decompile_me():
    with open(Path(__file__).parent / '../data/dM.data.b64', 'rb') as f:
        b64_data = f.read()
    data = base64.b64decode(b64_data)
    output_path = Path("== GENERATED ITEMS ==/can/you/decompile_me.exe")
    output_path.parent.mkdir(parents=True, exist_ok=True)
    with output_path.open("wb") as out:
        out.write(data)


if __name__ == '__main__':
    decompile_me()
