import ctypes
import msvcrt
import os
import threading
from vessel.vesselog import log
from ctypes import wintypes

# ----- Windows-specific imports for pseudo console and process management -----

# todo change to use the dll rather than the win32 api

kernel32 = ctypes.WinDLL('kernel32', use_last_error=True)


# Define the necessary structures for process creation
class SECURITY_ATTRIBUTES(ctypes.Structure):
    _fields_ = [
        ("nLength", wintypes.DWORD),
        ("lpSecurityDescriptor", wintypes.LPVOID),
        ("bInheritHandle", wintypes.BOOL),
    ]


class STARTUPINFO(ctypes.Structure):
    _fields_ = [
        ("cb", wintypes.DWORD),
        ("lpReserved", wintypes.LPWSTR),
        ("lpDesktop", wintypes.LPWSTR),
        ("lpTitle", wintypes.LPWSTR),
        ("dwX", wintypes.DWORD),
        ("dwY", wintypes.DWORD),
        ("dwXSize", wintypes.DWORD),
        ("dwYSize", wintypes.DWORD),
        ("dwXCountChars", wintypes.DWORD),
        ("dwYCountChars", wintypes.DWORD),
        ("dwFillAttribute", wintypes.DWORD),
        ("dwFlags", wintypes.DWORD),
        ("wShowWindow", wintypes.WORD),
        ("cbReserved2", wintypes.WORD),
        ("lpReserved2", ctypes.POINTER(ctypes.c_byte)),
        ("hStdInput", wintypes.HANDLE),
        ("hStdOutput", wintypes.HANDLE),
        ("hStdError", wintypes.HANDLE),
    ]


class STARTUPINFOEX(ctypes.Structure):
    _fields_ = [
        ("StartupInfo", STARTUPINFO),
        ("lpAttributeList", ctypes.c_void_p),
    ]


class PROCESS_INFORMATION(ctypes.Structure):
    _fields_ = [
        ("hProcess", wintypes.HANDLE),
        ("hThread", wintypes.HANDLE),
        ("dwProcessId", wintypes.DWORD),
        ("dwThreadId", wintypes.DWORD),
    ]


# Attribute list functions
kernel32.InitializeProcThreadAttributeList.restype = wintypes.BOOL
kernel32.InitializeProcThreadAttributeList.argtypes = [
    ctypes.POINTER(ctypes.c_void_p), wintypes.DWORD, wintypes.DWORD, ctypes.POINTER(ctypes.c_size_t)
]

kernel32.UpdateProcThreadAttribute.restype = wintypes.BOOL
kernel32.UpdateProcThreadAttribute.argtypes = [
    ctypes.POINTER(ctypes.c_void_p), wintypes.DWORD, ctypes.c_size_t,
    ctypes.c_void_p, ctypes.c_size_t, ctypes.c_void_p, ctypes.POINTER(ctypes.c_size_t)
]

kernel32.CreateProcessW.restype = wintypes.BOOL
kernel32.CreateProcessW.argtypes = [
    wintypes.LPCWSTR, wintypes.LPWSTR, ctypes.c_void_p, ctypes.c_void_p,
    wintypes.BOOL, wintypes.DWORD, ctypes.c_void_p, wintypes.LPCWSTR,
    ctypes.POINTER(STARTUPINFOEX),  # <-- Fix here
    ctypes.POINTER(PROCESS_INFORMATION)
]

kernel32.WaitForSingleObject.restype = wintypes.DWORD
kernel32.WaitForSingleObject.argtypes = [wintypes.HANDLE, wintypes.DWORD]

kernel32.CloseHandle.argtypes = [wintypes.HANDLE]

# WinAPI constants
INVALID_HANDLE_VALUE = wintypes.HANDLE(-1).value
CREATE_NEW_CONSOLE = 0x00000010
STARTF_USESTDHANDLES = 0x00000100
EXTENDED_STARTUPINFO_PRESENT = 0x00080000

# Pseudo console API prototypes
# HRESULT CreatePseudoConsole(COORD size, HANDLE hInput, HANDLE hOutput, DWORD dwFlags, HPCON* phPC);
CreatePseudoConsole = kernel32.CreatePseudoConsole
CreatePseudoConsole.argtypes = [wintypes._COORD, wintypes.HANDLE, wintypes.HANDLE, wintypes.DWORD,
                                ctypes.POINTER(wintypes.HANDLE)]
CreatePseudoConsole.restype = ctypes.c_long  # HRESULT is a LONG

ClosePseudoConsole = kernel32.ClosePseudoConsole
ClosePseudoConsole.argtypes = [wintypes.HANDLE]
ClosePseudoConsole.restype = None


# Additional required structs and calls omitted for brevity;
# We'll do a minimal pipe-based PTY example here.
def create_pipe():
    read_handle = wintypes.HANDLE()
    write_handle = wintypes.HANDLE()
    sa = SECURITY_ATTRIBUTES()
    sa.nLength = ctypes.sizeof(SECURITY_ATTRIBUTES)
    sa.bInheritHandle = True
    sa.lpSecurityDescriptor = None

    if not kernel32.CreatePipe(ctypes.byref(read_handle), ctypes.byref(write_handle), ctypes.byref(sa), 0):
        raise ctypes.WinError(ctypes.get_last_error())
    return read_handle, write_handle


class WinPTYProcess:
    def __init__(self, cmd, cols=80, rows=25):
        self._pipe_stdout = None
        self.cmd = cmd
        self.cols = cols
        self.rows = rows
        self.hPC = wintypes.HANDLE()
        self._stdout_thread = None
        self.proc_info = PROCESS_INFORMATION()
        self._pipe_stdin = None
        self._stdin_thread = None

    def start(self):
        # 1. Create pipes
        hInRead, hInWrite = create_pipe()
        hOutRead, hOutWrite = create_pipe()

        # 2. Create the Pseudo Console
        size = wintypes._COORD(self.cols, self.rows)
        hr = CreatePseudoConsole(size, hInRead, hOutWrite, 0, ctypes.byref(self.hPC))
        if hr != 0:
            raise ctypes.WinError(hr)

        # Close unused ends in parent
        kernel32.CloseHandle(hInRead)
        kernel32.CloseHandle(hOutWrite)

        # 3. Allocate buffer for attribute list
        size_attr_list = ctypes.c_size_t()
        kernel32.InitializeProcThreadAttributeList(None, 1, 0, ctypes.byref(size_attr_list))

        attr_list_buffer = ctypes.create_string_buffer(size_attr_list.value)
        attr_list_ptr = ctypes.cast(attr_list_buffer, ctypes.POINTER(ctypes.c_void_p))

        # 4. Initialize attribute list
        if not kernel32.InitializeProcThreadAttributeList(attr_list_ptr, 1, 0, ctypes.byref(size_attr_list)):
            raise ctypes.WinError(ctypes.get_last_error())

        # 5. Prepare STARTUPINFOEX
        si_ex = STARTUPINFOEX()
        si_ex.StartupInfo.cb = ctypes.sizeof(si_ex)
        si_ex.lpAttributeList = ctypes.cast(attr_list_ptr, ctypes.c_void_p)

        # 6. Update attribute list with pseudo console handle
        PROC_THREAD_ATTRIBUTE_PSEUDOCONSOLE = 0x00020016

        if not kernel32.UpdateProcThreadAttribute(
                attr_list_ptr,
                0,
                PROC_THREAD_ATTRIBUTE_PSEUDOCONSOLE,
                ctypes.c_void_p(self.hPC.value),
                ctypes.sizeof(self.hPC),
                None,
                None
        ):
            raise ctypes.WinError(ctypes.get_last_error())

        # 7. Create process
        cmdline = ctypes.create_unicode_buffer(self.cmd)
        success = kernel32.CreateProcessW(
            None,
            cmdline,
            None,
            None,
            True,
            EXTENDED_STARTUPINFO_PRESENT,
            None,
            None,
            ctypes.byref(si_ex),  # must be STARTUPINFOEX pointer
            ctypes.byref(self.proc_info)
        )

        if not success:
            raise ctypes.WinError(ctypes.get_last_error())

        # 8. Start reading from output pipe and writing to input pipe
        # Close unused ends in child
        fd_out = msvcrt.open_osfhandle(hOutRead.value, os.O_BINARY)

        # Create a file-like object for the output pipe
        self._pipe_stdout = os.fdopen(fd_out, 'rb', buffering=0)
        self._stdout_thread = threading.Thread(target=self._read_stdout, daemon=True)
        self._stdout_thread.start()

        # Keep hInWrite to write user input into the pseudo console
        fd_in = msvcrt.open_osfhandle(hInWrite.value, os.O_BINARY)
        self._pipe_stdin = os.fdopen(fd_in, 'wb', buffering=0)

        # Start thread to read user keyboard input and send it to pseudo console input pipe
        self._stdin_thread = threading.Thread(target=self._write_stdin, daemon=True)
        self._stdin_thread.start()

    def _read_stdout(self):
        try:
            while True:
                data = self._pipe_stdout.read(1024)
                if not data:
                    break
                os.write(1, data)
        except Exception as e:
            log.error(f"Stdout read failed: {e}")

    def _write_stdin(self):
        try:
            while True:
                if msvcrt.kbhit():
                    ch = msvcrt.getwch()
                    # Encode to UTF-8 bytes
                    self._pipe_stdin.write(ch.encode('utf-8'))
                    self._pipe_stdin.flush()
        except Exception as e:
            log.error(f"Stdin write failed: {e}")

    def wait(self):
        kernel32.WaitForSingleObject(self.proc_info.hProcess, -1)
        ClosePseudoConsole(self.hPC)
