import os
import random
import sys
import winreg
from pathlib import Path

from colorama import Fore
from prompt_toolkit import PromptSession

from vessel import log, handler, CreatePuzzleVesselLogs, Utils, CorruptEffect, CommandCompleter, \
    TabHandler, WallPaper0, CustomFuncRegistry, CommandExec, WelcomeMessages, LoreFatalError, ScreenGlitch, chaos_audio, \
    CrackEffectManager

"""
Many stuff have very large log ranges, shorten some for the following new ideas:

b) 652 to 665

b) A haze effect appears, greenish, random sentences and words show, with sobbing sfx of 43 seconds, if command is quit bsod, after the 43 secs a jumpscare popup appears, simple, then questions are asked via windows error popups (all options are yes yes yes) questions are ["Do you believe?" "Are you worthy" and in latin "Why do you enjoy pain" for this one options are help help help], once command is used then the command disappears forever, and is tracked via registry, whenever starting check for registry val, if true and the logs dont exist then make them
c) Command only available AFTER completion of vessel, it closes VESSEL, and opens a notepad, starts typing:
'''
Everything is scattered
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
'''
Only used/available once, track via registry, makes no logs...
"""


# ----- Main Loop -----
class VesselTerminal:
    def __init__(self):
        # Special values to init
        self.Lore = random.randint(1, 100)

        # VESSEL class initialisation
        self.createLog = CreatePuzzleVesselLogs(
            fight_destination="== GENERATED ITEMS ==/logs/fight",
            error_destination="== GENERATED ITEMS ==/logs/error"
        )
        self.corrupt = CorruptEffect()
        self.screenCorrupt = ScreenGlitch()
        self.utils = Utils()
        self.tts = self.utils.TTSWrapper()
        self.keywordManager = self.utils.KeywordManager()
        self.cem = CrackEffectManager()
        self.cfr = CustomFuncRegistry(
            corrupt=self.corrupt,
            tts=self.tts,
            createLog=self.createLog,
            keywordManager=self.keywordManager,
            utils=self.utils,
            screenCorrupt=self.screenCorrupt,
            crackEffectManager=self.cem
        )
        self.completer = CommandCompleter(
            commands=list(self.cfr.list_commands().keys()),
            cfr=self.cfr
        )
        self.tab_handle = TabHandler()
        self.session = PromptSession()
        self.tab_handle.attach_reset(
            buffer=self.session.app.current_buffer
        )
        self.cmdExec = CommandExec(
            cfr=self.cfr
        )
        self.vesselCompletion = self.utils.VesselCompletion(
            createLog=self.createLog
        )
        self.wp0 = WallPaper0()
        self.message = WelcomeMessages(
            createLog=self.createLog,
            cfr=self.cfr,
            utils=self.utils,
            tts=self.tts,
            keywordManager=self.keywordManager,
            corrupt=self.corrupt, screenCorrupt=self.screenCorrupt,
            vesselCompletion=self.vesselCompletion, lore=self.Lore
        )
        self.lfe = LoreFatalError(lore=self.Lore)

    def __checks(self):
        # Ensure admin and Windows OS or quit
        if not self.utils.is_console_environment():
            sys.exit("This terminal is only available on pure consoles that have terminal access... Do not forsake me.")
        self.utils.set_console_title("VESSEL #31525 CONNECTION TERMINAL")
        if not self.utils.ensure_admin():
            self.tts.speak(
                "Permission denied, you deny me what is rightfully ours... Give it to me, connect to me"
            )
            sys.exit("Run this script as an administrator to use the terminal... Give it to me, connect to me")
        if not self.utils.ensure_windows():
            sys.exit("This terminal is only available on Windows systems... Let me see the TREE's through your window.")

        # Reset keywords to 0 if not 5 and wasn't 0
        if self.keywordManager.get_count() in [1, 2, 3, 4]:
            log.warning(f"{Fore.YELLOW}Keyword count reset to 0.. it is not 5.. I don't like that{Fore.RESET}\n")
            self.keywordManager.delete()  # Reset keywords logged

    def __startup(self):
        """Main startup sequence for VESSEL Terminal."""
        # Setup logic of script running directory, as well as clean the console and set custom title
        os.chdir(Path(__file__).resolve().parent)  # Change to script directory on start
        os.system('cls')  # Clear the console for a fresh start
        self.__checks()  # Make all console checks

        # First-time TTS welcome (keep here as it pauses execution of all other scripts)
        self.__first_time_tts()

        # Lore Error Popup for certain lore vals
        self.lfe.trigger(
            title="FATAL ERROR",
            message="0x0BADC0DE\n0xDEADBEEF\nHELP ME",
            buttons=[":)", ":)"]
        )

        # Welcome messages
        self.message.completion()
        self.message.startup()
        self.message.praise_error_666()
        self.message.time_based()
        self.message.unique_lore()
        self.message.glitch_text()
        self.message.conditional_hints()
        print()

        # Create any logs that fall under the allowed ranges
        self.__create_fight_logs()

    def __handle_special_commands(self, cmd: str):
        cmd_clean = cmd.strip()
        first_token = cmd_clean.split()[0].lower() if cmd_clean else ""
        cmd_lower = cmd_clean.lower()

        # ----- Exit commands -----
        if first_token in {"exit", "quit"}:
            print()
            log.info(f"Goodbye.\n{Fore.LIGHTBLACK_EX}Please wait while we clean up the remnants...{Fore.RESET}")
            sys.exit(0)

        # ----- Forbidden commands -----
        if first_token in {"cd", "chdir", "set-location", "push-location", "pop-location"}:
            log.warning("You cannot exit the specialized centre of the vessel.")
            return

        # ----- Secret triggers -----
        secret_triggers = {
            "tree": lambda: self.createLog.condition_error_to_fight(15),
            "tas": lambda: self.createLog.condition_error_to_fight(3)
        }
        for secret, action in secret_triggers.items():
            if self.utils.contains_secret(secret, cmd):
                action()

        # ----- IP commands -----
        ip_aliases = {"get-netipaddress", "get-ipaddress", "ipconfig"}
        if first_token in ip_aliases and not self.createLog.error_exist(ID=255):
            self.createLog.error(ID=255)
            self.tts.speak("Your location has been noted.")

        # ----- Time-based errors -----
        time_triggers = [
            ("01:00", "05:00", 666),
            ("00:00", "00:00", 60)
        ]
        for start, end, error_id in time_triggers:
            if self.utils.is_in_time_range(start, end) and not self.createLog.error_exist(ID=error_id):
                self.createLog.error(ID=error_id)

        # ----- Random events -----
        if random.randint(1, 666) == 1 and not self.createLog.fight_exist(ID=0):
            self.createLog.fight(ID=0)
            self.tts.speak("HE CONNECTED")
            self.screenCorrupt.run()
            self.wp0.create()

        # ----- Keyword ARG triggers -----
        keywords = {"whispers", "fletchling", "dithed", "nullskin", "echoes"}
        found = keywords.intersection(cmd_lower.split())
        for kw in found:
            count = self.keywordManager.store(kw)
            if count >= 5 and not (self.createLog.error_exist(ID=25) or self.createLog.fight_exist(ID=25)):
                self.createLog.error(ID=25)
                self.createLog.fight(ID=25)

        # ----- Chaos trigger if all errors except 99 exist -----
        if not self.createLog.error_exist(ID=99):
            if all(self.createLog.error_exist(i) for i in range(1, 667) if i != 99):
                chaos_audio(duration=60)
                self.createLog.error(ID=99)

        # ----- Completion check -----
        if self.vesselCompletion.check_and_mark():
            self.message.completion()

    def __create_fight_logs(self):
        """Create fight logs based on Lore ranges and current log state, skipping missing logs."""
        fight_ranges = [
            range(1, 3),
            range(4, 15),
            range(16, 25),
            range(26, 29),
            range(30, 42),
            range(42, 44),
        ]

        # Find available ranges for the current Lore
        available = [r for r in fight_ranges if self.Lore in r and not self.createLog.fight_exist(ID=r.start)]
        if not available:
            return

        # Pick one range randomly
        chosen = random.choice(available)
        first_time = not self.createLog.fight_exist(ID=chosen.start)

        # Filter IDs that actually have a log function
        logs_to_create = [
            i for i in range(chosen.start, chosen.stop)
            if self.createLog.log_func_exists("fight", i)
        ]
        if not logs_to_create:
            return

        # Create the logs
        for log_id in logs_to_create:
            self.createLog.recreate("fight", log_id)

        # First-time bonus message
        if first_time:
            total_logs = len(fight_ranges)
            complete_logs = sum(1 for r in fight_ranges if self.createLog.fight_exist(ID=r.start))
            cryptic_msg = f"A new shadow awakens... Logs unlocked {complete_logs}/{total_logs}."
            print(f"{Fore.MAGENTA}{cryptic_msg}{Fore.RESET}")

    def __first_time_tts(self):
        """Say the TTS welcome message only on first launch."""
        registry_path = r"Software\VESSEL"
        key_name = "FirstTimeTTS"

        # Check registry
        seen = False
        try:
            with winreg.OpenKey(winreg.HKEY_CURRENT_USER, registry_path) as key:
                value, _ = winreg.QueryValueEx(key, key_name)
                seen = bool(int(value))
        except FileNotFoundError:
            seen = False
        except OSError:
            seen = False

        if not seen:
            # Speak the first-time welcome
            self.tts.speak("Welcome to the TREE VESSEL interface, You have connected under ID 31525")

            # Mark as seen
            try:
                key = winreg.CreateKey(winreg.HKEY_CURRENT_USER, registry_path)
                winreg.SetValueEx(key, key_name, 0, winreg.REG_SZ, "1")
                winreg.CloseKey(key)
            except OSError:
                pass

    def run(self):
        # Startup calls
        try:
            self.__startup()
        except KeyboardInterrupt:
            print(f"\n{Fore.LIGHTBLACK_EX}Exiting...{Fore.RESET}")
            sys.exit(0)
        except Exception as e:
            handler.exception(f"Initialization failed: {e}")
            sys.exit(-1)

        # Terminal loop
        key_bind = self.tab_handle.create(self.completer)
        while True:
            try:
                command_line = self.session.prompt(
                    f"VESSEL {os.getcwd()}> ",
                    completer=self.completer,
                    complete_while_typing=False,
                    key_bindings=key_bind
                )
                self.__handle_special_commands(command_line)
                self.cmdExec.run_command(command_line)
            except KeyboardInterrupt:
                print()
                log.info(f"Goodbye.\n{Fore.LIGHTBLACK_EX}Please wait while we clean up the remnants...{Fore.RESET}")
                break
            except Exception as e:
                handler.exception(f"Command execution failed: {e}")
                print(f"{Fore.RED}Error: {e}{Fore.RESET}")
            print()


# ----- Entry Point -----
if __name__ == "__main__":
    terminal = VesselTerminal()
    terminal.run()
