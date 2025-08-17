import ctypes
import threading
import time
from datetime import datetime

import cv2
import numpy as np
import pyautogui
import pygetwindow as gw
from PIL import ImageGrab

# Constants
DURATION = 205  # seconds
POPUP_INTERVAL = 5
RECORD_FPS = 10
OUTPUT_VIDEO = "TAS_HACK_FEED.avi"
ERROR_MESSAGES = [
    "FATAL SYSTEM ERROR: TAS CORE LEAK DETECTED",
    "MEMORY OVERFLOW: Segment TAS_TR33 corrupted",
    "CRITICAL ERROR: Terminal access overridden by unknown process",
    "!!! WARNING: Unclassified protocol injection detected",
    "ACCESS VIOLATION at 0x00007FFC: Attempted write to protected memory",
    "EXCEPTION_CODE: 0xC0000409 - Stack buffer overrun detected",
    "SYSTEM_THREAD_EXCEPTION_NOT_HANDLED (TAS_DRIVER.sys)",
    "DEVICE_DESCRIPTOR_MISMATCH: Unknown USB connected - ID 'TR33-ΔEXE'",
    "CRITICAL_PROCESS_DIED: tas_monitor.exe (PID: 1032)",
    "DATA ABORT: Illegal read of non-existent memory (0xDEADBEEF)",
    "BOOT_CONFIG_DATA_CORRUPT: Missing TAS_BOOT key",
    "SECURITY ALERT: Elevated process attempted unsigned kernel patch",
    "HEAP CORRUPTION DETECTED: tasleak_interface.dll",
    "UNHANDLED EXCEPTION: Instruction pointer corrupted - 0x0000000C",
    "DRIVER_POWER_STATE_FAILURE: tas_net.sys failed to suspend",
    "KERNEL_SECURITY_CHECK_FAILURE: TAS kernel pool memory altered",
    r"NT AUTHORITY\SYSTEM privilege escalation attempt blocked",
    "RUNTIME ERROR: buffer overflow in TAS_ANALYTICS()",
    "STACK TRACE: tas_core.dll → inject_payload() → memory_fault()",
    "WINLOGON.EXE - Application Error: The instruction at 0x00000001 referenced memory at 0x00000000",
    "INTERNAL_POWER_ERROR: tas_hibernation.sys wrote invalid data",
    "STOP CODE: PAGE_FAULT_IN_NONPAGED_AREA (TASDRIVER64.SYS)",
    "TAS_CORE: process integrity check failed — hash mismatch",
    "SYSTEM WARNING: Kernel debug mode forcibly enabled",
    "CRASH DUMP FAILED: Unable to write dump file due to leak in TAS_SECURE_REGION",
]

FAKE_COMMANDS = [
    ("nmap -A -T4 192.168.0.1",
     "[*] Running service detection...\nPORT   STATE SERVICE\n80/tcp open  http\n443/tcp open  https"),
    ("hydra -l admin -P rockyou.txt 192.168.0.1 ssh",
     "[DATA] attacking ssh://192.168.0.1 with 5000 passwords...\n[22][ssh] host: 192.168.0.1   login: admin   password: password123"),
    ("sqlmap -u https://tasleak.org/login.php --dump",
     "[INFO] starting SQL injection scan...\nDatabase: users\n+----+---------+----------+\n| id | email   | password |\n+----+---------+----------+\n| 1  | t@a.s   | LEAKED   |\n+----+---------+----------+"),
    ("msfconsole", "Loaded 2195 modules...\nTAS_Payload injected\nSession 1 opened"),
    ("airmon-ng start wlan0", "Interface wlan0 in monitor mode enabled"),
    ("airodump-ng wlan0mon", "Capturing packets on channel 6... BSSID: TASNET_5G"),
    ("ettercap -T -q -i wlan0", "MITM attack started on target 192.168.0.5"),
    ("john --wordlist=rockyou.txt hash.txt", "Loaded 1 password hash\npassword cracked: 'hunter2'"),
    ("tcpdump -i eth0 -w tas_dump.pcap", "Capturing packets... Ctrl+C to stop"),
    ("wireshark tas_dump.pcap", "[GUI opens] Loading packet capture..."),
    ("openssl s_client -connect tasleak.org:443", "CONNECTED(00000003)\n---\nCertificate chain... TAS self-signed"),
    ("curl -I https://tasleak.org", "HTTP/1.1 200 OK\nServer: nginx\nX-TAS-Leak: true"),
    ("dig tasleak.org", ";; ANSWER SECTION:\ntasleak.org.  3600 IN A 192.168.0.10"),
    ("netcat -lvnp 4444", "Listening on [any] 4444 ..."),
    ("msfvenom -p windows/meterpreter/reverse_tcp LHOST=192.168.0.10 LPORT=4444 -f exe -o tas_payload.exe",
     "Payload generated successfully"),
    ("ssh admin@192.168.0.1", "admin@192.168.0.1's password: \nLast login: Mon Jun 2 10:32:55 2025 from 192.168.0.100"),
    ("iptables -L", "Chain INPUT (policy ACCEPT)\nChain FORWARD (policy ACCEPT)\nChain OUTPUT (policy ACCEPT)"),
    ("systemctl status tas_service",
     "● tas_service.service - TAS Leak Monitor\n   Active: active (running) since Mon 2025-06-02"),
    ("ps aux | grep tas", "root      1234  0.1  0.3  23456  3456 ?        Ssl  10:31   0:00 /usr/bin/tas_monitor"),
    ("cat /etc/passwd", "root:x:0:0:root:/root:/bin/bash\ntasuser:x:1001:1001::/home/tasuser:/bin/bash"),
    ("find / -name '*tas*'", "/usr/local/bin/tas_leak\n/var/log/tas.log"),
    ("whoami", "tasuser"),
    ("uname -a", "Linux target 5.15.0-70-generic #78-Ubuntu SMP x86_64 GNU/Linux"),
    ("ifconfig wlan0",
     "wlan0: flags=4163<UP,BROADCAST,RUNNING,MULTICAST>  mtu 1500\ninet 192.168.0.15  netmask 255.255.255.0"),
    ("ping -c 4 tasleak.org",
     "PING tasleak.org (192.168.0.10) 56(84) bytes of data.\n64 bytes from 192.168.0.10: icmp_seq=1 ttl=64 time=0.123 ms"),
    ("echo 'TAS_LEAK=TRUE' >> /etc/environment", ""),
]


def show_error_popup(text):
    ctypes.windll.user32.MessageBoxW(0, text, "Windows Error", 0x10)


def simulate_terminal_activity():
    for command, output in FAKE_COMMANDS:
        print(f"$ {command}")
        time.sleep(2)  # Simulate typing delay
        for line in output.split("\n"):
            print(line)
            time.sleep(5.5 / max(len(output.split("\n")), 1))  # Spread output over 5.5 sec
        print()
        time.sleep(0.5)


def start_popups():
    def spam_errors():
        while True:
            msg = np.random.choice(ERROR_MESSAGES)
            threading.Thread(target=show_error_popup, args=(msg,)).start()
            time.sleep(POPUP_INTERVAL)

    threading.Thread(target=spam_errors, daemon=True).start()


def record_terminal_only(duration):
    # Attempt to find the PowerShell window
    target_title = "LETMEGROW"
    try:
        terminal_win = next(
            win for win in gw.getWindowsWithTitle(target_title) if win.isActive or win.isMaximized or win.isVisible)
        term_left, term_top = terminal_win.left, terminal_win.top
        term_width, term_height = terminal_win.width, terminal_win.height
    except StopIteration:
        print("[!] PowerShell window not found. Defaulting to center screen area.")
        screen_w, screen_h = pyautogui.size()
        term_width, term_height = 1000, 600
        term_left = (screen_w - term_width) // 2
        term_top = (screen_h - term_height) // 2

    fourcc = cv2.VideoWriter_fourcc(*"XVID")
    out = cv2.VideoWriter(OUTPUT_VIDEO, fourcc, RECORD_FPS, (term_width, term_height))

    font = cv2.FONT_HERSHEY_SIMPLEX
    start_time = time.time()

    while (time.time() - start_time) < duration:
        img = ImageGrab.grab(bbox=(term_left, term_top, term_left + term_width, term_top + term_height))
        frame = cv2.cvtColor(np.array(img), cv2.COLOR_RGB2BGR)

        # Overlay timestamp and glitch
        timestamp = datetime.now().strftime("CAM-13 | ??/??/19?? %H:%M:%S")
        cv2.putText(frame, timestamp, (10, term_height - 20), font, 0.7, (255, 255, 255), 1)
        frame = add_vhs_overlay(frame)

        out.write(frame)
        time.sleep(1 / RECORD_FPS)

    out.release()


def add_vhs_overlay(frame, overlay_opacity=0.4):
    """
    Apply a strong VHS-style static noise overlay with glitch artifacts.
    overlay_opacity: float between 0.0 (no effect) and 1.0 (full effect)
    """
    h, w, _ = frame.shape
    original = frame.copy().astype(np.float32)

    # Generate animated static noise
    static = np.random.randint(0, 256, (h, w), dtype=np.uint8)
    static_colored = cv2.merge([static, static, static])  # grayscale to RGB
    static_colored = cv2.GaussianBlur(static_colored, (3, 3), 0)  # slight blur for analog feel

    # Simulate scanlines
    scanline_overlay = np.ones((h, w, 3), dtype=np.uint8) * 255
    for y in range(0, h, 2):
        scanline_overlay[y] *= 0.8  # reduce brightness every other line

    static_colored = cv2.addWeighted(static_colored.astype(np.uint8), 0.8, scanline_overlay, 0.2, 0)

    # Add glitch bar
    if np.random.rand() < 0.15:
        bar_height = np.random.randint(3, 20)
        y = np.random.randint(0, h - bar_height)
        shift = np.random.randint(-w // 10, w // 10)
        static_colored[y:y + bar_height] = np.roll(static_colored[y:y + bar_height], shift, axis=1)

    # Combine static overlay with original frame
    noisy_overlay = cv2.addWeighted(original, 1 - overlay_opacity, static_colored.astype(np.float32), overlay_opacity,
                                    0)

    return noisy_overlay.astype(np.uint8)


def main():
    print("[*] TAS INTERFACE OVERRIDE INITIATED")
    start_popups()

    terminal_thread = threading.Thread(target=simulate_terminal_activity)
    record_thread = threading.Thread(target=record_terminal_only, args=(DURATION,))

    terminal_thread.start()
    record_thread.start()

    terminal_thread.join()
    record_thread.join()

    print("[*] TAS override complete. Footage saved.")


if __name__ == "__main__":
    main()
