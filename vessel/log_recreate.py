# noinspection PyUnusedImports
from recreateLog import *


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
    os.makedirs("../logs/fight", exist_ok=True)
    os.makedirs("../logs/error", exist_ok=True)
    for i in range(0, 43):  # Assuming fight logs start from 0 to 42
        create_log("fight", i, "../logs/fight")
    for i in range(1, 667):  # Assuming error logs start from 1 to 666
        create_log("error", i, "../logs/error")
