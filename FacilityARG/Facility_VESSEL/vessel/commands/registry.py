from typing import Callable, Any


class CommandRegistry:
    """
    Handles registration, storage, and execution of commands.

    Commands can be registered manually via `register` or automatically via `register_all`.
    """

    class Execution:
        """Wrapper for a command function to allow uniform calling."""

        def __init__(self, name: str, func: Callable):
            self.name = name
            self.func = func

        def __call__(self, args: list[str], _metadata_: bool = False) -> Any:
            return self.func(args, _metadata_)

    def __init__(self):
        self._commands: dict[str, CommandRegistry.Execution] = {}

    def register(self, name: str, func: Callable):
        """Register a single command."""
        self._commands[name] = self.Execution(name, func)

    def register_all(self, obj: Any):
        """Automatically register all methods with `_is_cmd = True`."""
        for attr_name in dir(obj):
            if attr_name.startswith("_"):
                continue
            attr = getattr(obj, attr_name)
            if callable(attr) and getattr(attr, "_is_cmd", False):
                self.register(attr_name, attr)

    def get(self, name: str) -> Execution | None:
        """Retrieve a command by name."""
        return self._commands.get(name)

    def list(self) -> dict[str, Execution]:
        """Return all registered commands."""
        return dict(self._commands)
