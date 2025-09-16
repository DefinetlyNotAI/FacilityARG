import base64
import os
from pathlib import Path


def dontTouch():
    base = '== GENERATED ITEMS ==/dont'
    os.makedirs(base, exist_ok=True)

    with open(Path(__file__).parent / 'data/dT-1.data.b64', 'rb') as f:
        b64_data_1 = f.read()
    with open(Path(__file__).parent / 'data/dT-2.data.b64', 'rb') as f:
        b64_data_2 = f.read()
    with open(Path(__file__).parent / 'data/dT-3.data.b64', 'rb') as f:
        b64_data_3 = f.read()
    with open(Path(__file__).parent / 'data/dT-4.data.b64', 'rb') as f:
        b64_data_4 = f.read()

    os.makedirs(os.path.join(base, r'''touch'''), exist_ok=True)
    with open(os.path.join(base, r'''touch\rootsim.exe'''), 'wb') as f:
        f.write(base64.b64decode(b64_data_1))
    with open(os.path.join(base, r'''touch\scare_tas.txt'''), 'wb') as f:
        f.write(base64.b64decode(b64_data_2))
    with open(os.path.join(base, r'''touch\shh.zip'''), 'wb') as f:
        f.write(base64.b64decode(b64_data_3))
    with open(os.path.join(base, r'''touch\█.txt'''), 'wb') as f:
        f.write(base64.b64decode(b64_data_4))


if __name__ == '__main__':
    dontTouch()
