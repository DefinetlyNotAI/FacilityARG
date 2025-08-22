import os
import random
from pathlib import Path
from datetime import datetime, timedelta

# Your log structure
year_to_error_ranges = {
    1975: [(1,2), (4,14), (16,24)],
    1995: [(26,42), (44,59), (61,98)],
    2010: [(100,254)],
    2015: [(256,332), (334,400)],
    2017: [(401,665)],
    2525: [(3,3),(15,15),(25,25)]
}

year_to_fight_ranges = {
    2017: [("all",)]
}

def expand_ranges(ranges):
    ids = set()
    for r in ranges:
        if r == ("all",):
            return "all"
        start, end = r
        ids.update(range(start, end + 1))
    return sorted(ids)

def get_all_matching_files(folder: Path, prefix: str):
    # Accept any extension, or even no extension
    # Match files starting with prefix_log_ 
    # No filtering by extension at all
    return [f for f in folder.iterdir()
            if f.is_file() and f.name.startswith(f"{prefix}_log_")]

def extract_log_number(filename: str) -> int:
    try:
        # filename example: "error_log_123.hex"
        # Step 1: Split at "_log_" -> ["error", "123.hex"]
        core = filename.split("_log_")[1]

        # Step 2: Remove extension - split at last dot
        if '.' in core:
            number_part = core.rsplit('.', 1)[0]
        else:
            number_part = core

        # Step 3: convert to int
        return int(number_part)
    except Exception:
        return None

def assign_ascending_timestamps(file_list, year):
    base_date = datetime(year, 1, 1, 0, 0, 0)
    end_date = datetime(year, 12, 31, 23, 59, 59)
    total_seconds = int((end_date - base_date).total_seconds())

    file_list_sorted = sorted(
        [(f, extract_log_number(f.name)) for f in file_list if extract_log_number(f.name) is not None],
        key=lambda x: x[1]
    )

    step = total_seconds // (len(file_list_sorted) + 1)
    current_time = base_date

    for f, _ in file_list_sorted:
        offset = random.randint(0, step - 1)
        timestamp = current_time + timedelta(seconds=offset)
        current_time = timestamp + timedelta(seconds=1)
        ts = timestamp.timestamp()
        os.utime(f, (ts, ts))

def main():
    error_dir = Path("../Fight aka Vessel/logs/error")
    fight_dir = Path("../Fight aka Vessel/logs/fight")

    # ERROR LOGS
    for year, ranges in year_to_error_ranges.items():
        ids = expand_ranges(ranges)
        files = get_all_matching_files(error_dir, "error")

        if ids != "all":
            files = [f for f in files if extract_log_number(f.name) in ids]

        assign_ascending_timestamps(files, year)

    # FIGHT LOGS
    for year, ranges in year_to_fight_ranges.items():
        ids = expand_ranges(ranges)
        files = get_all_matching_files(fight_dir, "fight")

        if ids != "all":
            files = [f for f in files if extract_log_number(f.name) in ids]

        assign_ascending_timestamps(files, year)

if __name__ == "__main__":
    main()
