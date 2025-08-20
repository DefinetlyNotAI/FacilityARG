import ctypes
import os
import random
import tempfile
import threading
import time
import winreg as reg

import keyboard
import numpy as np
import pygetwindow as gw
import sounddevice as sd
import win32api
import win32con
from PIL import Image, ImageDraw, ImageFont, ImageChops

from vessel.handler import handler
# noinspection PyUnusedImports
from vessel.logRecreate import ARGLogManager
from vessel.vesselLog import log


# ----- Special classes and functions -----
class Corrupt:
    def __init__(self):
        self.applied = {
            "screen": False,
            "mouse": False,
            "taskbar": False,
            "invert": False
        }
        self.c = self.__Corruption()
        self.tb = self.c.CrazyTaskbar()

    def start(self):
        self.c.invert_color()
        self.applied["invert"] = True
        self.c.flip_screen(2)
        self.applied["screen"] = True
        self.c.flip_mouse(1)
        self.applied["mouse"] = True
        self.tb.start()
        self.applied["taskbar"] = True

    def end(self):
        if self.applied["invert"]:
            self.c.uninvert_color()
        if self.applied["screen"]:
            self.c.flip_screen(0)
        if self.applied["taskbar"]:
            self.tb._revert()
        if self.applied["mouse"]:
            self.c.flip_mouse(0)
        # Reset applied state
        self._reset_applied()

    def _reset_applied(self):
        """Reset applied effects tracking."""
        for key in self.applied:
            self.applied[key] = False

    class WithWallPaper0:
        @staticmethod
        def _gen_wallpaper():
            W, H = 1920, 1080
            Image.new("RGB", (W, H), "black")

            # Fonts
            try:
                big_font = ImageFont.truetype("arial.ttf", 600)
                small_font = ImageFont.truetype("consola.ttf", 20)
            except Exception:
                big_font = ImageFont.load_default()
                small_font = ImageFont.load_default()

            hex_text = "50 52 41 49 53 45 20 42 45"

            # Measure hex text size to tile properly
            hex_bbox = small_font.getbbox(hex_text)
            hex_w = hex_bbox[2] - hex_bbox[0]
            hex_h = hex_bbox[3] - hex_bbox[1]

            # Draw tiled hex background
            bg = Image.new("RGB", (W, H), "black")
            bg_draw = ImageDraw.Draw(bg)
            for y in range(0, H, hex_h + 5):  # add small padding
                for x in range(0, W, hex_w + 10):
                    bg_draw.text((x, y), hex_text, font=small_font, fill=(80, 80, 80))

            # Flip background upside down
            bg = bg.transpose(Image.Transpose.ROTATE_180)

            # Copy to final image
            final = bg.copy()

            # Draw the big "0"
            bbox = big_font.getbbox("0")
            w, h = bbox[2] - bbox[0], bbox[3] - bbox[1]
            pos = ((W - w) // 2 - bbox[0], (H - h) // 2 - bbox[1])
            draw_final = ImageDraw.Draw(final)
            draw_final.text(pos, "0", font=big_font, fill="white")

            # Extract 0 region
            zero_box = ((W - w) // 2, (H - h) // 2, (W + w) // 2, (H + h) // 2)
            zero_region = final.crop(zero_box)

            # Apply RGB bleed
            r, g, b = zero_region.split()
            r = ImageChops.offset(r, -5, 0)  # red shift left
            b = ImageChops.offset(b, 5, 0)  # blue shift right
            zero_glitch = Image.merge("RGB", (r, g, b))
            final.paste(zero_glitch, zero_box)

            # Heavy glitch slicing on "0"
            for _ in range(30):
                x1 = random.randint(pos[0], pos[0] + w)
                y1 = random.randint(pos[1], pos[1] + h)
                x2 = min(x1 + random.randint(20, 200), pos[0] + w)
                y2 = min(y1 + random.randint(2, 20), pos[1] + h)
                slice_ = final.crop((x1, y1, x2, y2))
                final.paste(slice_, (x1 + random.randint(-50, 50), y1))

            # Save as BMP for wallpaper
            temp_file = tempfile.NamedTemporaryFile(suffix=".bmp", delete=False)
            final.save(temp_file.name, "BMP")
            temp_file.close()
            return temp_file.name

        @staticmethod
        def _set_wallpaper(image_path):
            # noinspection PyUnresolvedReferences
            ctypes.windll.user32.SystemParametersInfoW(20, 0, image_path, 3)
            os.remove(image_path)

        def create(self):
            wallpaper_path = self._gen_wallpaper()
            self._set_wallpaper(wallpaper_path)
            if os.path.isfile(wallpaper_path):
                os.remove(wallpaper_path)

    class __Corruption:
        @staticmethod
        def invert_color():
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
        def uninvert_color():
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
        def flip_mouse(new_value: int = None) -> None:
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
        def flip_screen(orientation: int = 2):
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
                win32api.ChangeDisplaySettingsEx(device.DeviceName, devmode)
            except Exception as e:
                handler.exception(f"Failed to flip screen: {e}")

        # noinspection PyUnresolvedReferences
        class CrazyTaskbar:
            def __init__(self):
                self.stop_glitching = threading.Event()
                self.taskbar_hwnd = ctypes.windll.user32.FindWindowW("Shell_TrayWnd", None)
                # Constants for Windows API
                self.SW_HIDE = 0
                self.SW_SHOW = 5
                self.HWND_BOTTOM = 1
                self.SWP_NOSIZE = 0x0001
                self.SWP_NOMOVE = 0x0002

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
                    self._revert()
                    exit()

            def _revert(self):
                """Stop glitching and restore the Taskbar to its default behavior."""
                self.stop_glitching.set()  # Stop the glitching thread
                if self.taskbar_hwnd:
                    ctypes.windll.user32.ShowWindow(self.taskbar_hwnd, self.SW_SHOW)
                    ctypes.windll.user32.SetWindowPos(self.taskbar_hwnd, self.HWND_BOTTOM, 0, 0, 0, 0,
                                                      self.SWP_NOMOVE | self.SWP_NOSIZE)

    @staticmethod
    def chaos_audio(duration=60, sample_rate=44100, volume=0.8):
        """
        Play dynamic chaotic audio for a given duration.
        Blocking call. No files are saved.
        """
        t = np.linspace(0, duration, int(sample_rate * duration), endpoint=False)

        # Randomly generate multiple chaotic tones
        freqs = np.random.uniform(200, 5000, size=(50,))  # 50 random frequencies
        audio = np.zeros_like(t)

        for f in freqs:
            # Random amplitude modulation and phase modulation for chaos
            mod = np.random.uniform(0.1, 1.0) * np.sin(2 * np.pi * np.random.uniform(0.5, 10) * t)
            audio += np.sin(2 * np.pi * f * t + mod)

        # Introduce random noise bursts
        noise = np.random.uniform(-1, 1, size=t.shape)
        audio += 0.3 * noise

        # Normalize audio to prevent clipping
        audio /= np.max(np.abs(audio))
        audio *= volume

        # Play the sound (blocking)
        sd.play(audio, samplerate=sample_rate)
        sd.wait()


class KeywordManager:
    @staticmethod
    def store(keyword: str, subkey=r"Software\VESSEL", value_name="Keywords") -> int:
        """
        Stores a keyword in the registry list if it doesn't exist and returns total number of keywords in registry.
        """
        try:
            # Open or create the subkey
            regkey = reg.CreateKey(reg.HKEY_CURRENT_USER, subkey)

            try:
                # Try reading existing keywords
                existing, _ = reg.QueryValueEx(regkey, value_name)
                if not isinstance(existing, list):
                    existing = []
            except FileNotFoundError:
                # Value does not exist yet
                existing = []

            # Add keyword if it doesn't exist
            if keyword not in existing:
                existing.append(keyword)
                reg.SetValueEx(regkey, value_name, 0, reg.REG_MULTI_SZ, existing)

            reg.CloseKey(regkey)
            return len(existing)

        except Exception as e:
            handler.exception(f"Error accessing registry: {e}")
            return -1

    @staticmethod
    def _delete(subkey=r"Software\VESSEL", value_name="Keywords") -> bool:
        """
        Deletes the registry value that stores the keywords.
        Returns True if deleted successfully, False otherwise.
        """
        try:
            regkey = reg.OpenKey(reg.HKEY_CURRENT_USER, subkey, 0, reg.KEY_SET_VALUE)
            reg.DeleteValue(regkey, value_name)
            reg.CloseKey(regkey)
            return True
        except FileNotFoundError:
            # Value or key does not exist
            return False
        except Exception as e:
            handler.exception(f"Error deleting value: {e}")
            return False

    @staticmethod
    def get_count(subkey=r"Software\VESSEL", value_name="Keywords") -> int:
        """
        Returns the number of keywords stored in the registry value.
        Returns 0 if the key or value does not exist.
        """
        try:
            regkey = reg.OpenKey(reg.HKEY_CURRENT_USER, subkey, 0, reg.KEY_READ)
            try:
                keywords, _ = reg.QueryValueEx(regkey, value_name)
                if isinstance(keywords, list):
                    return len(keywords)
                else:
                    return 0
            except FileNotFoundError:
                return 0
            finally:
                reg.CloseKey(regkey)
        except FileNotFoundError:
            return 0
        except Exception as e:
            handler.exception(f"Error reading registry: {e}")
            return -1


class VesselCompletion:
    def __init__(self, createLog: 'ARGLogManager'):
        self.createLog = createLog

    def check_and_mark(self) -> bool:
        # Check if all logs exist (replace with your check)
        all_exist = all(self.createLog.error_exist(ID=i) for i in range(1, 667)) and all(
            self.createLog.fight_exist(ID=i) for i in range(0, 43))

        if all_exist:
            key_path = r"Software\VESSEL\Completion"
            try:
                # Open the key if it exists, otherwise create it
                key = reg.CreateKey(reg.HKEY_CURRENT_USER, key_path)
                # Set value "vessel_complete" to 1 (DWORD)
                reg.SetValueEx(key, "vessel_complete", 0, reg.REG_DWORD, 1)
                reg.CloseKey(key)
            except WindowsError as e:
                handler.exception(f"Failed to set registry key: {e}")

        return all_exist

    @staticmethod
    def check() -> bool:
        key_path = r"Software\VESSEL\Completion"
        try:
            key = reg.OpenKey(reg.HKEY_CURRENT_USER, key_path, 0, reg.KEY_READ)
            value, _ = reg.QueryValueEx(key, "vessel_complete")
            reg.CloseKey(key)
            return value == 1
        except FileNotFoundError:
            return False
        except Exception as e:
            handler.exception(f"Failed to read registry key: {e}")
            return False
