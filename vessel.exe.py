import shlex
import subprocess

from vessel import log, handler

# ----- Global Python Exec State -----
persistent_globals = {
    "__builtins__": __builtins__,
}


# ----- Custom Function Execution Wrapper -----
class CustomFuncExec:
    def __init__(self, name, func):
        self.name = name
        self.func = func

    def __call__(self, args, _help_=False):
        return self.func(args, _help_)


# ----- Custom Commands -----

class CustomFuncRegistry:
    def __init__(self):
        self.commands = {}
        self._register_all()

    def _register_all(self):
        for attr_name in dir(self):
            if attr_name.startswith("_"):
                continue
            attr = getattr(self, attr_name)
            if callable(attr) and hasattr(attr, "_is_cmd"):
                self.commands[attr_name] = CustomFuncExec(attr_name, attr)

    def get_command(self, name):
        return self.commands.get(name)

    def list_commands(self):
        return self.commands

    # ----- Command Implementations -----
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


# ----- Command Registry Wrapper -----
custom_commands = CustomFuncRegistry().list_commands()


# ----- Core Command Execution Logic -----
class CommandExec:
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

            if cmd in custom_commands:
                custom_commands[cmd](args)
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
    main()

"""
Commands to add

one to create the can/you/decomple_me.exe [in scripts is the py script]
one to create all under dont/touch/
one to create all under the lost/

then commands that play out like a game, where achieving a goal creates the logs
- the logs act as save data to know what has been done
- use time, device, and other info for the events
- rerunning events also creates new logs and actually provides a different outcome
- special logs aka endings should be hard,
- implement glitches, user creation, meta events, and other things that make it feel like a virus

[error log 60/99/255/333/666 and fight log 0/29 are special ones for lore]
"""
