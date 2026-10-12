from PIL import Image
import sys

# Message to hide (same format as in steg.png)
HIDDEN_MESSAGE = "A red herring, not part of the puzzle you fool - سثقهخعسمغززز ه سشهي هفس ش قثي اثققهىل"
TERMINATOR = "|||END|||"


def str_to_bits(s):
    return ''.join(f"{ord(c):08b}" for c in s + TERMINATOR)


def bits_to_str(bits):
    chars = [chr(int(bits[i:i + 8], 2)) for i in range(0, len(bits), 8)]
    s = ''.join(chars)
    return s.split(TERMINATOR)[0]


def encode(img_path, output_path, message):
    img = Image.open(img_path).convert("RGB")
    pixels = list(img.getdata())

    bits = str_to_bits(message)
    if len(bits) > len(pixels) * 3:
        print("Message too long to encode in this image.")
        return

    new_pixels = []
    bit_idx = 0

    for r, g, b in pixels:
        if bit_idx < len(bits):
            r = (r & ~1) | int(bits[bit_idx])
            bit_idx += 1
        if bit_idx < len(bits):
            g = (g & ~1) | int(bits[bit_idx])
            bit_idx += 1
        if bit_idx < len(bits):
            b = (b & ~1) | int(bits[bit_idx])
            bit_idx += 1
        new_pixels.append((r, g, b))

    encoded_img = Image.new(img.mode, img.size)
    encoded_img.putdata(new_pixels)
    encoded_img.save(output_path)
    print(f"Message encoded and saved to {output_path}")


def decode(img_path):
    img = Image.open(img_path).convert("RGB")
    pixels = list(img.getdata())

    bits = ""
    for r, g, b in pixels:
        bits += str(r & 1)
        bits += str(g & 1)
        bits += str(b & 1)

    message = bits_to_str(bits)
    print(f"Decoded message:\n{message}")


if __name__ == "__main__":
    mode = sys.argv[1]
    if mode == "encode":
        encode("clownguy.webp", "steg_clownguy.png", HIDDEN_MESSAGE)
    elif mode == "decode":
        decode("steg_clownguy.png")
    else:
        print("Usage: python steg_clownguy_encode_decode.py [encode|decode]")
