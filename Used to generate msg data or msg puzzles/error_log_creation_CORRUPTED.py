import os
import random
import string
from datetime import datetime

import pywintypes
import win32con
import win32file

LOG_DIR = "generated_logs"
os.makedirs(LOG_DIR, exist_ok=True)

nonsense_heavy = list(range(100, 205)) + list(range(501, 601))  # 100–204 and 501-600
nonsense_light = list(range(1, 3)) + list(range(4, 15)) + list(range(16, 25)) + list(range(26, 32))
fails_to_open = list(range(205, 255)) + list(range(285, 333)) + list(range(334, 402))

date_map = {
    1975: set([1, 2] + list(range(4, 15)) + list(range(16, 25))),
    1995: set(list(range(26, 43)) + list(range(44, 60)) + list(range(61, 99))),
    2010: set(range(100, 255)),
    2015: set(list(range(256, 333)) + list(range(334, 401))),
    2017: set(range(401, 666)),
    2020: {3, 15, 25, 43, 60, 99, 255, 333, 666},
}


def get_date_for_log(i):
    for year, ids in date_map.items():
        if i in ids:
            return year
    return None


def get_month_day_for_log(i):
    """
    Map log ID to month and day.
    Special IDs get day 1 of month (mod 12),
    others cycle months/days roughly.
    """
    special_months = [3, 15, 25, 43, 60, 99, 255, 333, 666]

    if i in special_months:
        month = i % 12 or 12
        day = 1
        return month, day

    month = ((i // 28) % 12) + 1
    day = (i % 28) + 1

    return month, day


def get_random_time():
    hour = random.randint(0, 23)
    minute = random.randint(0, 59)
    second = random.randint(0, 59)
    return hour, minute, second


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
    for i in nonsense_light:
        year = get_date_for_log(i)
        if year is None:
            continue
        filepath = os.path.join(LOG_DIR, f"error_log_{i}.log")
        write_binary_log(filepath, generate_light_corruption(), year, i)

    for i in nonsense_heavy:
        year = get_date_for_log(i)
        if year is None:
            continue
        filepath = os.path.join(LOG_DIR, f"error_log_{i}.log")
        write_binary_log(filepath, generate_heavy_corruption(), year, i)

    for i in fails_to_open:
        year = get_date_for_log(i)
        if year is None:
            continue
        filepath = os.path.join(LOG_DIR, f"error_log_{i}.log")
        write_binary_log(filepath, generate_fails_to_open_bytes(), year, i)

    print("✅ Log generation complete.")


if __name__ == "__main__":
    main()
