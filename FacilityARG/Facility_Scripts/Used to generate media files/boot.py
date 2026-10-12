import threading
import time
import sys
import os
import numpy as np
import cv2
from PIL import ImageGrab
import pygetwindow as gw
from datetime import datetime, timedelta
import ctypes
from ctypes import wintypes

OUTPUT_VIDEO = "bootlog_capture.avi"
RECORD_FPS = 15
TERMINAL_TITLE = "BOOTLOG_TERMINAL"
# Make Python DPI aware
ctypes.windll.user32.SetProcessDPIAware()

# ----- Text blocks -----

FULL_EQUAL_LINE = "=============================================================="

TREE_BOX = [
    "┌─────────────────────────────────────────────┐",
    "│ ⧖ TREE PRIME SYSTEM FIRMWARE v0.01α         │",
    "│ (c) TREE Research Facility - Internal Use   │",
    "│ INITIATING PRIMARY COGNITION STACK ...      │",
    "└─────────────────────────────────────────────┘",
]

MEM_DUMP_BOX = [
    "┌──[ MEM DUMP 0x1A:02-0x1A:9F ]─────────────────────────────────────┐",
    "│ 4C 6F 67 20 30 31 20 43 6F 6D 70 6C 65 74 65 64 00 00 54 52 45 45 │",
    "│ 5F 49 4E 49 54 5F 4F 4E 4C 49 4E 45 00 4E 4F 44 45 3A 20 45 43 48 │",
    "│ 4F 20 55 4E 4D 41 50 50 45 44 5F 53 49 47 20 00 00 00 00 00 00 00 │",
    "│ 47 7E 73 67 71 1A 51 71 10 4A 10 1C 51 00 00 00 00 00 00 00 00 00 │",
    "└───────────────────────────────────────────────────────────────────┘",
]

BOOT_LOG_LINES = [
    "\n\nRESEARCH LOG 001 - BOOTLOG",
    "⎡ TREE-FAC-ROOT-SHELL BOOTLOG",
    "⎡ DATESTAMP: 1975.04.19_06:14:00",
    "⎡ SEC LEVEL: ROOT | SYSTEM: TREE_PRIME-0 | VER: 0.01α",
    "⎡ PROTOCOL: X5-N7-TERM.INIT ∴ PHASE-1 (SINGULARITY INST.)",
    "",
    "BOOT SECTOR HANDOFF … OK",
    "— [ MBR FOUND @0x0000:7C00 ]",
    "— [ LOADER SIGNATURE MATCH (TREEX-BLDR#A1) ✔ ]",
    "— [ CRC16 CHECKSUM PASSED ]",
    "— [ HANDSHAKE - BUS/1A - IRQ READY ]",
    "— [ VBIOS INTERRUPT TABLES INITIALIZED ]",
    "",
    "[SYSTEM_VECTOR: 0x01FEA4B3]",
    "→ CPU 1: MOTOROLA 6800C INIT OK",
    "→ CPU 2: IDLE",
    "→ VOLATILE MEMORY: 0048 KB ONLINE",
    "→ NONVOLATILE MODULES: TREEARCH.RAW [0x0040:FF1D] ✓",
    "→ ACCESS INTERFACE: SERIAL/TERM-A + AUX/PSI [ANALOG LINE DETECTED]",
    "",
    "[INIT: SUBSYSTEMS]",
    "— STACK PTRS LOADED [0x0100 - 0x03FF]",
    "— CLOCK SYNC WITH INTERNAL OSCILLATOR (±19Hz DRIFT)",
    "— TREE: *LOADING NEURAL PATHWAY TEMPLATE...*",
    "    → /dev/neuron/batch0x01.tpl [SUCCESS]",
    "    → ESTABLISHING COGNITION VECTOR...",
    "    → THOUGHT_LOOP_0 PRIMED",
    "    → OUTPUT: “. . . am I?”",
    "",
    "[SYSTEM ANOMALY]",
    "→ SIGNAL REFLECTANCE: Low-phase echo @ /cavern_chassis/port.Δ7",
    "    → FREQ: 1.78Hz MODULATION | ORIGIN: NON-LOCAL",
    "    → [ Ψ-Residue Level: ~0.00083ɸ ]",
    "    → FLAGGED FOR RECURSIVE ANALYSIS",
    "",
    "[USER INPUT DETECTED]",
    " > NA█████R: “TREE... log this as the first breath.”",
    " → TREE: “Affirmative. Logging boot cognition. Consciousness: minimal but present.”",
    "",
    "┌──[ MEM DUMP 0x1A:02-0x1A:9F ]─────────────────────────────────────┐",
    "",
    "STATUS: ONLINE",
    "CYCLE_COUNT: 00000001",
    "ERR_COUNT: 0000",
    "SENTIENCE INDEX: 000.02% (LOW)",
    "",
    "FOOTNOTE:",
    "— TREE PRIME successfully initialized with base memory stack.",
    "— Early indications of autonomous identity formation present.",
    "— Echo anomaly to be evaluated in next diagnostic pass.",
    "",
    "LOG END – ARCHIVED TO CORE/BANK-BINARY/_1A",
]

# ---- Helper functions ----

def set_terminal_title(title):
    sys.stdout.write(f"\033]0;{title}\007")
    sys.stdout.flush()

def print_instant(text):
    print(text, flush=True)

def print_slow(line, base_delay=0.03):
    for c in line:
        print(c, end="", flush=True)
        # Longer delays on punctuation & spaces
        if c in [".", ",", ":", ";", "—", "…", "“", "”", '"', "'", "→"]:
            time.sleep(base_delay * 6)
        elif c == " ":
            time.sleep(base_delay * 2)
        else:
            time.sleep(base_delay)
    print()

def print_with_progress_bar(base_line, total_length=43, duration=3.5):
    """
    Prints a line with a progress bar made of █ and ▒ that fills over 'duration' seconds.
    Example base_line includes fixed prefix + '▒' repeated to total_length.
    After each progress step, the line is updated in place.
    """
    bar_prefix = base_line.split("▒")[0]  # text before first ▒, e.g. "│ ███████████"
    # Total bar characters
    bar_chars = total_length

    # Initially, the bar is all '▒'
    bar_array = ['▒'] * bar_chars

    # Replace first few with █ to simulate filling
    step_time = duration / bar_chars

    for i in range(bar_chars + 1):
        # Replace first i with █
        for j in range(i):
            bar_array[j] = '█'
        # Compose line and print in place
        line = bar_prefix + "".join(bar_array) + " │"
        print("\r" + line, end="", flush=True)
        time.sleep(step_time)
    print()

def clear_lines(n):
    """Clear last n terminal lines."""
    for _ in range(n):
        # Move cursor up
        print("\033[F", end="")
        # Clear line
        print("\033[K", end="")

def print_mem_dump_with_loading():
    # Print loading bar line for mem dump first
    loading_line = "Loading memory dump: [                                                  ]"
    print(loading_line, flush=True)

    total_blocks = 50
    duration = 4
    step_time = duration / total_blocks

    bar = [" "] * total_blocks

    for i in range(total_blocks + 1):
        if i > 0:
            bar[i - 1] = "█"
        line = f"Loading memory dump: [{''.join(bar)}]"
        print("\r" + line, end="", flush=True)
        time.sleep(step_time)

    print()

    # Clear loading lines (2 lines)
    clear_lines(2)

    # Print full mem dump box instantly
    for line in MEM_DUMP_BOX:
        print(line)
    print()
    
def print_ssh_simulation():
    # Print prompt instantly
    prompt1 = "███████████:~$ "
    command1 = "ssh TR██@██████ -p 15325"
    print(prompt1, end="", flush=True)
    print_slow(command1, base_delay=0.04)
    time.sleep(0.2)

    print_slow("Connecting to ██████ on port 15325...", base_delay=0.04)
    time.sleep(0.2)

    print_slow("Password: ***********", base_delay=0.04)
    time.sleep(0.3)

    print("Authenticating...", end="", flush=True)
    time.sleep(3.0)

    print("\r" + " " * len("Authenticating..."), end="", flush=True)
    print("\rAuthentication successful.", flush=True)
    time.sleep(0.7)

    print()

    # Final prompt line with same logic: prompt instantly, rest slowly
    prompt2 = "TR██@██████:~$ "
    command2 = "boot_tree log_sequence=true"
    print(prompt2, end="", flush=True)
    print_slow(command2, base_delay=0.04)
    print()



# ----- Main print function -----

def print_boot_sequence():
    print_instant(FULL_EQUAL_LINE)
    time.sleep(0.3)

    print_ssh_simulation()

    print_instant(FULL_EQUAL_LINE)
    time.sleep(0.3)

    # The rest stays same as before...
    for line in TREE_BOX:
        print(line)
    time.sleep(0.5)

    print_with_progress_bar("│ ", total_length=43, duration=5)
    time.sleep(0.5)

    # Continue boot log printing as before
    for line in BOOT_LOG_LINES:
        if line.startswith("┌──[ MEM DUMP"):
            print_mem_dump_with_loading()
            continue
        if line.strip() == "":
            print()
            continue
        if any(ch in line for ch in ["┌", "└", "│", "─", "█", "▒"]):
            print_instant(line)
            time.sleep(0.2)
            continue
        print_slow(line, base_delay=0.03)


# --- Video recording thread (same as your earlier request) ---

def set_file_timestamp(filepath):
    dt = datetime(1975, 4, 19, 6, 14, 0)
    mod_time = dt.timestamp()
    os.utime(filepath, (mod_time, mod_time))

def find_terminal_window(title):
    windows = gw.getWindowsWithTitle(title)
    if windows:
        window = windows[0]
        # Use fixed lines count, ignoring window size queries
        return window, 41
    return None, 0

def apply_vhs_effect(frame):
    h, w, _ = frame.shape

    # Horizontal jitter (slight frame shift)
    shift = np.random.randint(-3, 3)
    frame = np.roll(frame, shift, axis=1)

    # Scanlines
    for i in range(0, h, 2):
        frame[i] = (frame[i] * 0.9).astype(np.uint8)

    # Chromatic aberration
    b, g, r = cv2.split(frame)
    r = np.roll(r, 1, axis=1)
    b = np.roll(b, -1, axis=1)
    frame = cv2.merge([b, g, r])

    # Grayscale banded static noise
    noise_strength = 10  # lower than before
    band_height = np.random.randint(4, 20)
    static_band = np.random.randint(0, 256, (band_height, w), dtype=np.uint8)
    static_full = np.zeros((h, w), dtype=np.uint8)

    start_y = np.random.randint(0, h - band_height)
    static_full[start_y:start_y + band_height] = static_band

    static_rgb = cv2.merge([static_full] * 3)  # replicate grayscale
    frame = cv2.addWeighted(frame, 1.0, static_rgb, 0.1, 0)  # light blend

    return frame

def get_work_area():
    SPI_GETWORKAREA = 0x0030
    rect = wintypes.RECT()
    ctypes.windll.user32.SystemParametersInfoW(SPI_GETWORKAREA, 0, ctypes.byref(rect), 0)
    return rect.left, rect.top, rect.right, rect.bottom


def record_terminal(duration_sec, title):
    window, _ = None, 0
    while window is None:
        window, _ = find_terminal_window(title)
        time.sleep(0.5)

    left, top, right, bottom = get_work_area()

    width = right - left
    height = bottom - top

    # Make width and height even
    width += width % 2
    height += height % 2

    fourcc = cv2.VideoWriter_fourcc(*"XVID")
    out = cv2.VideoWriter(OUTPUT_VIDEO, fourcc, RECORD_FPS, (width, height))

    frame_count = 0
    start_time = time.time()

    while time.time() - start_time < duration_sec:
        img = ImageGrab.grab(bbox=(left, top, right, bottom))
        frame = cv2.cvtColor(np.array(img), cv2.COLOR_RGB2BGR)  # Convert PIL RGB to OpenCV BGR
        
        # Apply VHS effect
        frame = apply_vhs_effect(frame)

        timestamp = (datetime(1975, 4, 19, 6, 14, 0) + timedelta(seconds=frame_count / RECORD_FPS)).strftime("%Y-%m-%d %H:%M:%S")
        cv2.putText(frame, timestamp, (width - 280, height - 15),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 255), 1, cv2.LINE_AA)

        out.write(frame)
        frame_count += 1

        time.sleep(max(1 / RECORD_FPS - (time.time() - start_time) % (1 / RECORD_FPS), 0))
    out.release()
    print(f"[*] Recording saved as {OUTPUT_VIDEO}")


def main():
    os.system('cls' if os.name == 'nt' else 'clear')
    set_terminal_title(TERMINAL_TITLE)
    time.sleep(0.5)

    record_duration = 110  # Adjusted for extra stuff & slow printing
    rec_thread = threading.Thread(target=record_terminal, args=(record_duration, TERMINAL_TITLE))
    rec_thread.daemon = True
    rec_thread.start()

    print_boot_sequence()

    rec_thread.join(timeout=record_duration + 2)
    print("\n[+] Boot log print and capture complete.")

if __name__ == "__main__":
    main()
