import ctypes
import shlex
import subprocess
import sys

import pyttsx3

from vessel import log, handler


# ----- Utils -----
class Utils:
    def __init__(self):
        self.engine = pyttsx3.init()

    @staticmethod
    def ensure_admin() -> bool:
        """
        Checks if the script is running as admin using os.getuid or net session.
        Uses TTS if not admin.
        """
        try:
            # noinspection PyUnresolvedReferences
            return ctypes.windll.shell32.IsUserAnAdmin() != 0
        except Exception:
            return False

    @staticmethod
    def set_console_title(title: str) -> None:
        """
        Sets the console title using the 'title' command.
        """
        try:
            # Works in Windows cmd
            subprocess.call(f"title {title}", shell=True)
        except Exception as e:
            log.error(f"Failed to set console title: {e}")

    def tts_speak(self, message: str) -> None:
        self.engine.say(message)
        self.engine.runAndWait()


# ----- Global Python Exec State -----
persistent_globals = {
    "__builtins__": __builtins__,
}


# ----- Custom Commands -----
class CustomFuncRegistry:
    def __init__(self):
        self.commands = {}
        self._register_all()

    class Exec:
        """Custom Function Execution Wrapper"""

        def __init__(self, name, func):
            self.name = name
            self.func = func

        def __call__(self, args, _help_=False):
            return self.func(args, _help_)

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
    def help(self, args, _help_=False):
        if _help_:
            return {
                "desc": "Shows help info for commands.",
                "usage": "help [command]",
                "example": "help eval",
                "args_required": False,
                "returns": "Help text or command list."
            }

        if args:
            cmd = args[0]
            func_obj = self.commands.get(cmd)
            if func_obj:
                meta = func_obj([], _help_=True)
                print(f"Command: {cmd}")
                for k, v in meta.items():
                    print(f"{k.capitalize()}: {v}")
            else:
                log.error(f"No such command: {cmd}")
        else:
            print("Available commands:")
            for name, func_obj in self.commands.items():
                meta = func_obj([], _help_=True)
                print(f" - {name:<10} :: {meta.get('desc')}")
            print("Piping supported: e.g., echo hello world | findstr hello")
            print("Type 'help <command>' for detailed help.")
        return None

    def hello(self, _, _help_=False):
        if _help_:
            return {
                "desc": "Prints a friendly greeting.",
                "usage": "hello",
                "example": "hello",
                "args_required": False,
                "returns": "None"
            }
        log.info("👋 Hello from the VESSEL terminal.")
        return None

    def exec(self, args, _help_=False):
        if _help_:
            return {
                "desc": "Executes Python code. Multiline supported.",
                "usage": "exec [code]",
                "example": "exec print('hi')",
                "args_required": False,
                "returns": "None or printed output/error"
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
            exec(code, persistent_globals)
        except Exception as e:
            handler.exception(f"Python exec failed: {e}")

    def eval(self, args, _help_=False):
        if _help_:
            return {
                "desc": "Evaluates a Python expression.",
                "usage": "eval <expression>",
                "example": "eval 2 + 3 * 5",
                "args_required": True,
                "returns": "Result or error"
            }

        if not args:
            log.warning("Expression required.")
            return None

        expr = " ".join(args)
        try:
            result = eval(expr, persistent_globals)
            log.info(f"Result: {result}")
        except Exception as e:
            handler.exception(f"Eval failed: {e}")

    # ----- Register Commands -----
    exec._is_cmd = True
    help._is_cmd = True
    hello._is_cmd = True
    eval._is_cmd = True


# ----- Core Command Execution Logic -----
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


# ----- Main Loop -----
def main():
    print("VESSEL Terminal started. Type 'help'. Press Ctrl+C to exit.")
    while True:
        try:
            command_line = input("VESSEL> ")
            CommandExec().run_command(command_line)
        except KeyboardInterrupt:
            print()
            log.info("Goodbye.")
            break
        # Always print prompt after command, unless exiting
        print()


if __name__ == "__main__":
    utils = Utils()
    if not utils.ensure_admin():
        utils.tts_speak("Permission denied, you deny me what is rightfully ours... Give it to me, connect to me")
        sys.exit(1)
    utils.set_console_title("VESSEL #31525 CONNECTION TERMINAL")
    main()

"""
Commands to add

run script "scripts/recreate_decompile.me_GENCODE.py" to create the decompile_me.exe puzzle
run script "scripts/recreate_dont.touch_GENCODE.py" to create the 4 secret files puzzle
run script "scripts/recreate_lost_GENCODE.py" to create the lost puzzle and secret mus files/dir

then commands that play out like a game, where achieving a goal creates the logs
- the logs act as save data to know what has been done
- use time, device, and other info for the events
- rerunning events also creates new logs and actually provides a different outcome
- special logs aka endings should be hard,
- implement glitches, user creation, meta events, and other things that make it feel like a virus

[error log 60/99/255/333/666 and fight log 0/29 are special ones for lore]
[error log 43/25/15/3 and fight log 3/15/25 are special files not logs that are puzzles]
- fight 3/15/25 [tree files for tas resurrection]
- error 25 [ascii 25 shift puzzle]
- error 43 [random tree location coord]
- error 15 [hex puzzle of 4 lines, if counting error number per line, gives TREE]
- error 3 [hint for fight 3/15/25, the tree files]
"""

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
# If "help log" => give basic ranges of all logs, create logs error 44 to 59, if those exist, create 61 to 98
# invert => Inverts all colors, mouse movements and creates error log 333

# IF ALL ERROR LOGS EXIST except 99 => TTS/Audio of deafening sounds and chaos for 1 minute, then create log error 99
# IF ALL LOGS EXIST => Registry key "vessel_complete" set to 1, "You have completed the vessel terminal", provide keyword 6 in terminal
