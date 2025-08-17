import os
import base64


def recreate(SOURCE: str, OUTPUT: str, OUTPUT_NAME: str):
    entries = []
    for root, dirs, files in os.walk(SOURCE):
        for d in dirs:
            path = os.path.relpath(os.path.join(root, d), SOURCE)
            entries.append(("dir", path, None))
        for f in files:
            full_path = os.path.join(root, f)
            rel_path = os.path.relpath(full_path, SOURCE)
            with open(full_path, "rb") as infile:
                data = infile.read()
            encoded = base64.b64encode(data).decode("utf-8")
            entries.append(("file", rel_path, encoded))

    with open(OUTPUT, "w", encoding="utf-8") as out:
        out.write("import os, base64\n\n")
        out.write("def recreate():\n")
        out.write(f"    base = '{OUTPUT_NAME}'\n")
        out.write("    os.makedirs(base, exist_ok=True)\n\n")

        for kind, path, data in entries:
            if kind == "dir":
                out.write(f"    os.makedirs(os.path.join(base, r'''{path}'''), exist_ok=True)\n")
            else:
                out.write(f"    with open(os.path.join(base, r'''{path}'''), 'wb') as f:\n")
                out.write(f"        f.write(base64.b64decode('''{data}'''))\n")

        out.write("\nif __name__ == '__main__':\n")
        out.write("    recreate()\n")


if __name__ == "__main__":
    os.makedirs("../recreator", exist_ok=True)
    recreate(SOURCE="../../Fight Resources/dont/",
             OUTPUT="../recreator/recreate_dont.touch_GENCODE.py",
             OUTPUT_NAME="dont")
    recreate(SOURCE="../../Fight Resources/lost/",
             OUTPUT="../recreator/recreate_lost_GENCODE.py",
             OUTPUT_NAME="lost")
