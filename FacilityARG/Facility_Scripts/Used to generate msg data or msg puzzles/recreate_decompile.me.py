# dump_exe_to_py_base64.py
from pathlib import Path
import base64

exe_path = Path("../can/you/decompile_me.exe")
output_py = Path("recreate_decompile.me_GENCODE.py")

# Read EXE bytes and encode in base64
with exe_path.open("rb") as f:
    exe_bytes = f.read()

b64_data = base64.b64encode(exe_bytes).decode('ascii')

# Write Python file
with output_py.open("w", encoding="utf-8") as f:
    f.write("from pathlib import Path\n")
    f.write("import base64\n\n")
    f.write(f"b64_data = '''{b64_data}'''\n")
    f.write("""
data = base64.b64decode(b64_data)
output_path = Path("../can/you/decompile_me.exe")
output_path.parent.mkdir(parents=True, exist_ok=True)
with output_path.open("wb") as out:
    out.write(data)
print(f"EXE recreated at {output_path}")
""")

print(f"Python file created: {output_py}")
