import ctypes
import random
import threading
import time
import winreg as reg

import keyboard
import pygetwindow as gw
import win32api
import win32con

from vessel.exceptionHandler import handler
from vessel.vesselLog import log


# ----- Special classes and functions -----
class CorruptEffect:
    def __init__(self):
        self.applied = {
            "screen": False,
            "mouse": False,
            "taskbar": False,
            "invert": False
        }
        self.ct = self.CrazyTaskbar()

    def start(self):
        self._invert_color()
        self.applied["invert"] = True
        self._flip_screen_180(2)
        self.applied["screen"] = True
        self._flip_mouse_buttons(1)
        self.applied["mouse"] = True
        self.ct.start()
        self.applied["taskbar"] = True

    def end(self):
        if self.applied["invert"]:
            self._uninvert_color()
        if self.applied["screen"]:
            self._flip_screen_180(0)
        if self.applied["taskbar"]:
            self.ct.revert()
        if self.applied["mouse"]:
            self._flip_mouse_buttons(0)
        # Reset applied state
        self.__reset_applied()

    def __reset_applied(self):
        """Reset applied effects tracking."""
        for key in self.applied:
            self.applied[key] = False

    # ====== Corruption effect methods/classes ====== #

    @staticmethod
    def _invert_color():
        # Open Magnifier
        keyboard.send('windows+plus')
        time.sleep(1)  # Wait for Magnifier to open

        # Focus the Magnifier window
        try:
            magnifier = gw.getWindowsWithTitle("Magnifier")[0]
            magnifier.activate()
            # time.sleep(0.5)
        except IndexError:
            handler.exception("Magnifier window not found")
            return

        # Invert colors
        keyboard.send('ctrl+alt+i')
        # Minimize everything
        keyboard.send('windows+m')

    @staticmethod
    def _uninvert_color():
        try:
            magnifiers = gw.getWindowsWithTitle("Magnifier")
            if magnifiers:
                keyboard.send('ctrl+alt+i')
                magnifiers[0].close()
            else:
                log.warning("Magnifier not running, nothing to uninvert.")
        except Exception as e:
            handler.exception(f"Failed to uninvert: {e}")

    @staticmethod
    def _flip_mouse_buttons(new_value: int = None) -> None:
        """
        Toggles the mouse button configuration.
        If the buttons are currently swapped, revert to default.
        If the buttons are not swapped, swap them.
        Changes persist through reboots and apply immediately.
        """
        try:
            # Open registry key to read current state
            regkey = reg.OpenKey(reg.HKEY_CURRENT_USER, r"Control Panel\Mouse", 0, reg.KEY_READ)
            current_value, _ = reg.QueryValueEx(regkey, "SwapMouseButtons")
            reg.CloseKey(regkey)

            # Determine new state
            if new_value is None:
                new_value = "0" if current_value == "1" else "1"
            else:
                # Convert to string for registry
                new_value = str(new_value)
                if new_value not in ["0", "1"]:
                    raise ValueError("Invalid value for SwapMouseButtons. Use '0' or '1'.")

            # Open registry key to set new value
            regkey = reg.OpenKey(reg.HKEY_CURRENT_USER, r"Control Panel\Mouse", 0, reg.KEY_SET_VALUE)
            reg.SetValueEx(regkey, "SwapMouseButtons", 0, reg.REG_SZ, new_value)
            reg.CloseKey(regkey)

            # Apply changes using SystemParametersInfo
            # noinspection PyUnresolvedReferences
            result = ctypes.windll.user32.SystemParametersInfoW(0x0021, int(new_value), None, 0x02)
            if not result:
                log.warning("Failed to apply the changes immediately. Please reboot for changes to take effect.")

        except Exception as e:
            handler.exception(f"Failed to toggle mouse buttons: {e}")

    @staticmethod
    def _flip_screen_180(orientation: int = 2):
        """
        Rotates the primary display to the specified orientation.
        orientation: 0=normal, 1=90°, 2=180°, 3=270°
        """
        if orientation not in [0, 1, 2, 3]:
            raise ValueError("Invalid orientation value. Must be 0, 1, 2, or 3.")

        try:
            device = win32api.EnumDisplayDevices(None, 0)
            devmode = win32api.EnumDisplaySettings(device.DeviceName, win32con.ENUM_CURRENT_SETTINGS)
            devmode.DisplayOrientation = orientation % 4
            # noinspection PyTypeChecker
            win32api.ChangeDisplaySettingsEx(device.DeviceName, devmode)
        except Exception as e:
            handler.exception(f"Failed to flip screen: {e}")

    class CrazyTaskbar:
        def __init__(self):
            self.stop_glitching = threading.Event()
            # noinspection PyUnresolvedReferences
            self.taskbar_hwnd = ctypes.windll.user32.FindWindowW("Shell_TrayWnd", None)
            # Constants for Windows API
            self.SW_HIDE = 0
            self.SW_SHOW = 5
            self.HWND_BOTTOM = 1
            self.SWP_NOSIZE = 0x0001
            self.SWP_NOMOVE = 0x0002

        # noinspection PyUnresolvedReferences
        def __glitch_forever(self) -> None:
            """Continuously make the Taskbar glitch until stopped."""
            if not self.taskbar_hwnd:
                log.error("Taskbar not found.")
                return

            while not self.stop_glitching.is_set():
                action = random.choice(["hide", "show", "move"])
                if action == "hide":
                    ctypes.windll.user32.ShowWindow(self.taskbar_hwnd, self.SW_HIDE)
                elif action == "show":
                    ctypes.windll.user32.ShowWindow(self.taskbar_hwnd, self.SW_SHOW)
                elif action == "move":
                    # Randomly adjust the Taskbar position
                    x = random.randint(-50, 50)
                    y = random.randint(-50, 50)
                    ctypes.windll.user32.SetWindowPos(self.taskbar_hwnd, self.HWND_BOTTOM, x, y, 0, 0,
                                                      self.SWP_NOSIZE)

                time.sleep(random.randint(5, 30) / 100)  # Pause between actions

        def start(self):
            """Start a thread to make the Taskbar glitch indefinitely."""
            try:
                self.stop_glitching.clear()
                threading.Thread(target=self.__glitch_forever, daemon=True).start()
            except KeyboardInterrupt:
                self.revert()
                exit()

        def revert(self):
            """Stop glitching and restore the Taskbar to its default behavior."""
            self.stop_glitching.set()  # Stop the glitching thread
            if self.taskbar_hwnd:
                # noinspection PyUnresolvedReferences
                ctypes.windll.user32.ShowWindow(self.taskbar_hwnd, self.SW_SHOW)
                # noinspection PyUnresolvedReferences
                ctypes.windll.user32.SetWindowPos(self.taskbar_hwnd, self.HWND_BOTTOM, 0, 0, 0, 0,
                                                  self.SWP_NOMOVE | self.SWP_NOSIZE)
