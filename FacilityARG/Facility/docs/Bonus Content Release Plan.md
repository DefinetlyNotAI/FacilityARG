# Weekly Saga Release Plan

Each week (after requirements are satisfied), a new **Saga** is released.  
The previous saga is **archived**-if unsolved, it **fails**.

All are in the main facility site, and are under `/chapters/{Roman Numeral}/`
The tab names are also the quest name!

Special notes:
`const {isCurrentlySolved} = useChapterAccess();` -> Returns true if solved, false if pending, and handles the other two
state redirections if necessary, also redirects if no end cookie
`const failed = useFailed("III");` -> Returns true if failed, false if pending or solved, also redirects if no end
cookie, only works for valid failable chapters, or else it will auto redirect if failed rather than return true

---

## (I) - Connecting...

- Page shows: "Attempting connection..."
- Instructions to email the admin. Once emailed, the site and quest unlock.
- Terminal-style puzzle:
    - **Port**: From July 3rd’s video
    - **IP**: Hidden in the fake email leak
- Upon success:
    - Download the secret exe that contains more puzzles
      Styles as an old IE connector, with popup asking for connection
- If port incorrect: "Port Access Denied - TREE's root has blocked this port"
- If password incorrect "IP address connection failed/not accepting handshake protocol. Maybe try a different address?"
- Popup has a [?] icon, if clicked hints "Find the answers in the first video log, find the answers in a leaked mail,
  then open my doors.. to see more doors"

---

## (II) - Empty?

- An empty page with a 1-week timer
- Message:  
  *“There are 8 links. 4 are numbers, 2 are foliage, one is you, and one is time.”*
    - Also mention each page must be screenshotted and sent to me complete to see,

### URLs and Secrets:

| URL                | Image & Caption                                                                                                      |
|--------------------|----------------------------------------------------------------------------------------------------------------------|
| `/3`               | Human, robot, and blackness – *"YOU - ME - IT"*                                                                      |
| `/15`              | 15 flowers – *"They sprout, and bloom from their insides, imagine we could do that?"*                                |
| `/25`              | 25 graves – *"Your life is pathetic... ask for a refund - AND BECOME 26"*                                            |
| `/TREE`            | Tree – *"Ignore the past, find the me with three's"*                                                                 |
| `/VESSEL`          | Webcam – *"Curious or plain suicidal"*                                                                               |
| `/TR33`            | Upside-down black tree – *"1gN0r3 tH3 fUtuR3, @ URL tH3 nUmB3r$ 0f Th1$ t3xT"*                                       |
| `/1033333013`      | Clock – *"When the clock strikes the link, go to 3h-15m-10th-utc, you have one shot at this, a 15 min gap"*          |
| `/3h-15m-10th-utc` | Melted clock – *"TOO LATE OR TOO EARLY TIME IS NOT REAL HERE"* (if mistimed), otherwise `:) :) :)` and EXE downloads |

If the link is accessed via root, then redirect as it's an honest mistake, also do not care for caps, redirect as well
for caps issues/mismatch

For `/3h-15m-10th-utc`, ask for a password with hint "A 10-digit number instructed you to come here when the clock
strikes me", the pass is `1033333013`, cookie to be used for saving that pass was set, cookie name:
`chII3h15m25thUTC_passdone`

---

## (III) - 3:Clocks and Hands

- 3 small clocks + 1 large central clock
- Each small clock has a locked word below:
    - **1st day**: Show "Broken" → hands replaced with ∞
    - **3rd day**: Show "Intelligent", hide prev → hands replaced with Ω
    - **5th day**: Show "NoName", hide prev → hands replaced with 0
- Each clock ticks for its own duration
- After countdown, hands replaced with symbols

These keywords must be sent to the discord bot using `/clock_the_hand {keyword}`

---

## (IV) - 3:Registration

- Displays 3 plaque cards (each with img, name, caption, quest-name in top-right)
- Images are corrupted
- While quest is ongoing:
    - Caption: `52 65 6D 65 6D 62 65 72 20 74 68 65 20 72 69 64 64 6C 65 73 20 62 65 66 6F 72 65`
    - Name: `???`
- Upon success:
    - Name: Solved name
    - Caption: Character-specific lore
- Upon failure:
    - Quest name: Marked with failure title
    - Name: `"YOU CAUSED THIS"`
    - Caption: `54 4F 4F 20 4C 41 54 45`
    - Image defaced with MS Paint-style red (X)

### Riddles:

- **TREE**:  
  *"What speaks, yet knows it’s not alive? What grows, but cannot die?"*

- **TAS**:  
  *"What bleeds without breath, remembers without pain, and obeys without soul?"*

- **Entity**:  
  *"What cannot be seen, but sees? What cannot be born, but waits?"*

### Sub-puzzles

When each is unlocked, a sub-puzzle is opened, for TAS and TREE they are similiar with very easy puzzle based items,
straight forward
Although Entity is different and is the TREE.exe interactive console which leads to whiteroom,

---

## (V) - Narrator:  A Harbinger

**Ren’Py Visual Novel**

- **Fail**: Cold, monotone narrator:  
  *"YOU AREN'T SPECIAL, I HAD VERY HIGH EXPECTATIONS."*
- **Success**: Creepy, cheerful narrator:  
  *"You're halfway to the truth. Watch out... something big is coming :)"*

Link autodownloads the VN ZIP File, called `Narrator: I.zip`

---

## (VI) - He who lives in clocks

- User must stay on page for 6 hours, if refreshed or left, timer resets, each user has own timer
- Background: Dark room with a large clock on the wall, bg music is the clock ticking
- A red spider lily is in the middle of the page with 6 petals
- Every hour, a petal falls, and a message appears:
    - In the beginning: *"To escape time, you must endure it."*
    - After 1 hour: *"Time is fleeting, but so am I."*
    - After 2 hours: *"Each tick brings me closer to you."*
    - After 3 hours: *"Patience is a virtue, they say."*
    - After 4 hours: *"The hands of time wait for no one."*
    - After 5 hours: *"Almost there, just a little longer."*
    - After 6 hours: *"HE lived here, before HE wrote a story."*

- If solved:
  *"All for nothing, No prize today, too early too early, just wait for {X}, but to escape the clock, share this to HIM,
  for he can fix it for all, and not need more death to fall"*
  And the background is just falling red spider lily petals

---

## (VII) - The timeline

- Background: 5 warped clocks

- Asks for input of the logs for each year, so it will start with asking for 1975,
  each correct log increments the progress bar by 1 out of the predefined list,
  if you get it incorrect you get banned (stored in localStorage) for 5 minutes,
  once the correct is fully added move to the next year, repeat for all 5

- Once all submitted:
    - Incorrect: *"Incorrect answer for the clock of ordered times.. work cleric, work."*
    - Correct (aka solved them all): *"Dates are now considered canon. Timeline check succeeded, Please tell HIM you
      have seen time itself."*, also remove the puzzle, only this
      message

```
1975 = {1, 2, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 16, 17, 18, 19, 20, 21, 22, 23, 24}
1995 = {26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90, 91, 92, 93, 94, 95, 96, 97, 98}
2010 = {100, 101, 102, 103, 104, 105, 106, 107, 108, 109, 110, 111, 112, 113, 114, 115, 116, 117, 118, 119, 120, 121, 122, 123, 124, 125, 126, 127, 128, 129, 130, 131, 132, 133, 134, 135, 136, 137, 138, 139, 140, 141, 142, 143, 144, 145, 146, 147, 148, 149, 150, 151, 152, 153, 154, 155, 156, 157, 158, 159, 160, 161, 162, 163, 164, 165, 166, 167, 168, 169, 170, 171, 172, 173, 174, 175, 176, 177, 178, 179, 180, 181, 182, 183, 184, 185, 186, 187, 188, 189, 190, 191, 192, 193, 194, 195, 196, 197, 198, 199, 200, 201, 202, 203, 204, 205, 206, 207, 208, 209, 210, 211, 212, 213, 214, 215, 216, 217, 218, 219, 220, 221, 222, 223, 224, 225, 226, 227, 228, 229, 230, 231, 232, 233, 234, 235, 236, 237, 238, 239, 240, 241, 242, 243, 244, 245, 246, 247, 248, 249, 250, 251, 252, 253, 254}
2015 = {256, 257, 258, 259, 260, 261, 262, 263, 264, 265, 266, 267, 268, 269, 270, 271, 272, 273, 274, 275, 276, 277, 278, 279, 280, 281, 282, 283, 284, 285, 286, 287, 288, 289, 290, 291, 292, 293, 294, 295, 296, 297, 298, 299, 300, 301, 302, 303, 304, 305, 306, 307, 308, 309, 310, 311, 312, 313, 314, 315, 316, 317, 318, 319, 320, 321, 322, 323, 324, 325, 326, 327, 328, 329, 330, 331, 332, 334, 335, 336, 337, 338, 339, 340, 341, 342, 343, 344, 345, 346, 347, 348, 349, 350, 351, 352, 353, 354, 355, 356, 357, 358, 359, 360, 361, 362, 363, 364, 365, 366, 367, 368, 369, 370, 371, 372, 373, 374, 375, 376, 377, 378, 379, 380, 381, 382, 383, 384, 385, 386, 387, 388, 389, 390, 391, 392, 393, 394, 395, 396, 397, 398, 399, 400}
2017 = {401, 402, 403, 404, 405, 406, 407, 408, 409, 410, 411, 412, 413, 414, 415, 416, 417, 418, 419, 420, 421, 422, 423, 424, 425, 426, 427, 428, 429, 430, 431, 432, 433, 434, 435, 436, 437, 438, 439, 440, 441, 442, 443, 444, 445, 446, 447, 448, 449, 450, 451, 452, 453, 454, 455, 456, 457, 458, 459, 460, 461, 462, 463, 464, 465, 466, 467, 468, 469, 470, 471, 472, 473, 474, 475, 476, 477, 478, 479, 480, 481, 482, 483, 484, 485, 486, 487, 488, 489, 490, 491, 492, 493, 494, 495, 496, 497, 498, 499, 500, 501, 502, 503, 504, 505, 506, 507, 508, 509, 510, 511, 512, 513, 514, 515, 516, 517, 518, 519, 520, 521, 522, 523, 524, 525, 526, 527, 528, 529, 530, 531, 532, 533, 534, 535, 536, 537, 538, 539, 540, 541, 542, 543, 544, 545, 546, 547, 548, 549, 550, 551, 552, 553, 554, 555, 556, 557, 558, 559, 560, 561, 562, 563, 564, 565, 566, 567, 568, 569, 570, 571, 572, 573, 574, 575, 576, 577, 578, 579, 580, 581, 582, 583, 584, 585, 586, 587, 588, 589, 590, 591, 592, 593, 594, 595, 596, 597, 598, 599, 600, 601, 602, 603, 604, 605, 606, 607, 608, 609, 610, 611, 612, 613, 614, 615, 616, 617, 618, 619, 620, 621, 622, 623, 624, 625, 626, 627, 628, 629, 630, 631, 632, 633, 634, 635, 636, 637, 638, 639, 640, 641, 642, 643, 644, 645, 646, 647, 648, 649, 650, 651, 652, 653, 654, 655, 656, 657, 658, 659, 660, 661, 662, 663, 664, 665}
```

---

## (VIII) - Bloom, Live and Die

- Blank page with 3 tasks:

    1. **25 players** must simulate connecting → get IP banned
    2. **15 players** must upload `.txt` with "blooming" related words → then banned
    3. **3 players** must press a switch to "see the truth"

- If **40 players** are banned:
    - The 3 can press button `whisper`:  
      *"ticktock solve it quick {#/3}"*

      and get IP-locked from the button

    - When all 3 press it, the site perma changes forever to remove the puzzle, and show the Reward

- Reward:  
  Lore drop + *"1 more obstacle left before you return to me"*

All this is tracked via a DB that stores the IP's to ban, ofc progress is still shown, and IP ban is only for this page,
and when the puzzle is solved IP ban removed, but if failed, the IP ban stays, also all banned get custom useless cookie
`humanSacrifice=foolishSinner`

Also show progress for all, and the 25/15/3 must press a button, so they choose if they participate or not,

---

## (IX) - Philosophy

- Static site with text:  
  *"Email {X} the answers to the following 15 questions. You may skip 3. 25 participants required. No right or wrong."*

- Downloads `15.txt` with:
    - 5 questions about **life**
    - 5 questions about **death**
    - 5 questions about **time**

---

## (X) - Narrator: Tenacity

**Ren’Py Visual Novel (Final)**

- **Fail both**:  
  *"REFUSE connection"*

- **Fail one**:  
  Cold, corrupted imagery, monotone narrator:  
  *"YOU WERE VERY CLOSE... JUST 4 LEFT... FAILED MY EXPECTATIONS"*

- **Success**:  
  Poetic, creepy narrator, ecstatic:  
  *"You're IN the truth. Here it is... lore about time... and me :D"*

  Link autodownloads the VN ZIP File, called `Narrator: I.zip`

---
