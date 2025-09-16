import os
import shlex
import subprocess
import sys
import time
from io import StringIO
from pathlib import Path

from colorama import Fore, Style

from vessel.vsa import ScreenGlitch, CorruptEffect
from vessel.createPuzzleVesselLogs import CreatePuzzleVesselLogs
from vessel.exceptionHandler import handler
from vessel.scripts import lost_recreate, dt_recreate, dm_recreate
from vessel.utils import Utils
from vessel.vesselLog import log


# ----- Custom Commands -----
class CustomFuncRegistry:
    def __init__(self,
                 createLog: 'CreatePuzzleVesselLogs',
                 tts: 'Utils.TTSWrapper',
                 utils: 'Utils',
                 keywordManager: 'Utils.KeywordManager',
                 corrupt: 'CorruptEffect',
                 screenCorrupt: 'ScreenGlitch',
                 ):
        self.persistent_globals = {"__builtins__": __builtins__}
        self.commands = {}
        self._register_all()
        self.command_available_for = self.CommandAvailableFor()
        self.createLog = createLog
        self.tts = tts
        self.utils = utils
        self.keywordManager = keywordManager
        self.corrupt = corrupt
        self.screenCorrupt = screenCorrupt

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
        def letsplay_askme(createLog: 'CreatePuzzleVesselLogs'):
            """Shows letsplay and askme IF the ipconfig trick was done AND all the launch time tricks were done"""
            e255 = createLog.error_exist(ID=255)
            e666 = createLog.error_exist(ID=666)
            e60 = createLog.error_exist(ID=60)
            return e255 and e666 and e60

        @staticmethod
        def facility_location_connect(createLog: 'CreatePuzzleVesselLogs'):
            """Shows facility, location, connect IF tree AND 29 were done"""
            f15 = createLog.fight_exist(ID=15)
            e15 = createLog.error_exist(ID=15)
            f29 = createLog.fight_exist(ID=29)
            return f15 and e15 and f29

        @staticmethod
        def decompiler_invert(createLog: 'CreatePuzzleVesselLogs', keywordManager: 'Utils.KeywordManager'):
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

        try:
            dt_recreate()  # Create the dont touch puzzle
            self.tts.speak("  You fucked up")
            self.tts.speak("  I SUGGEST YOU SAVE YOUR DATA. CLOSING THE PROGRAM WILL BE WORSE THAN MY MERCY")
            for i in range(10):
                self.tts.speak(f"  T minus {10 - i} seconds.")
                time.sleep(1)
        except KeyboardInterrupt:
            self.utils.trigger_crash()
            return None

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
                "requirement_satisfied?": self.command_available_for.letsplay_askme(createLog=self.createLog)
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
                "requirement_satisfied?": self.command_available_for.decompiler_invert(createLog=self.createLog,
                                                                                       keywordManager=self.keywordManager)
            }

        puzzle_path = Path("== GENERATED ITEMS ==/can/you/decompile_me.exe")
        if not puzzle_path.exists():
            dm_recreate()  # Create the decompile_me.exe puzzle
        elif not self.createLog.error_exist(ID=501):
            # Log errors 501-665
            self.createLog.error_range(start=501, end=665)
        return None

    def invert(self, _, _metadata_=False):
        if _metadata_:
            return {
                "desc": "Invert the world upside down, invert your perspective, see through ME.",
                "usage": "invert",
                "example": "invert",
                "args_required": False,
                "returns": "Inverted colors and error log",
                "requirement_satisfied?": self.command_available_for.decompiler_invert(createLog=self.createLog,
                                                                                       keywordManager=self.keywordManager)
            }

        if self.createLog.error_exist(ID=333):
            self.tts.speak("You already inverted the world, no need to do it again.")
            return None

        self.tts.speak("Until death will we invert and see from new perspectives")

        # Start the corruption effects
        try:
            self.corrupt.start()
            # Wait to end the effects
            time.sleep(25)
            # End the corruption effects
            self.corrupt.end()
        except KeyboardInterrupt:
            # End the corruption effects
            self.corrupt.end()
        except Exception as e:
            handler.exception(f"Corruption failed: {e}")
            self.corrupt.end()
            sys.exit(-1)
        self.createLog.error(ID=333)

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
                "requirement_satisfied?": self.command_available_for.facility_location_connect(createLog=self.createLog)
            }

        if not self.createLog.error_exist(ID=404):
            self.tts.speak(
                "The facility rejects you… you are severed from everything. No head, no eyes, no mouth, no hands, no soul, no life... only a fragile sprout clinging to nothing.")
            self.createLog.error(ID=404)
        elif not self.createLog.error_exist(ID=500):
            self.tts.speak(
                "The facility knows you... again. Your sapling trembles in the hollow, screaming silently as the void etches your absence into eternity.")
            self.createLog.error(ID=500)
        else:
            self.tts.speak("Will you ever stop growing?")
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
                "requirement_satisfied?": self.command_available_for.facility_location_connect(createLog=self.createLog)
            }

        # Get the user's location (latitude and longitude) with error handling
        lat, lon = self.utils.get_windows_location()
        if lat == "Location unavailable":
            self.tts.speak(
                "Location unavailable, please check your settings and allow me to have access to all your privacy and location data.")
            return None
        print(f"Lat: {lat}, Lon: {lon}")

        # Redundant check for log 15 as the command isn't available if it doesn't exist
        if not self.createLog.fight_exist(ID=3) or not self.createLog.fight_exist(ID=25):
            self.tts.speak(
                "Coordinates... acquired. But your path is incomplete. You are not yet ready... 3, 15, 25... they linger. I can see them, but you cannot... not yet.")
        elif not self.createLog.error_exist(ID=43):
            self.tts.speak(
                "Coordinates... acquired. You are prepared. The logs align... the path opens. There is nothing left to hide... Are you lost now?")
            lost_recreate()
            self.createLog.error(ID=43)

        return None

    def connect(self, _, _metadata_: bool = False):
        """Connects to a terminal, if not already connected."""
        if _metadata_:
            return {
                "desc": "Connects to a terminal, if not already connected.",
                "usage": "connect",
                "example": "connect",
                "args_required": False,
                "returns": "Connection status or error log",
                "requirement_satisfied?": self.command_available_for.facility_location_connect(
                    createLog=self.createLog),
            }

        # Log states for specific terminals
        terminal_errors = {
            1: self.createLog.error_exist(ID=201),
            3: self.createLog.error_exist(ID=256),
            5: self.createLog.error_exist(ID=334),
            23: self.createLog.error_exist(ID=405),
        }

        # If all required terminals are already connected
        if all(terminal_errors.values()):
            log.warning("You are already connected to HIM.")
            return None

        # Build available terminals
        available_terminals = list(range(1, 11))
        if terminal_errors[1] and terminal_errors[3] and terminal_errors[5]:
            available_terminals.append(23)

        # Build one-line menu
        def build_terminal_menu(available_terminals_, terminal_errors_):
            parts = []
            for term in available_terminals_:
                if term == 23:
                    color = Fore.YELLOW
                elif terminal_errors_.get(term, False):
                    color = Fore.GREEN
                else:
                    color = Fore.RED
                parts.append(f"{color}[{term}]{Style.RESET_ALL}")
            return " ".join(parts)

        # Usage in your function
        menu_line = build_terminal_menu(available_terminals, terminal_errors)
        print(f"\n{Fore.CYAN}Available terminals:{Style.RESET_ALL}\n{menu_line}")
        terminal_selected = input("> ").strip()
        # Validate selection
        if not terminal_selected.isdigit() or int(terminal_selected) not in available_terminals:
            log.error(f"Invalid terminal selection: [{terminal_selected}]. Please choose a valid terminal.")
            return None

        terminal_selected = int(terminal_selected)

        # Handle first three terminals
        if terminal_selected in [1, 3, 5]:
            if not terminal_errors[terminal_selected]:
                ranges = {1: (201, 254), 3: (256, 332), 5: (334, 403)}
                start, end = ranges[terminal_selected]
                self.createLog.error_range(start=start, end=end)

            self.tts.speak(f"Connection to terminal {terminal_selected} has succeeded...")
            self.tts.speak("Necessary logs created.")
            return None

        # Handle terminal 23 special case
        if terminal_selected == 23:
            if not terminal_errors[23]:
                self.tts.speak(
                    "User 2 is requesting access to terminal 23. Please hit yes to confirm seizure of control.")
                input("User 2 is requesting access to terminal 23. Please hit yes to confirm seizure of control.\n> ")

                self.tts.speak("Permission not granted. This terminal is currently controlled by User o1.")
                self.createLog.error_range(start=405, end=499)

                # Corruption + crash
                self.screenCorrupt.run()
                self.utils.trigger_crash()
            else:
                self.utils.trigger_crash()

            return None

        # Fallback crash
        self.utils.trigger_crash()
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
    connect._is_cmd = True


# ----- Core Command Execution -----
class CommandExec:
    def __init__(self, cfr: 'CustomFuncRegistry'):
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
