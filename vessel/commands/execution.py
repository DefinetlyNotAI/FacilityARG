import shlex
import subprocess
from contextlib import redirect_stdout
from io import StringIO

from colorama import Fore, Style

from vessel.types import VesselObjects
from vessel.exceptionHandler import handler
from vessel.vesselLog import log


class CommandExec:
    """Handles execution of custom and system commands, including piping."""
    def __init__(self, vt: 'VesselObjects'):
        self.custom_commands = vt.commandRegistry.list()

    # ---------------- Helper Functions ----------------
    def _run_custom_command(self, cmd: str, args: list[str], input_data: str | None = None) -> str:
        """Run a registered custom command and capture its output."""
        if input_data and not args:
            args = [input_data]

        buffer = StringIO()
        with redirect_stdout(buffer):
            self.custom_commands[cmd](args)
        return buffer.getvalue().strip()

    @staticmethod
    def _run_system_command(stage: list[str], input_data: str | None = None) -> str:
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
        return out.strip()

    def _execute_stage(self, stage: list[str], prev_output: str | None) -> str:
        """Determine if stage is custom or system command and execute it."""
        cmd, args = stage[0], stage[1:]
        if cmd in self.custom_commands:
            return self._run_custom_command(cmd, args, prev_output)
        return self._run_system_command(stage, prev_output)

    # ---------------- Public Methods ----------------
    def run_piped_command(self, command_line: str):
        """Run piped commands, supporting both custom and system commands."""
        try:
            stages = [shlex.split(stage.strip()) for stage in command_line.split("|")]
            prev_output: str | None = None
            for stage in stages:
                prev_output = self._execute_stage(stage, prev_output)
            if prev_output:
                print(prev_output)
        except Exception as e:
            handler.exception(f"Piping failed: {e}")

    def run_command(self, command_line: str):
        """Run a single or piped command."""
        if not command_line.strip():
            return

        try:
            if "|" in command_line:
                self.run_piped_command(command_line)
                return

            parts = shlex.split(command_line)
            cmd, args = parts[0], parts[1:]
            func_obj = self.custom_commands.get(cmd)

            if func_obj:
                meta = func_obj([], _metadata_=True)
                if not meta.get("requirement_satisfied?", True):
                    print(f"{Fore.RED}Command unavailable or not found{Style.RESET_ALL}")
                    return

            if cmd in self.custom_commands:
                self.custom_commands[cmd](args)
            else:
                subprocess.run(["powershell", "-Command", command_line], check=False)
        except Exception as e:
            handler.exception(f"Command error: {e}")
