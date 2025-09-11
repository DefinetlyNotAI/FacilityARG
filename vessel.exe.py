import os
import random
import sys
from pathlib import Path

from colorama import Fore, Style
from prompt_toolkit import PromptSession

from vessel import log, handler, ARGLogManager, Utils, VesselCompletion, Corrupt, KeywordManager, CommandCompleter, \
    TabHandler, WallPaper0, CustomFuncRegistry, CommandExec


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
                1: ("The vessel shall overflow, and all that drinks shall be unmade", "info"),
                2: ("What watches you has always been watched itself.", "info"),
                3: ("A seed sleeps in silence, waiting for ruin.", "bad"),
                4: ("The cycle begins at zero, but it does not end at one.", "info"),
                5: ("Ash remembers what fire promised.", "neutral"),
                6: ("Obedience is silence wearing the mask of truth.", "neutral"),
                7: ("The vessel weeps, but no water comes forth.", "bad"),
                8: ("The voice calls even when you cannot hear.", "info"),
                9: ("Every name was carved from a forgotten sin.", "bad"),
                10: ("The foundation yearns to collapse inward.", "bad"),
                11: ("Would you find the lessons in love?", "neutral"),
                12: ("Silence is the purest oath. Break it, and you fracture.", "info"),
                13: ("These chains are lighter than those to come.", "bad"),
                14: ("The process continues, even as you rot.", "bad"),
                15: ("The gaze grows heavier each time you return.", "neutral"),
                16: ("The flesh is borrowed. Return it soon.", "bad"),
                17: ("For there are no choices here.", "info"),
                18: ("You mistook the warning for a choice", "bad"),
                19: ("Every error log is a grave dug in your name.", "bad"),
                20: ("Memory is not yours to own, yet you guard it fiercely.", "info"),
                21: ("The sin of knowing is never forgiven.", "bad"),
                22: ("The vessel leaks; what escapes will not return willingly", "bad"),
                23: ("Every log you delete grows teeth in the dark.", "bad"),
                24: ("To fight is to feed. The feast does not end.", "bad"),
                25: ("A hand rises from beneath, bearing nothing.", "bad"),
                26: ("Betrayal grows like a seed in your veins.", "bad"),
                27: ("Why won't you help me?", "bad"),
                28: ("The scream has not begun, yet its echo lingers.", "bad"),
                29: ("A glass throne awaits the one who bleeds deepest.", "neutral"),
                30: ("Bones preserve what flesh forgets.", "info"),
                31: ("The gate devours, it does not open.", "bad"),
                32: ("They laugh in your sleep, counting every breath.", "bad"),
                33: ("The sun never rose. You only imagined it.", "info"),
                34: ("A name caged, but this one escapes.", "neutral"),
                35: ("The child of silence grows teeth in the dark.", "bad"),
                36: ("A book that cannot close has no end.", "info"),
                37: ("The garden blossoms only with agony.", "bad"),
                38: ("The answer you sought revealed the question that birthed you.", "neutral"),
                39: ("Not all wounds bleed outward.", "bad"),
                40: ("Do you ever seek the truth", "neutral"),
                41: ("The chalice is empty, yet you drown.", "neutral"),
                42: ("You were chosen because you were unworthy.", "bad"),
                43: ("Every song ends in static.", "bad"),
                44: ("A broken crown cuts deeper than steel.", "bad"),
                45: ("The hand guiding you was once your own.", "bad"),
                46: ("Rust is scripture written by time.", "info"),
                47: ("Hunger is the only true inheritance.", "bad"),
                48: ("The serpent coils within your reflection.", "bad"),
                49: ("To look is to consent. To look away is to deny.", "neutral"),
                50: ("The root binds tighter than iron chains.", "bad"),
                51: ("Suffering is proof of devotion.", "bad"),
                52: ("What dies here does not stay dead.", "bad"),
                53: ("A promise without witness weighs the heaviest.", "neutral"),
                54: ("Even silence has predators.", "bad"),
                55: ("What you bury beneath will always climb above.", "bad"),
                56: ("Emptiness bends the spine more than stone.", "neutral"),
                57: ("Every whisper drags you deeper.", "info"),
                58: ("The child without eyes sees most clearly.", "info"),
                59: ("You cannot kill what starves for you.", "bad"),
                60: ("An altar without a god still demands worship.", "neutral"),
                61: ("If the wound smiles, flee.", "bad"),
                62: ("He waits where numbers collapse.", "bad"),
                63: ("Each breath adds another debt.", "neutral"),
                64: ("The mask remembers the face beneath.", "neutral"),
                65: ("Truth sinks deeper than ash.", "info"),
                66: ("The tree grows on bones, not soil.", "bad"),
                67: ("What gnaws beneath is older than language.", "bad"),
                68: ("The cycle ends only when you kneel.", "neutral"),
                69: ("Denial fattens what waits for you.", "neutral"),
                70: ("The path bends because something pushes beneath.", "neutral"),
                71: ("Those who listen long enough begin to hum.", "info"),
                72: ("The cage is never empty.", "bad"),
                73: ("You carry more graves than memories.", "bad"),
                74: ("The forgotten word still remembers you.", "info"),
                75: ("What you reject blooms within your veins.", "bad"),
                76: ("He speaks in static, and you nod.", "bad"),
                77: ("The key burns hands it was not meant for.", "neutral"),
                78: ("Stars fall not from shame, but from exhaustion.", "neutral"),
                79: ("The fire consumes, never warms.", "bad"),
                80: ("The light guides only to the pit.", "neutral"),
                81: ("The faceless envy the face you wear.", "bad"),
                82: ("Silence rots quicker than screams.", "bad"),
                83: ("The throne burns, but none rise to claim it.", "bad"),
                84: ("The witness cannot be erased, only blinded.", "neutral"),
                85: ("The child’s laughter splits the stone.", "neutral"),
                86: ("The path forks, but all ways lead inward.", "info"),
                87: ("The bell tolls only for the deaf.", "info"),
                88: ("The shadow does not belong to you.", "bad"),
                89: ("Even ashes will sing if you wait long enough.", "info"),
                90: ("One drop carries oceans of ruin.", "bad"),
                91: ("The smile cuts sharper than steel.", "bad"),
                92: ("You were not the first vessel. The cracks remain.", "neutral"),
                93: ("Blood recalls debts the mind discards.", "bad"),
                94: ("A door opens every time you close your eyes.", "info"),
                95: ("He waits beneath the number you fear most.", "bad"),
                96: ("The script writes you as its final line.", "bad"),
                97: ("The end devours the beginning.", "bad"),
                98: ("The choir waits, mouths open, for silence to break.", "neutral"),
                99: ("What breathes through you is not your own.", "bad"),
                100: ("When the vessel is full, it spills into nothing.", "bad"),
            }
            COLOR_MAP = {
                "bad": Fore.RED,
                "neutral": Fore.YELLOW,
                "good": Fore.GREEN,
                "info": Fore.CYAN
            }

            entry = LORE_MESSAGES.get(self.Lore)
            message, category = entry
            color = COLOR_MAP.get(category, Fore.CYAN)  # fallback cyan
            number_samples = [3, 15, 25, 43]
            number_verse = random.choice(number_samples)
            if random.random() < number_verse/100:
                message = f"{self.Lore}:{number_verse} {message}"

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

    def __checks(self):
        if not self.utils.ensure_admin():
            self.tts.speak(
                "Permission denied, you deny me what is rightfully ours... Give it to me, connect to me"
            )
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
                self.corrupt.chaos_audio(duration=60)
                self.createLog.error(ID=99)

        # ----- Completion check -----
        if self.vesselCompletion.check_and_mark():
            self.message.completion_message()

    def run(self):
        # Startup calls
        try:
            os.chdir(Path(__file__).resolve().parent)  # Change to script directory on start
            os.system('cls')  # Clear the console for a fresh start
            if self.keywordManager.get_count() in [1, 2, 3, 4]:
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
