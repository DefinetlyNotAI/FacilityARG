From log 15 using key `0x025153` XOR on hex dump you get this key: `0x4B 0x45 0x59 0x5F 0x58 0x4F 0x52`

-------------------------------------------------------------------------------------------------------------------------------------

Log 3 contains the key `0x3F 0xA9 0xC1 0x7D 0x02 0xEE 0x48`

-------------------------------------------------------------------------------------------------------------------------------------

From Log 004:
The sequence begins with `3C-??-5A-?-1F`
Later confirmed fully in Log 006 as: `3C-1A-5A-0D-1F-??-??`

From Log 006:
Last two bytes were masked:
Mask: `B3`
XOR + Hex Rot (+3) yields final bytes

Let’s assume two placeholder unknowns = X and Y:
If we reverse-engineer:
Let final (masked) bytes = A and B
Let actual bytes = (A XOR B3) + 3
We find A = `6E`, B = `24`

Unto log 25
Then:
(`6E` XOR `B3`) = DD → DD + 3 = `E0`
(`24` XOR `B3`) = 97 → 97 + 3 = `9A`
→ Final HEX KEY = `0x3C 0x1A 0x5A 0x0D 0x1F 0xE0 0x9A`

-------------------------------------------------------------------------------------------------------------------------------------

To get log 0, just merge the hex keys 1 2 and 3 and then use XOR to decrypt Log 0
This step is given by log 2 by decrypting the base64

- `4B 45 59 5F 58 4F 52 3F A9 C1 7D 02 EE 48 3C 1A 5A 0D 1F E0 9A`

-------------------------------------------------------------------------------------------------------------------------------------

Other log solutions:

- Log 5 has HEX as a secret message: `PROJ-VESSEL-IS-SLEEPING`
- Log 7 has ceaser cipher of random text:
    - ```
    When they sleep, it behaves a course.
    The walls are not soft—they breathe.
    The room is not a room.
    We are not alone in here.
    ```
- Log 8 needs to decode hex, then base64 then reverse text to get the message
- Log 9 needs to decode to hex, then base64, then reverse the 3 text snippets to get 3 phrases/words, talked abt in
  log11
    - `"342 negewsroV"`, `"nretleT"`, `".driht eht leef ot ton sdneterp netfo semit owt speew ohw eH"`
- Log 11 relates to log 9, only secret is morse code [where . is ∴] that translates to `PRAISE BE`
- Log 13, read caps letters to get `REVEALTHEHIDDENTRAPSASTHESHADOWSSILENTLYMOVE`
- Log 14, just a fun boot log with many internet Easter eggs
- Log 16, just hex saying `VESSEL.exe --not here..........`
- Log 18, Morse to hex with a creepy poem:
    - ```
    King of kings
    Child of man
    Thy who sits in the palm of my hand
    Twitch not. Breathe slow.
    You are already mine.
    And I always keep my toys smiling.
    ```
- Log 20, binary `THE FIRST ONE LIES ABOVE`.
- Log 12, 17, 21, 23, 24: no secret here just lore

-------------------------------------------------------------------------------------------------------------------------------------

> There are others, but are either irrelevant or too niche to this main puzzle

-------------------------------------------------------------------------------------------------------------------------------------