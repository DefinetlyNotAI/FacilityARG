import os
import platform
from datetime import datetime

# Windows-only: for setting creation time
if platform.system() == 'Windows':
    import pywintypes
    import win32file
    import win32con


def parse_datetime(dt_str):
    # Fix separators, unify format to "YYYY.MM.DD HH:MM:SS"
    # Some have '-' instead of '_', some miss seconds
    # Some have invalid months/days (e.g. 22.22)

    # Replace - with _ for consistent splitting, replace _ with space
    dt_str = dt_str.replace('-', '_').replace('_', ' ')
    parts = dt_str.strip().split()
    if len(parts) == 1:
        # Only date, no time? Assume 00:00:00
        date_part = parts[0]
        time_part = '00:00:00'
    else:
        date_part, time_part = parts[0], parts[1]

    # Fix missing seconds in time (e.g. "04:22" -> "04:22:00")
    if time_part.count(':') == 1:
        time_part += ':00'

    # Fix zeroes or impossible date parts:
    # Date format expected: YYYY.MM.DD, but sometimes invalid like 2010.0.0 or 2010.22.22
    try:
        year, month, day = map(int, date_part.split('.'))
    except Exception:
        # invalid split, fallback
        year, month, day = 2000, 1, 1  # fallback default

    # Clamp month/day to valid ranges
    if month < 1 or month > 12:
        month = 1
    if day < 1 or day > 28:  # to avoid invalid days, limit to 28 days max for safety
        day = 1

    try:
        hour, minute, second = map(int, time_part.split(':'))
    except Exception:
        hour, minute, second = 0, 0, 0

    # Clamp time values
    hour = max(0, min(hour, 23))
    minute = max(0, min(minute, 59))
    second = max(0, min(second, 59))

    try:
        return datetime(year, month, day, hour, minute, second)
    except Exception:
        # fallback to epoch time if datetime fails
        return datetime(1970, 1, 1, 0, 0, 0)


def set_file_times_windows(filepath, dt):
    # Convert datetime to Windows FILETIME structure
    wintime = pywintypes.Time(dt)
    handle = win32file.CreateFile(
        filepath, win32con.GENERIC_WRITE,
        0, None, win32con.OPEN_EXISTING,
        win32con.FILE_ATTRIBUTE_NORMAL, None)
    win32file.SetFileTime(handle, wintime, wintime, wintime)
    handle.close()


def set_file_times_unix(filepath, dt):
    # Set modification and access times (no creation time)
    mod_time = dt.timestamp()
    os.utime(filepath, (mod_time, mod_time))


# Dates from your input:
timestamps = [
    "2525.03.15 03:15:25",
    "1975.04.19 06:14:00",
    "1995.06.09 03:49:22",
    "1995.09.06 01:02:03",
    "1995.09.27 03:41:08",
    "1995.09.13 04:22:00",
    "1995.10.04 14:22:16",
    "1995.12.03 16:49:00",
    "1995.02.09 23:03:00",
    "1995.04.06 01:12:00",
    "1995.08.03 13:27:08",
    "1995.09.17 05:48:00",
    "1995.10.03 14:22:00",
    "1995.11.19 03:33:00",
    "1995.01.07 09:15:00",
    "2010.05.03 14:22:09",
    "2010.10.03 14:23:00",
    "2010.01.01 00:00:00",
    "2010.02.12 03:33:00",
    "2010.07.12 21:37:44",
    "2010.09.14 07:02:00",
    "2010.09.14 07:03:00",
    "2010.02.22 03:15:25",
    "2015.09.14 07:05:00",
    "2015.09.14 07:06:00",
    "2015.02.13 00:00:00",
]


def main():
    for i, ts in enumerate(timestamps, start=0):
        filename = f"Research Log {i}.log"
        if not os.path.isfile(filename):
            print(f"[WARN] File not found: {filename}")
            continue
        dt = parse_datetime(ts)
        print(f"Setting times for {filename} -> {dt.isoformat().replace('T', ' ')}")
        try:
            if platform.system() == 'Windows':
                set_file_times_windows(filename, dt)
            else:
                set_file_times_unix(filename, dt)
        except Exception as e:
            print(f"[ERROR] Failed to set times for {filename}: {e}")


if __name__ == "__main__":
    main()
