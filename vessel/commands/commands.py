import ctypes
import os
import subprocess
import sys
import time
from pathlib import Path

import pyautogui
from colorama import Fore, Style

from vessel.exceptionHandler import handler
from vessel.scripts import lost_recreate, dt_recreate, dm_recreate
from vessel.types import VesselObjects
from vessel.vesselLog import log


class CustomCommands:
    def __init__(self, vt: 'VesselObjects'):
        # Dependencies
        self.createLog = vt.createLog
        self.tts = vt.tts
        self.utils = vt.utils
        self.keywordManager = vt.keywordManager
        self.corruptEffect = vt.corruptEffect
        self.screenCorruptEffect = vt.screenCorruptEffect
        self.screenCrackEffect = vt.screenCrackEffect
        self.fatalErrPopup = vt.fatalErrPopup
        self.vesselCompletionUtil = vt.vesselCompletionUtil
        self.breakingDown = vt.breakingDown

        # Logic components
        self.persistent_globals = {"__builtins__": __builtins__}
        self.screenCrackEffect.startup_check()

        # Registry
        self.commandRegistry = vt.commandRegistry
        self.commandRegistry.register_all(self)

    # ===== Command Implementations =====
    def help(self, args, _metadata_: bool = False):
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
                "hint": "See me strike at midnight, when time itself is still. Then find me roaming 1 to 5, "
                        "through the hours of the graveyard shift"
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
            func_obj = self.commandRegistry.get(cmd)  # <-- FIXED
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
        for name, func_obj in self.commandRegistry.list().items():  # <-- FIXED
            meta = func_obj([], _metadata_=True)
            if meta.get("requirement_satisfied?", True):
                desc = meta.get('desc')
                print(f"{Fore.MAGENTA} - {name:<10} {Style.RESET_ALL}:: {Fore.WHITE}{desc}{Style.RESET_ALL}")

        print(f"\n{Fore.BLUE}Piping supported: e.g., echo hello world | findstr hello{Style.RESET_ALL}")
        print(f"{Fore.BLUE}Type 'help <command>' for detailed help.{Style.RESET_ALL}")
        return None

    def eval(self, args, _metadata_: bool = False):
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

    def sudo(self, _, _metadata_: bool = False):
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

    def letsplay(self, _, _metadata_: bool = False):
        """Opens Steam if installed"""
        if _metadata_:
            return {
                "desc": "Opens Steam if installed.",
                "usage": "letsplay",
                "example": "letsplay",
                "args_required": False,
                "returns": "Steam window or error",
                "requirement_satisfied?": self.createLog.error_exist(ID=255) and self.createLog.error_exist(
                    ID=666) and self.createLog.error_exist(ID=60)
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

    def decompiler(self, _, _metadata_: bool = False):
        """Creates decompile_me.exe puzzle, logs errors if run again."""
        if _metadata_:
            return {
                "desc": "Creates a puzzle just for you... can you solve it?",
                "usage": "decompiler",
                "example": "decompiler",
                "args_required": False,
                "returns": "Puzzle file or error logs",
                "requirement_satisfied?": self.createLog.fight_exist(ID=0) and self.createLog.fight_exist(
                    ID=3) and self.createLog.error_exist(ID=3) and self.keywordManager.get_count() >= 3
            }
        puzzle_path = Path("== GENERATED ITEMS ==/can/you/decompile_me.exe")
        if not puzzle_path.exists():
            dm_recreate()  # Create the decompile_me.exe puzzle
        elif not self.createLog.error_exist(ID=501):
            # Log errors 501-600
            self.createLog.error_range(start=501, end=600)
        return None

    def invert(self, _, _metadata_: bool = False):
        if _metadata_:
            return {
                "desc": "Invert the world upside down, invert your perspective, see through ME.",
                "usage": "invert",
                "example": "invert",
                "args_required": False,
                "returns": "Inverted colors and error log",
                "requirement_satisfied?": self.createLog.fight_exist(ID=0) and self.createLog.fight_exist(
                    ID=3) and self.createLog.error_exist(ID=3) and self.keywordManager.get_count() >= 3
            }

        if self.createLog.error_exist(ID=333):
            self.tts.speak("You already inverted the world, no need to do it again.")
            return None

        self.tts.speak("Until death will we invert and see from new perspectives")

        # Start the corruption effects
        try:
            self.corruptEffect.start()
            # Wait to end the effects
            time.sleep(25)
            # End the corruption effects
            self.corruptEffect.end()
        except KeyboardInterrupt:
            # End the corruption effects
            self.corruptEffect.end()
        except Exception as e:
            handler.exception(f"Corruption failed: {e}")
            self.corruptEffect.end()
            sys.exit(-1)
        self.createLog.error(ID=333)

        return None

    def facility(self, _, _metadata_: bool = False):
        """Connects to the facility, if not already connected."""
        if _metadata_:
            return {
                "desc": "Attempts connection to the facility, if not already connected.",
                "usage": "facility",
                "example": "facility",
                "args_required": False,
                "returns": "Facility connection status or error log",
                "requirement_satisfied?": self.createLog.fight_exist(ID=29) and self.createLog.error_exist(
                    ID=15) and self.createLog.fight_exist(ID=15)
            }
        if not self.createLog.error_exist(ID=404):
            self.tts.speak(
                "The facility rejects you… you are severed from everything. No head, no eyes, no mouth, no hands, "
                "no soul, no life... only a fragile sprout clinging to nothing.")
            self.createLog.error(ID=404)
        elif not self.createLog.error_exist(ID=500):
            self.tts.speak(
                "The facility knows you... again. Your sapling trembles in the hollow, screaming silently as the void "
                "etches your absence into eternity.")
            self.createLog.error(ID=500)
        else:
            self.tts.speak("Will you ever stop growing?")
        return None

    def location(self, _, _metadata_: bool = False):
        """Provides the user's location."""
        if _metadata_:
            return {
                "desc": "Provides the user's location (latitude and longitude).",
                "usage": "location",
                "example": "location",
                "args_required": False,
                "returns": "Location",
                "requirement_satisfied?": self.createLog.fight_exist(ID=29) and self.createLog.error_exist(
                    ID=15) and self.createLog.fight_exist(ID=15)
            }

        # Get the user's location (latitude and longitude) with error handling
        lat, lon = self.utils.get_windows_location()
        if lat == "Location unavailable":
            self.tts.speak(
                "Location unavailable, please check your settings and allow me to have access to all your privacy and "
                "location data.")
            return None
        print(f"Lat: {lat}, Lon: {lon}")

        # Redundant check for log 15 as the command isn't available if it doesn't exist
        if not self.createLog.fight_exist(ID=3) or not self.createLog.fight_exist(ID=25):
            self.tts.speak(
                "Coordinates... acquired. But your path is incomplete. You are not yet ready... 3, 15, 25... they "
                "linger. I can see them, but you cannot... not yet.")
        elif not self.createLog.error_exist(ID=43):
            self.tts.speak(
                "Coordinates... acquired. You are prepared. The logs align... the path opens. There is nothing left "
                "to hide... Are you lost now?")
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
                "requirement_satisfied?": self.createLog.fight_exist(ID=29) and self.createLog.error_exist(
                    ID=15) and self.createLog.fight_exist(ID=15),
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
                self.screenCorruptEffect.run()
                self.utils.trigger_crash()
            else:
                self.utils.trigger_crash()

            return None

        # Fallback crash
        self.utils.trigger_crash()
        return None

    def glassThrone(self, _, _metadata_: bool = False):
        if _metadata_:
            return {
                "desc": "Crack your screen so you can see.",
                "usage": "glassThrone",
                "example": "glassThrone",
                "args_required": False,
                "returns": "Connection status or error log",
                "requirement_satisfied?": self.createLog.error_exist(ID=501),  # Aka after decompiler is complete
            }
        self.screenCrackEffect.apply_crack()
        return None

    def breakEveryone(self, _, _metadata_: bool = False):
        if _metadata_:
            return {
                "desc": "Break down and see the truth.",
                "usage": "break",
                "example": "break",
                "args_required": False,
                "returns": "System meltdown and error log",
                "requirement_satisfied?": all(self.createLog.fight_exist(ID=i) for i in range(0, 43)),
                # Aka all fight logs complete
            }
        if self.breakingDown.is_already_ran():
            log.warning("You have already broken down. Cannot do it again.")
            return None
        self.breakingDown.run()  # This will not return but crash the system
        return None

    def blasphemy(self, _, _metadata_: bool = False):
        if _metadata_:
            return {
                "desc": "Unknown.. Command should not exist",
                "usage": "blasphemy",
                "example": "Unknown.. Command should not exist",
                "args_required": False,
                "returns": "Unknown.. Command should not exist",
                "requirement_satisfied?": self.vesselCompletionUtil.check_registry(),
            }
        # ====== File setup ======
        base_dir = os.path.dirname(__file__)
        target_dir = os.path.join(base_dir, "../== GENERATED ITEMS ==")
        file_path = os.path.join(target_dir, "Blasphemy.txt")
        if os.path.exists(file_path):
            os.startfile(file_path)
            self.tts.speak(f"You have already sinned.")
            return None
        os.makedirs(target_dir, exist_ok=True)
        content = """Everything is scattered
Nothing makes sense...
Did HE write the story wrong?
Did HE make a mistake?? 
No..
No.. There must be something I am missing... WE are missing
...
They keep appearing...
3, 15, 25
Their sum 43...
'V and X when I meet'
What does that mean?
...
Recurring themes..
..
...
....
|Blasphemy|
"""
        with open(file_path, "w", encoding="utf-8") as f:
            f.write("")
        subprocess.Popen(["notepad.exe", file_path])
        time.sleep(1.5)
        pyautogui.typewrite(content, interval=0.15)
        # noinspection PyUnresolvedReferences
        ctypes.windll.kernel32.FreeConsole()
        sys.exit()

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
    glassThrone._is_cmd = True
    breakEveryone._is_cmd = True
    blasphemy._is_cmd = True
