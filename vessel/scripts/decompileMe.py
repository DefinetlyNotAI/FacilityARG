from pathlib import Path
import base64


def decompile_me():
    data = base64.b64decode(b64_data)
    output_path = Path("== GENERATED ITEMS ==/can/you/decompile_me.exe")
    output_path.parent.mkdir(parents=True, exist_ok=True)
    with output_path.open("wb") as out:
        out.write(data)


if __name__ == '__main__':
    with open('data/dM.data.b64', 'rb') as f:
        b64_data = f.read()
    decompile_me()
