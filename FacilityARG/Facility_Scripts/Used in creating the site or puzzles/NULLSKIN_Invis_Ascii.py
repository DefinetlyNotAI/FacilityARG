def text_to_invisible(text):
    binary_string = ''.join(f"{ord(c):08b}" for c in text)
    return ''.join('\u200c' if bit == '1' else '\u200b' for bit in binary_string)


original = "Nullskin"
encoded = text_to_invisible(original)

with open("im_invisible_im_binary.txt", "w", encoding="utf-8") as f:
    f.write(encoded)

print("Invisible encoded text saved to im_invisible_im_binary.txt")
