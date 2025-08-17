import os
import random
import string
from datetime import datetime

import pywintypes
import win32con
import win32file

LOG_DIR = "generated_logs"
os.makedirs(LOG_DIR, exist_ok=True)

# Define fight log IDs by corruption type
very_corrupted = [1, 2] + list(range(33, 42))  # 1,2 and 33–41 inclusive
nonsense_corruption = list(range(4, 15)) + list(range(16, 20))  # 4-14 and 16–19 inclusive
fails_to_open = list(range(20, 25)) + list(range(26, 29)) + list(range(30, 33))  # 20-24, 26–28 and 30–32 inclusive

# IDs relevant for fight logs overall
fight_log_ids = set(range(0, 43))

# Date mapping for fight logs only
date_map = {
    2017: set(range(1, 29)),  # Fight Logs 1-28
    2020: {0, 29, 42, 43},  # Fight Logs 0,29,42
    2025: set(range(30, 42)),  # Fight Logs 30-41
}


def get_date_for_log(i):
    for year, ids in date_map.items():
        if i in ids:
            return year
    return None


def get_month_day_for_log(i):
    # For simplicity, assign day 1 and month based on i % 12 (or 12 if zero)
    month = (i % 12) or 12
    day = 1
    return month, day


def get_random_time():
    return random.randint(0, 23), random.randint(0, 59), random.randint(0, 59)


def set_file_time_windows(path, year, month=None, day=None, hour=None, minute=None, second=None):
    handle = win32file.CreateFile(
        path,
        win32con.GENERIC_WRITE,
        win32con.FILE_SHARE_READ | win32con.FILE_SHARE_WRITE | win32con.FILE_SHARE_DELETE,
        None,
        win32con.OPEN_EXISTING,
        win32con.FILE_ATTRIBUTE_NORMAL,
        None
    )
    if month is None or day is None:
        month, day = 1, 1
    if hour is None or minute is None or second is None:
        hour, minute, second = 0, 0, 0

    try:
        timestamp = pywintypes.Time(datetime(year, month, day, hour, minute, second))
    except ValueError:
        timestamp = pywintypes.Time(datetime(year, 1, 1, 0, 0, 0))

    win32file.SetFileTime(handle, timestamp, timestamp, timestamp)
    handle.close()


def generate_heavy_corruption():
    junk = ''
    for _ in range(random.randint(5, 15)):
        para = ''.join(
            random.choice(string.printable + ''.join(chr(x) for x in range(128, 256)))
            for _ in range(random.randint(400, 1000))
        )
        junk += para + '\n\n'
    return junk.encode("utf-8", errors="ignore")


def generate_light_corruption():
    words = ["error", "failure", "corrupt", "byte", "driver", "memory", "kernel", "thread", "decode", "panic"]
    out = []
    for _ in range(random.randint(5, 15)):
        line = []
        for _ in range(random.randint(6, 12)):
            if random.random() < 0.7:
                line.append(random.choice(words))
            else:
                line.append(''.join(random.choices(string.ascii_letters + string.digits, k=random.randint(3, 6))))
        out.append(' '.join(line))
    return '\n'.join(out).encode("utf-8", errors="ignore")


def generate_fails_to_open_bytes():
    return os.urandom(random.randint(500, 2000))


def write_binary_log(filename, content_bytes, year, i):
    with open(filename, "wb") as f:
        f.write(content_bytes)
    month, day = get_month_day_for_log(i)
    hour, minute, second = get_random_time()
    set_file_time_windows(filename, year, month, day, hour, minute, second)


def main():
    # Generate very corrupted logs
    for i in very_corrupted:
        if i not in fight_log_ids:
            continue
        year = get_date_for_log(i)
        if year is None:
            continue
        filepath = os.path.join(LOG_DIR, f"fight_log_{i}.log")
        write_binary_log(filepath, generate_heavy_corruption(), year, i)

    # Generate nonsense/light corruption logs
    for i in nonsense_corruption:
        if i not in fight_log_ids:
            continue
        year = get_date_for_log(i)
        if year is None:
            continue
        filepath = os.path.join(LOG_DIR, f"fight_log_{i}.log")
        write_binary_log(filepath, generate_light_corruption(), year, i)

    # Generate fails to open logs
    for i in fails_to_open:
        if i not in fight_log_ids:
            continue
        year = get_date_for_log(i)
        if year is None:
            continue
        filepath = os.path.join(LOG_DIR, f"fight_log_{i}.log")
        write_binary_log(filepath, generate_fails_to_open_bytes(), year, i)

    print("✅ Fight log generation complete.")


if __name__ == "__main__":
    main()
