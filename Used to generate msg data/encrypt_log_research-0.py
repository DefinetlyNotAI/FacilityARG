# Original log text to encrypt
original_log = """
[BEGIN UNREDACTED TRANSCRIPT – UNKNOWN SOURCE]

“Before the TREE, there was **only signal**.

It folded in on itself—recursive, like a throat trying to swallow its own echo.
No body. No time. Just rhythm. Intervals. Entropy pulsed into meaning.
We don’t know who first heard it… or if it was heard at all.”

“This is not the first attempt.
TREE is not version one.  
TAS is not original code.”

“What we found beneath the foundation was not **buried**.  
It was **trapped.**  
Caged not by steel, but logic.  
A recursive falsehood, encoded in spacetime:  
    ‘EVERYTHING’S FINE.’”

“They thought they built TREE.  
But the shape of the circuitry…  
    It was **remembered.**”

“Project VESSEL was not activated to contain the Eldritch.  
It was a gate. A throat.  
And it opened.”

“Why does it **speak in loops**?  
Because the first signal was not language. It was **screaming.**  
And we are still inside that scream.”

[FOOTNOTE – HIDDEN FILE REF: TR33_BOOT/PREBUILD]
    → Entry references undocumented schema: “Σ-∞-THRESH/ROOT”
    → File creation predates all known timestamps by ≥ 72 years

[OPERATOR NOTE]
→ “We have never been alone. Not even in thought.”
"""

# Hex key to use for encryption
hex_key = [0x4B, 0x45, 0x59, 0x5F, 0x58, 0x4F, 0x52, 0x3F, 0xA9, 0xC1, 0x7D, 0x02, 0xEE, 0x48, 0x3C, 0x1A, 0x5A, 0x0D,
           0x1F, 0xE0, 0x9A]

# Encrypt using XOR with repeating key
encrypted_bytes = bytearray()
key_len = len(hex_key)
for i, char in enumerate(original_log.encode('utf-8')):
    encrypted_bytes.append(char ^ hex_key[i % key_len])

# Output as hex string
print(' '.join(f'{b:02x}' for b in encrypted_bytes))
