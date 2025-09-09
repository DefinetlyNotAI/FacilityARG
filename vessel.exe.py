import os
import random
import sys
from pathlib import Path

from colorama import Fore, Style
from prompt_toolkit import PromptSession

from vessel import log, handler, ARGLogManager, Utils, VesselCompletion, Corrupt, KeywordManager, CommandCompleter, \
    TabHandler, WallPaper0, CustomFuncRegistry, CommandExec


# TODO Make all fun vals have unique messages from 1-100
#           these messages should be cryptic, start with the fun value and message
#      If a fun value resulted in log creation, and is the first time,
#           it should also say that with a cryptic message bonus related to the log,
#           as well as the fun value and mention complete/total logs from rng


# ----- Main Loop -----
class VesselTerminal:
    def __init__(self, createLog: 'ARGLogManager', cfr: 'CustomFuncRegistry',
                 utils: 'Utils', tts: 'Utils.TTSWrapper', keywordManager: 'KeywordManager',
                 corrupt: 'Corrupt', screenCorrupt: 'Corrupt.Screen'):
        self.createLog = createLog
        self.cfr = cfr
        self.utils = utils
        self.tts = tts
        self.keywordManager = keywordManager
        self.corrupt = corrupt
        self.screenCorrupt = screenCorrupt

        self.commands = list(self.cfr.list_commands().keys())
        self.completer = CommandCompleter(commands=self.commands, cfr=self.cfr)
        self.tab_handle = TabHandler()
        self.kb = self.tab_handle.create(self.completer)
        self.session = PromptSession()
        self.tab_handle.attach_reset(self.session.app.current_buffer)
        self.cmdExec = CommandExec(cfr=self.cfr)
        self.vesselCompletion = VesselCompletion(createLog=createLog)
        self.wp0 = WallPaper0()
        self.message = self.__Welcome(
            createLog=createLog,
            cfr=cfr,
            utils=utils,
            tts=tts,
            keywordManager=keywordManager,
            corrupt=corrupt,
            screenCorrupt=screenCorrupt,
            vesselCompletion=self.vesselCompletion,
        )

    class __Welcome:
        def __init__(self, createLog: 'ARGLogManager', cfr: 'CustomFuncRegistry',
                     utils: 'Utils', tts: 'Utils.TTSWrapper', keywordManager: 'KeywordManager',
                     corrupt: 'Corrupt', screenCorrupt: 'Corrupt.Screen', vesselCompletion: 'VesselCompletion'):
            self.cfr = cfr
            self.utils = utils
            self.tts = tts
            self.keywordManager = keywordManager
            self.corrupt = corrupt
            self.screenCorrupt = screenCorrupt
            self.createLog = createLog

            self.vesselCompletion = vesselCompletion

        def completion_message(self):
            if self.vesselCompletion.check():
                print(
                    f"{Fore.GREEN}{Style.BRIGHT}You have completed the VESSEL terminal experience fully!{Style.RESET_ALL}")
                print(
                    f"{Fore.YELLOW}{Style.BRIGHT}The 6th key is '{Fore.CYAN}Unbirth{Fore.YELLOW}'.. See you in the {Fore.RED}END{Style.RESET_ALL}\n")

        @staticmethod
        def print_startup_messages():
            """Print startup and safety messages."""
            messages = [
                f"{Fore.CYAN}VESSEL Terminal started. Try 'help'. Press Ctrl+C to exit.{Style.RESET_ALL}",
                f"{Fore.YELLOW}Use with audio.. It is useless and a waste of time otherwise{Style.RESET_ALL}\n",
                f"{Fore.RED}DO NOT delete the logs.. {Style.RESET_ALL}{Fore.YELLOW}If you want to store them somewhere else do NOT move them, copy them!{Style.RESET_ALL}",
                f"{Fore.RED}DO NOT EXIT MID-COMMAND, it will cause issues and may result in unexpected softlocks{Style.RESET_ALL}\n"
            ]
            for message in messages:
                print(message)

        def praise_if_error_666(self):
            """Display praise if error ID 666 exists."""
            if self.createLog.error_exist(ID=666):
                print(f"{Fore.RED}PRAISE BE{Fore.RESET}\n")

        def time_based_greetings(self):
            """Display greeting messages based on current system time."""
            time_events = [
                ("00:00", "00:00", Fore.MAGENTA, "The night is silent… too silent."),
                ("13:37", "13:37", Fore.GREEN, "You found the leet hour. Lucky."),
                ("01:00", "05:00", Fore.BLUE, "Critical system quiet hours detected…"),
            ]
            for start, end, color, message in time_events:
                if self.utils.is_in_time_range(start, end):
                    print(f"{color}{message}{Fore.RESET}")
                    break

        @staticmethod
        def show_cryptic_messages(Lore: int):
            """Display special cryptic messages for certain Lore values."""
            messages = {
                3: f"{Fore.GREEN}Do you see it? It’s waiting to come to life{Fore.RESET}",
                15: f"{Fore.RED}Entity detected nearby.. are you sure whatever you are doing is worth it?{Fore.RESET}",
                25: f"{Fore.YELLOW}Null reference at line 0xDEADDEAD{Fore.RESET}"
            }
            if Lore in messages:
                print(messages[Lore])

        @staticmethod
        def show_glitch_text(Lore: int):
            """Display glitch text effects based on Lore."""
            glitch_colors = [Fore.RED, Fore.YELLOW, Fore.BLUE, Fore.MAGENTA]
            texts = [
                '01010100 01110010 01100101 01100101',  # "Tree" in binary
                '███████ NULL ███████',  # Corruption placeholder
                '0xDEADDEAD corrupted'  # Fake memory corruption
            ]
            if 1 <= Lore <= 99:
                print(f"{random.choice(glitch_colors)}{texts[(Lore - 1) // 33]}{Fore.RESET}")

        def show_conditional_hints(self, Lore: int):
            """Display hints depending on Lore and current completion state."""
            if self.vesselCompletion.check():
                return

            conditions = [
                (26 <= Lore <= 31 and not self.createLog.error_exist(ID=255),
                 "Maybe try checking your internet protocol?"),

                (32 <= Lore <= 37,
                 "There’s more than 'help' to see here."),

                (38 <= Lore <= 43 and not self.createLog.fight_exist(ID=29),
                 "Can you make me say the prime of 29"),

                (44 <= Lore <= 49,
                 "Not everything is as it seems... so do check everything at least twice."),

                (50 <= Lore <= 55 and self.keywordManager.get_count() < 5,
                 "Why don't you echo the 5 keys?"),

                (56 <= Lore <= 61 and not self.createLog.fight_exist(ID=3) and not self.createLog.error_exist(ID=3),
                 "Mention your deleted friend's name, you may find fragments... fight or errors of 3"),

                (62 <= Lore <= 67 and self.cfr.command_available_for.letsplay_askme()
                 and not self.createLog.error_exist(ID=1)
                 and not self.createLog.error_exist(ID=100),
                 "Let's play a game, shall we?"),

                (74 <= Lore <= 79,
                 "Some commands hide until they trust you, it is linear after all"),

                (80 <= Lore <= 85,
                 "Have sound on... you may hear something"),

                (86 <= Lore <= 91 and not self.createLog.fight_exist(ID=0),
                 "If you hit the devils jackpot, HE may find a way to connect to you"),

                (92 <= Lore <= 100,
                 "It is all about luck.."),
            ]
            for cond, msg in conditions:
                if cond:
                    print(f"{Fore.LIGHTBLACK_EX}Tip: {msg}{Fore.RESET}")

        def create_fight_logs(self, Lore: int):
            """Create fight logs based on Lore ranges and current log state."""
            fight_ranges = [
                range(1, 3),
                range(4, 15),
                range(16, 25),
                range(26, 29),
                range(30, 42),
                range(42, 44),
            ]

            available = [r for r in fight_ranges if Lore in r and not self.createLog.fight_exist(ID=r.start)]
            if available:
                chosen = random.choice(available)
                self.createLog.fight_range(start=chosen.start, end=chosen.stop - 1)

    def __checks(self):
        if not self.utils.ensure_admin():
            self.tts.speak(
                "Permission denied, you deny me what is rightfully ours... Give it to me, connect to me")
            sys.exit("Run this script as an administrator to use the terminal.")
        if not self.utils.ensure_windows():
            sys.exit("This terminal is only available on Windows systems.")

    def __welcome_message(self):
        """Main startup sequence for VESSEL Terminal."""
        Lore = random.randint(1, 100)
        self.message.completion_message()
        self.message.print_startup_messages()
        self.message.praise_if_error_666()
        self.message.time_based_greetings()
        self.message.show_cryptic_messages(Lore)
        self.message.show_glitch_text(Lore)
        self.message.show_conditional_hints(Lore)
        self.message.create_fight_logs(Lore)
        print()

    def __handle_special_commands(self, cmd):
        # Get first token (lowercase)
        first_token = cmd.strip().split()[0].lower() if cmd.strip().split() else ""

        if cmd == "exit" or cmd == "quit":
            print(f"\n{Fore.LIGHTBLACK_EX}Exiting...{Fore.RESET}")
            sys.exit(0)

        # Don't allow changing directories
        chdir_alias = ["cd", "chdir", "set-location", "push-location", "pop-location"]
        if first_token in chdir_alias:
            log.warning("You cannot exit the specialized centre of the vessel.")
            return

        # Tree easter egg
        if self.utils.contains_secret("tree", cmd):
            self.createLog.condition_error_to_fight(15)

        # IP commands
        if not self.createLog.error_exist(ID=255):
            ip_alias = ["get-netipaddress", "get-ipaddress", "ipconfig"]
            if first_token in ip_alias:
                self.createLog.error(ID=255)
                self.tts.speak("Your location has been noted.")

        # Time-based errors
        if self.utils.is_in_time_range("01:00", "05:00") and not self.createLog.error_exist(ID=666):
            self.createLog.error(ID=666)
        if self.utils.is_in_time_range("00:00", "00:00") and not self.createLog.error_exist(ID=60):
            self.createLog.error(ID=60)

        # TAS easter egg
        if self.utils.contains_secret("tas", cmd):
            self.createLog.condition_error_to_fight(3)

        # Random 0 event
        if random.randint(1, 666) == 1 and not self.createLog.fight_exist(ID=0):
            self.createLog.fight(ID=0)
            self.tts.speak("HE CONNECTED")
            self.screenCorrupt.run()
            self.wp0.create()

        # Keyword counting for ARG triggers
        keywords = {"whispers", "fletchling", "dithed", "nullskin", "echoes"}
        cmd_lower = cmd.lower()
        found = keywords.intersection(cmd_lower.split())
        for kw in found:
            counter = self.keywordManager.store(kw)
            if counter >= 5 and not (self.createLog.error_exist(ID=25) or self.createLog.fight_exist(ID=25)):
                self.createLog.error(ID=25)
                self.createLog.fight(ID=25)

        # If all error logs exist except 99, trigger chaos
        if not self.createLog.error_exist(ID=99):
            if all(self.createLog.error_exist(ID=i) for i in range(1, 667) if i != 99):
                self.corrupt.chaos_audio(duration=60)
                self.createLog.error(ID=99)

        # Check if all logs were unlocked
        if self.vesselCompletion.check_and_mark():
            self.message.completion_message()

    def run(self):
        # Startup calls
        try:
            os.chdir(Path(__file__).resolve().parent)  # Change to script directory on start
            os.system('cls')  # Clear the console for a fresh start
            if self.keywordManager.get_count() != 5:
                log.warning(f"{Fore.YELLOW}Keyword count reset to 0.. it is not 5.. I don't like that{Fore.RESET}")
                self.keywordManager.delete()  # Reset keywords logged
            self.utils.set_console_title("VESSEL #31525 CONNECTION TERMINAL")
            self.__checks()
            self.__welcome_message()
        except KeyboardInterrupt:
            print(f"\n{Fore.LIGHTBLACK_EX}Exiting...{Fore.RESET}")
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
def init_terminal():
    createLog = ARGLogManager(fight_destination="== GENERATED ITEMS ==/logs/fight",
                              error_destination="== GENERATED ITEMS ==/logs/error")
    corrupt = Corrupt()
    screenCorrupt = corrupt.Screen()
    utils = Utils()
    tts = utils.TTSWrapper()
    keywordManager = KeywordManager()
    cfr = CustomFuncRegistry(
        corrupt=corrupt,
        tts=tts,
        createLog=createLog,
        keywordManager=keywordManager,
        utils=utils,
        screenCorrupt=screenCorrupt
    )

    return VesselTerminal(
        createLog=createLog,
        cfr=cfr,
        utils=utils,
        tts=tts,
        keywordManager=keywordManager,
        corrupt=corrupt,
        screenCorrupt=screenCorrupt
    )


if __name__ == "__main__":
    terminal = init_terminal()
    terminal.run()
