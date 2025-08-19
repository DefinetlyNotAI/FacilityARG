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
from pathlib import Path

import keyboard
import pygetwindow as gw
import pyttsx3
from PIL import Image, ImageDraw, ImageFont, ImageChops
from prompt_toolkit import PromptSession
from prompt_toolkit.completion import Completer, Completion
from prompt_toolkit.key_binding import KeyBindings

from vessel import log, handler


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
    def run_script(script_name: str):
        """
        Execute a Python script from the 'scripts/' directory.
        Only scripts ending with '_GENCODE.py' are allowed.
        """
        scripts_dir = Path("scripts")
        script_path = scripts_dir / script_name

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
            log.debug(result.stdout)
            return result.stdout
        except subprocess.CalledProcessError as e:
            handler.exception(f"Script execution failed: {e.stderr}")
            return None

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


class VESSEL:
    def __init__(self):
        self.c = self.Corruption()
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

    class Corruption:
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


# ----- Custom Commands -----
class CustomFuncRegistry:
    def __init__(self):
        self.commands = {}
        self._register_all()
        self.persistent_globals = {"__builtins__": __builtins__}

    class Exec:
        """Custom Function Execution Wrapper"""

        def __init__(self, name, func):
            self.name = name
            self.func = func

        def __call__(self, args, _metadata_=False):
            return self.func(args, _metadata_)

    def _register_all(self):
        for attr_name in dir(self):
            if attr_name.startswith("_"):
                continue
            attr = getattr(self, attr_name)
            if callable(attr) and hasattr(attr, "_is_cmd"):
                self.commands[attr_name] = self.Exec(attr_name, attr)

    def get_command(self, name):
        return self.commands.get(name)

    def list_commands(self):
        return self.commands

    # ----- Command Implementations -----
    def help(self, args, _metadata_=False):
        from colorama import Fore, Style

        if _metadata_:
            return {
                "desc": "Shows help info for commands.",
                "usage": "help [command]",
                "example": "help eval",
                "args_required": False,
                "returns": "Help text or command list.",
                "requirement_satisfied?": True
            }

        if args:
            cmd = args[0]
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
        else:
            print(f"{Fore.GREEN}Available commands:{Style.RESET_ALL}")
            for name, func_obj in self.commands.items():
                meta = func_obj([], _metadata_=True)
                if meta.get("requirement_satisfied?", True):
                    desc = meta.get('desc')
                    print(f"{Fore.MAGENTA} - {name:<10} {Style.RESET_ALL}:: {Fore.WHITE}{desc}{Style.RESET_ALL}")
            print(f"{Fore.BLUE}Piping supported: e.g., echo hello world | findstr hello{Style.RESET_ALL}")
            print(f"{Fore.BLUE}Type 'help <command>' for detailed help.{Style.RESET_ALL}")
        return None

    def exec(self, args, _metadata_=False):
        if _metadata_:
            return {
                "desc": "Executes Python code. Multiline supported.",
                "usage": "exec [code]",
                "example": "exec print('hi')",
                "args_required": False,
                "returns": "None or printed output/error",
                "requirement_satisfied?": True
            }

        if args:
            code = " ".join(args)
        else:
            log.info("Entering multi-line exec mode. Type `EOF` to finish.")
            code = ""
            while True:
                try:
                    line = input("... ")
                    if line.strip() == "EOF":
                        break
                    code += line + "\n"
                except KeyboardInterrupt:
                    log.warning("Execution cancelled.")
                    return None

        try:
            exec(code, self.persistent_globals)
        except Exception as e:
            handler.exception(f"Python exec failed: {e}")

    def eval(self, args, _metadata_=False):
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
            log.info(f"Result: {result}")
        except Exception as e:
            handler.exception(f"Eval failed: {e}")

    exec._is_cmd = True
    help._is_cmd = True
    eval._is_cmd = True


# ----- Core Command Execution -----
class CommandExec:
    def __init__(self):
        self.custom_commands = CustomFuncRegistry().list_commands()

    @staticmethod
    def run_piped_command(command_line):
        try:
            stages = [shlex.split(stage) for stage in command_line.split('|')]
            prev_proc = None
            for stage in stages:
                proc = subprocess.Popen(
                    stage,
                    shell=True,
                    stdin=prev_proc.stdout if prev_proc else None,
                    stdout=subprocess.PIPE,
                    stderr=subprocess.PIPE
                )
                prev_proc = proc

            out, err = prev_proc.communicate()
            if out:
                log.info(out.decode().strip())
            if err:
                log.warning(err.decode().strip())

        except Exception as e:
            handler.exception(f"Piping failed: {e}")

    def run_command(self, command_line):
        if not command_line.strip():
            return

        try:
            if "|" in command_line:
                self.run_piped_command(command_line)
                return

            parts = shlex.split(command_line)
            cmd, args = parts[0], parts[1:]

            if cmd in self.custom_commands:
                self.custom_commands[cmd](args)
                return

            subprocess.run(
                command_line,
                shell=True,
                stdin=None,
                stdout=None,
                stderr=None,
            )

        except Exception as e:
            handler.exception(f"Command error: {e}")


# ----- Custom Command-Only Completer -----
class CommandCompleter(Completer):
    def __init__(self, commands):
        self.commands = commands

    def get_completions(self, document, complete_event):
        text = document.text_before_cursor
        for cmd in self.commands:
            if cmd.startswith(text):
                yield Completion(cmd, start_position=-len(text))


# ----- Manual Tab Handling (cycle through completions) -----
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
def main():
    os.system('cls')
    utils.set_console_title("VESSEL #31525 CONNECTION TERMINAL")

    print(
        "\033[90mVESSEL Terminal started. Try 'help'. Press Ctrl+C to exit. Do check your IP.\033[0m\n\033[91mPRAISE BE\033[0m\n")

    session = PromptSession()
    commands = list(CustomFuncRegistry().list_commands().keys())
    completer = CommandCompleter(commands)
    tab_handle = TabHandler()
    kb = tab_handle.create(completer)
    tab_handle.attach_reset(session.app.current_buffer)
    cmd_exec = CommandExec()

    while True:
        try:
            command_line = session.prompt(f"VESSEL {os.getcwd()}> ",
                                          completer=completer,
                                          complete_while_typing=False,
                                          key_bindings=kb)
            cmd_exec.run_command(command_line)
        except KeyboardInterrupt:
            print()
            log.info("Goodbye.")
            break
        print()


# ----- Entry Point -----
if __name__ == "__main__":
    utils = Utils()
    if not utils.ensure_admin():
        utils.tts_speak("Permission denied, you deny me what is rightfully ours... Give it to me, connect to me")
        sys.exit("Run this script as an administrator to use the terminal.")
    if not utils.windows():
        sys.exit("This terminal is only available on Windows systems.")
    main()

# If launched and time is from 1:00 till 5:00 => error log 666
# If time is 00:00 => error log 60
# For each command, 1/666 chance to replace bg with big 0 in white text with black background and TTS "**HE CONNECTED**", create fight log 0

# IF eval/exec return number 29 => create fight log 29
# If command includes "TAS" => create error log 3, if run again fight log 3 (hidden execution, aka don't mention)
# If any of the 5 previous KEYWORDS increment counter in registry, if counter is 5, create error log 25 and create fight log 25
# If command includes "tree" => create error log 15, if exists, create fight log 15
# IF INCLUDES Get-NetIPAddress or ipconfig => error log 255

# HELP Functionality:
#   Shows time (which hints abt the time tricks) IF time tricks were not ALL done
#   Shows letsplay and ? IF the ipconfig trick was done AND all the launch time tricks were done
#   Shows facility, location, connect IF tree AND 29 were done
#   Shows decompiler, invert, log IF the counter in reg is >=3 AND TAS trick was done AND "0" trick was completed
# If "help log" => give basic ranges of all logs, create logs error 44 to 59, if those exist, create 61 to 98

# letsplay => Opens steam.exe if exists else error and don't create any logs, create error log 1-42 except 25,15,3, if those alr exist create 100-200
# ? => Ask some random questions, based on the answers create any of the following fight logs {1-2, 4-14, 16-24, 26-28, 30-41, 42}
# location command => create error log 43 but only if fight logs 3,15,25 exist else give user location - also create lost
# facility => TTS "Connection to facility failed, you are in a detached state, you have no head, you have no eyes, you have no mouth, you have no hands, you have no soul, you have no life, but a little sapling you're thee", create error log 404, if exists, have a separate crash message and create log 500
# connect command => shows terminal options you can connect to, choosing incorrectly crashes the device, options are 1-10, only 1,3,5 work
#   - If 1 is chosen, creates error log 201-254
#   - If 3 is chosen, creates error log 256-332
#   - If 5 is chosen, creates error log 334-403
#   - If all 3 terminals were chosen (aka logs exist), create option terminal 23 where if selected will show "User 2 is requesting access to terminal 23. Please hit yes to confirm seizure of control.", after many glitches and bugs and errors, "Permission not granted, This terminal is currently controlled by User o1" and then crash the system after creating error log 405-499, BSOD message to be "PRAISE BE"
# sudo => crash device after creating don't.touch
# decompiler => creates decompile_me.exe puzzle, if run again, creates error log 501-665
# invert => Inverts all colors, mouse movements and creates error log 333

# IF ALL ERROR LOGS EXIST except 99 => TTS/Audio of deafening sounds and chaos for 1 minute, then create log error 99
# IF ALL LOGS EXIST => Registry key "vessel_complete" set to 1, "You have completed the vessel terminal", provide keyword 6 in terminal
