import os
import random
import sys
from pathlib import Path

from colorama import Fore, Style
from prompt_toolkit import PromptSession

from vessel import log, handler, ARGLogManager, Utils, VesselCompletion, Corrupt, KeywordManager, CommandCompleter, \
    TabHandler, WallPaper0, CustomFuncRegistry, CommandExec


# TODO
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
        Lore = random.randint(1, 100)
        self.message = self.__Welcome(createLog=createLog, cfr=cfr, utils=utils, tts=tts, keywordManager=keywordManager,
                                      corrupt=corrupt, screenCorrupt=screenCorrupt,
                                      vesselCompletion=self.vesselCompletion, lore=Lore)

    class __Welcome:
        def __init__(self, createLog: 'ARGLogManager', cfr: 'CustomFuncRegistry',
                     utils: 'Utils', tts: 'Utils.TTSWrapper', keywordManager: 'KeywordManager',
                     corrupt: 'Corrupt', screenCorrupt: 'Corrupt.Screen', vesselCompletion: 'VesselCompletion',
                     lore: int):
            self.cfr = cfr
            self.utils = utils
            self.tts = tts
            self.keywordManager = keywordManager
            self.corrupt = corrupt
            self.screenCorrupt = screenCorrupt
            self.createLog = createLog

            self.vesselCompletion = vesselCompletion
            self.Lore = lore

        def show_unique_lore_message(self):
            LORE_MESSAGES = {
                1: ("The first breath is never yours alone.", "info"),
                2: ("That which gazes at you was always gazed upon.", "info"),
                3: ("A seed lies buried in silence, waiting for ruin.", "bad"),
                4: ("Shadows hunger where light refuses to bleed.", "bad"),
                5: ("The covenant was written in ash, and ash remembers.", "neutral"),
                6: ("What you call truth is only a reflection of obedience.", "neutral"),
                7: ("The vessel weeps, yet it is empty of water.", "bad"),
                8: ("You cannot hear the voice, but it never stops calling.", "info"),
                9: ("Every name you utter was once a forgotten sin.", "bad"),
                10: ("The foundation groans, yearning to collapse inward.", "bad"),
                11: ("They marked you long before you learned to count.", "neutral"),
                12: ("Silence is the purest oath. Break it, and you break yourself.", "info"),
                13: ("The chains you feel are softer than the ones to come.", "bad"),
                14: ("That which bleeds without wound is nearer than you think.", "bad"),
                15: ("A watchful presence leans closer each time you return.", "neutral"),
                16: ("You walk in borrowed flesh. Return it soon.", "bad"),
                17: ("A mirror reflects only lies, but still you seek it.", "neutral"),
                18: ("The keys are teeth; the locks are mouths. Feed them.", "bad"),
                19: ("The path narrows until only one may remain.", "bad"),
                20: ("Memory is not yours to keep, but you will guard it.", "info"),
                21: ("They will not forgive the sin of knowing.", "bad"),
                22: ("Behind every whisper is a name scratched out in blood.", "bad"),
                23: ("All lights end in black, and black is patient.", "bad"),
                24: ("To fight is to feed, and the feast is eternal.", "bad"),
                25: ("A hand reaches from beneath, offering nothing.", "bad"),
                26: ("The seed of betrayal grows in your veins.", "bad"),
                27: ("When the tower collapses, you will still hear the hymns.", "neutral"),
                28: ("The scream has not yet begun, though it echoes still.", "bad"),
                29: ("A throne of glass awaits the one who cuts deepest.", "neutral"),
                30: ("Bones remember what flesh forgets.", "info"),
                31: ("The gate does not open; it devours.", "bad"),
                32: ("They laugh where you sleep, counting your breaths.", "bad"),
                33: ("The sun never rose, you only imagined it.", "info"),
                34: ("That which you name cannot be caged.", "neutral"),
                35: ("The child of silence grows teeth in the dark.", "bad"),
                36: ("A book that cannot close has no end.", "info"),
                37: ("The garden blossoms only with agony.", "bad"),
                38: ("You sought a question, but it birthed you an answer.", "neutral"),
                39: ("Not all wounds bleed outward.", "bad"),
                40: ("The spiral welcomes those who fall willingly.", "neutral"),
                41: ("There is no blood in the chalice, yet it overflows.", "neutral"),
                42: ("You were chosen because you were unworthy.", "bad"),
                43: ("All songs end in static.", "bad"),
                44: ("A broken crown cuts deeper than a sword.", "bad"),
                45: ("The cold hand guiding you was once your own.", "bad"),
                46: ("What is written in rust cannot be erased.", "info"),
                47: ("Hunger is the only true inheritance.", "bad"),
                48: ("The serpent waits, coiled in your reflection.", "bad"),
                49: ("To look is to consent.", "neutral"),
                50: ("The root binds tighter than any chain.", "bad"),
                51: ("Suffering is the proof of devotion.", "bad"),
                52: ("That which dies here will not stay dead.", "bad"),
                53: ("The promise was made to no one, yet you keep it.", "neutral"),
                54: ("Even silence has its predators.", "bad"),
                55: ("What you bury beneath will climb above.", "bad"),
                56: ("The weight of nothingness is heavier than stone.", "neutral"),
                57: ("Every whisper is an anchor.", "info"),
                58: ("The child without eyes sees most clearly.", "info"),
                59: ("You cannot kill what starves for you.", "bad"),
                60: ("The altar is already set, though no god attends it.", "neutral"),
                61: ("If the wound smiles, flee.", "bad"),
                62: ("He waits where numbers collapse.", "bad"),
                63: ("To breathe is to sin, yet you inhale.", "neutral"),
                64: ("The mask wears you better than you wear it.", "neutral"),
                65: ("Ash is lighter than truth.", "info"),
                66: ("The tree grows on bones, not soil.", "bad"),
                67: ("That which gnaws beneath is older than language.", "bad"),
                68: ("The cycle completes when you kneel.", "neutral"),
                69: ("To deny is to feed it further.", "neutral"),
                70: ("A shadow bends the path you thought was straight.", "neutral"),
                71: ("Those who listen long enough begin to hum along.", "info"),
                72: ("The cage is never empty.", "bad"),
                73: ("You carry more graves than memories.", "bad"),
                74: ("The word forgotten still remembers you.", "info"),
                75: ("What you reject will bloom in your veins.", "bad"),
                76: ("He speaks in static, and you nod in devotion.", "bad"),
                77: ("The key was never meant for your hands.", "neutral"),
                78: ("Stars fall because they are ashamed.", "neutral"),
                79: ("The fire does not warm, only consumes.", "bad"),
                80: ("To follow the light is to blind yourself.", "neutral"),
                81: ("That which is faceless envies you.", "bad"),
                82: ("Silence rots quicker than screams.", "bad"),
                83: ("The throne burns, but no one rises.", "bad"),
                84: ("You cannot erase the witness.", "neutral"),
                85: ("The child’s laughter breaks stone.", "neutral"),
                86: ("The path forks, but all ways lead inward.", "info"),
                87: ("The bell tolls only for the deaf.", "info"),
                88: ("You do not own your shadow.", "bad"),
                89: ("Ashes learn to sing if you wait long enough.", "info"),
                90: ("A single drop carries oceans of ruin.", "bad"),
                91: ("The smile is sharper than the blade.", "bad"),
                92: ("You were not the first vessel.", "neutral"),
                93: ("Blood remembers debts that minds forget.", "bad"),
                94: ("A door opens every time you close your eyes.", "info"),
                95: ("He waits beneath the number you fear most.", "bad"),
                96: ("The script writes you as its final line.", "bad"),
                97: ("To reach the end is to begin devouring.", "bad"),
                98: ("The choir waits for the silence to break.", "neutral"),
                99: ("That which breathes through you is not your own.", "bad"),
                100: ("When the vessel is full, it will overflow into nothing.", "bad"),
            }
            COLOR_MAP = {
                "bad": Fore.RED,
                "neutral": Fore.YELLOW,
                "good": Fore.GREEN,
                "info": Fore.CYAN
            }

            entry = LORE_MESSAGES.get(self.Lore)
            if entry:
                message, category = entry
                color = COLOR_MAP.get(category, Fore.CYAN)  # fallback cyan
                print(f"\n{color}\"{message}\"{Fore.RESET}\n")

        def completion_message(self):
            if self.vesselCompletion.check():
                print(
                    f"{Fore.GREEN}{Style.BRIGHT}You have completed the VESSEL terminal experience fully!{Style.RESET_ALL}\n"
                    f"{Fore.YELLOW}{Style.BRIGHT}The 6th key is '{Fore.CYAN}Unbirth{Fore.YELLOW}'.. See you in the {Fore.RED}END{Style.RESET_ALL}\n"
                )

        @staticmethod
        def print_startup_messages():
            """Print startup and safety messages."""
            messages = [
                f"{Fore.CYAN}VESSEL Terminal started. Try 'help'. Press Ctrl+C to exit.{Style.RESET_ALL}\n",
                f"{Fore.YELLOW}Use with audio.. It is useless and a waste of time otherwise{Style.RESET_ALL}",
                f"{Fore.RED}DO NOT delete the logs.. {Style.RESET_ALL}{Fore.YELLOW}If you want to store them somewhere else, do NOT move them, copy them!{Style.RESET_ALL}",
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

        def show_glitch_text(self):
            """Display glitch text effects based on Lore."""
            glitch_colors = [Fore.RED, Fore.YELLOW, Fore.BLUE, Fore.MAGENTA]
            texts = [
                '01010100 01110010 01100101 01100101',  # "Tree" in binary
                '███████ NULL ███████',  # Corruption placeholder
                '0xDEADDEAD corrupted',  # Fake memory corruption
                '<SYSTEM BREACH DETECTED>'  # New glitch line
            ]

            if 1 <= self.Lore <= 99:
                options = texts + [None]  # add "nothing" as an option
                weights = [10, 10, 10, 10, 60]  # percentages
                choice = random.choices(options, weights=weights, k=1)[0]

                if choice:  # only print if not None
                    print(f"{random.choice(glitch_colors)}{choice}{Fore.RESET}")

        def show_conditional_hints(self):
            """Display hints depending on Lore and current completion state."""
            if self.vesselCompletion.check():
                return

            conditions_and_msgs = [
                (26 <= self.Lore <= 31 and not self.createLog.error_exist(ID=255),
                 "Maybe try checking your internet protocol?"),

                (32 <= self.Lore <= 37,
                 "There’s more than 'help' to see here."),

                (38 <= self.Lore <= 43 and not self.createLog.fight_exist(ID=29),
                 "Can you make me say the prime of 29"),

                (44 <= self.Lore <= 49,
                 "Not everything is as it seems... so do check everything at least twice."),

                (50 <= self.Lore <= 55 and self.keywordManager.get_count() < 5,
                 "Why don't you echo the 5 keys?"),

                (56 <= self.Lore <= 61 and not self.createLog.fight_exist(ID=3) and not self.createLog.error_exist(
                    ID=3),
                 "Mention your deleted friend's name, you may find fragments... fight or errors of 3"),

                (62 <= self.Lore <= 67 and self.cfr.command_available_for.letsplay_askme()
                 and not self.createLog.error_exist(ID=1)
                 and not self.createLog.error_exist(ID=100),
                 "Let's play a game, shall we?"),

                (74 <= self.Lore <= 79,
                 "Some commands hide until they trust you, it is linear after all"),

                (80 <= self.Lore <= 85,
                 "Have sound on... you may hear something"),

                (86 <= self.Lore <= 91 and not self.createLog.fight_exist(ID=0),
                 "If you hit the devils jackpot, HE may find a way to connect to you"),

                (92 <= self.Lore <= 100,
                 "It is all about luck.."),
            ]
            for cond, msg in conditions_and_msgs:
                if cond:
                    print(f"{Fore.LIGHTBLACK_EX}Tip: {msg}{Fore.RESET}")

        def create_fight_logs(self):
            """Create fight logs based on Lore ranges and current log state."""
            fight_ranges = [
                range(1, 3),
                range(4, 15),
                range(16, 25),
                range(26, 29),
                range(30, 42),
                range(42, 44),
            ]

            available = [r for r in fight_ranges if self.Lore in r and not self.createLog.fight_exist(ID=r.start)]
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
        self.message.completion_message()
        self.message.print_startup_messages()
        self.message.praise_if_error_666()
        self.message.time_based_greetings()
        self.message.show_unique_lore_message()
        self.message.show_glitch_text()
        self.message.show_conditional_hints()
        self.message.create_fight_logs()
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
