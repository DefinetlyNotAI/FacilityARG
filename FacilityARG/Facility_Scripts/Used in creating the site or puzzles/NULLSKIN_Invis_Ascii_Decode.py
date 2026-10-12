def decode_zero_width_file(filename):
    # Map zero-width chars to bits
    char_to_bit = {
        '\u200b': '0',  # zero-width space
        '\u200c': '1',  # zero-width non-joiner
    }

    with open(filename, 'r', encoding='utf-8') as f:
        content = f.read()

    # Filter only zero-width chars and convert to bits
    bits = ''.join(char_to_bit.get(ch, '') for ch in content)

    # Group bits into bytes (8 bits)
    chars = []
    for i in range(0, len(bits), 8):
        byte = bits[i:i + 8]
        if len(byte) < 8:
            # Ignore incomplete byte at the end
            break
        chars.append(chr(int(byte, 2)))

    return ''.join(chars)


# Example usage:
message = decode_zero_width_file('im_invisible_im_binary.txt')
print(message)
