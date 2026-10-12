import base64
import hashlib
import os
from pathlib import Path

MAX_SCRIPT_SIZE = 1024 * 1024  # ~1 MiB

# ANSI colors
RED = "\033[91m"
GREEN = "\033[92m"
CYAN = "\033[96m"
GREY = "\033[90m"
RESET = "\033[0m"


def log_info(msg):
    print(f"{CYAN}[i]{RESET} {msg}")


def log_success(msg):
    print(f"{GREEN}[✓]{RESET} {msg}")


def log_error(msg):
    print(f"{RED}[!]{RESET} {msg}")


def log_verbose(msg):
    print(f"{GREY}[~]{RESET} {msg}")


def sanitize_name(name, existing):
    """Convert a filename to a valid Python identifier and avoid collisions."""
    base = ''.join(c if c.isalnum() else '_' for c in name)
    if base in existing:
        h = hashlib.sha1(name.encode()).hexdigest()[:6]
        base = f"{base}_{h}"
        log_error(f"Collision detected for '{name}', sanitised as '{base}'")
    existing.add(base)
    return base


def generate_log_scripts(folder, output_dir, prefix):
    """
    Generate split recreator scripts for logs.

    folder     -> source logs folder
    output_dir -> vessel/recreateLog
    prefix     -> 'elp' (error) or 'flp' (fight)
    """
    folder = Path(folder)
    output_dir = Path(output_dir)
    output_dir.mkdir(parents=True, exist_ok=True)

    log_files = sorted(folder.glob("*"))
    if not log_files:
        log_error(f"No log files found in {folder}")
        return 0
    else:
        log_info(f"Found {len(log_files)} logs in {folder}")

    part_number = 1
    current_size = 0
    existing_funcs = set()

    def output_path(n):
        return output_dir / f"{prefix}{n}.py"

    # common header with helper function
    base_header = [
        "import os, base64",
        "from pathlib import Path",
        "from win32_setctime import setctime",
        "",
        "def _write_log(data, name, destination, atime, mtime, ctime):",
        "    file_path = Path(destination)/name",
        "    with open(file_path, 'wb+') as f:",
        "        f.write(base64.b64decode(data))",
        "    os.utime(file_path, (atime, mtime))",
        "    setctime(str(file_path), ctime)",
        "",
    ]
    script_lines = base_header.copy()

    for idx, file in enumerate(log_files, 1):
        log_verbose(f"Processing log {idx}/{len(log_files)}: {file.name}")
        data = base64.b64encode(file.read_bytes()).decode()
        mtime = int(file.stat().st_mtime)
        atime = ctime = mtime
        func_name = sanitize_name(file.stem, existing_funcs)

        func_lines = [
            f"def {func_name}(destination='.'):",  # function wrapper
            f"    _write_log(b'''{data}''', '{file.name}', destination, {atime}, {mtime}, {ctime})",
            "",
        ]
        func_text = "\n".join(func_lines)
        func_size = len(func_text.encode())

        # split file if exceeds MAX_SCRIPT_SIZE
        if current_size + func_size > MAX_SCRIPT_SIZE and current_size > 0:
            log_info(f"Part {part_number} reached size limit. Writing out file.")
            output_path(part_number).write_text("\n".join(script_lines), encoding="utf-8")
            part_number += 1
            script_lines = base_header.copy()
            current_size = 0

        script_lines.extend(func_lines)
        current_size += func_size

    # write last part
    if script_lines:
        log_info(f"Writing final part {part_number}")
        output_path(part_number).write_text("\n".join(script_lines), encoding="utf-8")

    log_success(f"Generated {part_number} parts for prefix '{prefix}'")
    return part_number


def generate_all(output_dir: str = "vessel/recreateLog"):
    os.makedirs(output_dir, exist_ok=True)
    log_info(f"Output directory ensured at {output_dir}")

    # error logs -> elp{n}.py
    log_info("Generating ERROR log recreators...")
    error_parts = generate_log_scripts(
        "logs/error", output_dir, "elp"
    )

    # fight logs -> flp{n}.py
    log_info("Generating FIGHT log recreators...")
    fight_parts = generate_log_scripts(
        "logs/fight", output_dir, "flp"
    )

    # create __init__.py
    log_info("Creating __init__.py...")
    init_lines = []
    for i in range(1, error_parts + 1):
        init_lines.append(f"from vessel.recreateLog.elp{i} import *")
    for i in range(1, fight_parts + 1):
        init_lines.append(f"from vessel.recreateLog.flp{i} import *")

    Path(output_dir, "__init__.py").write_text("\n".join(init_lines), encoding="utf-8")
    log_success(f"__init__.py created with {error_parts} error parts and {fight_parts} fight parts imports")


if __name__ == "__main__":
    generate_all()
