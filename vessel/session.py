from prompt_toolkit.completion import Completer, Completion
from prompt_toolkit.key_binding import KeyBindings


# ----- Session Handlers -----
class CommandCompleter(Completer):
    def __init__(self, commands: list[str], cfr):
        self.commands = commands
        self.cfr = cfr

    def get_completions(self, document, complete_event):
        text = document.text_before_cursor
        tokens = text.split()
        if not tokens:
            latest_token = ""
            prefix_tokens = []
        else:
            latest_token = tokens[-1]
            prefix_tokens = tokens[:-1]
        for cmd in self.commands:
            func_obj = self.cfr.get_command(cmd)
            if func_obj:
                meta = func_obj([], _metadata_=True)
                if cmd.startswith(latest_token) and meta.get("requirement_satisfied?", True):
                    completion_text = " ".join(prefix_tokens + [cmd])
                    yield Completion(completion_text, start_position=-len(latest_token))


class TabHandler:
    """Safe tab-cycling behavior without overlapping text."""

    def __init__(self):
        self.completions = []
        self.index = 0
        self.prefix = ""
        self.active = False
        self._suspend_reset = False

    def create(self, completer):
        kb = KeyBindings()

        @kb.add("tab")
        def _(event):
            b = event.app.current_buffer
            current_text = b.document.text_before_cursor

            self._suspend_reset = True
            try:
                # First tab press for a new prefix
                if not self.active:
                    self.prefix = current_text
                    self.completions = list(completer.get_completions(b.document, None))
                    self.index = 0
                    self.active = True

                if not self.completions:
                    return

                # Delete the **entire current buffer** before inserting new completion
                b.delete_before_cursor(len(current_text))

                completion = self.completions[self.index]
                b.insert_text(completion.text)

                # Cycle index for next tab
                self.index = (self.index + 1) % len(self.completions)
            finally:
                self._suspend_reset = False

        return kb

    def attach_reset(self, buffer):
        """Reset autocomplete if user types anything other than Tab"""

        def reset(_):
            if self.active and not self._suspend_reset:
                self.completions = []
                self.index = 0
                self.prefix = ""
                self.active = False

        buffer.on_text_changed += reset
