import ctypes
import random
import sys
import threading
import time

import keyboard
import win32api
import win32con
import win32gui

from vessel.exceptionHandler import handler


class ScreenGlitch:
    def __init__(self, duration=15, glitchiness=0.4, popup_intensity=0.5):
        """
        :param duration: Seconds to run corruption
        :param glitchiness: Multiplier (0.0 - 2.0) for how often glitch effects happen
        :param popup_intensity: Multiplier (0.0 - 2.0) for popup frequency
        """
        self.duration = duration
        self.glitchiness = glitchiness
        self.popup_intensity = popup_intensity
        self.stop_event = threading.Event()

        self.POPUP_PREFIX = "VESSEL :: PRAISE BE"

        self.user32 = ctypes.windll.user32

    # --- Screen handling ---
    # noinspection PyTypeChecker
    @staticmethod
    def __capture_screen_to_memdc():
        hdc = win32gui.GetDC(0)
        sw = win32api.GetSystemMetrics(0)
        sh = win32api.GetSystemMetrics(1)

        memdc = win32gui.CreateCompatibleDC(hdc)
        hbmp = win32gui.CreateCompatibleBitmap(hdc, sw, sh)
        win32gui.SelectObject(memdc, hbmp)
        win32gui.BitBlt(memdc, 0, 0, sw, sh, hdc, 0, 0, win32con.SRCCOPY)
        return hdc, memdc, hbmp, sw, sh

    @staticmethod
    def __restore_screen_from_memdc(hdc, memdc, sw, sh):
        win32gui.BitBlt(hdc, 0, 0, sw, sh, memdc, 0, 0, win32con.SRCCOPY)

    @staticmethod
    def __release_gdi(hdc, memdc, hbmp):
        try:
            if hbmp:
                win32gui.DeleteObject(hbmp)
        except Exception:
            pass
        try:
            if memdc:
                win32gui.DeleteDC(memdc)
        except Exception:
            pass
        try:
            if hdc:
                win32gui.ReleaseDC(0, hdc)
        except Exception:
            pass

    # --- Popup spammer ---
    def __popup_spammer(self):
        messages = [
            "VESSEL link unstable. PRAISE BE.",
            "Vessel integrity degraded. PRAISE BE.",
            "TAS channel breach detected. PRAISE BE.",
            "TR33 whispers acknowledged. PRAISE BE.",
            "Calibration offset 3.15.25. PRAISE BE.",
            "Containment nominal in error. PRAISE BE.",
            "Subsystem echoes return. PRAISE BE.",
        ]
        icons = [0x10, 0x30, 0x40]  # error, warning, info

        while not self.stop_event.is_set():
            title = f"{self.POPUP_PREFIX} [{random.randint(1000, 9999)}]"
            msg = random.choice(messages)
            style = random.choice(icons)
            # noinspection PyUnresolvedReferences
            t = threading.Thread(
                target=lambda: self.user32.MessageBoxW(0, msg, title, style),
                daemon=True
            )
            t.start()

            # Adjust frequency based on intensity
            base = random.uniform(0.15, 0.5)
            time.sleep(base / max(0.1, self.popup_intensity))

    def __close_our_popups(self):
        def enum_cb(hwnd, _):
            try:
                title = win32gui.GetWindowText(hwnd)
                if title.startswith(self.POPUP_PREFIX):
                    win32gui.PostMessage(hwnd, win32con.WM_CLOSE, 0, 0)
            except Exception:
                pass
            return True

        win32gui.EnumWindows(enum_cb, None)

    # --- Glitch effects ---
    def __glitch_effects(self, hdc, sw, sh):
        g = self.glitchiness

        if random.random() < 0.5 * g:  # Random invert
            x = random.randint(0, max(0, sw - 200))
            y = random.randint(0, max(0, sh - 200))
            w = random.randint(60, 400)
            h = random.randint(40, 280)
            win32gui.PatBlt(hdc, x, y, w, h, win32con.DSTINVERT)

        if random.random() < 0.8 * g:  # Screen tear
            y = random.randint(0, sh - 1)
            h = random.randint(10, max(10, min(200, sh - y)))
            offset = random.randint(-80, 80)
            win32gui.BitBlt(hdc, 0 + offset, y, sw, h, hdc, 0, y, win32con.SRCCOPY)

        if random.random() < 0.7 * g:  # Block shift
            w = random.randint(80, min(600, sw))
            h = random.randint(60, min(400, sh))
            x = random.randint(0, max(0, sw - w))
            y = random.randint(0, max(0, sh - h))
            dx = random.randint(-50, 50)
            dy = random.randint(-30, 30)
            win32gui.BitBlt(hdc, x + dx, y + dy, w, h, hdc, x, y, win32con.SRCCOPY)

    # --- Runner ---
    def run(self):
        keyboard.send('windows+m')
        hdc = memdc = hbmp = None
        sw = sh = 0
        started = time.time()

        try:
            hdc, memdc, hbmp, sw, sh = self.__capture_screen_to_memdc()

            popup_thread = threading.Thread(target=self.__popup_spammer, daemon=True)
            popup_thread.start()

            while time.time() - started < self.duration and not self.stop_event.is_set():
                self.__glitch_effects(hdc, sw, sh)
                time.sleep(0.02)

        except KeyboardInterrupt:
            self.stop_event.set()
        except Exception as e:
            handler.exception(f"[!] Runtime error: {e}: {sys.stderr}")
        finally:
            self.stop_event.set()
            self.__close_our_popups()
            if hdc and memdc and sw and sh:
                try:
                    self.__restore_screen_from_memdc(hdc, memdc, sw, sh)
                except Exception:
                    pass
            self.__release_gdi(hdc, memdc, hbmp)
            keyboard.send('windows+m')
