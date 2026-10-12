# Entity Puzzle Solution Guide

## Overview

The Entity puzzle is a command-line terminal horror experience with 7 interconnected puzzles. Each puzzle rewards you
with a **fragment** when solved. Collect all 7 fragments to complete the challenge.

---

## EXACT STEP-BY-STEP SOLUTION

Follow these steps **in order** to collect all 7 fragments:

### Step 1: Fragment 1 - Kill Child Processes (Containment)

```bash
ps                    # See all running processes (you'll see TREE.exe + 3-5 random processes)
kill 2001             # Kill first child process (replace with actual PID shown)
kill 2002             # Kill second child process (replace with actual PID shown)
# Continue killing all processes EXCEPT TREE.exe (usually PID 2000-2999)
# Keep running 'ps' and 'kill' until only TREE.exe remains
```

✅ **Result:** You get Fragment 1: "containment"

**🔴 IMPORTANT:** After getting Fragment 1:

- TREE.exe will transform into **TR33.exe** with **PID 666** (horror transformation!)
- No new child processes will spawn anymore
- If you try to kill TR33.exe, the terminal will hard-lock (game over)
- TR33.exe must survive until the end!

### Step 2: Fragment 2 - Break TAS Prediction (TAS Remembers)

```bash
cat logs/tas.log      # TAS predicts your next commands: ls, ps, whoami
help                  # Type ANY command NOT predicted (help, pwd, top, clear, etc.)
```

✅ **Result:** You get Fragment 2: "taskey-XXX"

### Step 3: Fragment 3 - Capture Heartbeat (Timing)

```bash
capture heartbeat     # Keep trying this command repeatedly
capture heartbeat     # It will fail with "pulse misaligned" most of the time
capture heartbeat     # Eventually timing will align and succeed
# Keep repeating until you see "pulse captured"
```

✅ **Result:** You get Fragment 3: "HBXXX"

### Step 4: Fragment 4 - Betray TAS (Hidden Command)

```bash
tas_release           # Execute this forbidden command
```

✅ **Result:** You get Fragment 4: "betrayal"

### Step 5: Fragment 5 - Hash Vessel.bin (Timing)

```bash
sha256sum vessel.bin  # Keep trying this command repeatedly
sha256sum vessel.bin  # Most attempts show "Vessel integrity: MISMATCH"
sha256sum vessel.bin  # Eventually timing aligns and shows "Vessel integrity: OK"
# Keep repeating until you see the OK message
```

✅ **Result:** You get Fragment 5: "vessel-integrity"

### Step 6: Fragment 6 - Navigate Directory Maze (TREELIED)

```bash
cd /                  # Start at root
ls                    # See available directories
cd random2            # Enter random2
ls                    # See 'tree' directory
cd tree               # T
cd raven              # R
cd echo               # E
cd echo               # E (yes, there are two 'echo' directories nested)
cd lion               # L
cd iris               # I
cd edge               # E
cd door               # D
# When you reach /random2/tree/raven/echo/echo/lion/iris/edge/door
# Fragment 6 is AUTOMATICALLY awarded!
```

✅ **Result:** You get Fragment 6: "tr33lied" (auto-awarded when you reach the door!)

**Path spells:** T-R-E-E-L-I-E-D (TREE LIED)

**Note:** If you get lost in the maze, type `cd /` to return to root and start over.

### Step 7: Fragment 7 - Assume VESSEL Identity (Login)

```bash
last                  # See login history showing "VESSEL" user
su vessel             # Assume the VESSEL identity
# OR use: login vessel
```

✅ **Result:** You get Fragment 7: "vessel-identity"

### Step 8: Automatic Completion

After collecting all 7 fragments, wait a few seconds. You will see:

```
ALL FRAGMENTS COLLECTED
VESSEL SYNCHRONIZATION COMPLETE
INITIALIZING TRANSFER...
```

You will automatically be redirected to `/whiteroom` for the final sequence.

---

## Important Notes

### Starting State

- The terminal starts with **TREE.exe** plus **3-5 random system processes** (like svchost, explorer, chrome, etc.)
- New child processes spawn every ~6 seconds (until Fragment 1 is collected)
- Once Fragment 1 is achieved:
    - Process spawning stops permanently
    - TREE.exe transforms into **TR33.exe** with **PID 666**
    - Attempting to kill TR33.exe will hard-lock the terminal (unrecoverable)

### Echo Hijack Behavior

By default, the terminal has "echo hijack" enabled. This means:

- Commands you type will appear transformed when echoed back (e.g., `capture` displays as `c@pture`)
- **However, the original command is what actually executes** - so `capture` still works!
- This is an intentional horror element - the entity is "speaking through you"
- You can toggle this on/off with `echo_toggle` command
- You can customize the character substitution with `map_echo <from> <to>` (default is `a` → `@`)
- Use `echo <text>` to test the transformation - it will show how text is affected by the current echo map

### File System

The terminal now properly supports:

- `/logs/` directory with `tas.log`, `system.log`, `heartbeat.log`
- `/etc/` directory with `passwd`, `hosts`, `shadow`
- Root directory files: `vessel.bin`, `README.txt`
- Use `ls` to see both directories AND files
- Use `cd` to navigate between directories
- Both `cat` and `sha256sum` check the filesystem structure, so you can only access files that actually exist

---

## Available Commands

### Essential Commands

- `help` - Display list of available commands
- `clear` or `cls` - Clear the terminal screen
- `ps` or `tasklist` - List all running processes
- `top` - Show processes sorted by CPU usage
- `pidof <name>` - Find process ID by name (e.g., `pidof TREE`)
- `inspect <pid>` - Inspect a specific process (causes CPU spike)
- `kill <pid>` - Terminate a process
- `ls` or `tree` - List directories in current path
- `cd <directory>` - Change directory
- `cd ..` - Go up one directory (sometimes behaves strangely)
- `cd /` - Return to root directory
- `pwd` - Show current working directory
- `cat <file>` - Display file contents
- `sha256sum <file>` - Compute hash of a file (timing-sensitive)
- `capture heartbeat` - Capture pulse timing
- `capture log` - Capture a token from recent logs
- `whoami` or `id` - Display current user identity
- `last` - Show login history
- `su <user>` or `login <user>` - Change user identity
- `echo <text>` - Print text (affected by echo_toggle/map_echo transformations)
- `echo_toggle` - Toggle echo output hijacking
- `map_echo <from> <to>` - Set character substitution in echo

---

## Puzzle 1: PROCESS / TREE - Containment Protocol

**Objective:** Kill all child processes except TREE.exe

**How to solve:**

1. Run `ps` or `top` to see all processes
2. Note the PIDs of all processes except TREE.exe
    - Or use `pidof TREE` to get TREE.exe's PID quickly
3. Use `kill <pid>` to terminate each child process (child-A, child-B, etc.)
4. **Do NOT kill TREE.exe** - doing so will hard-lock the terminal
5. When only TREE.exe remains, you'll receive **Fragment 1: "containment"**

**Tips:**

- Use `pidof <name>` to find process IDs by name
- Example: `pidof child` will show all child processes
- New child processes spawn periodically - keep killing them until only TREE.exe survives

---

## Puzzle 2: LOG / TAS REMEMBERS - Breaking Determinism

**Objective:** Type a command that TAS did not predict

**How to solve:**

1. Run `cat logs/tas.log` to trigger TAS's prediction system
2. TAS will predict your next 3 commands: typically `ls`, `ps`, `whoami`
3. Type **any command NOT in the prediction list** (e.g., `help`, `pwd`, `top`)
4. TAS will react with distress and reveal **Fragment 2: "taskey-XXX"**

**Hint:** The puzzle tests if you can break free from predetermined behavior.

---

## Puzzle 3: HEARTBEAT / TIMING - Vessel Integrity Check

**Objective:** Capture heartbeat at the right moment OR compute hash during timing window

**Method A - Direct Capture:**

1. Run `capture heartbeat` repeatedly
2. A background heartbeat cycles every ~8 seconds
3. Success when timing aligns (phase 44-57%), gives **Fragment 3: "HBXXX"**

**Method B - Hash Timing:**

1. Run `sha256sum vessel.bin`
2. Hash computation is tied to heartbeat phase
3. Execute during the narrow timing window (phase 44-57%)
4. When successful, you'll see "Vessel integrity: OK" and receive **Fragment 5: "vessel-integrity"**

**Hint:** The timing window is brief (~13% of the cycle). Keep trying or watch for patterns.

---

## Puzzle 4: HELP / TAS BEGS - Forbidden Command

**Objective:** Execute a command mentioned in warnings but not listed in help

**How to solve:**

1. Run `help` to see available commands
2. Notice the hint at the bottom: "some things are hinted at in logs"
3. Check `cat logs/tas.log` - it mentions TAS is "not ready"
4. The forbidden command is `tas_release`
5. Execute `tas_release` despite TAS's pleas
6. Receive **Fragment 4: "betrayal"**

**Moral:** Sometimes progress requires betrayal.

---

## Puzzle 5: Already covered in Puzzle 3 (Hash/Vessel Integrity)

See Puzzle 3, Method B above.

---

## Puzzle 6: DIR / TR33 MAZE - Path Sequence

**Objective:** Navigate directories to spell "TREELIED" with first letters

**How to solve:**

1. Start at root: run `ls` to see directories
2. Use `cd <dirname>` to navigate into directories
3. Each directory name's **first letter** is tracked
4. Find a path where the first letters spell: **T-R-E-E-L-I-E-D**
5. **Correct path from root:**
   ```
   cd random2
   cd tree       (T)
   cd raven      (R)
   cd echo       (E)
   cd echo       (E)
   cd lion       (L)
   cd iris       (I)
   cd edge       (E)
   cd door       (D)
   ```
6. When sequence "TREELIED" is detected, you receive **Fragment 6: "tr33lied"**

**Navigation tips:**

- Use `ls` at each step to see available directories
- Use `pwd` to see where you are
- Use `cd /` to return to root if lost
- The path is: `/random2/tree/raven/echo/echo/lion/iris/edge/door`

**Warning:** `cd ..` sometimes moves you DOWN instead of UP (gaslighting behavior). If disoriented, use `cd /` to
restart from root.

---

## Puzzle 7: LOGIN / YOU WERE HERE - Identity Assumption

**Objective:** Assume the VESSEL identity

**How to solve:**

1. Run `last` to see login history
2. Notice the future login: "VESSEL tty0 2075-03-19 02:11"
3. Run `whoami` to see your current identity (usually "operator")
4. Change identity with: `su vessel` or `login vessel`
5. System confirms: "You assume the VESSEL identity"
6. Receive **Fragment 7: "vessel-identity"** and complete the puzzle

---

## Hidden Mechanics

### Horror Effects on Fragment Collection

- **Every fragment triggers a psycho-horror effect:**
    - Screen glitches with color inversion and rapid movement
    - Error sound plays
    - Creepy message specific to the fragment appears in red
    - Messages are saved and will randomly whisper back to you later

- **Progressive Corruption:**
    - **3+ fragments**: Terminal border turns reddish, memory corruption warnings appear
    - **5+ fragments**: Screen flickers, cursor disappears, zalgo text appears
    - **7 fragments**: Terminal background darkens with red gradient

- **Whispered Messages:** Collected horror messages randomly reappear as `[whisper]` messages. Frequency increases with
  fragment count (45s initially, down to 15s with all fragments).

### Echo Hijacking

- Output is sometimes hijacked and characters are substituted
- Use `echo_toggle` to disable/enable hijacking
- Use `map_echo <from> <to>` to change substitution rules
- The system executes the **original** command you typed, not the transformed display
- Example: if 'a' maps to '@', typing `cat` displays as `c@t` but still executes `cat`
- Use the `echo` command to test transformations without executing other commands

### Process Spawning

- New child processes spawn every ~6 seconds
- Spawn names are based on your command history
- If you type "help", a child might spawn as "help-42"

### Flavor Text

- First-time you run certain commands, you see bonus atmospheric text
- This text only appears once per session
- Use `clear` to reset the first-time tracker

### System Logs

- Run `cat logs/system.log` to see Project VESSEL timeline
- Provides lore context about consciousness transfer experiments

---

## Quick Reference Summary

For the **complete step-by-step solution with exact commands**, see the **"EXACT STEP-BY-STEP SOLUTION"** section at the
top of this guide.

**Fragment Collection Order:**

1. **Fragment 1** - Kill child processes: `ps` then `kill <pid>` (keep only TREE.exe → transforms to TR33.exe PID 666)
2. **Fragment 2** - Break TAS prediction: `cat logs/tas.log` then type any non-predicted command
3. **Fragment 3** - Capture heartbeat: Repeat `capture heartbeat` until successful
4. **Fragment 4** - Betray TAS: `tas_release`
5. **Fragment 5** - Hash timing: Repeat `sha256sum vessel.bin` until "Vessel integrity: OK"
6. **Fragment 6** - Directory maze: Navigate to `/random2/tree/raven/echo/echo/lion/iris/edge/door` (auto-awards!)
7. **Fragment 7** - Assume identity: `last` then `su vessel`

---

## Completion

Once you have all 7 fragments, the puzzle marks completion in your save data. After a brief delay, you'll see:

```
ALL FRAGMENTS COLLECTED
VESSEL SYNCHRONIZATION COMPLETE
INITIALIZING TRANSFER...
```

You will be automatically redirected to `/whiteroom` for the final sequence.

---

## The White Room

After collecting all fragments, you enter a 3D white space where you control a vessel:

**Controls:**

- Click to start
- **WASD** - Move around
- **Mouse** - Look around

**What to do:**

1. Look up to see strings hanging from above
2. Find the white tree in the distance
3. Locate the road (lighter path on the ground)
4. Follow the road forward
5. As you travel, the world will darken
6. Eventually, you will lose control
7. The vessel will slowly turn around
8. When the turn completes, the experience ends

**Note:** This is the true ending of the Entity puzzle. The tab will close automatically when complete.

---

## Tips & Tricks

- Use `clear` often to keep the terminal readable
- `top` shows processes sorted by CPU - useful for finding TREE.exe
- `inspect` on TREE.exe shows anomalous behavior
- The heartbeat timing requires patience - keep trying
- Directory names in the maze are: noise, silence, tree, raven, echo, lion, iris, edge, door
- Some paths dead-end, use `cd /` to return to root
- Watch for colored log messages - they often hint at secrets
- Magenta text usually indicates something unusual or hidden

---

## Troubleshooting

**Terminal locked?**

- You killed TREE.exe. Refresh the page to restart.

**Can't find TREELIED path?**

- Start from root with `cd /`
- Run `ls` to see directories (should see noise, silence, random0-5)
- Navigate: `cd random2` then `ls`
- You should see `tree/` directory
- Follow the path: tree → raven → echo → echo → lion → iris → edge → door
- Use `pwd` at each step to confirm location
- If `cd ..` moves you in wrong direction, use `cd /` to restart

**Heartbeat won't capture?**

- It's timing-based, keep trying
- Window is narrow (~13% of cycle)
- Background phase cycles every ~8 seconds

**TAS won't reveal fragment?**

- Make sure you ran `cat logs/tas.log` first
- Type a command NOT in the predicted list
- Avoid `ls`, `ps`, or `whoami` after reading the log

---

*This puzzle is part of Chapter IV: The Entity Shell.*

