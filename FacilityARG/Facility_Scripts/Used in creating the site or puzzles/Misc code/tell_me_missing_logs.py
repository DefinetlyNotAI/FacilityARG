import os
import sys


def find_missing_logs(delimiter, min_val, max_val):
    existing_numbers = set()

    for filename in os.listdir(''):
        if filename.startswith(delimiter) and filename.endswith('.log'):
            try:
                number_part = filename[len(delimiter):-4]  # Remove prefix and '.log'
                number = int(number_part)
                existing_numbers.add(number)
            except ValueError:
                continue  # Ignore files with non-numeric suffixes

    expected = set(range(min_val, max_val + 1))
    missing = sorted(expected - existing_numbers)

    if missing:
        print(f"Missing log numbers for '{delimiter}{{i}}.log' from {min_val} to {max_val}:")
        print(', '.join(map(str, missing)))
    else:
        print("No logs are missing.")


if __name__ == "__main__":
    if len(sys.argv) != 4:
        print("Usage: python find_missing_logs.py <delimiter> <min> <max>")
        sys.exit(1)

    delim = sys.argv[1]
    try:
        min_v = int(sys.argv[2])
        max_v = int(sys.argv[3])
    except ValueError:
        print("Min and Max must be integers.")
        sys.exit(1)

    find_missing_logs(delim, min_v, max_v)
