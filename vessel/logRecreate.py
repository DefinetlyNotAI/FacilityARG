from typing import Callable
# noinspection PyUnusedImports
from vessel.recreateLog import *
import os
import glob


class ARGLogManager:
    """
    Handles recreation, verification, and batch management of ARG logs.
    Supports both fight and error logs.
    """

    def __init__(
            self,
            fight_destination: str = "../logs/fight",
            error_destination: str = "../logs/error",
    ):
        self.fight_destination = os.path.abspath(fight_destination)
        self.error_destination = os.path.abspath(error_destination)
        self._setup_dirs()

    def _setup_dirs(self):
        """Ensure destination directories exist."""
        os.makedirs(self.fight_destination, exist_ok=True)
        os.makedirs(self.error_destination, exist_ok=True)

    @staticmethod
    def _get_log_func(log_type: str, ID: int) -> Callable[[str], None]:
        """Retrieve the recreated function for a given log type and ID."""
        func_name = f"{log_type}_log_{ID}"
        func = globals().get(func_name)
        if not callable(func):
            raise ValueError(f"No log function found with name '{func_name}'")
        return func

    def _get_log_path(self, log_type: str, ID: int) -> str:
        """Return the full path of a log file for existence checks."""
        directory = self.fight_destination if log_type == "fight" else self.error_destination
        # Let recreate function determine the filename (no fixed extension)
        filename = f"{log_type}_log_{ID}"
        return os.path.join(directory, filename)

    def recreate(self, log_type: str, ID: int):
        """Recreate a single log file of the specified type."""
        func = self._get_log_func(log_type, ID)
        path = self.fight_destination if log_type == "fight" else self.error_destination
        func(path)

    def recreate_range(self, log_type: str, start: int, end: int, verbose: bool = False):
        """Recreate a range of log files (inclusive)."""
        for ID in range(start, end + 1):
            self.recreate(log_type, ID)
            if verbose:
                print(f"{log_type.capitalize()} log {ID} recreated.")

    def exists(self, log_type: str, ID: int) -> bool:
        """Check if a log file exists."""
        log_path = self._get_log_path(log_type, ID)
        files = glob.glob(log_path + ".*") + glob.glob(log_path)
        return any(os.path.isfile(f) for f in files)

    def batch_status(self, log_type: str, start: int, end: int) -> dict[int, bool]:
        """Return a dictionary mapping log IDs to existence status."""
        return {ID: self.exists(log_type, ID) for ID in range(start, end + 1)}

    # Convenience methods
    def fight(self, ID: int):
        return self.recreate("fight", ID)

    def error(self, ID: int):
        return self.recreate("error", ID)

    def fight_range(self, start: int, end: int, verbose: bool = False):
        return self.recreate_range("fight", start, end, verbose)

    def error_range(self, start: int, end: int, verbose: bool = False):
        return self.recreate_range("error", start, end, verbose)

    def fight_exist(self, ID: int) -> bool:
        return self.exists("fight", ID)

    def error_exist(self, ID: int) -> bool:
        return self.exists("error", ID)


if __name__ == "__main__":
    clog = ARGLogManager(fight_destination="../logs/fight", error_destination="../logs/error")
    clog.fight_range(0, 42)
    clog.error_range(1, 666)
