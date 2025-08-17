def shift_text(text, shift=25):
    result = []
    for char in text:
        ascii_val = ord(char)
        shifted_val = ascii_val + shift
        # Wrap around if going past ASCII 126 (printable chars range roughly 32-126)
        if shifted_val > 126:
            shifted_val = 32 + (shifted_val - 127)
        result.append(chr(shifted_val))
    return ''.join(result)


input_text = "You dig too much, its futile... but do go plant a tree for me, and look under your feet - THERE IS SOMETHING BURIED IN THERE"
output = shift_text(input_text)
print(output)
