import base64
import hashlib
import os
from pathlib import Path

MAX_SCRIPT_SIZE = 2 * 1024 * 1024  # ~2 MiB


def sanitize_name(name, existing):
    """Convert a filename to a valid Python identifier and avoid collisions."""
    base = ''.join(c if c.isalnum() else '_' for c in name)
    if base in existing:
        h = hashlib.sha1(name.encode()).hexdigest()[:6]
        base = f"{base}_{h}"
    existing.add(base)
    return base


def generate_log_scripts(folder, output_prefix):
    folder = Path(folder)
    log_files = sorted(folder.glob("*"))  # preserve natural order
    script_lines = [
        "import os",
        "import base64",
        "from pathlib import Path",
        "from win32_setctime import setctime",
        "",
    ]

    part_number = 1
    current_size = 0
    existing_funcs = set()

    def output_path(n):
        return Path(f"{output_prefix}_part{n}.py")

    for file in log_files:
        data = base64.b64encode(file.read_bytes()).decode()
        mtime = int(file.stat().st_mtime)
        # Use modification time for both creation and modification
        atime = mtime
        ctime = mtime
        func_name = sanitize_name(file.stem, existing_funcs)  # supports any extension

        func_lines = [
            f"def {func_name}(destination='.'):",
            f"    data = b'''{data}'''",
            f"    file_path = Path(destination)/'{file.name}'",
            "    with open(file_path,'wb+') as f:",
            "        f.write(base64.b64decode(data))",
            f"    os.utime(file_path, ({atime}, {mtime}))",
            f"    setctime(str(file_path), {ctime})",
            "",
        ]
        func_text = "\n".join(func_lines)
        func_size = len(func_text.encode())

        # split file if exceeds MAX_SCRIPT_SIZE
        if current_size + func_size > MAX_SCRIPT_SIZE and current_size > 0:
            output_path(part_number).write_text("\n".join(script_lines), encoding="utf-8")
            part_number += 1
            script_lines = [
                "import os",
                "import base64",
                "from pathlib import Path",
                "from win32_setctime import setctime",
                "",
            ]
            current_size = 0

        script_lines.extend(func_lines)
        current_size += func_size

    # write last part
    if script_lines:
        with open(output_path(part_number), "w") as f:
            f.write("\n".join(script_lines))


# Example usage
os.makedirs("../recreator", exist_ok=True)
generate_log_scripts("../../Fight Resources/logs/error", "../../vessel/recreate_error_logs")
generate_log_scripts("../../Fight Resources/logs/fight", "../../vessel/recreate_fight_logs")
