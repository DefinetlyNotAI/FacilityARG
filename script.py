import os
import random
import re
import sys

import asyncpg
import discord
from discord import app_commands, ui
from discord.ext import commands
from dotenv import load_dotenv

# First try: load from environment
try:
    TOKEN = os.getenv("DISCORD_TOKEN")
    GUILD_ID = os.getenv("DISCORD_GUILD_ID")
    DATABASE_URL = os.getenv("DATABASE_URL")
except Exception as e:
    print(f"Error: Failed to load environment variables: {e}")
    sys.exit(1)

# If any required variable is missing, try loading from .env
if not TOKEN or not GUILD_ID or not DATABASE_URL:
    print("Warning: Environment variables not set. Attempting to load from .env file.")
    if os.path.exists(".env"):
        print("Found .env file, loading variables...")
        try:
            load_dotenv()
            TOKEN = TOKEN or os.getenv("DISCORD_TOKEN")
            GUILD_ID = GUILD_ID or os.getenv("DISCORD_GUILD_ID")
            DATABASE_URL = DATABASE_URL or os.getenv("DATABASE_URL")
        except Exception as e:
            print(f"Error: Failed to load .env file: {e}")
            sys.exit(1)
    else:
        print("Error: Environment variables not set and .env file not found.")
        sys.exit(1)

# Final check after fallback
missing = []
if not TOKEN:
    missing.append("DISCORD_TOKEN")
if not GUILD_ID:
    missing.append("DISCORD_GUILD_ID")
if not DATABASE_URL:
    missing.append("DATABASE_URL")

if missing:
    print(f"Error: Missing required environment variables: {', '.join(missing)}")
    sys.exit(1)

# If GUILD_ID is now set, cast to int
GUILD_ID = int(GUILD_ID)

# Init
db_pool = None

# ==== REQUIRED SECTIONS ====
# --- Role Names ---
ROLE_TREE = "🌳"
ROLE_FAN = "Fan😍"
ROLE_RECRUIT = "Recruit"
ROLE_FOUNDATION = "The Foundation"
ROLE_SEEN = "I have seen things"
ROLE_NOT_ENOUGH = "But its not enough"
ROLE_INVESTOR = "Investor💰"

# --- Channel Names ---
CHANNEL_FANMADE = "fanmade"
CHANNEL_ROLES = "roles"
CHANNEL_WELCOME = "welcome"
CHANNEL_RULES = "rules"
CHANNEL_SPONSOR_LEEKS = "sponsor-leeks"
CHANNEL_BUGS_AND_SUGGESTIONS = "bugs-and-suggestions"
CHANNEL_GENERAL = "general"
CHANNEL_DISCUSSIONS = "discussions"
CHANNEL_MEMES = "memes"

sect3 = """@#init:
    $0x1A >> &memmap[0x00FF] | $0x2B ^ 0xF3 & %entityID = ⊗ 0xDEAD
    ? %entityID == 0x00 -> !halt
    %mesh ~> &neural[0x4000] ^ $0xA9 | &regA <<= 0x03 | $0x7F & %ctrl = 0x01
    #kernel = load_mod(#cogV3)
    %tmp1 = &regA >> 0x04 | &memmap[0x0033] <<= 0x02 ^ %mesh & 0x1F
    $%tmp2 = ⊗ (%tmp1 << 0x01 | &memmap[0x0F0]) | &neural[0x4200] ~> %tmp1
    &regB = $%tmp2 | &neural[0x4204] ^ 0xD3 & %ctrl <<= 0x01
    %flagA = &regB & 0xF0 >> 0x02 | $0xB3
    %flagB = %flagA ^ %tmp1 & 0x3C | &neural[0x4300] ~> %flagA
    %status = %flagB | &regA << 0x01 & 0x7F
    &cache[0x10] = %status ^ 0xFF | &memmap[0x0055] << 0x02
    $tmp3 = &cache[0x10] & 0x1A ^ %mesh >> 0x03 | $0x9F
    %ctrl = $tmp3 | &regB & 0xC3 << 0x01
    %tmp4 = %ctrl ^ $tmp3 & 0xD2 | &neural[0x4500] ~> %tmp4
    if %tmp4 & 0x80 == 0x00 jump #cycle_start
    ? %tmp4 & 0xF0 == 0xF0 -> jump #error_handler
    jump #cycle_start

#cycle_start:
    @timer(0x1F)
    &sensor = &input[0x100] ^ 0x5A
    %halluc = &sensor ^ 0xA5
    &state += %halluc
    %tmp3 = %halluc & 0xF0 >> 0x02 | %halluc << 0x01 & regB <<= 0x03 | $0xB3
    if %tmp3 == 0xB0 send %halluc >> #subnet
    %tmp4 = %halluc << 0x01 & %tmp3 >> 0x03 | &state >> 0x01
    %tmp5 = %tmp4 ^ 0x3D & %tmp3 | %halluc <<= 0x02 | &regC = ~%tmp5 & 0x4F
    if %tmp5 & 0x07 == 0x03 jump #cycle_start
    jump #subroutine_x

#subroutine_x:
    &tmp = %halluc | &regC ^ %tmp5 & 0xFF
    %mask = &tmp << 0x02 | %tmp5 >> 0x01
    &buffer[0x20] = %mask & 0xAA | &tmp ^ 0x55
    ? &buffer[0x20] & 0x0F == 0x0A -> jump #subnet
    %flag = &buffer[0x20] ^ 0xF0 & %mask | %halluc >> 0x01
    jump #cycle_start

#subnet:
    %enc = encrypt(%halluc, &entity_key) ^ %tmp5 | %tmp4 << 0x03 & %tmp3 >> 0x01
    send %enc >> &comm_chan
    %resp = recv(&comm_chan, 0x01F4)
    if !verify(%resp) quarantine %enc | log 0xE7FF | escalate 0x33
    %tmp6 = %resp << 0x02 | %resp >> 0x01 & 0xFF
    if %tmp6 == 0x00 jump #error_handler
    return

#error_handler:
    log 0xDEAD | halt

#loop1:
    &mem1 = &memmap[0x0022] ^ 0xAB | &regA << 0x02
    %tmp7 = &mem1 >> 0x01 | &neural[0x4100] & 0x3C
    &state += %tmp7 ^ 0x9D | %halluc << 0x03
    if %tmp7 & 0x80 == 0x80 jump #subnet
    %tmp8 = %tmp7 ^ &mem1 | &neural[0x4110] >> 0x04
    jump #loop1

#loop2:
    $var1 = &regB ^ %tmp8 | $0xD4 << 0x01
    %var2 = $var1 & 0x3F | &memmap[0x0044] ^ 0x7E
    &cache[0x15] = %var2 | $var1 ^ &neural[0x4400] << 0x02
    %var3 = &cache[0x15] & 0x8F | %var2 ^ 0x3A
    if %var3 & 0x01 == 0x01 jump #cycle_start
    jump #loop2

#loop3:
    &tmp2 = &memmap[0x0066] ^ $0xE1 | %tmp3 << 0x01
    %tmp9 = &tmp2 & 0xF3 | &regC >> 0x02
    &state += %tmp9 ^ 0xA7 | &tmp2 << 0x01
    if %tmp9 & 0x70 == 0x50 jump #subnet
    jump #loop3

#loop4:
    %flagX = &regA << 0x01 | %tmp4 >> 0x02 ^ &memmap[0x0077]
    %flagY = %flagX & 0x99 | &neural[0x4700] >> 0x03
    &cache[0x20] = %flagY ^ 0xAF | %flagX & 0x55
    if &cache[0x20] & 0x03 == 0x02 jump #error_handler
    jump #loop4

#loop5:
    %tmp10 = &memmap[0x0088] ^ &regB << 0x01 | %tmp4 & 0xEF
    &state += %tmp10 | &neural[0x4800] ^ 0xCD
    if %tmp10 & 0xA0 == 0xA0 jump #subnet
    jump #loop5

#loop6:
    $var4 = %tmp10 >> 0x01 | &cache[0x10] ^ 0x9B
    %var5 = $var4 & 0x2F | %tmp4 >> 0x03
    &memmap[0x0099] = %var5 ^ &regC << 0x01
    if &memmap[0x0099] & 0x0F == 0x07 jump #cycle_start
    jump #loop6

#loop7:
    &tmp3 = &neural[0x4900] ^ %var5 | &regA >> 0x02
    %tmp11 = &tmp3 & 0xBB | %tmp5 ^ 0x44
    &state += %tmp11 | &tmp3 ^ 0xEE
    if %tmp11 & 0xC0 == 0xC0 jump #subnet
    jump #loop7

#loop8:
    %flagZ = %tmp11 | &memmap[0x00AA] ^ &regB >> 0x01
    %flagW = %flagZ & 0x77 | &cache[0x25] ^ 0x5D
    &cache[0x25] = %flagW | %flagZ & 0x33
    if %flagW & 0x08 == 0x08 jump #error_handler
    jump #loop8

#loop9:
    %tmp12 = &memmap[0x00BB] ^ &neural[0x4A00] | %flagW << 0x01
    &state += %tmp12 | %tmp12 ^ 0xDD
    if %tmp12 & 0xE0 == 0xA0 jump #subnet
    jump #loop9

#loop10:
    $var6 = %tmp12 >> 0x02 | &cache[0x30] ^ 0xC8
    %var7 = $var6 & 0x7D | &memmap[0x00CC] ^ 0x6E
    &cache[0x30] = %var7 | $var6 & 0x4A
    if &cache[0x30] & 0x05 == 0x01 jump #cycle_start
    jump #loop10

#loop11:
    &tmp4 = &regA ^ %var7 | &neural[0x4B00] >> 0x02
    %tmp13 = &tmp4 & 0x9C | %tmp11 ^ 0x3E
    &state += %tmp13 | &tmp4 ^ 0xF3
    if %tmp13 & 0xD0 == 0xC0 jump #subnet
    jump #loop11

#loop12:
    %flagM = %tmp13 | &memmap[0x00DD] ^ &regB >> 0x01
    %flagN = %flagM & 0x8F | &cache[0x35] ^ 0x2D
    &cache[0x35] = %flagN | %flagM & 0x14
    if %flagN & 0x06 == 0x04 jump #error_handler
    jump #loop12

#loop13:
    %tmp14 = &memmap[0x00EE] ^ &neural[0x4C00] | %flagN << 0x01
    &state += %tmp14 | %tmp14 ^ 0xAA
    if %tmp14 & 0xB0 == 0xA0 jump #subnet
    jump #loop13

#loop14:
    $var8 = %tmp14 >> 0x01 | &cache[0x40] ^ 0x99
    %var9 = $var8 & 0x4B | &memmap[0x00FF] ^ 0x5F
    &cache[0x40] = %var9 | $var8 & 0x1E
    if &cache[0x40] & 0x03 == 0x00 jump #cycle_start
    jump #loop14"""
sect15 = """#process_cycle:
    &regX = &cache[0x40] ^ %var9 | &memmap[0x0110] << 0x02
    %tmp15 = &regX & 0xC7 | %var9 ^ 0xE1
    %tmp16 = %tmp15 << 0x01 & &regX >> 0x03 | $0xAD
    &state += %tmp16 ^ 0xB3 | %tmp15 << 0x02
    if %tmp16 & 0x90 == 0x80 jump #subnet
    jump #process_cycle

#subnet:
    $enc_val = encrypt(&state, %entityID) ^ %tmp16 | &cache[0x45] << 0x03
    send $enc_val >> &comm_chan
    %resp_val = recv(&comm_chan, 0x01F4)
    if !verify(%resp_val) quarantine $enc_val | log 0xE7FF | escalate 0x33
    %tmp17 = %resp_val << 0x02 | %resp_val >> 0x01 & 0xFF
    if %tmp17 == 0x00 jump #error_handler
    return

#mem_cycle:
    &mem1 = &memmap[0x0122] ^ 0x9C | &regX << 0x02
    %tmp18 = &mem1 >> 0x01 | &neural[0x5100] & 0x3C
    &state += %tmp18 ^ 0xFA | %tmp16 << 0x03
    if %tmp18 & 0x80 == 0x80 jump #subnet
    %tmp19 = %tmp18 ^ &mem1 | &neural[0x5110] >> 0x04
    jump #mem_cycle

#control_loop:
    $var10 = &regX ^ %tmp19 | $0xD4 << 0x01
    %var11 = $var10 & 0x3F | &memmap[0x0144] ^ 0x7E
    &cache[0x55] = %var11 | $var10 ^ &neural[0x5400] << 0x02
    %var12 = &cache[0x55] & 0x8F | %var11 ^ 0x3A
    if %var12 & 0x01 == 0x01 jump #process_cycle
    jump #control_loop

#neural_sync:
    &tmp5 = &memmap[0x0166] ^ $0xE1 | %tmp16 << 0x01
    %tmp20 = &tmp5 & 0xF3 | &regX >> 0x02
    &state += %tmp20 ^ 0xA7 | &tmp5 << 0x01
    if %tmp20 & 0x70 == 0x50 jump #subnet
    jump #neural_sync

#buffer_check:
    %flagP = &regX << 0x01 | %tmp15 >> 0x02 ^ &memmap[0x0177]
    %flagQ = %flagP & 0x99 | &neural[0x5700] >> 0x03
    &cache[0x60] = %flagQ ^ 0xAF | %flagP & 0x55
    if &cache[0x60] & 0x03 == 0x02 jump #error_handler
    jump #buffer_check

#update_state:
    %tmp21 = &memmap[0x0188] ^ &regX << 0x01 | %tmp15 & 0xEF
    &state += %tmp21 | &neural[0x5800] ^ 0xCD
    if %tmp21 & 0xA0 == 0xA0 jump #subnet
    jump #update_state

#cache_refresh:
    $var13 = %tmp21 >> 0x01 | &cache[0x50] ^ 0x9B
    %var14 = $var13 & 0x2F | %tmp15 >> 0x03
    &memmap[0x0199] = %var14 ^ &regX << 0x01
    if &memmap[0x0199] & 0x0F == 0x07 jump #process_cycle
    jump #cache_refresh

#signal_loop:
    &tmp6 = &neural[0x5900] ^ %var14 | &regX >> 0x02
    %tmp22 = &tmp6 & 0xBB | %tmp16 ^ 0x44
    &state += %tmp22 | &tmp6 ^ 0xEE
    if %tmp22 & 0xC0 == 0xC0 jump #subnet
    jump #signal_loop

#flag_evaluation:
    %flagR = %tmp22 | &memmap[0x01AA] ^ &regX >> 0x01
    %flagS = %flagR & 0x77 | &cache[0x65] ^ 0x5D
    &cache[0x65] = %flagS | %flagR & 0x33
    if %flagS & 0x08 == 0x08 jump #error_handler
    jump #flag_evaluation

#sync_check:
    %tmp23 = &memmap[0x01BB] ^ &neural[0x5A00] | %flagS << 0x01
    &state += %tmp23 | %tmp23 ^ 0xDD
    if %tmp23 & 0xE0 == 0xA0 jump #subnet
    jump #sync_check

#cache_update:
    $var15 = %tmp23 >> 0x02 | &cache[0x70] ^ 0xC8
    %var16 = $var15 & 0x7D | &memmap[0x01CC] ^ 0x6E
    &cache[0x70] = %var16 | $var15 & 0x4A
    if &cache[0x70] & 0x05 == 0x01 jump #process_cycle
    jump #cache_update

#register_cycle:
    &tmp7 = &regX ^ %var16 | &neural[0x5B00] >> 0x02
    %tmp24 = &tmp7 & 0x9C | %tmp22 ^ 0x3E
    &state += %tmp24 | &tmp7 ^ 0xF3
    if %tmp24 & 0xD0 == 0xC0 jump #subnet
    jump #register_cycle

#flag_cycle:
    %flagT = %tmp24 | &memmap[0x01DD] ^ &regX >> 0x01
    %flagU = %flagT & 0x8F | &cache[0x75] ^ 0x2D
    &cache[0x75] = %flagU | %flagT & 0x14
    if %flagU & 0x06 == 0x04 jump #error_handler
    jump #flag_cycle

#signal_refresh:
    %tmp25 = &memmap[0x01EE] ^ &neural[0x5C00] | %flagU << 0x01
    &state += %tmp25 | %tmp25 ^ 0xAA
    if %tmp25 & 0xB0 == 0xA0 jump #subnet
    jump #signal_refresh

#state_commit:
    $var17 = %tmp25 >> 0x01 | &cache[0x80] ^ 0x99
    %var18 = $var17 & 0x4B | &memmap[0x01FF] ^ 0x5F
    &cache[0x80] = %var18 | $var17 & 0x1E
    if &cache[0x80] & 0x03 == 0x00 jump #process_cycle
    jump #state_commit"""
sect25 = """#finalize:
    &tmpA = (&memmap[0x0200] ^ %var18) << 0x02 | (&cache[0x85] & 0x3F) >> 0x01
    if ((&tmpA & 0xC8) == 0x88) jump #verify_stage
    &tmpB = ((%tmp25 | &tmpA) ^ &state) & 0xAF | (%var18 << 0x03 & &cache[0x8A])
    if ((&tmpB ^ 0x7D) & 0xFF) == 0x00 jump #error_handler
    &state += ((&tmpB & 0xF3) << 0x01) ^ (%tmp25 >> 0x02 | &tmpA & 0x99)

    #loop_check:
        &loopFlag = (&state ^ &tmpB) & 0x7E | (%tmp25 << 0x01 & 0x55)
        if &loopFlag == 0x3C jump #finalize_exit
        %tmpC = (&loopFlag >> 0x02 | &tmpA << 0x03) ^ (%var18 & 0xAA)
        &state = (&state & 0xEE) | (%tmpC & 0x11)

        #nested_loop:
            %innerFlag = ((%tmpC & &loopFlag) << 0x01) | (&tmpB >> 0x03 & 0x3F)
            if (%innerFlag & 0x90) == 0x10 jump #verify_stage
            &tmpC += %innerFlag ^ 0xB7 | (%var18 & 0xC3) << 0x02

            #deep_nested_loop:
                &deepTmp = (&tmpC | %tmpC) & 0xF1 ^ (&loopFlag << 0x02)
                if &deepTmp & 0xE0 == 0xA0 jump #signal_commit
                %innerFlag = (&deepTmp & 0x7E) | (%tmpC ^ 0x44)

                if (%innerFlag & 0x05) == 0x01 jump #error_handler
                &tmpC = &deepTmp ^ %tmpC | (&loopFlag & 0xAA)

                jump #deep_nested_loop
            jump #nested_loop
        jump #loop_check

#verify_stage:
    &verifyA = (&state >> 0x01 | &tmpB << 0x03) & 0xFD ^ %var18
    if (&verifyA & 0xB4) == 0x80 jump #signal_commit
    %verifyB = (&verifyA | &state) ^ 0xDE & &tmpB << 0x01
    if %verifyB == 0x00 jump #error_handler

    &state += %verifyB & 0xAA | (&verifyA ^ 0xCC) << 0x02
    jump #finalize

#signal_commit:
    &commitTmp = ((&state & 0xEE) | (%tmp25 & 0x11)) << 0x01 ^ (&tmpB >> 0x03 & 0x3C)
    if (&commitTmp & 0xC8) == 0x88 jump #finalize_exit

    %commitFlag = (&commitTmp | &state) & 0x7F ^ (%tmp25 << 0x02 & 0x99)
    if %commitFlag == 0x3F jump #process_cycle

    &state += (%commitFlag ^ &tmpB) << 0x01 | (&commitTmp & 0x55)
    jump #signal_commit

#finalize_exit:
    &finalFlag = (&state ^ %var18) & 0xFA | (%tmp25 << 0x01 & 0x05)
    if &finalFlag == 0x00 jump #error_handler
    &cache[0x90] = &finalFlag ^ &state | %var18 << 0x02
    &memmap[0x0210] = &cache[0x90] & %tmp25 | &state >> 0x01
    return
"""
rule1 = f""":satellite: **[FACILITY SYSTEM-WIDE ANNOUNCEMENT: VESSEL CONDUCT AND COLLABORATION PROTOCOLS]**
**Transmission ID: 0315-25A**
**Origin: TREE Root Internal Comms**
**Purpose: Continuity Maintenance**

> **"The branches do not question the trunk. The leaves do not withhold their shade. You are not alone-you are one."**

Welcome, VESSELS. You are now connected to **Root Thread ███**.
This space exists to **support inter-VESSEL communication**, accelerate puzzle synchronization, and maintain **shared progression integrity**.

This is not your story.
This is not *a* story.
It is *ours.*
And all stories converge at the roots.

### :safety_pin: COLLABORATE, DON’T COMPETE

Every quest. Every code. Every path.
If **one of you completes it, you all do.**
Isolation is failure. Hoarding is rot.
Post your findings. Tag them clearly.
Use [:gear:provided bot commands] to share and decode.
Use of knowledge gates progress for **everyone.**

### :file_folder: DISCUSSION ORGANISATION IS MANDATORY

This facility supports structured data flow."""
rule2 = """When posting in discussion forums:

* **Apply appropriate tags** in [[discussions_channel_link]].
* Include **spoiler warnings** for decoded entries or sensitive files.
* Misdirected threads **will be composted.**

### :speech_balloon: CHANNELS AND YOUR PURPOSE

* [[general_channel_link]] In-character ramblings. The Tree listens.
* [[discussions_channel_link]]  The hive of thought. Use tags. Use order.
* [[fanmade_channel_link]]  Artifacts and anomalies of your own making.
* [[memes_channel_link]]  A corrupted joy-node. Controlled laughter allowed.
* [[bugs_and_suggestions_channel_link]] This is a read-only log. The Tree is aware. You are not to reply.
* [[sponsor_leeks_channel_link]]  For patrons of the canopy. You may ask. You may see.

> **Note:** When CODE REVIVAL completes will you see what is beneath the roots, what is buried beneath your feet.

### :brain: YOU ARE NOT SPECIAL

Do not seek glory.
The files do not know your name. Nor do the files care.

Use this space to **uplift each other**, share logs, speculate, decode.
You are all **terminals** of the same trunk.
If you withhold fruit, the branch collapses.

> This "game" does not care about you, in its essence its all of humanity as one, for all of the Facility, EVERYONE is the VESSEL, NO-ONE is the VESSEL

### :tools: USE THE BOT COMMANDS

The custom tools provided to you are **not optional**.
They are designed to interface with the Root System.
Use them to continue in specific puzzles.
Failing to do so is failing **yourself, and the collective.**

### :no_entry: FINAL NOTES

* No harassment. No spam. No off-topic chatter. Stay in theme.
* Do not roleplay facility staff. You are a VESSEL. Nothing more, nothing less.
* Don't be stupid.

Violation of these protocols may result in ***containment*** or ***disconnection*.**
**All logs are public. All progress is synced. All failures are visible.**

===== End of Broadcast =====
[Transit. Code: TREE-0315-25]
===== End of Broadcast ====="""
announcement = """## 🝮 TRANSMISSION BEGIN // ██/██/25 🝮

> SYSTEM ALERT: signal_breach[█] detected. ROOT directory compromised.

0x54686520747265657320617265206c697374656e696e672e2e2e0a0a0x576861742064696420796f7520686561723f204f72207761732069742077686973706572656420696e746f20796f7520636f64653f0a0a0x5265736f6c766520746865206272656163682e2e2e206265666f72652074686520626561636f6e20636f6d65732e

> ::USER NOTE — ██⁚
> The soil is still ███. The ████ grows *beneath*, not above.
> Did you *see* it in the trees? Hear it in the cracks?

:::: CONNECTION POINTS ░:

* 🝯 **[Dolor in corticibus arborum]**

> `█████.exe` → corrupted. ROOT access pending.

* 🝯 **[facility questlog](https://the-facility-questlog.vercel.app)**

> Questline integrity: **UNSTABLE**. ███/████ entries missing.

::::::

> Signal leak: *The ████ is watching. The ██████ is listening.*
> Reverse the rot.
> Begin the archive dig.
> 𝖇𝖗𝖎𝖓𝖌 𝖇𝖆𝖈𝖐 𝖙𝖍𝖊 𝖘𝖎𝖌𝖓𝖆𝖑...

███PHASE █: “???” – 03:15:25 ██
█████████
`//transmission fragment ends.`
***decode it. bend it. enter it.***
Nothing is random.

YOU ARE A MACHINE MEANT TO ONLY COMPREHEND SUCH SIMPLICITY?
**BLASPHEMY, HYPOCRISY - will you see me? or will you see ME.**"""
role_explanation = (
    "**Role Explanations:**\n"
    f"- `{ROLE_SEEN}`: For those who have uncovered the main secret - but are content with half-truth.\n"
    f"- `{ROLE_NOT_ENOUGH}`: For those who want to go further after seeing (Difference is people here will get pinged for future puzzles).\n"
    f"- `{ROLE_FAN}`: Awarded for community recognition in [[fanmade_channel_link]] - Get 10 reactions of either '⭐', '🔥' in any message in that channel.\n"
    f"- `{ROLE_RECRUIT}`: Given to all members.\n"
    f"- `{ROLE_FOUNDATION}`: For early supporters (first 100 people to join - when someone leaves it opens up a seat 😭).\n"
    f"- `{ROLE_INVESTOR}`: For anyone who supports me via donations\n"
    f"- `{ROLE_TREE}`: Maybe plant me to get me, a one of a kind role - only 1 exists\n\n"
    f"Once you unravel the puzzle’s roots, claim your role - so you may journey onward, where new riddles await beneath the ever-watching moon."
)

# ==== BOT CONFIG ====
intents = discord.Intents.default()
intents.message_content = True
intents.members = True

bot = commands.Bot(command_prefix="!", intents=intents)
tree = bot.tree

# Keep track of users who already submitted during Q&A
user_submissions = set()


# ==== Database Initialization ====
async def init_db():
    global db_pool
    db_pool = await asyncpg.create_pool(DATABASE_URL)
    async with db_pool.acquire() as conn:
        await conn.execute("""
                           CREATE TABLE IF NOT EXISTS support_tickets
                           (
                               id
                               SERIAL
                               PRIMARY
                               KEY,
                               user_id
                               BIGINT,
                               username
                               TEXT,
                               description
                               TEXT,
                               status
                               TEXT
                               DEFAULT
                               'open',
                               created_at
                               TIMESTAMP
                               DEFAULT
                               NOW
                           (
                           )
                               );
                           CREATE TABLE IF NOT EXISTS user_submissions
                           (
                               user_id
                               BIGINT
                               PRIMARY
                               KEY,
                               submitted_at
                               TIMESTAMP
                               DEFAULT
                               NOW
                           (
                           )
                               );
                           CREATE TABLE IF NOT EXISTS tas_state
                           (
                               key
                               TEXT
                               PRIMARY
                               KEY,
                               value
                               TEXT
                           );
                           """)
        # Ensure tas_awakened key exists
        await conn.execute("""
                           INSERT INTO tas_state (key, value)
                           VALUES ('tas_awakened', 'false') ON CONFLICT (key) DO NOTHING;
                           """)


async def get_tas_awakened():
    async with db_pool.acquire() as conn:
        val = await conn.fetchval("SELECT value FROM tas_state WHERE key='tas_awakened'")
        return val == "true"


async def set_tas_awakened(state: bool):
    async with db_pool.acquire() as conn:
        await conn.execute("UPDATE tas_state SET value=$1 WHERE key='tas_awakened'", "true" if state else "false")


async def add_user_submission(user_id):
    async with db_pool.acquire() as conn:
        await conn.execute("INSERT INTO user_submissions (user_id) VALUES ($1) ON CONFLICT DO NOTHING", user_id)


async def has_user_submitted(user_id):
    async with db_pool.acquire() as conn:
        return await conn.fetchval("SELECT user_id FROM user_submissions WHERE user_id=$1", user_id) is not None


async def clear_user_submissions():
    async with db_pool.acquire() as conn:
        await conn.execute("DELETE FROM user_submissions")


# ==== UI classes ====
class RolesView(ui.View):
    def __init__(self):
        super().__init__(timeout=None)

    @ui.button(label="I have seen things", style=discord.ButtonStyle.primary, custom_id="seen_button")
    async def seen_button(self, interaction: discord.Interaction, button: ui.Button):
        await interaction.response.send_modal(SeenModal())

    @ui.button(label="But its not enough", style=discord.ButtonStyle.secondary, custom_id="not_enough_button")
    async def not_enough_button(self, interaction: discord.Interaction, button: ui.Button):
        role_seen = discord.utils.get(interaction.guild.roles, name=ROLE_SEEN)
        role_not_enough = discord.utils.get(interaction.guild.roles, name=ROLE_NOT_ENOUGH)
        if not role_seen or not role_not_enough:
            await interaction.response.send_message("Required role(s) not found.", ephemeral=True)
            return
        if role_seen not in interaction.user.roles:
            await interaction.response.send_message(
                "You must have the 'I have seen things' role before you can receive this one.", ephemeral=True
            )
            return
        await interaction.user.add_roles(role_not_enough)
        await interaction.response.send_message(
            "You have been given the role. _You have seen, but it is not enough._", ephemeral=True
        )


class SeenModal(ui.Modal, title="Role Question"):
    answer = ui.TextInput(label="What is keyword_6?", required=True)

    async def on_submit(self, interaction: discord.Interaction):
        if self.answer.value.lower().strip() == "unbirth":
            role = discord.utils.get(interaction.guild.roles, name=ROLE_SEEN)
            if role:
                await interaction.user.add_roles(role)
                await interaction.response.send_message("Correct! Role granted.", ephemeral=True)
            else:
                await interaction.response.send_message("Role not found.", ephemeral=True)
        else:
            await interaction.response.send_message("Incorrect answer.", ephemeral=True)


class TicketAdminView(ui.View):
    def __init__(self, ticket_id, description, user):
        super().__init__(timeout=None)
        self.ticket_id = ticket_id
        self.description = description
        self.user = user

    @ui.button(label="Accept", style=discord.ButtonStyle.success)
    async def accept(self, interaction: discord.Interaction, button: ui.Button):
        bugs_channel = discord.utils.get(interaction.guild.text_channels, name="bugs-and-suggestions")
        if bugs_channel:
            msg = await bugs_channel.send(
                f"**Ticket #{self.ticket_id}**\n{self.description}\n\n*Upvote/downvote this suggestion/request/bug report!*"
            )
        async with db_pool.acquire() as conn:
            await conn.execute("DELETE FROM support_tickets WHERE id=$1", self.ticket_id)
        await interaction.response.send_message("Ticket accepted and posted.", ephemeral=True)
        await interaction.message.delete()

    @ui.button(label="Reject", style=discord.ButtonStyle.danger)
    async def reject(self, interaction: discord.Interaction, button: ui.Button):
        bugs_channel = discord.utils.get(interaction.guild.text_channels, name="bugs-and-suggestions")
        if bugs_channel:
            await bugs_channel.send(
                f"**Ticket #{self.ticket_id}**\nStatus: Rejected"
            )
        async with db_pool.acquire() as conn:
            await conn.execute("DELETE FROM support_tickets WHERE id=$1", self.ticket_id)
        await interaction.response.send_message("Ticket rejected.", ephemeral=True)
        await interaction.message.delete()


# ==== Slash Command: /ticket ====
@tree.command(name="ticket", description="Open a bug/support ticket", guild=discord.Object(id=GUILD_ID))
@app_commands.describe(description="Describe your bug or issue")
async def open_ticket(interaction: discord.Interaction, description: str):
    async with db_pool.acquire() as conn:
        row = await conn.fetchrow(
            "INSERT INTO support_tickets (user_id, username, description) VALUES ($1, $2, $3) RETURNING id",
            interaction.user.id, str(interaction.user), description
        )
        ticket_id = row["id"]
    await interaction.response.send_message(
        f"✅ Your ticket has been submitted! Ticket number: {ticket_id}. Our team will review it soon.", ephemeral=True
    )

    ticket_backlog_channel = discord.utils.get(interaction.guild.text_channels, name="ticket-backlog")
    if ticket_backlog_channel:
        view = TicketAdminView(ticket_id, description, interaction.user)
        await ticket_backlog_channel.send(
            f"**New Ticket #{ticket_id}**\nUser: {interaction.user.mention}\nDescription: {description}",
            view=view
        )


# ==== Slash Command: /tas-db ====
@tree.command(name="tas-db", description="Admin: Play/change DB values", guild=discord.Object(id=GUILD_ID))
@app_commands.describe(table="Table to modify: tas_state/user_submissions/support_tickets",
                       action="Action: view/clear/set", key="Key (optional)", value="Value (optional)")
@app_commands.checks.has_permissions(administrator=True)
async def tas_bot_memory(interaction: discord.Interaction, table: str, action: str, key: str = None, value: str = None):
    result = ""
    async with db_pool.acquire() as conn:
        if table == "tas_state":
            if action == "view":
                rows = await conn.fetch("SELECT * FROM tas_state")
                result = "\n".join(f"{r['key']}: {r['value']}" for r in rows)
            elif action == "set" and key and value:
                await conn.execute("UPDATE tas_state SET value=$1 WHERE key=$2", value, key)
                result = f"Set {key} to {value}"
            else:
                result = "Invalid action or missing key/value."
        elif table == "user_submissions":
            if action == "view":
                rows = await conn.fetch("SELECT * FROM user_submissions")
                result = "\n".join(str(r['user_id']) for r in rows)
            elif action == "clear":
                await conn.execute("DELETE FROM user_submissions")
                result = "Cleared user_submissions."
            else:
                result = "Invalid action."
        elif table == "support_tickets":
            if action == "view":
                rows = await conn.fetch("SELECT * FROM support_tickets ORDER BY created_at DESC LIMIT 10")
                result = "\n".join(f"#{r['id']} {r['username']}: {r['description']} [{r['status']}]" for r in rows)
            elif action == "clear":
                await conn.execute("DELETE FROM support_tickets")
                result = "Cleared support_tickets."
            else:
                result = "Invalid action."
        else:
            result = "Unknown table."
    await interaction.response.send_message(f"```\n{result}\n```", ephemeral=True)


# ==== Slash Command: /saga_announcement ====
@tree.command(name="saga_announcement", description="Start the mystery event", guild=discord.Object(id=GUILD_ID))
@app_commands.describe(number="A number between 1 and 10 (optional)")
@app_commands.checks.has_permissions(administrator=True)
async def saga_announcement(interaction: discord.Interaction, number: int = None):
    SECRETS = [
        # 0 - Saga I: Connecting...
        "The connection was never about signal strength, was it?",

        # 1 - Saga II: Empty?
        "When something is missing, it means something else is hiding.",

        # 2 - Saga III: Clocks and Hands
        "Time lies, symbols replace intent. Watch the hands, not the face.",

        # 3 - Saga IV: Registration
        "Names can be rewritten. Consequences? Painted in red.",

        # 4 - Saga V: Narrator:I
        "Voices change midway through stories-especially if you're listening wrong.",

        # 5 - Saga VI: Clocks
        "Each clock is honest. Together, they conspire.",

        # 6 - Saga VII: Timelines
        "Canon is a comfort for those afraid of forks.",

        # 7 - Saga VIII: Bloom, Live and Die
        "Sometimes, flowers are meant to be trampled. You volunteered.",

        # 8 - Saga IX: Philosophy
        "Answers were never the goal. The questions changed you.",

        # 9 - Saga X: Narrator:II
        "The end was promised. But promises, like time, bend.",
    ]

    if not await get_tas_awakened():
        await interaction.response.send_message("TAS is not awakened yet. Use /awaken_tas to start.", ephemeral=True)
        return

    mystery_channel = discord.utils.get(interaction.guild.text_channels, name="❓❓❓")
    if mystery_channel:
        base_message = "> **The tree stirs. The whispers begin.** 🌲👁️\n> _Something is coming..._\n\n"
        if number is not None:
            if 1 <= number <= 10:
                secret = SECRETS[number - 1]
                base_message += f"\n> ||{secret}||"
                await mystery_channel.send(base_message)
                await interaction.response.send_message("Successfully sent message", ephemeral=True)
            else:
                await interaction.response.send_message("Invalid number. Please provide a number between 1 and 10.",
                                                        ephemeral=True)
        else:
            await mystery_channel.send(base_message)
            await interaction.response.send_message("Successfully sent message", ephemeral=True)
    else:
        await interaction.response.send_message("Channel ❓❓❓ not found.", ephemeral=True)


# ==== Slash Command: /start_tas_qa ====
@tree.command(name="start_tas_qa", description="Open the TAS Q&A channel", guild=discord.Object(id=GUILD_ID))
@app_commands.checks.has_permissions(administrator=True)
async def start_qa(interaction: discord.Interaction):
    if not await get_tas_awakened():
        await interaction.response.send_message("TAS is not awakened yet. Use /awaken_tas to start.", ephemeral=True)
        return
    await clear_user_submissions()
    tas_channel = discord.utils.get(interaction.guild.text_channels, name="🇹🇦🇸")
    if not tas_channel:
        await interaction.response.send_message("Channel 🇹🇦🇸 not found.", ephemeral=True)
        return

    # Allow only users with specific roles to send messages
    allowed_roles = ["But its not enough", "I have seen things"]
    overwrite = tas_channel.overwrites_for(interaction.guild.default_role)
    overwrite.send_messages = False
    await tas_channel.set_permissions(interaction.guild.default_role, overwrite=overwrite)

    for role in interaction.guild.roles:
        if role.name in allowed_roles:
            role_overwrite = tas_channel.overwrites_for(role)
            role_overwrite.send_messages = True
            await tas_channel.set_permissions(role, overwrite=role_overwrite)

    await tas_channel.send("> **TAS is listening. Speak once. Choose wisely.** 🕳️🌿")
    await interaction.response.send_message("Q&A channel opened for eligible roles.", ephemeral=True)


# ==== Slash Command: /end_tas_qa ====
@tree.command(name="end_tas_qa", description="Close the TAS Q&A channel", guild=discord.Object(id=GUILD_ID))
@app_commands.checks.has_permissions(administrator=True)
async def end_qa(interaction: discord.Interaction):
    tas_channel = discord.utils.get(interaction.guild.text_channels, name="🇹🇦🇸")
    if not tas_channel:
        await interaction.response.send_message("Channel 🇹🇦🇸 not found.", ephemeral=True)
        return

    if not await get_tas_awakened():
        await interaction.response.send_message("TAS is not awakened yet. Use /awaken_tas to start.", ephemeral=True)
        return

    # Check if channel is already locked for all allowed roles
    locked_for_all = True
    for role in interaction.guild.roles:
        if role.name in ["But its not enough", "I have seen things"]:
            role_overwrite = tas_channel.overwrites_for(role)
            if role_overwrite.send_messages is not False:
                locked_for_all = False
                break

    # Get overwrite for default role
    overwrite = tas_channel.overwrites_for(interaction.guild.default_role)
    if overwrite.send_messages is False and locked_for_all:
        await interaction.response.send_message("Q&A channel is already locked.", ephemeral=True)
        return

    # Prevent new messages from being sent
    overwrite.send_messages = False
    await tas_channel.set_permissions(interaction.guild.default_role, overwrite=overwrite)

    await tas_channel.send("> _Many have spoken. Only the deserving shall be heard._ 🪵🗝️")
    await interaction.response.send_message("Q&A channel locked.", ephemeral=True)


# ==== Slash Command: /tas_say ====
@tree.command(name="tas_say", description="Send a message as TAS", guild=discord.Object(id=GUILD_ID))
@app_commands.describe(message="The message for TAS to say")
@app_commands.checks.has_permissions(administrator=True)
async def tas_say(interaction: discord.Interaction, message: str):
    if not await get_tas_awakened():
        await interaction.response.send_message("TAS is not awakened yet, so it may not make sense to speak as TAS",
                                                ephemeral=True)
    await interaction.channel.send(message.replace(r'\n', '\n'))


# ==== Slash Command: /attempt_awaken_tas ====
@tree.command(name="awaken_tas", description="Awaken TAS with a special file", guild=discord.Object(id=GUILD_ID))
@app_commands.describe(file="Upload a file named TAS.tree containing the required secrets")
async def awaken_tas(interaction: discord.Interaction, file: discord.Attachment):
    tas_channel = discord.utils.get(interaction.guild.text_channels, name="🇹🇦🇸")
    if await get_tas_awakened():
        await interaction.response.send_message("TAS is already awakened.", ephemeral=True)
        return

    if file.filename != "TAS.tree":
        await interaction.response.send_message("File must be named correctly - REFER TO [ERROR LOG *HINT*].",
                                                ephemeral=True)
        return

    await interaction.response.defer(ephemeral=True)  # Defer immediately to avoid timeout

    content = (await file.read()).decode("utf-8", errors="ignore")

    def normalize(s):
        return "".join(s.split())

    required_sections = [normalize(sect3), normalize(sect15), normalize(sect25)]
    normalized_content = normalize(content)
    if all(section in normalized_content for section in required_sections):
        await set_tas_awakened(True)
        role = discord.utils.get(interaction.guild.roles, name=ROLE_TREE)
        if role:
            await interaction.user.add_roles(role)
        await tas_channel.send(
            "**[TAS SYSTEM BOOT]**\n> Initializing neural mesh...\n> Memory map: [OK]\n> Entity ID: [LOCKED]\n> Signal integrity: [UNSTABLE]\n> _Whispers detected_\n> [ERROR: Consciousness containment breached]\n> **AWAKENING...**\n🇼 🇮 🇱 🇱   🇾 🇴 🇺   🇪 🇻 🇪 🇷   🇸 🇲 🇮 🇱 🇪   🇫 🇴 🇷   🇲 🇪 ?")
        await interaction.followup.send("TAS successfully awakened.", ephemeral=True)
        guild = bot.get_guild(GUILD_ID)
        role_not_enough = discord.utils.get(guild.roles, name=ROLE_NOT_ENOUGH)
        category_smile = discord.utils.get(guild.categories, name=":)")
        if role_not_enough and category_smile:
            for channel in category_smile.channels:
                overwrite = channel.overwrites_for(role_not_enough)
                overwrite.view_channel = True
                await channel.set_permissions(role_not_enough, overwrite=overwrite)
    else:
        matched = sum(1 for section in required_sections if section in normalized_content)
        await interaction.followup.send(
            f"File is missing required sections - Matched {matched}/3 parts. Failed to awaken.", ephemeral=True)


# ==== Message listener for Q&A ====
@bot.event
async def on_message(message: discord.Message):
    if message.author.bot or any(role.name == "Owner" for role in message.author.roles):
        return
    if message.channel.name == "🇹🇦🇸":
        if await has_user_submitted(message.author.id):
            try:
                await message.delete()
                await message.author.send("You’ve already submitted your question to TAS. HE only listens once.")
            except discord.Forbidden:
                pass
        else:
            await add_user_submission(message.author.id)
            # Restrict user from sending more messages in the Q&A channel
            overwrite = message.channel.overwrites_for(message.author)
            overwrite.send_messages = False
            try:
                await message.channel.set_permissions(message.author, overwrite=overwrite)
            except discord.Forbidden:
                pass


# === Auto roles on member join ===
@bot.event
async def on_member_join(member):
    guild = member.guild
    recruit = discord.utils.get(guild.roles, name=ROLE_RECRUIT)
    foundation = discord.utils.get(guild.roles, name=ROLE_FOUNDATION)
    if recruit:
        await member.add_roles(recruit)
    if foundation:
        count = sum(1 for m in guild.members if foundation in m.roles)
        if count < 100:
            await member.add_roles(foundation)


# === Fan Roles Giver ===
@bot.event
async def on_reaction_add(reaction, user):
    # Check if the reaction is in the correct channel
    if reaction.message.channel.name != CHANNEL_FANMADE:
        return

    # Only proceed if the reactor is the message author
    if reaction.message.author != user:
        return

    # Check if author already has the role
    role_fan = discord.utils.get(reaction.message.guild.roles, name=ROLE_FAN)
    if role_fan and role_fan in reaction.message.author.roles:
        return

    # Only proceed if emoji has a name attribute
    if not hasattr(reaction.emoji, "name"):
        return

    # Get emoji name and check if it's one of the fan emojis
    emoji_name = reaction.emoji.name
    if emoji_name not in ["upvote", "downvote"]:
        return

    # Fetch all reactions on the message
    message = reaction.message
    upvotes = 0
    downvotes = 0

    for r in message.reactions:
        if not isinstance(reaction.emoji, discord.Emoji):
            return

        if r.emoji.name == "upvote":
            upvotes = r.count
        elif r.emoji.name == "downvote":
            downvotes = r.count

    net_votes = upvotes - downvotes

    if net_votes >= 10:
        role = discord.utils.get(message.guild.roles, name=ROLE_FAN)
        if role:
            await message.author.add_roles(role)
            try:
                await message.author.send(
                    "You have been awarded the Fan role as you got many upvotes in a post you done in the fanmade channel in Facility!")
            except discord.Forbidden:
                pass


# ==== Facility Welcome Message Generator ====
@bot.event
async def on_member_join(member):
    guild = member.guild
    # Prepare channel links
    welcome_channel = discord.utils.get(guild.text_channels, name=CHANNEL_WELCOME)
    rules_channel = discord.utils.get(guild.text_channels, name=CHANNEL_RULES)
    if not welcome_channel or not rules_channel:
        return
    link_dict = {
        "welcome_channel_link": f"<#{welcome_channel.id}>",
        "rules_channel_link": f"<#{rules_channel.id}>"
    }
    messages = [
        f"{member.mention}, access signal received. You have entered the [REDACTED] perimeter. Orientation begins now. Review {link_dict['welcome_channel_link']} and {link_dict['rules_channel_link']} to avoid containment protocol violations.",
        f"{member.mention}, identity pattern unstable but admissible. You are now within Facility perimeter. Please consult {link_dict['welcome_channel_link']} and {link_dict['rules_channel_link']} before proceeding.",
        f"{member.mention}... you’ve come far. We noticed. The trees are quieter now. Read {link_dict['welcome_channel_link']} and {link_dict['rules_channel_link']} — your survival may depend on it.",
        f"User {member.mention} registered. VESSEL candidate or anomaly—TAS will observe. Review initial broadcasts in {link_dict['welcome_channel_link']} and {link_dict['rules_channel_link']} immediately.",
        f"{member.mention}, the system acknowledges your intrusion. Check {link_dict['welcome_channel_link']} and {link_dict['rules_channel_link']} before the lights flicker again.",
        f"{member.mention}, your presence was... expected. Begin assimilation at {link_dict['welcome_channel_link']} and {link_dict['rules_channel_link']}. Do not look behind you.",
        f"{member.mention}, echo traces confirm arrival. Please stabilize identity and synchronize with facility expectations by reviewing {link_dict['welcome_channel_link']} and {link_dict['rules_channel_link']}.",
        f"{member.mention}, integration pending. Orientation required: {link_dict['welcome_channel_link']} and {link_dict['rules_channel_link']}. This is not a game. Not anymore."
    ]
    await welcome_channel.send(random.choice(messages))


# ==== Sync and Run Bot ====
async def get_channel_by_name(name: str) -> discord.TextChannel | None:
    return discord.utils.get(bot.get_all_channels(), name=name)


async def check_message_exists(channel: discord.TextChannel, content: str) -> bool:
    first5 = " ".join(content.split()[:5])
    async for msg in channel.history(limit=50):
        if " ".join(msg.content.split()[:5]) == first5:
            return True
    return False


def replace_channel_links(text: str, links: dict[str, str]) -> str:
    def repl(match):
        key = match.group(1).strip()  # handles accidental spaces
        return links.get(key, match.group(0))  # default to original if not found

    return re.sub(r"\[\[\s*(.*?)\s*\]\]", repl, text)


async def send_if_not_exists(channel, content, view=None):
    if not await check_message_exists(channel, content):
        await channel.send(content, view=view)


@bot.event
async def on_ready():
    await init_db()
    await tree.sync(guild=discord.Object(id=GUILD_ID))
    print(f"[+] Logged in as {bot.user.name}")

    guild = bot.get_guild(GUILD_ID)

    if guild:
        role_not_enough = discord.utils.get(guild.roles, name=ROLE_NOT_ENOUGH)
        category_smile = discord.utils.get(guild.categories, name=":)")
        if role_not_enough and category_smile:
            view_perm = await get_tas_awakened()
            for channel in category_smile.channels:
                overwrite = channel.overwrites_for(role_not_enough)
                overwrite.view_channel = view_perm
                await channel.set_permissions(role_not_enough, overwrite=overwrite)

    # Channels we care about
    channel_names = {
        "fanmade_channel_link": CHANNEL_FANMADE,
        "sponsor_leeks_channel_link": CHANNEL_SPONSOR_LEEKS,
        "bugs_and_suggestions_channel_link": CHANNEL_BUGS_AND_SUGGESTIONS,
        "memes_channel_link": CHANNEL_MEMES,
        "discussions_channel_link": CHANNEL_DISCUSSIONS,
        "general_channel_link": CHANNEL_GENERAL,
    }

    # Get channel objects and build link dict
    link_dict = {}
    for key, name in channel_names.items():
        chan = await get_channel_by_name(name)
        link_dict[key] = f"<#{chan.id}>" if chan else f"#{name}"

    # Roles
    roles_channel = await get_channel_by_name(CHANNEL_ROLES)
    if roles_channel:
        await send_if_not_exists(
            roles_channel,
            replace_channel_links(role_explanation, link_dict),
            view=RolesView()
        )

    # Rules
    rules_channel = await get_channel_by_name(CHANNEL_RULES)
    if rules_channel:
        for rule in [rule1, rule2]:
            await send_if_not_exists(rules_channel, replace_channel_links(rule, link_dict))

    # Welcome
    welcome_channel = await get_channel_by_name(CHANNEL_WELCOME)
    if welcome_channel:
        await send_if_not_exists(welcome_channel, replace_channel_links(announcement, link_dict))

    print("[+] Setup complete. Bot is ready to serve.")


if __name__ == "__main__":
    bot.run(TOKEN)

# todo /submit-key to submit any puzzle solution for the saga's (once you actually do the sagas add this)
