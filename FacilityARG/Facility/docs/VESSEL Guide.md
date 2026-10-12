# **VESSEL ARG - ULTIMATE COMPLETE DOCUMENTATION**

## **Every Command, Trigger, Mechanism, and Secret - Nothing Undocumented**

---

## **CRITICAL SETUP REQUIREMENTS**

### **System Requirements**

- **Windows OS ONLY** - Linux/Mac will not work
- **Run as Administrator** - Required for all functionality
- **Audio MUST be enabled** - Essential for TTS guidance and audio cues
- **Pure console environment** - Don't run in IDE terminals (PyCharm, VSCode)

### **Important Warnings**

- **DO NOT delete logs** - Copy them if you want to save them elsewhere
- **DO NOT exit mid-command** - Can cause softlocks requiring restart
- **DO NOT run multiple instances** - Can cause registry conflicts
- **Keep audio on** - TTS provides critical guidance and lore

---

## **COMPLETE LOG OVERVIEW**

### **Total Logs Required**

- **666 Error logs** (IDs 1-666)
- **43 Fight logs** (IDs 0-42)
- **Total: 709 logs**

### **Log Storage Locations**

- **Error logs**: `== GENERATED ITEMS ==/logs/error/error_{ID}.log`
- **Fight logs**: `== GENERATED ITEMS ==/logs/fight/fight_{ID}.log`

---

## **PHASE 1: INITIAL STARTUP & BASIC COMMANDS**

### **Step 1: First Launch**

```bash
python vessel.exe.py
```

**What Happens:**

- **First-time TTS**: "Welcome to the TREE VESSEL interface, You have connected under ID 31525"
- **Registry creation**: `HKEY_CURRENT_USER\Software\VESSEL\FirstTimeTTS = 1`
- **Lore-based popup**: If Lore is 3, 15, 25, or 43, you'll get a "FATAL ERROR" popup
- **Automatic fight logs**: Created based on current Lore value (see Lore System section)
- **Unique lore message**: Displays cryptic message based on current Lore (1-100)

### **Step 2: Help Command**

```bash
help
```

**Log Creation Logic:**

- **First run**: Creates Error logs 44-59 (if they don't exist)
- **Second run**: Creates Error logs 61-98 (if 44-59 already exist)
- **Subsequent runs**: No additional logs

**Output**: Lists all available commands with descriptions

### **Step 3: Eval Command**

```bash
eval 29
```

**Log Creation**: Creates Fight log 29 (when result equals 29)
**Function**: Evaluates mathematical expressions
**Examples**:

- `eval 2+2` → Result: 4
- `eval 29` → Result: 29 + Creates Fight log 29

---

## **PHASE 2: SECRET TRIGGERS & KEYWORDS**

### **Secret Word Triggers**

#### **Tree Trigger**

```bash
echo tree
```

**Creates**: Error log 15 → Fight log 15 (run twice)

#### **TAS Trigger**

```bash
echo tas
```

**Creates**: Error log 3 → Fight log 3 (run twice)

### **Keyword ARG Puzzle (5 Keywords Required)**

**The 5 Keywords** (case-insensitive):

1. `whispers`
2. `fletchling`
3. `dithed`
4. `nullskin`
5. `echoes`

**How to Trigger**:
Type any command containing these exact words:

```bash
echo whispers
echo fletchling  
echo dithed
echo nullskin
echo echoes
```

**After 5th keyword**:

- **Creates**: Error log 25 + Fight log 25
- **Registry tracking**: Keywords stored in `HKEY_CURRENT_USER\Software\VESSEL\`
- **TTS**: Confirmation message

---

## **PHASE 3: IP & LOCATION COMMANDS**

### **IP Detection Commands**

```bash
ipconfig
# OR
get-netipaddress
# OR  
get-ipaddress

```

**Creates**: Error log 255
**TTS**: "Your location has been noted."
**Function**: Detects and logs your IP address information

---

## **PHASE 4: TIME-BASED TRIGGERS**

### **Midnight Trigger**

**Time**: Exactly 00:00 (midnight)

```bash
help
# (or any command)
```

**Creates**: Error log 60
**Note**: Must be run exactly at midnight

### **Graveyard Hours Trigger**

**Time**: Between 01:00-05:00

```bash
help
# (or any command)
```

**Creates**: Error log 666
**Note**: The final error log - only available during these hours

---

## **PHASE 5: ADVANCED COMMANDS**

### **Steam Gaming Command**

**Requirements**: Error logs 255, 666, and 60 must exist

```bash
letsplay
```

**Log Creation**:

- **First run**: Creates Error logs 1-2, 4-14, 16-24, 26-42 (skips existing)
- **Second run**: Creates Error logs 100-200
- **Subsequent runs**: No additional logs

**Function**: Simulates gaming session with Steam integration

### **Decompiler Puzzle**

**Requirements**: Fight logs 0, 3, Error log 3, and 3+ keywords

```bash
decompiler
```

**First Run**:

- **Creates**: `== GENERATED ITEMS ==/can/you/decompile_me.exe`
- **Function**: Generates executable from base64 data

**Second Run**:

- **Creates**: Error logs 501-600
- **Function**: Mass log generation

### **Invert Command**

**Requirements**: Fight logs 0, 3, Error log 3, and 3+ keywords

```bash
invert
```

**Creates**: Error log 333
**Visual Effects**:

- 25-second screen corruption
- Color inversion
- Screen rotation (180°)
- Mouse button swap
- Taskbar glitching
  **TTS**: "Until death will we invert and see from new perspectives"

---

## **PHASE 6: FACILITY & LOCATION SYSTEM**

### **Facility Connection**

**Requirements**: Fight log 29, Error log 15, Fight log 15

```bash
facility
```

**Log Creation**:

- **First run**: Creates Error log 404
- **Second run**: Creates Error log 500
- **Third+ runs**: TTS only, no logs

**Function**: Connects to facility network

### **Location Command**

**Requirements**: Fight log 29, Error log 15, Fight log 15

```bash
location
```

**Behavior**:

- **If missing Fight logs 3 or 25**: Warning TTS message
- **If ready**: Creates Error log 43 + `== GENERATED ITEMS ==/lost.py`

**Generated Files** (when lost.py runs):

- `== GENERATED ITEMS ==/lost/lost/lost/.../FINDME.txt` (24 levels deep)
- `== GENERATED ITEMS ==/lost/mus/mud.mp3`
- `== GENERATED ITEMS ==/lost/mus/penumbra_phantasm.mp4`
- `== GENERATED ITEMS ==/lost/mus/_as_a_child_.mp3+1`
- `== GENERATED ITEMS ==/lost/mus/_log_the_apple_tree_.m4v`
- `== GENERATED ITEMS ==/lost/mus/§.webm`

---

## **PHASE 7: TERMINAL CONNECTION SYSTEM**

### **Connect Command**

**Requirements**: Fight log 29, Error log 15, Fight log 15

```bash
connect
```

**Terminal Options & Log Creation**:

- **Terminal 1**: Creates Error logs 201-254
- **Terminal 3**: Creates Error logs 256-332
- **Terminal 5**: Creates Error logs 334-403
- **Terminal 23** (only if 1,3,5 connected): Creates Error logs 405-499 + system crash

**Interactive Process**: You'll be prompted to select terminals

---

## **PHASE 8: GLASS THRONE SYSTEM**

### **Glass Throne Command**

**Requirements**: Error log 501 exists (after decompiler second run)

```bash
glassThrone
```

**Mechanism**:

- **Progressive screen cracks**: 7 stages of visual corruption
- **After 7 cracks**: Creates Error logs 661-665
- **Registry tracking**: `HKEY_CURRENT_USER\Software\VESSEL\Crack\Progress`
- **Visual overlay**: Persistent crack effect on screen

**Each run adds one crack until 7 total**

---

## **PHASE 9: RANDOM EVENTS**

### **Devil's Jackpot (1/666 chance)**

**Trigger**: Any command has 1/666 chance
**Creates**: Fight log 0
**Effects**:

- Screen corruption
- Wallpaper change
- Visual glitching
  **TTS**: "HE CONNECTED"

### **Chaos Trigger**

**Condition**: When ALL error logs 1-666 exist EXCEPT 99
**Creates**: Error log 99
**Effect**: 60-second chaos audio playback
**Note**: This is the penultimate error log

---

## **PHASE 10: FINAL COMMANDS**

### **Breaking Down (Penultimate Command)**

**Requirements**: ALL fight logs 0-42 must exist

```bash
breakEveryone
# OR
break
```

**Creates**: Error logs 600-660
**Effects**:

- 43-second audio playback
- Text overlay on screen
- Jumpscare effect
- System crash/restart
  **Registry**: `HKEY_CURRENT_USER\Software\VESSEL\highAF\Completed = 1`

### **Blasphemy (Final Command)**

**Requirements**: Complete VESSEL (all 666 errors + 43 fights)

```bash
blasphemy
```

**Creates**: `== GENERATED ITEMS ==/Blasphemy.txt` with final lore
**Effect**:

- Opens Notepad with typed message
- Exits program permanently
- Completion achievement

---

## **LORE SYSTEM**

### **Lore Value Calculation**

- **Base**: Random value 1-100 on first launch
- **Storage**: `HKEY_CURRENT_USER\Software\VESSEL\Lore`
- **Special values**: 3, 15, 25, 43 trigger fatal error popups

### **Automatic Fight Log Creation on Startup**

Based on Lore ranges:

- **Lore 1-2**: Fight logs 1-2
- **Lore 4-14**: Fight logs 4-14
- **Lore 16-24**: Fight logs 16-24
- **Lore 26-28**: Fight logs 26-28
- **Lore 30-41**: Fight logs 30-41
- **Lore 42-43**: Fight logs 42-43

### **Lore Messages**

Each Lore value displays unique cryptic messages on startup

---

## **TECHNICAL SYSTEMS**

### **Registry Tracking**

**Base Path**: `HKEY_CURRENT_USER\Software\VESSEL\`

**Keys Used**:

- `FirstTimeTTS` - First launch tracking
- `Lore` - Lore value storage
- `Keywords\{keyword}` - Keyword puzzle progress
- `Crack\Progress` - Glass throne crack count
- `highAF\Completed` - Breaking down completion
- `Completion\vessel_complete` - Full completion marker

### **Visual Effects System**

#### **Screen Corruption (CorruptEffect)**

- **Color inversion**: Uses Windows Magnifier
- **Screen rotation**: 180° display flip
- **Mouse swap**: Registry-based button reversal
- **Taskbar glitch**: Random hide/show/move

#### **Screen Glitch**

- **Duration**: Configurable (default 15 seconds)
- **Effects**: Random inversions, screen tears, block shifts
- **Popups**: Spam "VESSEL :: PRAISE BE" messages
- **Intensity**: Configurable glitch frequency

### **Audio System**

- **TTS**: Windows Speech API
- **Chaos Audio**: 60-second audio file playback
- **Breaking Audio**: 43-second finale audio

### **File Generation**

- **decompile_me.exe**: Base64 decoded executable
- **lost.py**: Generates nested folder structure with media files
- **Blasphemy.txt**: Final lore document

---

## **FORBIDDEN COMMANDS**

These commands are blocked and will show error:

```bash
cd
chdir
set-location
push-location
pop-location
```

---

## **EXIT COMMANDS**

```bash
exit
quit
```

**Function**: Safely exits VESSEL with cleanup

---

## **COMMAND REFERENCE**

### **Basic Commands**

- `help` - Show command list + create error logs
- `eval {expression}` - Evaluate math + create fight logs
- `echo {text}` - Echo text + trigger secret words

### **Network Commands**

- `ipconfig` - Show IP info + create error log 255
- `get-netipaddress` - Alternative IP command
- `get-ipaddress` - Alternative IP command

### **Advanced Commands**

- `letsplay` - Gaming simulation (requires error logs 255, 666, 60)
- `decompiler` - Generate executable + error logs (requires fight logs 0, 3, error log 3, 3+ keywords)
- `invert` - Screen corruption (requires fight logs 0, 3, error log 3, 3+ keywords)
- `facility` - Connect to facility (requires fight log 29, error log 15, fight log 15)
- `location` - Location services (requires fight log 29, error log 15, fight log 15)
- `connect` - Terminal connection (requires fight log 29, error log 15, fight log 15)
- `glassThrone` - Screen cracking (requires error log 501)
- `breakEveryone` / `break` - Finale sequence (requires all 43 fight logs)
- `blasphemy` - Final command (requires all 666 error + 43 fight logs)

### **Secret Triggers**

- Any command containing: `whispers`, `fletchling`, `dithed`, `nullskin`, `echoes`
- `echo tree` - Creates error log 15 → fight log 15
- `echo tas` - Creates error log 3 → fight log 3
- Midnight commands (00:00) - Creates error log 60
- Graveyard hours (01:00-05:00) - Creates error log 666
- 1/666 random chance - Creates fight log 0 + effects

---

## **COMPLETION VERIFICATION**

### **Progress Tracking**

- **Error logs**: Check `== GENERATED ITEMS ==/logs/error/` for files 1-666
- **Fight logs**: Check `== GENERATED ITEMS ==/logs/fight/` for files 0-42
- **Registry**: `HKEY_CURRENT_USER\Software\VESSEL\Completion\vessel_complete = 1`

### **Completion Message**

```
"You have completed the VESSEL terminal experience fully!
The 6th key is 'Unbirth'.. See you in the END"
```

### **Final State**

- **Total logs**: 709 (666 error + 43 fight)
- **Generated files**: Multiple executables, media files, lore documents
- **Registry entries**: Complete tracking system
- **Achievement**: Full ARG completion

---

## **TROUBLESHOOTING**

### **Common Issues**

- **No TTS**: Check Windows Speech API, enable audio
- **Registry errors**: Run as Administrator
- **Visual effects fail**: Ensure Windows display drivers updated
- **Commands not working**: Check requirements are met
- **Logs not creating**: Verify file permissions

### **Softlock Recovery**

- **Exit safely**: Use `exit` or `quit` commands
- **Force close**: Ctrl+C (may cause issues)
- **Registry reset**: Delete `HKEY_CURRENT_USER\Software\VESSEL\`
- **File cleanup**: Delete `== GENERATED ITEMS ==/` folder

---

## **LORE & NARRATIVE**

### **Core Themes**

- **VESSEL**: Mysterious interface/entity
- **TREE**: Central symbolic element
- **TAS**: Unknown system/entity
- **Praise Be**: Recurring phrase
- **31525**: Connection ID
- **Unbirth**: The 6th key (final revelation)

### **Narrative Arc**

1. **Connection**: Initial link to VESSEL system
2. **Exploration**: Discovery of commands and secrets
3. **Corruption**: System degradation and glitches
4. **Integration**: Deeper connection to facility
5. **Breakdown**: System failure and chaos
6. **Transcendence**: Final revelation and completion

---

## **COMPLETE LOG CREATION MAP**

### **Error Logs (666 total)**

- **1-2**: letsplay (first run)
- **3**: echo tas → condition_error_to_fight
- **4-14**: letsplay (first run)
- **15**: echo tree → condition_error_to_fight
- **16-24**: letsplay (first run)
- **25**: 5th keyword trigger
- **26-42**: letsplay (first run)
- **43**: location command
- **44-59**: help (first run)
- **60**: midnight trigger
- **61-98**: help (second run)
- **99**: chaos trigger (when all others exist except 99)
- **100-200**: letsplay (second run)
- **201-254**: connect terminal 1
- **255**: IP commands
- **256-332**: connect terminal 3
- **333**: invert command
- **334-403**: connect terminal 5
- **404**: facility (first run)
- **405-499**: connect terminal 23
- **500**: facility (second run)
- **501-600**: decompiler (second run)
- **600-660**: breakEveryone/break
- **661-665**: glassThrone (after 7 cracks)
- **666**: graveyard hours trigger

### **Fight Logs (43 total)**

- **0**: Devil's jackpot (1/666 chance)
- **1-2**: Automatic (Lore 1-2)
- **3**: echo tas + condition_error_to_fight
- **4-14**: Automatic (Lore 4-14)
- **15**: echo tree + condition_error_to_fight
- **16-24**: Automatic (Lore 16-24)
- **25**: 5th keyword trigger
- **26-28**: Automatic (Lore 26-28)
- **29**: eval 29
- **30-41**: Automatic (Lore 30-41)
- **42-43**: Automatic (Lore 42-43)

---

This is the complete, comprehensive, and ultimate documentation of the VESSEL ARG system. Every command, trigger,
mechanism, secret, and detail has been documented.
