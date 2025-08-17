# Manually coded

import os
import subprocess
import sys
import shutil

# Path setup
output_dir = os.path.join(os.path.dirname(__file__), "..", "can", "you")
os.makedirs(output_dir, exist_ok=True)
py_file = os.path.join(output_dir, "decompile_me.py")

# Write your Python code here
code = '''
"""This is a red herring, what a waste of time"""
"ه مهفثقشممغ سشهي هفس ش صشسفث خب فهةث غخع هيهخف"

for i in range(43):
    x = 3 ** 15 % 25

for i in range(43):
    x = 25 ** 15 % 3


def lmao_what_a_loser(): pass


def cleanup_the_tree(): pass


print("decompile me")
'''


with open(py_file, "w", encoding="utf-8") as f:
    f.write(code)

# Uninstall obsolete pathlib package if present
try:
    import importlib.metadata
    if "pathlib" in {dist.metadata["Name"].lower() for dist in importlib.metadata.distributions()}:
        subprocess.run([sys.executable, "-m", "pip", "uninstall", "-y", "pathlib"], check=True)
except Exception:
    pass

# Install PyInstaller
subprocess.run([sys.executable, "-m", "pip", "install", "--user", "pyinstaller"], check=True)

# Build EXE
subprocess.run([
    sys.executable, "-m", "PyInstaller",
    "--onefile",
    "--name", "decompile_me",
    "--distpath", output_dir,
    py_file
], check=True)

print("\n✅ EXE created! Check the 'can/you' folder:", output_dir)

# Cleanup: remove .spec file and build directory
spec_file = os.path.join(os.path.dirname(py_file), "decompile_me.spec")
if os.path.exists(spec_file):
    os.remove(spec_file)
build_dir = os.path.join(os.path.dirname(py_file), "build")
if os.path.exists(build_dir):
    shutil.rmtree(build_dir)
if os.path.exists(py_file):
    os.remove(py_file)
subprocess.run([sys.executable, "-m", "pip", "uninstall", "-y", "pyinstaller"], check=True)

