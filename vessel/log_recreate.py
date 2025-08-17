# noinspection PyUnusedImports
from recreate_error_logs_part1 import *
# noinspection PyUnusedImports
from recreate_error_logs_part2 import *
# noinspection PyUnusedImports
from recreate_error_logs_part3 import *
# noinspection PyUnusedImports
from recreate_fight_logs_part1 import *


def create_log(log_type: str, id_: int, destination="."):
    """
    Recreate a log file of the given type and ID.

    log_type: 'fight' or 'error'
    id: integer corresponding to the log's numeric identifier
    destination: folder to recreate the log
    """
    if log_type not in ("fight", "error"):
        raise ValueError("log_type must be 'fight' or 'error'")

    func_name = f"{log_type}_log_{id_}"
    func = globals().get(func_name)

    if func is None:
        raise ValueError(f"No log function found with name '{func_name}'")

    func(destination)


if __name__ == "__main__":
    os.makedirs("./logs/fight", exist_ok=True)
    os.makedirs("./logs/error", exist_ok=True)
    for i in range(0, 43):
        create_log("fight", i, "./logs/fight")
    for i in range(1, 667):
        create_log("error", i, "./logs/error")
