import base64
import ctypes
import os
import sys
import traceback
import winreg
from pathlib import Path

from PyQt6.QtCore import Qt, QSize
from PyQt6.QtGui import QPixmap
from PyQt6.QtWidgets import QApplication, QLabel

from vessel.createPuzzleVesselLogs import CreatePuzzleVesselLogs
from vessel.exceptionHandler import handler
from vessel.utils import Utils


class CrackEffectManager:
    """
    Manage crack progression overlays, registry tracking, logs, and TTS.
    Can be used programmatically by calling apply_crack() or with an optional InputThread.
    """

    REG_PATH = r"Software\VESSEL\Crack"
    REG_NAME = "Progress"

    def __init__(self, utils: 'Utils', tts: 'Utils.TTSWrapper', createLog: 'CreatePuzzleVesselLogs'):
        self.utils = utils
        self.tts = tts
        self.createLog = createLog
        self.overlay_windows = []

        # QApplication: create if it doesn't exist
        self.app = QApplication.instance() or QApplication(sys.argv)

        # Set path for files
        self.base_path = Path(__file__).resolve().parent

    # ---------------------------
    # Registry helpers
    # ---------------------------
    def get_progress(self) -> int:
        try:
            with winreg.OpenKey(winreg.HKEY_CURRENT_USER, self.REG_PATH, 0, winreg.KEY_READ) as key:
                progress, _ = winreg.QueryValueEx(key, self.REG_NAME)
                return int(progress)
        except FileNotFoundError:
            return 0
        except Exception as e:
            handler.exception(f"Failed reading registry: {e}")
            return 0

    def set_progress(self, value: int):
        try:
            with winreg.CreateKey(winreg.HKEY_CURRENT_USER, self.REG_PATH) as key:
                winreg.SetValueEx(key, self.REG_NAME, 0, winreg.REG_DWORD, int(value))
        except Exception as e:
            handler.exception(f"Failed to set registry value: {e}")

    # ---------------------------
    # Logs
    # ---------------------------
    def create_missing_logs(self, progress: int):
        try:
            if progress < 1 or progress > 7:
                return

            total_logs = 59  # IDs 601–659
            base = 601
            num_cracks = 7

            chunk_size = total_logs // num_cracks  # 8
            remainder = total_logs % num_cracks  # 3

            extra = 1 if progress <= remainder else 0
            start = base + (progress - 1) * chunk_size + min(progress - 1, remainder)
            end = start + chunk_size - 1 + extra
            if end > 659:
                end = 659

            if not self.createLog.error_exist(ID=start):
                self.createLog.error_range(start=start, end=end)
        except Exception as e:
            handler.exception(f"Failed to create logs for crack {progress}: {e}")

    # ---------------------------
    # Overlay helpers
    # ---------------------------
    # noinspection PyUnresolvedReferences
    @staticmethod
    def __set_click_through(hwnd: int):
        try:
            GWL_EXSTYLE = -20
            WS_EX_LAYERED = 0x80000
            WS_EX_TRANSPARENT = 0x20

            try:
                GetWindowLong = ctypes.windll.user32.GetWindowLongPtrW
                SetWindowLong = ctypes.windll.user32.SetWindowLongPtrW
            except AttributeError:
                GetWindowLong = ctypes.windll.user32.GetWindowLongW
                SetWindowLong = ctypes.windll.user32.SetWindowLongW

            styles = GetWindowLong(hwnd, GWL_EXSTYLE)
            SetWindowLong(hwnd, GWL_EXSTYLE, styles | WS_EX_LAYERED | WS_EX_TRANSPARENT)

            SWP_NOSIZE = 0x0001
            SWP_NOMOVE = 0x0002
            HWND_TOPMOST = -1
            ctypes.windll.user32.SetWindowPos(hwnd, HWND_TOPMOST, 0, 0, 0, 0, SWP_NOMOVE | SWP_NOSIZE)
        except Exception:
            handler.exception("Failed to set click-through window styles:\n" + traceback.format_exc())

    def hide_all_overlays(self):
        try:
            for w in list(self.overlay_windows):
                try:
                    w.hide()
                    w.close()
                    w.deleteLater()
                except Exception:
                    pass
            self.overlay_windows.clear()
        except Exception as e:
            handler.exception(f"Failed to hide overlays: {e}")

    def show_crack_overlay(self, progress: int):
        """
        Show overlay for crack progress using base64 image.
        Expects images in ./data/#.data.png.b64
        """
        try:
            img_file = self.base_path / f"data/{progress}.data.png.b64"
            if not os.path.exists(img_file):
                raise FileNotFoundError(f"[Crack Effect] Image not found: {img_file}")

            with open(img_file, "rb") as f:
                b64_data = f.read()

            img_bytes = base64.b64decode(b64_data)
            pixmap = QPixmap()
            pixmap.loadFromData(img_bytes)

            if pixmap.isNull():
                raise ValueError(f"[Crack Effect] Failed to load image for progress {progress}")

            label = QLabel()
            screen = self.app.primaryScreen()
            if screen:
                screen_size = screen.size()
                pixmap = pixmap.scaled(
                    QSize(screen_size.width(), screen_size.height()),
                    Qt.AspectRatioMode.KeepAspectRatioByExpanding,
                    Qt.TransformationMode.SmoothTransformation,
                )
                label.setFixedSize(screen_size)
            else:
                label.setFixedSize(pixmap.size())

            label.setPixmap(pixmap)
            label.setWindowFlags(
                Qt.WindowType.FramelessWindowHint |
                Qt.WindowType.WindowStaysOnTopHint |
                Qt.WindowType.Tool
            )
            label.setAttribute(Qt.WidgetAttribute.WA_ShowWithoutActivating, True)
            label.setAttribute(Qt.WidgetAttribute.WA_TranslucentBackground, True)
            label.setAttribute(Qt.WidgetAttribute.WA_TransparentForMouseEvents, True)
            label.setAlignment(Qt.AlignmentFlag.AlignCenter)
            try:
                label.showFullScreen()
            except Exception:
                if screen:
                    geo = screen.geometry()
                    label.setGeometry(geo.x(), geo.y(), geo.width(), geo.height())
                    label.show()

            hwnd = int(label.winId())
            self.__set_click_through(hwnd)

            self.overlay_windows.append(label)
            self.app.processEvents()

        except Exception as e:
            handler.exception(f"Failed to show crack overlay: {e}\n" + traceback.format_exc())

    # ---------------------------
    # Crack logic
    # ---------------------------
    def trigger_breach(self):
        self.show_crack_overlay(7)
        try:
            self.tts.speak("In the span of seven days, seven cracks arise beyond mortal comprehension.")
        except Exception:
            handler.exception("TTS failed during breach:\n" + traceback.format_exc())
        self.hide_all_overlays()
        self.create_missing_logs(6)
        self.set_progress(7)

    def apply_crack(self):
        progress = self.get_progress()
        if progress >= 7:
            print("\033[91m")
            print(r"""
             /$$$$$$$  /$$$$$$$  /$$$$$$$$  /$$$$$$   /$$$$$$  /$$   /$$       /$$$$$$ /$$      /$$ /$$      /$$ /$$$$$$$$ /$$   /$$ /$$$$$$$$ /$$   /$$ /$$$$$$$$
            | $$__  $$| $$__  $$| $$_____/ /$$__  $$ /$$__  $$| $$  | $$      |_  $$_/| $$$    /$$$| $$$    /$$$| $$_____/| $$$ | $$| $$_____/| $$$ | $$|__  $$__/
            | $$  \ $$| $$  \ $$| $$      | $$  \ $$| $$  \__/| $$  | $$        | $$  | $$$$  /$$$$| $$$$  /$$$$| $$      | $$$$| $$| $$      | $$$$| $$   | $$   
            | $$$$$$$ | $$$$$$$/| $$$$$   | $$$$$$$$| $$      | $$$$$$$$        | $$  | $$ $$/$$ $$| $$ $$/$$ $$| $$$$$   | $$ $$ $$| $$$$$   | $$ $$ $$   | $$   
            | $$__  $$| $$__  $$| $$__/   | $$__  $$| $$      | $$__  $$        | $$  | $$  $$$| $$| $$  $$$| $$| $$__/   | $$  $$$$| $$__/   | $$  $$$$   | $$   
            | $$  \ $$| $$  \ $$| $$      | $$  | $$| $$    $$| $$  | $$        | $$  | $$\  $ | $$| $$\  $ | $$| $$      | $$\  $$$| $$      | $$\  $$$   | $$   
            | $$$$$$$/| $$  | $$| $$$$$$$$| $$  | $$|  $$$$$$/| $$  | $$       /$$$$$$| $$ \/  | $$| $$ \/  | $$| $$$$$$$$| $$ \  $$| $$$$$$$$| $$ \  $$   | $$   
            |_______/ |__/  |__/|________/|__/  |__/ \______/ |__/  |__/      |______/|__/     |__/|__/     |__/|________/|__/  \__/|________/|__/  \__/   |__/                                                                                                                                                  
            """)
            print("\033[0m")
            return

        progress += 1
        self.set_progress(progress)

        if progress == 7:
            self.trigger_breach()
        else:
            self.show_crack_overlay(progress)
            self.create_missing_logs(progress)

    def startup_check(self):
        progress = self.get_progress()
        if progress != 7:
            self.set_progress(0)
            self.hide_all_overlays()
