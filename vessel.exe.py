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

    def _checks(self):
        if not self.utils.ensure_admin():
            self.tts.speak(
                "Permission denied, you deny me what is rightfully ours... Give it to me, connect to me")
            sys.exit("Run this script as an administrator to use the terminal.")
        if not self.utils.ensure_windows():
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
        print(
            f"{Fore.RED}DO NOT EXIT MID-COMMAND, it will cause issues and may result in unexpected softlocks{Style.RESET_ALL}\n")
        if self.createLog.error_exist(ID=666):
            print("\033[91mPRAISE BE\033[0m\n")

        # Time-based greetings
        if self.utils.is_in_time_range("00:00", "00:00"):
            print("\033[95mThe night is silent… too silent.\033[0m")
        elif self.utils.is_in_time_range("13:37", "13:37"):
            print("\033[92mYou found the leet hour. Lucky.\033[0m")
        elif self.utils.is_in_time_range("01:00", "05:00"):
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
            if 26 <= Fun <= 31 and not self.createLog.error_exist(ID=255):
                hints.append("Maybe try checking your internet protocol?")
            if 32 <= Fun <= 37:
                hints.append("There’s more than 'help' to see here.")
            if 38 <= Fun <= 43 and not self.createLog.fight_exist(ID=29):
                hints.append("Can you make me say the prime of 29")
            if 44 <= Fun <= 49:
                hints.append("Not everything is as it seems... so do check everything at least twice.")
            if 50 <= Fun <= 55 and self.keywordManager.get_count() < 5:
                hints.append("Why don't you echo the 5 keys?")
            if 56 <= Fun <= 61 and not self.createLog.fight_exist(ID=3) and not self.createLog.error_exist(ID=3):
                hints.append("Mention your deleted friend's name, you may find fragments... fight or errors of 3")
            if 62 <= Fun <= 67 and self.cfr.command_available_for.letsplay_askme() and not self.createLog.error_exist(
                    ID=1) and not self.createLog.error_exist(ID=100):
                hints.append("Let's play a game, shall we?")
            if 74 <= Fun <= 79:
                hints.append("Some commands hide until they trust you, it is linear after all")
            if 80 <= Fun <= 85:
                hints.append("Have sound on... you may hear something")
            if 86 <= Fun <= 91 and not self.createLog.fight_exist(ID=0):
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

        available_ranges = [r[0] for r in fight_ranges if Fun in r[1] and not self.createLog.fight_exist(ID=r[0][0])]
        if available_ranges:
            start, end = random.choice(available_ranges)
            self.createLog.fight_range(start=start, end=end)

        print()

    def run(self):
        # Startup calls
        try:
            os.chdir(Path(__file__).resolve().parent)  # Change to script directory on start
            os.system('cls')  # Clear the console for a fresh start
            if self.keywordManager.get_count() != 5:
                log.warning(f"{Fore.YELLOW}Keyword count reset to 0.. it is not 5.. I don't like that{Fore.RESET}")
                self.keywordManager.delete()  # Reset keywords logged
            self.utils.set_console_title("VESSEL #31525 CONNECTION TERMINAL")
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
        if self.utils.contains_secret("tree", cmd):
            self.__trigger_error_to_fight_log(15)

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
            self.__trigger_error_to_fight_log(3)

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
            self.__completion_message()

    def __trigger_error_to_fight_log(self, ID):
        e_exist = self.createLog.error_exist(ID=ID)
        f_exist = self.createLog.fight_exist(ID=ID)
        if not e_exist:
            self.createLog.error(ID=ID)
        elif not f_exist:
            self.createLog.fight(ID=ID)


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
