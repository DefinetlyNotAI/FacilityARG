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
"""
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
