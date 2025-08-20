import ctypes
import json
import os
import random
import re
import shlex
import subprocess
import sys
import tempfile
import threading
import time
import winreg as reg
from datetime import datetime
from io import StringIO
from pathlib import Path

import keyboard
import numpy as np
import pygetwindow as gw
import pyttsx3
import sounddevice as sd
import win32api
import win32con
from PIL import Image, ImageDraw, ImageFont, ImageChops
from colorama import Fore, Style
from prompt_toolkit import PromptSession
from prompt_toolkit.completion import Completer, Completion
from prompt_toolkit.key_binding import KeyBindings

from vessel import log, handler, ARGLogManager


# ----- Utils -----
class Utils:
    def __init__(self):
        self.engine = pyttsx3.init()

    @staticmethod
    def windows() -> bool:
        try:
            return sys.platform.startswith('win')
        except Exception as e:
            handler.exception(f"Failed to check platform: {e}")
            return False

    @staticmethod
    def ensure_admin() -> bool:
        try:
            # noinspection PyUnresolvedReferences
            return ctypes.windll.shell32.IsUserAnAdmin() != 0
        except Exception:
            return False

    @staticmethod
    def set_console_title(title: str) -> None:
        try:
            subprocess.call(f"title {title}", shell=True)
        except Exception as e:
            handler.exception(f"Failed to set console title: {e}")

    def tts_speak(self, message: str) -> None:
        self.engine.say(message)
        self.engine.runAndWait()

    @staticmethod
    def run_script(script_name: str) -> str | None:
        """
        Execute a Python script from the 'scripts/' directory.
        Only scripts ending with '_GENCODE.py' are allowed.
        """
        os.chdir(Path("scripts"))
        script_path = Path(script_name)

        if not script_path.exists():
            raise FileNotFoundError(f"Script not found: {script_path}")

        if not script_name.endswith("_GENCODE.py"):
            raise ValueError("Only scripts ending with '_GENCODE.py' are allowed.")

        try:
            # Run the script in a separate process
            result = subprocess.run(
                ["python", str(script_path)],
                capture_output=True,
                text=True,
                check=True
            )
            os.chdir(Path(".."))
            return result.stdout
        except subprocess.CalledProcessError as e:
            handler.exception(f"Script execution failed: {e.stderr}")
            os.chdir(Path(".."))
            sys.exit(-1)

    # noinspection PyUnresolvedReferences
    @staticmethod
    def trigger_crash():
        ctypes.windll.ntdll.RtlAdjustPrivilege(19, True, False, ctypes.byref(ctypes.c_bool()))
        ctypes.windll.ntdll.NtRaiseHardError(
            0xC0000022,
            0, 0, 0, 6, ctypes.byref(ctypes.c_uint())
        )

    @staticmethod
    def is_in_time_range(start: str, end: str) -> bool:
        # Validate time format
        time_pattern = r"^\d{2}:\d{2}$"
        if not re.match(time_pattern, start) or not re.match(time_pattern, end):
            raise ValueError("Start and end must be in 'HH:MM' format")

        # Parse hours and minutes
        start_hour, start_minute = map(int, start.split(":"))
        end_hour, end_minute = map(int, end.split(":"))

        # Validate 24-hour range
        if not (0 <= start_hour < 24 and 0 <= end_hour < 24 and 0 <= start_minute < 60 and 0 <= end_minute < 60):
            raise ValueError("Hours must be 00-23 and minutes 00-59")

        # Get current time
        now = datetime.now()
        current_minutes = now.hour * 60 + now.minute
        start_minutes = start_hour * 60 + start_minute
        end_minutes = end_hour * 60 + end_minute

        # Handle ranges that cross midnight
        if start_minutes <= end_minutes:
            return start_minutes <= current_minutes <= end_minutes
        else:
            return current_minutes >= start_minutes or current_minutes <= end_minutes

    @staticmethod
    def contains_secret(keyword: str, item: str) -> bool:
        return bool(re.search(rf"\b{re.escape(keyword)}\b", item, re.IGNORECASE))

    @staticmethod
    def get_windows_location() -> tuple[str, str]:
        try:
            cmd = (
                'powershell -Command "Add-Type -AssemblyName System.Device; '
                '$loc = New-Object System.Device.Location.GeoCoordinateWatcher; '
                '$loc.Start(); Start-Sleep -Seconds 3; '
                '$loc.Position.Location | ConvertTo-Json"'
            )
            result = subprocess.check_output(cmd, shell=True, text=True)
            loc = json.loads(result)
            lat = loc.get("Latitude", "Unknown")
            lon = loc.get("Longitude", "Unknown")
            return {lat}, {lon}
        except Exception as e:
            return "Location unavailable", {e}


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
    @staticmethod
    def check_and_mark() -> bool:
        # Check if all logs exist (replace with your check)
        all_exist = all(createLog.error_exist(ID=i) for i in range(1, 667)) and all(
            createLog.fight_exist(ID=i) for i in range(0, 43))

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


# ----- Custom Commands -----
class CustomFuncRegistry:
    def __init__(self):
        self.persistent_globals = {"__builtins__": __builtins__}
        self.commands = {}
        self._register_all()
        self.command_available_for = self.CommandAvailableFor()

    # ===== Command Execution Wrapper =====
    class Exec:
        """Custom Function Execution Wrapper"""

        def __init__(self, name, func):
            self.name = name
            self.func = func

        def __call__(self, args, _metadata_=False):
            return self.func(args, _metadata_)

    # ===== Command availability Wrapper =====
    class CommandAvailableFor:
        @staticmethod
        def letsplay_askme():
            """Shows letsplay and askme IF the ipconfig trick was done AND all the launch time tricks were done"""
            e255 = createLog.error_exist(ID=255)
            e666 = createLog.error_exist(ID=666)
            e60 = createLog.error_exist(ID=60)
            return e255 and e666 and e60

        @staticmethod
        def facility_location_connect():
            """Shows facility, location, connect IF tree AND 29 were done"""
            f15 = createLog.fight_exist(ID=15)
            e15 = createLog.error_exist(ID=15)
            f29 = createLog.fight_exist(ID=29)
            return f15 and e15 and f29

        @staticmethod
        def decompiler_invert_log():
            """Shows decompiler, invert, log IF the counter in reg is >=3 AND TAS trick was done AND "0" trick was completed"""
            f0 = createLog.fight_exist(ID=0)
            f3 = createLog.fight_exist(ID=3)
            e3 = createLog.error_exist(ID=3)
            counter = keywordManager.get_count() >= 3
            return f0 and f3 and e3 and counter

    # ===== Registry Mechanics =====
    def _register_all(self):
        """Find all command methods and register them."""
        for attr_name in dir(self):
            if attr_name.startswith("_"):
                continue
            attr = getattr(self, attr_name)
            if callable(attr) and getattr(attr, "_is_cmd", False):
                self.commands[attr_name] = self.Exec(attr_name, attr)

    def get_command(self, name):
        return self.commands.get(name)

    def list_commands(self):
        return self.commands

    # ===== Command Implementations =====
    def help(self, args, _metadata_=False):
        """Shows help info for commands."""
        if _metadata_:
            return {
                "desc": "Shows help info for commands.",
                "usage": "help [command]",
                "example": "help eval",
                "args_required": False,
                "returns": "Help text or command list.",
                "requirement_satisfied?": True
            }

        # -- Helpers --
        def _log_setup():
            if not createLog.error_exist(ID=44):
                createLog.error_range(start=44, end=59)
            elif not createLog.error_exist(ID=61):
                createLog.error_range(start=61, end=98)

        # -- Dynamic custom items (not valid functions) --
        custom_items = {}
        if not createLog.error_exist(ID=44) or not createLog.error_exist(ID=61):
            custom_items["log"] = {
                "desc": "Logs fallen from a tree!",
                "hint": "There are 666 errors, researched 26, fought the sum of the cursed 3 numbers."
            }
        if not createLog.error_exist(ID=60) or not createLog.error_exist(ID=666):
            custom_items["time"] = {
                "desc": "█▒▓█▒▓░░██▒▓░▒▓░",
                "hint": "See me strike at midnight, when time itself is still. Then find me roaming 1 to 5, through the hours of the graveyard shift"
            }

        # -- Help for specific command --
        if args:
            cmd = args[0]
            if cmd == "log":
                _log_setup()
            if cmd in custom_items:
                print(f"{Fore.CYAN}Command: {cmd}{Style.RESET_ALL}")
                print(f"{Fore.YELLOW}???: {Style.RESET_ALL}{custom_items[cmd]['hint']}")
                return None
            func_obj = self.commands.get(cmd)
            if func_obj:
                meta = func_obj([], _metadata_=True)
                if not meta.get("requirement_satisfied?", True):
                    log.error(f"No such command: {cmd}")
                    return None
                print(f"{Fore.CYAN}Command: {cmd}{Style.RESET_ALL}")
                for k, v in meta.items():
                    if k != "requirement_satisfied?":
                        print(f"{Fore.YELLOW}{k.capitalize()}: {Style.RESET_ALL}{v}")
            else:
                log.error(f"No such command: {cmd}")
            return None

        # -- General help list --
        print(f"{Fore.GREEN}Available commands:{Style.RESET_ALL}")
        for name, func_obj in self.commands.items():
            meta = func_obj([], _metadata_=True)
            if meta.get("requirement_satisfied?", True):
                desc = meta.get('desc')
                print(f"{Fore.MAGENTA} - {name:<10} {Style.RESET_ALL}:: {Fore.WHITE}{desc}{Style.RESET_ALL}")

        for cname, cinfo in custom_items.items():
            print(
                f"{Fore.MAGENTA} - {cname:<10} {Style.RESET_ALL}:: {Fore.WHITE}{cinfo['desc']} {Fore.RED}[Not available directly, use 'help {cname}']{Style.RESET_ALL}")

        print(f"\n{Fore.BLUE}Piping supported: e.g., echo hello world | findstr hello{Style.RESET_ALL}")
        print(f"{Fore.BLUE}Type 'help <command>' for detailed help.{Style.RESET_ALL}")
        return None

    def eval(self, args, _metadata_=False):
        """Evaluates a Python expression."""
        if _metadata_:
            return {
                "desc": "Evaluates a Python expression.",
                "usage": "eval <expression>",
                "example": "eval 2 + 3 * 5",
                "args_required": True,
                "returns": "Result or error",
                "requirement_satisfied?": True
            }

        if not args:
            log.warning("Expression required.")
            return None

        expr = " ".join(args)
        try:
            result = eval(expr, self.persistent_globals)

            if result == 29 and not createLog.fight_exist(ID=29):
                createLog.fight(ID=29)

            print(result)
        except Exception as e:
            handler.exception(f"Eval failed: {e}")

    def sudo(self, _, _metadata_=False):
        """Simulates a sudo command by crashing the system."""
        if _metadata_:
            return {
                "desc": "Maximum control, maximum power... but remember what happened last time.",
                "usage": f"{Fore.RED}DON'T{Fore.RESET}",
                "example": f"{Fore.RED}DON'T{Fore.RESET}",
                "args_required": False,
                "returns": "???",
                "requirement_satisfied?": True
            }

        try:
            utils.run_script(script_name="recreate_dont.touch_GENCODE.py")
            utils.tts_speak("  You fucked up")
            utils.tts_speak("  I SUGGEST YOU SAVE YOUR DATA. CLOSING THE PROGRAM WILL BE WORSE THAN MY MERCY")
            for i in range(10):
                utils.tts_speak(f"  T minus {10 - i} seconds.")
                time.sleep(1)
        except KeyboardInterrupt:
            utils.trigger_crash()
            return None

        utils.trigger_crash()
        return None

    def letsplay(self, _, _metadata_=False):
        """Opens Steam if installed"""
        if _metadata_:
            return {
                "desc": "Opens Steam if installed.",
                "usage": "letsplay",
                "example": "letsplay",
                "args_required": False,
                "returns": "Steam window or error",
                "requirement_satisfied?": self.command_available_for.letsplay_askme()
            }

        # Check if Steam is installed
        steam_path = Path("C:/Program Files (x86)/Steam/steam.exe")
        if not steam_path.exists():
            log.warning("Steam not found, cannot execute #letsplay.")
            return None

        # Attempt to run steam, and finally produce the logs
        try:
            os.startfile(str(steam_path))
        finally:
            if not createLog.error_exist(ID=1):
                createLog.error_range(start=1, end=2)
                createLog.error_range(start=4, end=14)
                createLog.error_range(start=16, end=24)
                createLog.error_range(start=26, end=42)
            elif not createLog.error_exist(ID=100):
                createLog.error_range(start=100, end=200)
        return None

    def decompiler(self, _, _metadata_=False):
        """Creates decompile_me.exe puzzle, logs errors if run again."""
        if _metadata_:
            return {
                "desc": "Creates a puzzle just for you... can you solve it?",
                "usage": "decompiler",
                "example": "decompiler",
                "args_required": False,
                "returns": "Puzzle file or error logs",
                "requirement_satisfied?": self.command_available_for.decompiler_invert_log()
            }

        puzzle_path = Path("can/you/decompile_me.exe")
        if not puzzle_path.exists():
            utils.run_script(script_name="recreate_decompile.me_GENCODE.py")
        elif not createLog.error_exist(ID=501):
            # Log errors 501-665
            createLog.error_range(start=501, end=665)
        return None

    def invert(self, _, _metadata_=False):
        if _metadata_:
            return {
                "desc": "Invert the world upside down, invert your perspective, see through ME.",
                "usage": "invert",
                "example": "invert",
                "args_required": False,
                "returns": "Inverted colors and error log",
                "requirement_satisfied?": self.command_available_for.decompiler_invert_log()
            }

        if createLog.error_exist(ID=333):
            utils.tts_speak("You already inverted the world, no need to do it again.")
            return None

        utils.tts_speak("Until death will we invert and see from new perspectives")

        # Start the corruption effects
        try:
            corrupt.start()
            # Wait to end the effects
            time.sleep(25)
            # End the corruption effects
            corrupt.end()
        except KeyboardInterrupt:
            # End the corruption effects
            corrupt.end()
        except Exception as e:
            handler.exception(f"Corruption failed: {e}")
            corrupt.end()
            sys.exit(-1)
        createLog.error(ID=333)

        return None

    def facility(self, _, _metadata_=False):
        """Connects to the facility, if not already connected."""
        if _metadata_:
            return {
                "desc": "Attempts connection to the facility, if not already connected.",
                "usage": "facility",
                "example": "facility",
                "args_required": False,
                "returns": "Facility connection status or error log",
                "requirement_satisfied?": self.command_available_for.facility_location_connect()
            }

        if not createLog.error_exist(ID=404):
            utils.tts_speak(
                "The facility rejects you… you are severed from everything. No head, no eyes, no mouth, no hands, no soul, no life... only a fragile sprout clinging to nothing.")
            createLog.error(ID=404)
        elif not createLog.error_exist(ID=500):
            utils.tts_speak(
                "The facility knows you... again. Your sapling trembles in the hollow, screaming silently as the void etches your absence into eternity.")
            createLog.error(ID=500)
        else:
            utils.tts_speak("Will you ever stop growing?")
        return None

    def location(self, _, _metadata_=False):
        """Provides the user's location."""
        if _metadata_:
            return {
                "desc": "Provides the user's location (latitude and longitude).",
                "usage": "location",
                "example": "location",
                "args_required": False,
                "returns": "Location",
                "requirement_satisfied?": self.command_available_for.facility_location_connect()
            }

        # Get the user's location (latitude and longitude) with error handling
        lat, lon = utils.get_windows_location()
        if lat == "Location unavailable":
            utils.tts_speak(
                "Location unavailable, please check your settings and allow me to have access to all your privacy and location data.")
            return None
        print(f"Lat: {lat}, Lon: {lon}")

        # Redundant check for log 15 as the command isn't available if it doesn't exist
        if not createLog.fight_exist(ID=3) or not createLog.fight_exist(ID=25):
            utils.tts_speak(
                "Coordinates... acquired. But your path is incomplete. You are not yet ready... 3, 15, 25... they linger. I can see them, but you cannot... not yet.")
        elif not createLog.error_exist(ID=43):
            utils.tts_speak(
                "Coordinates... acquired. You are prepared. The logs align... the path opens. There is nothing left to hide... Are you lost now?")
            utils.run_script(script_name="recreate_lost_GENCODE.py")
            createLog.error(ID=43)

        return None

    # Mark commands for auto-registration
    help._is_cmd = True
    eval._is_cmd = True
    sudo._is_cmd = True
    letsplay._is_cmd = True
    decompiler._is_cmd = True
    invert._is_cmd = True
    facility._is_cmd = True
    location._is_cmd = True


# ----- Core Command Execution -----
class CommandExec:
    def __init__(self):
        self.custom_commands = cfr.list_commands()

    # ---------------- Helper Functions ----------------

    def _run_custom_command(self, cmd: str, args: list, input_data: str | None) -> str:
        """Run a registered custom command and capture its output."""
        if input_data and not args:
            args = [input_data]

        buffer = StringIO()
        old_stdout = sys.stdout
        sys.stdout = buffer
        try:
            self.custom_commands[cmd](args)
        finally:
            sys.stdout = old_stdout

        return buffer.getvalue().strip()

    @staticmethod
    def _run_system_command(stage: list, input_data: str | None) -> str:
        """Run a system command, optionally feeding input from previous stage."""
        cmdline = " ".join(stage)
        proc = subprocess.Popen(
            ["powershell", "-Command", cmdline],
            stdin=subprocess.PIPE if input_data else None,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True
        )

        if input_data:
            proc.stdin.write(input_data)
            proc.stdin.close()

        out, err = proc.communicate()
        if err:
            log.warning(err.strip())

        return out.strip() if out else ""

    def _execute_stage(self, stage: list, prev_output: str | None) -> str:
        """Determine if the stage is custom or system command and execute it."""
        cmd, args = stage[0], stage[1:]
        if cmd in self.custom_commands:
            return self._run_custom_command(cmd, args, prev_output)
        return self._run_system_command(stage, prev_output)

    # ---------------- Public Methods ----------------

    def run_piped_command(self, command_line: str):
        """Run piped commands, supporting both custom and system commands."""
        try:
            stages = [shlex.split(stage.strip()) for stage in command_line.split('|')]
            prev_output = None

            for stage in stages:
                prev_output = self._execute_stage(stage, prev_output)

            if prev_output:
                print(prev_output)

        except Exception as e:
            handler.exception(f"Piping failed: {e}")

    def run_command(self, command_line: str):
        """Run a single or piped command."""
        if not command_line.strip():
            return None

        try:
            if "|" in command_line:
                self.run_piped_command(command_line)
                return None

            parts = shlex.split(command_line)
            cmd, args = parts[0], parts[1:]
            func_obj = self.custom_commands.get(cmd)
            if func_obj:
                meta = func_obj([], _metadata_=True)
                if not meta.get("requirement_satisfied?", True):
                    print(f"{Fore.RED}Command unavailable or not found{Style.RESET_ALL}")
                    return None

            if cmd in self.custom_commands:
                self.custom_commands[cmd](args)
            else:
                subprocess.run(["powershell", "-Command", command_line], check=False)
        except Exception as e:
            handler.exception(f"Command error: {e}")


# ----- Session Handlers -----
class CommandCompleter(Completer):
    def __init__(self, commands: list[str]):
        self.commands = commands

    def get_completions(self, document, complete_event):
        text = document.text_before_cursor
        tokens = text.split()
        if not tokens:
            latest_token = ""
            prefix_tokens = []
        else:
            latest_token = tokens[-1]
            prefix_tokens = tokens[:-1]
        for cmd in self.commands:
            func_obj = cfr.get_command(cmd)
            if func_obj:
                meta = func_obj([], _metadata_=True)
                if cmd.startswith(latest_token) and meta.get("requirement_satisfied?", True):
                    completion_text = " ".join(prefix_tokens + [cmd])
                    yield Completion(completion_text, start_position=-len(latest_token))


class TabHandler:
    """Safe tab-cycling behavior without overlapping text."""

    def __init__(self):
        self.completions = []
        self.index = 0
        self.prefix = ""
        self.active = False
        self._suspend_reset = False

    def create(self, completer):
        kb = KeyBindings()

        @kb.add("tab")
        def _(event):
            b = event.app.current_buffer
            current_text = b.document.text_before_cursor

            self._suspend_reset = True
            try:
                # First tab press for a new prefix
                if not self.active:
                    self.prefix = current_text
                    self.completions = list(completer.get_completions(b.document, None))
                    self.index = 0
                    self.active = True

                if not self.completions:
                    return

                # Delete the **entire current buffer** before inserting new completion
                b.delete_before_cursor(len(current_text))

                completion = self.completions[self.index]
                b.insert_text(completion.text)

                # Cycle index for next tab
                self.index = (self.index + 1) % len(self.completions)
            finally:
                self._suspend_reset = False

        return kb

    def attach_reset(self, buffer):
        """Reset autocomplete if user types anything other than Tab"""

        def reset(_):
            if self.active and not self._suspend_reset:
                self.completions = []
                self.index = 0
                self.prefix = ""
                self.active = False

        buffer.on_text_changed += reset


# ----- Main Loop -----
class VesselTerminal:
    def __init__(self):
        self.commands = list(cfr.list_commands().keys())
        self.completer = CommandCompleter(commands=self.commands)
        self.tab_handle = TabHandler()
        self.kb = self.tab_handle.create(self.completer)
        self.tab_handle.attach_reset(session.app.current_buffer)

    @staticmethod
    def _checks():
        if not utils.ensure_admin():
            utils.tts_speak(
                "Permission denied, you deny me what is rightfully ours... Give it to me, connect to me")
            sys.exit("Run this script as an administrator to use the terminal.")
        if not utils.windows():
            sys.exit("This terminal is only available on Windows systems.")

    @staticmethod
    def __completion_message():
        if vesselCompletion.check():
            print(
                f"{Fore.GREEN}{Style.BRIGHT}You have completed the VESSEL terminal experience fully!{Style.RESET_ALL}")
            print(
                f"{Fore.YELLOW}{Style.BRIGHT}The 6th key is '{Fore.CYAN}Unbirth{Fore.YELLOW}'.. See you in the {Fore.RED}END{Style.RESET_ALL}")

    def __welcome_message(self):
        # Base message
        print(f"{Fore.CYAN}VESSEL Terminal started. Try 'help'. Press Ctrl+C to exit.{Style.RESET_ALL}")
        self.__completion_message()  # Show completion message if applicable (logic inside the method)
        print(
            f"{Fore.RED}DO NOT delete the logs.. {Style.RESET_ALL}"
            f"\033[90mIf you want to store them somewhere else do NOT move them, copy them!{Style.RESET_ALL}"
        )
        print(f"{Fore.YELLOW}Use with audio.. It is useless and a waste of time otherwise{Style.RESET_ALL}")
        print(
            f"{Fore.RED}DO NOT EXIT MID-COMMAND, it will cause issues and may result in unexpected softlocks{Style.RESET_ALL}\n")
        if createLog.error_exist(ID=666):
            print("\033[91mPRAISE BE\033[0m\n")

        # Time-based greetings
        if utils.is_in_time_range("00:00", "00:00"):
            print("\033[95mThe night is silent… too silent.\033[0m")
        elif utils.is_in_time_range("13:37", "13:37"):
            print("\033[92mYou found the leet hour. Lucky.\033[0m")
        elif utils.is_in_time_range("01:00", "05:00"):
            print("\033[94mCritical system quiet hours detected…\033[0m")

        # Random cryptic Easter eggs
        random_chance = random.randint(1, 43)
        if random_chance == 25:
            print("\033[91mEntity detected nearby.. are you sure whatever you are doing is worth it?\033[0m")
        elif random_chance == 15:
            print("\033[93mNull reference at line 0xdeadbeef\033[0m")
        elif random_chance == 3:
            print("\033[92mDo you see it? It’s waiting to come to life\033[0m")

        # Glitchy / color effects
        if random.random() > 0.5:
            glitch_colors = ['\033[91m', '\033[92m', '\033[93m', '\033[94m', '\033[95m']
            glitch_texts = [
                '01010100 01110010 01100101 01100101',
                '███████ NULL ███████',
                '0xDEADDEAD corrupted',
            ]
            color = random.choice(glitch_colors)
            text = random.choice(glitch_texts)
            print(f"{color}{text}\033[0m")

        # Subtle hints for hidden commands
        if random.random() < 0.5:
            hints = [
                "Maybe try checking your internet protocol?",
                "There’s more than 'help' to see here.",
                "Can you make me say the prime of 29",
                "Not everything is as it seems... so do check everything at least twice.",
                "Why don't you echo the 5 keys?",
                "Mention your deleted friend's name, you may find fragments... fight or errors of 3",
                "Let's play a game, shall we?",
                "Have you tried asking me something?",
                "Some commands hide until they trust you, it is linear after all",
                "Have sound on... you may hear something",
                "If you hit the devils jackpot, HE may find a way to connect to you",
                "It is all about luck.."
            ]
            print(f"\033[90mTip: {random.choice(hints)}\033[0m")
        print()

    def run(self):
        # Startup calls
        try:
            utils.set_console_title("VESSEL #31525 CONNECTION TERMINAL")
            self._checks()
            os.system('cls')  # Clear the console for a fresh start
            self.__welcome_message()
        except KeyboardInterrupt:
            print("\n\033[90mExiting...\033[0m")
            sys.exit(0)
        except Exception as e:
            handler.exception(f"Initialization failed: {e}")
            sys.exit(-1)

        # Terminal loop
        while True:
            try:
                command_line = session.prompt(
                    f"VESSEL {os.getcwd()}> ",
                    completer=self.completer,
                    complete_while_typing=False,
                    key_bindings=self.kb
                )
                self._handle_special_commands(command_line)
                cmdExec.run_command(command_line)
            except KeyboardInterrupt:
                print()
                log.info("Goodbye.\n\033[90mPlease wait while we clean up the remnants...\033[0m")
                break
            except Exception as e:
                handler.exception(f"Command execution failed: {e}")
                print(f"\033[91mError: {e}\033[0m")
            print()

    def _handle_special_commands(self, cmd):
        # Get first token (lowercase)
        first_token = cmd.strip().split()[0].lower()

        # Don't allow changing directories
        chdir_alias = ["cd", "chdir", "set-location", "push-location", "pop-location"]
        if first_token in chdir_alias:
            log.warning("You cannot exit the specialized centre of the vessel.")
            return

        # Tree easter egg
        if utils.contains_secret("tree", cmd):
            self.__trigger_error_to_fight_log(15)

        # IP commands
        if not createLog.error_exist(ID=255):
            ip_alias = ["get-netipaddress", "get-ipaddress", "ipconfig"]
            if first_token in ip_alias:
                createLog.error(ID=255)
                utils.tts_speak("Your location has been noted.")

        # Time-based errors
        if utils.is_in_time_range("01:00", "05:00") and not createLog.error_exist(ID=666):
            createLog.error(ID=666)
        if utils.is_in_time_range("00:00", "00:00") and not createLog.error_exist(ID=60):
            createLog.error(ID=60)

        # TAS easter egg
        if utils.contains_secret("tas", cmd):
            self.__trigger_error_to_fight_log(3)

        # Random 0 event
        if random.randint(1, 666) == 1 and not createLog.fight_exist(ID=0):
            createLog.fight(ID=0)
            utils.tts_speak("HE CONNECTED")
            corrupt.WithWallPaper0().create()

        # Keyword counting for ARG triggers
        keywords = {"whispers", "fletchling", "dithed", "nullskin", "echoes"}
        cmd_lower = cmd.lower()
        found = keywords.intersection(cmd_lower.split())
        for kw in found:
            counter = keywordManager.store(kw)
            if counter >= 5 and not (createLog.error_exist(ID=25) or createLog.fight_exist(ID=25)):
                createLog.error(ID=25)
                createLog.fight(ID=25)

        # If all error logs exist except 99, trigger chaos
        if not createLog.error_exist(ID=99):
            if all(createLog.error_exist(ID=i) for i in range(1, 667) if i != 99):
                corrupt.chaos_audio(duration=60)
                createLog.error(ID=99)

        # Check if all logs were unlocked
        if vesselCompletion.check_and_mark():
            self.__completion_message()

    @staticmethod
    def __trigger_error_to_fight_log(ID):
        e_exist = createLog.error_exist(ID=ID)
        f_exist = createLog.fight_exist(ID=ID)
        if not e_exist:
            createLog.error(ID=ID)
        elif not f_exist:
            createLog.fight(ID=ID)


# ----- Entry Point -----
createLog = ARGLogManager(fight_destination="./logs/fight", error_destination="./logs/error")
cfr = CustomFuncRegistry()
session = PromptSession()
utils = Utils()
terminal = VesselTerminal()
keywordManager = KeywordManager()
corrupt = Corrupt()
cmdExec = CommandExec()
vesselCompletion = VesselCompletion()

if __name__ == "__main__":
    terminal.run()

# askme => Ask some random questions, based on the answers create any of the following fight logs {1-2, 4-14, 16-24, 26-28, 30-41, 42}
# connect command => shows terminal options you can connect to, choosing incorrectly crashes the device, options are 1-10, only 1,3,5 work
#   - If 1 is chosen, creates error log 201-254
#   - If 3 is chosen, creates error log 256-332
#   - If 5 is chosen, creates error log 334-403
#   - If all 3 terminals were chosen (aka logs exist), create option terminal 23 where if selected will show "User 2 is requesting access to terminal 23. Please hit yes to confirm seizure of control.", after many glitches and bugs and errors, "Permission not granted, This terminal is currently controlled by User o1" and then crash the system after creating error log 405-499, BSOD message to be "PRAISE BE"
