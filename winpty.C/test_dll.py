import ctypes
from ctypes import wintypes

# Load your DLL
mydll = ctypes.WinDLL('./winpty.dll')
# start_pty: takes LPCWSTR (wchar_t*), returns int
mydll.start_pty.argtypes = [wintypes.LPCWSTR]
mydll.start_pty.restype = ctypes.c_int

# write_to_pty: takes const char*, returns int
mydll.write_to_pty.argtypes = [ctypes.c_char_p]
mydll.write_to_pty.restype = ctypes.c_int

# cleanup_pty: void -> void
mydll.cleanup_pty.argtypes = []
mydll.cleanup_pty.restype = None

cmd = "cmd.exe"
ret = mydll.start_pty(cmd)
print(f"start_pty returned: {ret}")

mydll.write_to_pty(b"echo Hello from Python\r\n")
mydll.write_to_pty(b"dir\r\n")

input("Press Enter to clean up and exit...")  # Allow time to see output
mydll.cleanup_pty()
