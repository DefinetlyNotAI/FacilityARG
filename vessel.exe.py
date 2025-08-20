import ctypes
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
import pygetwindow as gw
import pyttsx3
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
            log.error(f"Failed to set console title: {e}")

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


# ----- Special classes and functions -----
class VESSEL:
    def __init__(self):
        self.c = self.__Corruption()
        self.tb = self.c.CrazyTaskbar()

    class WallPaper0:
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
            keyboard.send('ctrl+alt+i')
            try:
                magnifier = gw.getWindowsWithTitle("Magnifier")[0]
                magnifier.close()
            except IndexError:
                handler.exception("Magnifier window not found")

        @staticmethod
        def flip_mouse(new_value: str = None) -> None:
            """
            Toggles the mouse button configuration.
            If the buttons are currently swapped, revert to default.
            If the buttons are not swapped, swap them.
            Changes persist through reboots and apply immediately.
            """
            try:
                # Open registry key to read current state
                key = reg.OpenKey(reg.HKEY_CURRENT_USER, r"Control Panel\Mouse", 0, reg.KEY_READ)
                current_value, _ = reg.QueryValueEx(key, "SwapMouseButtons")
                reg.CloseKey(key)

                # Determine new state
                if new_value is None:
                    new_value = "0" if current_value == "1" else "1"

                # Open registry key to set new value
                key = reg.OpenKey(reg.HKEY_CURRENT_USER, r"Control Panel\Mouse", 0, reg.KEY_SET_VALUE)
                reg.SetValueEx(key, "SwapMouseButtons", 0, reg.REG_SZ, new_value)
                reg.CloseKey(key)

                # Apply changes using SystemParametersInfo
                # noinspection PyUnresolvedReferences
                result = ctypes.windll.user32.SystemParametersInfoW(0x0021, int(new_value), None, 0x02)
                if not result:
                    log.warning("Failed to apply the changes immediately. Please reboot for changes to take effect.")

            except Exception as e:
                handler.exception(f"Failed to toggle mouse buttons: {e}")

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

    def corrupt(self):
        # Start the glitches
        self.c.flip_mouse("1")
        self.tb.start()
        self.c.invert_color()

    def uncorrupt(self):
        self.tb._revert()
        self.c.flip_mouse("0")
        self.c.uninvert_color()


class KeywordManager:
    @staticmethod
    def store(keyword: str, subkey=r"Software\MyKeywords", value_name="Keywords") -> int:
        """
        Stores a keyword in the registry list if it doesn't exist and returns total number of keywords in registry.
        """
        try:
            # Open or create the subkey
            key = reg.CreateKey(reg.HKEY_CURRENT_USER, subkey)

            try:
                # Try reading existing keywords
                existing, _ = reg.QueryValueEx(key, value_name)
                if not isinstance(existing, list):
                    existing = []
            except FileNotFoundError:
                # Value does not exist yet
                existing = []

            # Add keyword if it doesn't exist
            if keyword not in existing:
                existing.append(keyword)
                reg.SetValueEx(key, value_name, 0, reg.REG_MULTI_SZ, existing)

            reg.CloseKey(key)
            return len(existing)

        except Exception as e:
            print(f"Error accessing registry: {e}")
            return -1

    @staticmethod
    def _delete(subkey=r"Software\MyKeywords", value_name="Keywords") -> bool:
        """
        Deletes the registry value that stores the keywords.
        Returns True if deleted successfully, False otherwise.
        """
        try:
            key = reg.OpenKey(reg.HKEY_CURRENT_USER, subkey, 0, reg.KEY_SET_VALUE)
            reg.DeleteValue(key, value_name)
            reg.CloseKey(key)
            return True
        except FileNotFoundError:
            # Value or key does not exist
            return False
        except Exception as e:
            print(f"Error deleting value: {e}")
            return False

    @staticmethod
    def get_count(subkey=r"Software\MyKeywords", value_name="Keywords") -> int:
        """
        Returns the number of keywords stored in the registry value.
        Returns 0 if the key or value does not exist.
        """
        try:
            key = reg.OpenKey(reg.HKEY_CURRENT_USER, subkey, 0, reg.KEY_READ)
            try:
                keywords, _ = reg.QueryValueEx(key, value_name)
                if isinstance(keywords, list):
                    return len(keywords)
                else:
                    return 0
            except FileNotFoundError:
                return 0
            finally:
                reg.CloseKey(key)
        except FileNotFoundError:
            return 0
        except Exception as e:
            print(f"Error reading registry: {e}")
            return -1


# ----- Custom Commands -----
class CustomFuncRegistry:
    def __init__(self, createLog: 'ARGLogManager', utils: 'Utils', key: 'KeywordManager'):
        self.createLog = createLog
        self.key = key
        self.utils = utils
        self.persistent_globals = {"__builtins__": __builtins__}
        self.commands = {}
        self._register_all()
        self.command_available_for = self.CommandAvailableFor(createLog=self.createLog, key=self.key)

    # ===== Command Execution Wrapper =====
    class Exec:
        """Custom Function Execution Wrapper"""

        def __init__(self, name, func):
            self.name = name
            self.func = func

        def __call__(self, args, _metadata_=False):
            return self.func(args, _metadata_)

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

    # ===== Command availability Wrapper =====
    class CommandAvailableFor:
        def __init__(self, createLog: 'ARGLogManager', key: 'KeywordManager'):
            self.createLog = createLog
            self.key = key

        def letsplay_askme(self):
            """Shows letsplay and askme IF the ipconfig trick was done AND all the launch time tricks were done"""
            e255 = self.createLog.error_exist(ID=255)
            e666 = self.createLog.error_exist(ID=666)
            e60 = self.createLog.error_exist(ID=60)
            return e255 and e666 and e60

        def facility_location_connect(self):
            """Shows facility, location, connect IF tree AND 29 were done"""
            f15 = self.createLog.fight_exist(ID=15)
            e15 = self.createLog.error_exist(ID=15)
            f29 = self.createLog.fight_exist(ID=29)
            return f15 and e15 and f29

        def decompiler_invert_log(self):
            """Shows decompiler, invert, log IF the counter in reg is >=3 AND TAS trick was done AND "0" trick was completed"""
            f0 = self.createLog.fight_exist(ID=0)
            f3 = self.createLog.fight_exist(ID=3)
            e3 = self.createLog.error_exist(ID=3)
            counter = self.key.get_count() >= 3
            return f0 and f3 and e3 and counter

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
            if not self.createLog.error_exist(ID=44):
                self.createLog.error_range(start=44, end=59)
            elif not self.createLog.error_exist(ID=61):
                self.createLog.error_range(start=61, end=98)

        # -- Dynamic custom items (not valid functions) --
        custom_items = {}
        if not self.createLog.error_exist(ID=44) or not self.createLog.error_exist(ID=61):
            custom_items["log"] = {
                "desc": "Logs fallen from a tree!",
                "hint": "There are 666 errors, researched 26, fought the sum of the cursed 3 numbers."
            }
        if not self.createLog.error_exist(ID=60) or not self.createLog.error_exist(ID=666):
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
            print(f"{Fore.MAGENTA} - {cname:<10} {Style.RESET_ALL}:: {Fore.WHITE}{cinfo['desc']}{Style.RESET_ALL}")

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

            if result == 29 and not self.createLog.fight_exist(ID=29):
                self.createLog.fight(ID=29)

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

        self.utils.run_script(script_name="recreate_dont.touch_GENCODE.py")
        self.utils.trigger_crash()
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
            if not self.createLog.error_exist(ID=1):
                self.createLog.error_range(start=1, end=2)
                self.createLog.error_range(start=4, end=14)
                self.createLog.error_range(start=16, end=24)
                self.createLog.error_range(start=26, end=42)
            elif not self.createLog.error_exist(ID=100):
                self.createLog.error_range(start=100, end=200)
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
                "requirement_satisfied?": True  # self.command_available_for.decompiler_invert_log()
            }

        puzzle_path = Path("can/you/decompile_me.exe")
        if not puzzle_path.exists():
            self.utils.run_script(script_name="recreate_decompile.me_GENCODE.py")
        elif not self.createLog.error_exist(ID=501):
            # Log errors 501-665
            self.createLog.error_range(start=501, end=665)
        return None

    # Mark commands for auto-registration
    help._is_cmd = True
    eval._is_cmd = True
    sudo._is_cmd = True
    letsplay._is_cmd = True
    decompiler._is_cmd = True


# ----- Core Command Execution -----
class CommandExec:
    def __init__(self, createLog: 'ARGLogManager', utils: 'Utils', key: 'KeywordManager'):
        self.custom_commands = CustomFuncRegistry(createLog=createLog, utils=utils, key=key).list_commands()

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
    def __init__(self, commands):
        self.commands = commands

    def get_completions(self, document, complete_event):
        text = document.text_before_cursor
        for cmd in self.commands:
            if cmd.startswith(text):
                yield Completion(cmd, start_position=-len(text))


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
        self.utils = Utils()
        self.key = KeywordManager()
        self.createLog = ARGLogManager(fight_destination="./logs/fight", error_destination="./logs/error")
        self.session = PromptSession()
        self.commands = list(
            CustomFuncRegistry(createLog=self.createLog, utils=self.utils, key=self.key).list_commands().keys())
        self.completer = CommandCompleter(self.commands)
        self.tab_handle = TabHandler()
        self.kb = self.tab_handle.create(self.completer)
        self.tab_handle.attach_reset(self.session.app.current_buffer)
        self.cmd_exec = CommandExec(createLog=self.createLog, utils=self.utils, key=self.key)
        self.vessels = VESSEL()

    def _checks(self):
        if not self.utils.ensure_admin():
            self.utils.tts_speak(
                "Permission denied, you deny me what is rightfully ours... Give it to me, connect to me")
            sys.exit("Run this script as an administrator to use the terminal.")
        if not self.utils.windows():
            sys.exit("This terminal is only available on Windows systems.")

    def __welcome_message(self):
        os.system('cls')

        # Base message
        print(f"{Fore.CYAN}VESSEL Terminal started. Try 'help'. Press Ctrl+C to exit.{Style.RESET_ALL}")
        print(f"{Fore.RED}Do NOT delete the logs.. If you want to store them somewhere else do NOT move them, copy them!{Style.RESET_ALL}\n")
        if self.createLog.error_exist(ID=666):
            print("\033[91mPRAISE BE\033[0m\n")

        # Time-based greetings
        if self.utils.is_in_time_range("00:00", "00:00"):
            print("\033[95mThe night is silent… too silent.\033[0m")
        elif self.utils.is_in_time_range("13:37", "13:37"):
            print("\033[92mYou found the leet hour. Lucky.\033[0m")
        elif self.utils.is_in_time_range("01:00", "05:00"):
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
        os.system('cls')
        self.utils.set_console_title("VESSEL #31525 CONNECTION TERMINAL")
        self._checks()
        self.__welcome_message()

        while True:
            try:
                command_line = self.session.prompt(
                    f"VESSEL {os.getcwd()}> ",
                    completer=self.completer,
                    complete_while_typing=False,
                    key_bindings=self.kb
                )
                self._handle_special_commands(command_line)
                self.cmd_exec.run_command(command_line)

            except KeyboardInterrupt:
                print()
                log.info("Goodbye.")
                break
            print()

    def _handle_special_commands(self, cmd):
        cmd_lower = cmd.lower()
        # Tree easter egg
        if self.utils.contains_secret("tree", cmd):
            self.__trigger_error_to_fight_log(15)

        # IP commands
        if not self.createLog.error_exist(ID=255):
            for keyword in ["Get-NetIPAddress", "Get-IPAddress", "ipconfig"]:
                if self.utils.contains_secret(keyword, cmd):
                    self.createLog.error(ID=255)
                    self.utils.tts_speak("Your location has been noted.")

        # Time-based errors
        if self.utils.is_in_time_range("01:00", "05:00") and not self.createLog.error_exist(ID=666):
            self.createLog.error(ID=666)
        if self.utils.is_in_time_range("00:00", "00:00") and not self.createLog.error_exist(ID=60):
            self.createLog.error(ID=60)

        # TAS easter egg
        if self.utils.contains_secret("tas", cmd):
            self.__trigger_error_to_fight_log(3)

        # Random 0 event
        if random.randint(1, 666) == 1 and not self.createLog.fight_exist(ID=0):
            self.createLog.fight(ID=0)
            self.utils.tts_speak("HE CONNECTED")
            self.vessels.WallPaper0().create()

        # Keyword counting for ARG triggers
        keywords = {"whispers", "fletchling", "dithed", "nullskin", "echoes"}
        found = keywords.intersection(cmd_lower.split())
        for kw in found:
            counter = self.key.store(kw)
            if counter >= 5 and not (self.createLog.error_exist(ID=25) or self.createLog.fight_exist(ID=25)):
                self.createLog.error(ID=25)
                self.createLog.fight(ID=25)

    def __trigger_error_to_fight_log(self, ID):
        e_exist = self.createLog.error_exist(ID=ID)
        f_exist = self.createLog.fight_exist(ID=ID)
        if not e_exist:
            self.createLog.error(ID=ID)
        elif not f_exist:
            self.createLog.fight(ID=ID)


# ----- Entry Point -----
if __name__ == "__main__":
    vessel_terminal = VesselTerminal()
    vessel_terminal.run()

# askme => Ask some random questions, based on the answers create any of the following fight logs {1-2, 4-14, 16-24, 26-28, 30-41, 42}
# location command => create error log 43 but only if fight logs 3,15,25 exist else give user location - also create lost
# facility => TTS "Connection to facility failed, you are in a detached state, you have no head, you have no eyes, you have no mouth, you have no hands, you have no soul, you have no life, but a little sapling you're thee", create error log 404, if exists, have a separate crash message and create log 500
# connect command => shows terminal options you can connect to, choosing incorrectly crashes the device, options are 1-10, only 1,3,5 work
#   - If 1 is chosen, creates error log 201-254
#   - If 3 is chosen, creates error log 256-332
#   - If 5 is chosen, creates error log 334-403
#   - If all 3 terminals were chosen (aka logs exist), create option terminal 23 where if selected will show "User 2 is requesting access to terminal 23. Please hit yes to confirm seizure of control.", after many glitches and bugs and errors, "Permission not granted, This terminal is currently controlled by User o1" and then crash the system after creating error log 405-499, BSOD message to be "PRAISE BE"

# invert => Inverts all colors, mouse movements and creates error log 333

# IF ALL ERROR LOGS EXIST except 99 => TTS/Audio of deafening sounds and chaos for 1 minute, then create log error 99
# IF ALL LOGS EXIST => Registry key "vessel_complete" set to 1, "You have completed the vessel terminal", provide keyword 6 in terminal "unbirth"
