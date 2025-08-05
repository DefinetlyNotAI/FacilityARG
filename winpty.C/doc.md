# 📄 `winpty.dll` Documentation

**Author:** Shahm Najeeb
**Build Target:** Windows 10+ (ConPTY-supported)
**Purpose:** Provides a C wrapper around the Windows Pseudo Console API (`CreatePseudoConsole`, `ResizePseudoConsole`, etc.) for use in Python via `ctypes`.

---

## 🔧 Overview

This DLL exposes key functions to:

* Create a pseudo-terminal (ConPTY)
* Spawn a child process (like `cmd.exe`)
* Optionally allow resizing or advanced management
* Clean up and free resources

---

## 📁 File Structure

| File               | Purpose                                     |
|--------------------|---------------------------------------------|
| `winpty_wrapper.c` | C implementation of the wrapper functions   |
| `winpty.def`       | Export definitions (if using `cl.exe`)      |
| `winpty.dll`       | Compiled DLL to be used in Python           |
| `winpty.lib`       | Import library (used only for linking in C) |
| `test_dll.py`      | Python test script using `ctypes`           |

---

## 🧩 Exported Functions

### 1. `int start_pty()`

**Description:**
Initializes the Windows Pseudo Console and spawns an interactive shell (`cmd.exe`).

**Signature:**

```c
int start_pty();
```

**Parameters:** None
**Returns:**

* `0` on success
* `-1` on any failure (e.g., pipe creation, pseudo console init, process creation)

**Side Effects:**

* Creates two pipes for input/output
* Spawns a `cmd.exe` instance connected to the PTY
* Attaches the PTY output to the current process's stdout

---

## 🧼 Cleanup Notes

The current implementation automatically handles cleanup after Enter is pressed. However, consider exposing a cleanup method like:

```c
void cleanup_pty();
```

To let Python scripts clean up on demand.

---

## 💡 Example Usage in Python

```python
import ctypes
import os

# Load the DLL
dll = ctypes.WinDLL("./winpty.dll")

# Call the function
ret = dll.start_pty()
print("start_pty returned:", ret)

input("Press Enter to clean up and exit...")
```

Make sure the DLL is in the same directory as the Python script or provide a full path.

---

## ⚠️ Requirements

* Windows 10 (build 1809+)
* Console subsystem (not usable in GUI-only applications)
* Python 3.6+ (for `ctypes`)
* Visual Studio (to compile DLL)

---

## 🛠️ Compilation (MSVC)

Use `cl.exe`:

```bash
cl winpty_wrapper.c /LD /link /OUT:winpty.dll
```

---
