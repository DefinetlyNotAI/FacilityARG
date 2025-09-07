import os
import random
import shlex
import subprocess
import sys
import time
from io import StringIO
from pathlib import Path

from colorama import Fore, Style
from prompt_toolkit import PromptSession

from vessel import log, handler, ARGLogManager, Utils, VesselCompletion, Corrupt, KeywordManager, CommandCompleter, \
    TabHandler, WallPaper0, lost_recreate, dt_recreate, dm_recreate


# TODO Make all fun vals have unique messages from 1-100
#           these messages should be cryptic, start with the fun value and message
#      If a fun value resulted in log creation, and is the first time,
#           it should also say that with a cryptic message bonus related to the log,
#           as well as the fun value and mention complete/total logs from rng

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
            dt_recreate()  # Create the dont touch puzzle
            tts.speak("  You fucked up")
            tts.speak("  I SUGGEST YOU SAVE YOUR DATA. CLOSING THE PROGRAM WILL BE WORSE THAN MY MERCY")
            for i in range(10):
                tts.speak(f"  T minus {10 - i} seconds.")
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

        puzzle_path = Path("== GENERATED ITEMS ==/can/you/decompile_me.exe")
        if not puzzle_path.exists():
            dm_recreate()  # Create the decompile_me.exe puzzle
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
            tts.speak("You already inverted the world, no need to do it again.")
            return None

        tts.speak("Until death will we invert and see from new perspectives")

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
            tts.speak(
                "The facility rejects you… you are severed from everything. No head, no eyes, no mouth, no hands, no soul, no life... only a fragile sprout clinging to nothing.")
            createLog.error(ID=404)
        elif not createLog.error_exist(ID=500):
            tts.speak(
                "The facility knows you... again. Your sapling trembles in the hollow, screaming silently as the void etches your absence into eternity.")
            createLog.error(ID=500)
        else:
            tts.speak("Will you ever stop growing?")
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
            tts.speak(
                "Location unavailable, please check your settings and allow me to have access to all your privacy and location data.")
            return None
        print(f"Lat: {lat}, Lon: {lon}")

        # Redundant check for log 15 as the command isn't available if it doesn't exist
        if not createLog.fight_exist(ID=3) or not createLog.fight_exist(ID=25):
            tts.speak(
                "Coordinates... acquired. But your path is incomplete. You are not yet ready... 3, 15, 25... they linger. I can see them, but you cannot... not yet.")
        elif not createLog.error_exist(ID=43):
            tts.speak(
                "Coordinates... acquired. You are prepared. The logs align... the path opens. There is nothing left to hide... Are you lost now?")
            lost_recreate()
            createLog.error(ID=43)

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
                "requirement_satisfied?": self.command_available_for.facility_location_connect(),
            }

        # Log states for specific terminals
        terminal_errors = {
            1: createLog.error_exist(ID=201),
            3: createLog.error_exist(ID=256),
            5: createLog.error_exist(ID=334),
            23: createLog.error_exist(ID=405),
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
                createLog.error_range(start=start, end=end)

            tts.speak(f"Connection to terminal {terminal_selected} has succeeded...")
            tts.speak("Necessary logs created.")
            return None

        # Handle terminal 23 special case
        if terminal_selected == 23:
            if not terminal_errors[23]:
                tts.speak(
                    "User 2 is requesting access to terminal 23. Please hit yes to confirm seizure of control.")
                input("User 2 is requesting access to terminal 23. Please hit yes to confirm seizure of control.\n> ")

                tts.speak("Permission not granted. This terminal is currently controlled by User o1.")
                createLog.error_range(start=405, end=499)

                # Corruption + crash
                screenCorrupt.run()
                utils.trigger_crash()
            else:
                utils.trigger_crash()

            return None

        # Fallback crash
        utils.trigger_crash()
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


# ----- Main Loop -----
class VesselTerminal:
    def __init__(self):
        self.commands = list(cfr.list_commands().keys())
        self.completer = CommandCompleter(commands=self.commands, cfr=cfr)
        self.tab_handle = TabHandler()
        self.kb = self.tab_handle.create(self.completer)
        self.session = PromptSession()
        self.tab_handle.attach_reset(self.session.app.current_buffer)
        self.cmdExec = CommandExec()
        self.vesselCompletion = VesselCompletion(createLog=createLog)
        self.wp0 = WallPaper0()

    @staticmethod
    def _checks():
        if not utils.ensure_admin():
            tts.speak(
                "Permission denied, you deny me what is rightfully ours... Give it to me, connect to me")
            sys.exit("Run this script as an administrator to use the terminal.")
        if not utils.ensure_windows():
            sys.exit("This terminal is only available on Windows systems.")

    def __completion_message(self):
        if self.vesselCompletion.check():
            print(
                f"{Fore.GREEN}{Style.BRIGHT}You have completed the VESSEL terminal experience fully!{Style.RESET_ALL}")
            print(
                f"{Fore.YELLOW}{Style.BRIGHT}The 6th key is '{Fore.CYAN}Unbirth{Fore.YELLOW}'.. See you in the {Fore.RED}END{Style.RESET_ALL}")

    def __welcome_message(self):
        print(f"{Fore.CYAN}VESSEL Terminal started. Try 'help'. Press Ctrl+C to exit.{Style.RESET_ALL}")
        self.__completion_message()
        print(f"{Fore.RED}DO NOT delete the logs.. {Style.RESET_ALL}"
              f"\033[90mIf you want to store them somewhere else do NOT move them, copy them!{Style.RESET_ALL}")
        print(f"{Fore.YELLOW}Use with audio.. It is useless and a waste of time otherwise{Style.RESET_ALL}")
        print(f"{Fore.RED}DO NOT EXIT MID-COMMAND, it will cause issues and may result in unexpected softlocks{Style.RESET_ALL}\n")
        if createLog.error_exist(ID=666):
            print("\033[91mPRAISE BE\033[0m\n")

        # Time-based greetings
        if utils.is_in_time_range("00:00", "00:00"):
            print("\033[95mThe night is silent… too silent.\033[0m")
        elif utils.is_in_time_range("13:37", "13:37"):
            print("\033[92mYou found the leet hour. Lucky.\033[0m")
        elif utils.is_in_time_range("01:00", "05:00"):
            print("\033[94mCritical system quiet hours detected…\033[0m")

        # Fun value determines all randomness
        Fun = random.randint(1, 100)

        # Cryptic messages based on Fun
        if Fun == 3:
            print("\033[92mDo you see it? It’s waiting to come to life\033[0m")
        elif Fun == 15:
            print("\033[91mEntity detected nearby.. are you sure whatever you are doing is worth it?\033[0m")
        elif Fun == 25:
            print("\033[93mNull reference at line 0xDEADDEAD\033[0m")

        # Glitchy outputs
        glitch_colors = ['\033[91m', '\033[93m', '\033[94m', '\033[95m']  # red, yellow, blue, magenta
        if 1 <= Fun <= 33:
            glitch_text = '01010100 01110010 01100101 01100101'
        elif 34 <= Fun <= 66:
            glitch_text = '███████ NULL ███████'
        elif 67 <= Fun <= 99:
            glitch_text = '0xDEADDEAD corrupted'
        else:
            glitch_text = None

        if glitch_text:
            print(f"{random.choice(glitch_colors)}{glitch_text}\033[0m")

        # Hints mapping
        hints = []
        if not self.vesselCompletion.check():
            if 26 <= Fun <= 31 and not createLog.error_exist(ID=255):
                hints.append("Maybe try checking your internet protocol?")
            if 32 <= Fun <= 37:
                hints.append("There’s more than 'help' to see here.")
            if 38 <= Fun <= 43 and not createLog.fight_exist(ID=29):
                hints.append("Can you make me say the prime of 29")
            if 44 <= Fun <= 49:
                hints.append("Not everything is as it seems... so do check everything at least twice.")
            if 50 <= Fun <= 55 and keywordManager.get_count() < 5:
                hints.append("Why don't you echo the 5 keys?")
            if 56 <= Fun <= 61 and not createLog.fight_exist(ID=3) and not createLog.error_exist(ID=3):
                hints.append("Mention your deleted friend's name, you may find fragments... fight or errors of 3")
            if 62 <= Fun <= 67 and cfr.command_available_for.letsplay_askme() and not createLog.error_exist(ID=1) and not createLog.error_exist(ID=100):
                hints.append("Let's play a game, shall we?")
            if 74 <= Fun <= 79:
                hints.append("Some commands hide until they trust you, it is linear after all")
            if 80 <= Fun <= 85:
                hints.append("Have sound on... you may hear something")
            if 86 <= Fun <= 91 and not createLog.fight_exist(ID=0):
                hints.append("If you hit the devils jackpot, HE may find a way to connect to you")
            if 92 <= Fun <= 100:
                hints.append("It is all about luck..")

        for hint in hints:
            print(f"\033[90mTip: {hint}\033[0m")

        # Fight logs creation based on Fun
        fight_ranges = [
            ((1, 2), range(1, 3)),
            ((4, 14), range(4, 15)),
            ((16, 24), range(16, 25)),
            ((26, 28), range(26, 29)),
            ((30, 41), range(30, 42)),
            ((42, 42), range(42, 44)),  # extended for Fun mapping 42–43
        ]

        available_ranges = [r[0] for r in fight_ranges if Fun in r[1] and not createLog.fight_exist(ID=r[0][0])]
        if available_ranges:
            start, end = random.choice(available_ranges)
            createLog.fight_range(start=start, end=end)

        print()

    def run(self):
        # Startup calls
        try:
            os.chdir(Path(__file__).resolve().parent)  # Change to script directory on start
            os.system('cls')  # Clear the console for a fresh start
            if keywordManager.get_count() != 5:
                log.warning(f"{Fore.YELLOW}Keyword count reset to 0.. it is not 5.. I don't like that{Fore.RESET}")
                keywordManager.delete()  # Reset keywords logged
            utils.set_console_title("VESSEL #31525 CONNECTION TERMINAL")
            self._checks()
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
                command_line = self.session.prompt(
                    f"VESSEL {os.getcwd()}> ",
                    completer=self.completer,
                    complete_while_typing=False,
                    key_bindings=self.kb
                )
                self._handle_special_commands(command_line)
                self.cmdExec.run_command(command_line)
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
        first_token = cmd.strip().split()[0].lower() if cmd.strip().split() else ""

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
                tts.speak("Your location has been noted.")

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
            tts.speak("HE CONNECTED")
            screenCorrupt.run()
            self.wp0.create()

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
        if self.vesselCompletion.check_and_mark():
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
createLog = ARGLogManager(
    fight_destination="./== GENERATED ITEMS ==/logs/fight",
    error_destination="./== GENERATED ITEMS ==/logs/error"
)
corrupt = Corrupt()
screenCorrupt = corrupt.Screen()
cfr = CustomFuncRegistry()
utils = Utils()
tts = utils.TTSWrapper()
keywordManager = KeywordManager()

if __name__ == "__main__":
    terminal = VesselTerminal()
    terminal.run()
