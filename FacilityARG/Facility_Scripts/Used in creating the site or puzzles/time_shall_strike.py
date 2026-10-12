import os
import sys
import time
import ctypes
import random
import subprocess

# ========== CONFIG ==========
LORE_FILE = "lore_note.txt"
LORE_TEXT = """\
[ARCHIVE//FRAGMENT]
Time moves differently here.
It whispers through the wires.
Check back when the shadows are gone.
"""

# ========== FULLSCREEN CONSOLE ==========
def fullscreen_console():
    os.system("mode con: cols=120 lines=40")  # Console size
    hwnd = ctypes.windll.kernel32.GetConsoleWindow()
    if hwnd != 0:
        ctypes.windll.user32.ShowWindow(hwnd, 3)  # Maximize window

# ========== GLITCH EFFECT: FULL SCREEN WITH COLOR INVERSION ==========
def glitch_effect(duration=5):
    colors = ["0F","1F","2F","3F","4F","5F","6F","7F","8F","9F","AF","BF","CF","DF","EF","FF"]
    chars = ["@", "#", "$", "%", "&", "*", "!", "?", "/", "\\", "|", " "]
    for _ in range(duration * 20):
        os.system("cls")
        os.system(f"color {random.choice(colors)}")
        for _ in range(40):
            line = "".join(random.choice(chars) for _ in range(120))
            print(line)
        time.sleep(0.05)
    os.system("color 07")

# ========== DROP LORE ==========
def drop_lore():
    with open(LORE_FILE, "w", encoding="utf-8") as f:
        f.write(LORE_TEXT)

# ========== TECHNICAL BLACK SCREEN OF DEATH ==========
def technical_black_screen():
    os.system("cls")
    os.system("color 0F")  # Black background, bright white text
    lines = [
        "CRITICAL SYSTEM FAILURE DETECTED",
        "Initializing memory dump...",
        "Dumping kernel memory: [██████████] 100%",
        "Error Code: 0xDEADC0DE",
        "Faulting module: TREE-ARCH-002-A",
        "Exception: SLEEP_STATE_NOT_FOUND",
        "Stack trace (most recent call last):",
        "  0x7FFFA12345: TREE::vessel::initiate()",
        "  0x7FFFA23456: TREE::core::archive_access()",
        "  0x7FFFA34567: TREE::narrator::self_terminate()",
        "Memory addresses corrupted: [0x00000000…0xFFFFFFFF]",
        "Check logs for further diagnostics...",
        "System halted."
    ]
    
    # Scroll lines like a crash dump
    for _ in range(5):
        for line in lines:
            print(line)
            time.sleep(0.3)
        print("\n" * 2)
        # subtle flicker
        if random.random() < 0.2:
            os.system("cls")
    
    print("\nPress Ctrl+C to exit, if you dare.")
    try:
        while True:
            # occasional flicker
            if random.random() < 0.1:
                os.system("cls")
                for line in lines:
                    print(line)
            time.sleep(0.5)
    except KeyboardInterrupt:
        pass

# ========== SELF DELETE ==========
def self_delete():
    script_path = os.path.abspath(sys.argv[0])
    bat_path = script_path + ".bat"
    with open(bat_path, "w") as bat:
        bat.write(f"""@echo off
:loop
del "{script_path}" >nul 2>&1
if exist "{script_path}" goto loop
del "%~f0"
""")
    subprocess.Popen([bat_path], shell=True)

# ========== MAIN ==========
if __name__ == "__main__":
    fullscreen_console()
    glitch_effect(duration=5)
    print("\nSleep now, and check up on me later\n")
    time.sleep(2)
    drop_lore()
    technical_black_screen()
    self_delete()
