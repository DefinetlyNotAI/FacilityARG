import os
import sys
import winreg
import ctypes
from PyQt6.QtWidgets import QApplication, QLabel
from PyQt6.QtGui import QPixmap
from PyQt6.QtCore import Qt

from vessel import handler, Utils, CreatePuzzleVesselLogs

# ----------------------------
# Initialization
# ----------------------------
utils = Utils()
tts = utils.TTSWrapper()

REG_PATH = r"Software\VESSEL\Crack"
REG_NAME = "Progress"

createLog = CreatePuzzleVesselLogs(
    fight_destination="== GENERATED ITEMS ==/logs/fight",
    error_destination="== GENERATED ITEMS ==/logs/error"
)

# Keep a reference to overlay windows
overlay_windows = []

# ----------------------------
# Registry functions
# ----------------------------
def get_crack_progress():
    try:
        with winreg.OpenKey(winreg.HKEY_CURRENT_USER, REG_PATH, 0, winreg.KEY_READ) as key:
            progress, _ = winreg.QueryValueEx(key, REG_NAME)
            return progress
    except FileNotFoundError:
        return 0

def set_crack_progress(value):
    try:
        with winreg.CreateKey(winreg.HKEY_CURRENT_USER, REG_PATH) as key:
            winreg.SetValueEx(key, REG_NAME, 0, winreg.REG_DWORD, value)
    except Exception as e:
        handler.exception(f"Failed to set registry value: {e}")

# ----------------------------
# Log functions
# ----------------------------
def create_missing_logs():
    try:  # TODO Each to be different for each crack
        if not createLog.error_exist(ID=601):
            createLog.error_range(start=601, end=660)
    except Exception as e:
        handler.exception(f"Failed to create logs: {e}")

# ----------------------------
# Overlay functions
# ----------------------------
def show_crack_overlay(progress):
    """Show a click-through full-screen overlay of the crack"""
    try:
        img_path = f"img/crack/{progress}.png"
        if not os.path.exists(img_path):
            print(f"[Crack Effect] Image not found: {img_path}")
            return

        app = QApplication.instance()
        if not app:
            app = QApplication(sys.argv)

        label = QLabel()
        pixmap = QPixmap(img_path)
        label.setPixmap(pixmap)
        label.setWindowFlags(
            Qt.WindowType.FramelessWindowHint |
            Qt.WindowType.WindowStaysOnTopHint |
            Qt.WindowType.Tool
        )
        label.setAttribute(Qt.WidgetAttribute.WA_TranslucentBackground, True)
        label.setAttribute(Qt.WidgetAttribute.WA_TransparentForMouseEvents, True)
        label.showFullScreen()

        # Make fully click-through at Windows level
        hwnd = int(label.winId())
        GWL_EXSTYLE = -20
        WS_EX_LAYERED = 0x80000
        WS_EX_TRANSPARENT = 0x20
        styles = ctypes.windll.user32.GetWindowLongW(hwnd, GWL_EXSTYLE)
        ctypes.windll.user32.SetWindowLongW(hwnd, GWL_EXSTYLE, styles | WS_EX_LAYERED | WS_EX_TRANSPARENT)

        overlay_windows.append(label)  # Keep reference to prevent GC
        app.processEvents()

    except Exception as e:
        handler.exception(f"Failed to show crack overlay: {e}")

# ----------------------------
# Crack logic
# ----------------------------
def trigger_breach():
    try:
        tts.speak("Heavens and earth, one in seven days, 7 cracks are incomprehensible")
        utils.trigger_crash(fake=True)
    except Exception as e:
        handler.exception(f"Failed to trigger breach: {e}")

def apply_crack():
    try:
        progress = get_crack_progress()

        if progress >= 7:
            create_missing_logs()
            print("BREACH")
            return

        # Increment crack
        progress += 1
        set_crack_progress(progress)
        show_crack_overlay(progress)

        if progress == 7:
            trigger_breach()

    except Exception as e:
        handler.exception(f"Error applying crack: {e}")

def startup_check():
    try:
        progress = get_crack_progress()
        if 1 <= progress <= 6:
            show_crack_overlay(progress)
        elif progress >= 7:
            create_missing_logs()
    except Exception as e:
        handler.exception(f"Startup check failed: {e}")

# ----------------------------
# Main
# ----------------------------
if __name__ == "__main__":
    startup_check()
    while True:
        if input("Press Enter to continue...") == "quit":
            break
        apply_crack()

# todo Crack to stay on permanently
# todo Fix to make crack fullscreen
