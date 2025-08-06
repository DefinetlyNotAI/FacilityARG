import ctypes
import msvcrt
import os
import threading
from vessel.vesselog import log
from ctypes import wintypes


# ----- Windows-specific imports for pseudo console and process management -----

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


# Define the pseudo console class
class PyWinPTY:
    kernel32 = ctypes.WinDLL('kernel32', use_last_error=True)

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
        ctypes.POINTER(STARTUPINFOEX),
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
    CREATE_NEW_PROCESS_GROUP = 0x00000200

    # Pseudo console API prototypes
    # HRESULT CreatePseudoConsole(COORD size, HANDLE hInput, HANDLE hOutput, DWORD dwFlags, HPCON* phPC);
    CreatePseudoConsole = kernel32.CreatePseudoConsole
    CreatePseudoConsole.argtypes = [wintypes._COORD, wintypes.HANDLE, wintypes.HANDLE, wintypes.DWORD,
                                    ctypes.POINTER(wintypes.HANDLE)]
    CreatePseudoConsole.restype = ctypes.c_long  # HRESULT is a LONG

    ClosePseudoConsole = kernel32.ClosePseudoConsole
    ClosePseudoConsole.argtypes = [wintypes.HANDLE]
    ClosePseudoConsole.restype = None

    # Initialize the pseudo console and process attributes
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

    # Additional required structs and calls omitted for brevity;
    # We'll do a minimal pipe-based PTY example here.
    def create_pipe(self):
        read_handle = wintypes.HANDLE()
        write_handle = wintypes.HANDLE()
        sa = SECURITY_ATTRIBUTES()
        sa.nLength = ctypes.sizeof(SECURITY_ATTRIBUTES)
        sa.bInheritHandle = True
        sa.lpSecurityDescriptor = None

        if not self.kernel32.CreatePipe(ctypes.byref(read_handle), ctypes.byref(write_handle), ctypes.byref(sa), 0):
            raise ctypes.WinError(ctypes.get_last_error())
        return read_handle, write_handle

    def start(self):
        # 1. Create pipes
        hInRead, hInWrite = self.create_pipe()
        hOutRead, hOutWrite = self.create_pipe()

        # 2. Create the Pseudo Console
        size = wintypes._COORD(self.cols, self.rows)
        hr = self.CreatePseudoConsole(size, hInRead, hOutWrite, 0, ctypes.byref(self.hPC))
        if hr != 0:
            raise ctypes.WinError(hr)

        # Close unused ends in parent
        self.kernel32.CloseHandle(hInRead)
        self.kernel32.CloseHandle(hOutWrite)

        # 3. Allocate buffer for attribute list
        size_attr_list = ctypes.c_size_t()
        self.kernel32.InitializeProcThreadAttributeList(None, 1, 0, ctypes.byref(size_attr_list))
        attr_list_buffer = ctypes.create_string_buffer(size_attr_list.value)
        attr_list_ptr = ctypes.cast(attr_list_buffer, ctypes.POINTER(ctypes.c_void_p))

        # 4. Initialize attribute list
        if not self.kernel32.InitializeProcThreadAttributeList(attr_list_ptr, 1, 0, ctypes.byref(size_attr_list)):
            raise ctypes.WinError(ctypes.get_last_error())

        # 5. Prepare STARTUPINFOEX
        si_ex = STARTUPINFOEX()
        si_ex.StartupInfo.cb = ctypes.sizeof(si_ex)
        si_ex.lpAttributeList = ctypes.cast(attr_list_ptr, ctypes.c_void_p)

        # 6. Update attribute list with pseudo console handle
        PROC_THREAD_ATTRIBUTE_PSEUDOCONSOLE = 0x00020016
        if not self.kernel32.UpdateProcThreadAttribute(
                attr_list_ptr,
                0,
                PROC_THREAD_ATTRIBUTE_PSEUDOCONSOLE,
                ctypes.c_void_p(self.hPC.value),
                ctypes.sizeof(self.hPC),
                None,
                None
        ):
            raise ctypes.WinError(ctypes.get_last_error())

        def try_create(command):
            cmdline = ctypes.create_unicode_buffer(command)
            return self.kernel32.CreateProcessW(
                None,
                cmdline,
                None,
                None,
                True,
                self.EXTENDED_STARTUPINFO_PRESENT | self.CREATE_NEW_PROCESS_GROUP,
                None,
                None,
                ctypes.byref(si_ex),
                ctypes.byref(self.proc_info)
            )

        # 7. Try raw command, then fallback to cmd /C or powershell -Command
        is_singular_cmd = False
        if not try_create(self.cmd):
            err = ctypes.get_last_error()
            if err in (2, 123):  # ERROR_FILE_NOT_FOUND or ERROR_INVALID_NAME
                is_singular_cmd = True
                shell_wrapped = f'cmd.exe /C "{self.cmd}"'
                if not try_create(shell_wrapped):
                    shell_wrapped = f'powershell.exe -Command "{self.cmd}"'
                    if not try_create(shell_wrapped):
                        raise ctypes.WinError(ctypes.get_last_error())
            else:
                raise ctypes.WinError(err)

        # 8. Set up IO threads
        log.debug(
            f"Command {'is' if is_singular_cmd else 'is not'} singular {' ' if is_singular_cmd else 'but is a executable'}: {self.cmd}")

        fd_out = msvcrt.open_osfhandle(hOutRead.value, os.O_BINARY)
        self._pipe_stdout = os.fdopen(fd_out, 'rb', buffering=0)
        if is_singular_cmd:
            self._stdout_thread = threading.Thread(target=self._read_stdout_singular_cmd, daemon=True)
        else:
            self._stdout_thread = threading.Thread(target=self._read_stdout, daemon=True)
        self._stdout_thread.start()

        fd_in = msvcrt.open_osfhandle(hInWrite.value, os.O_BINARY)
        self._pipe_stdin = os.fdopen(fd_in, 'wb', buffering=0)
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

    def _read_stdout_singular_cmd(self):
        buffer = b""
        try:
            while True:
                data = self._pipe_stdout.read(1024)
                if not data:
                    # Print any leftover buffered data
                    if buffer:
                        os.write(1, buffer)
                    break
                buffer += data
                while b'\n' in buffer:
                    line, buffer = buffer.split(b'\n', 1)
                    os.write(1, line + b'\n')
        except Exception as e:
            log.error(f"Stdout read failed: {e}")

    def _write_stdin(self):
        try:
            while True:
                if msvcrt.kbhit():
                    ch = msvcrt.getch()  # get raw byte
                    self._pipe_stdin.write(ch)
                    self._pipe_stdin.flush()
        except Exception as e:
            log.error(f"Stdin write failed: {e}")

    def wait(self):
        self.kernel32.WaitForSingleObject(self.proc_info.hProcess, -1)
        self.ClosePseudoConsole(self.hPC)


# TODO -> Add ctrl+c support, then sig handling (for all special keys like arrow keys, etc), then fix bug where exiting a process also exits the py program

# ---- DLL Usage ----
import ctypes

# Load the DLL (make sure it's in the correct path or use full path)
dll_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "winpty.C", "winpty.dll")
if not os.path.exists(dll_path):
    raise FileNotFoundError(f"Could not find winpty.dll at {dll_path}")
pty_dll = ctypes.CDLL(dll_path)

# Define functions
start_pty = pty_dll.start_pty
start_pty.argtypes = [ctypes.c_wchar_p]
start_pty.restype = ctypes.c_int

write_to_pty = pty_dll.write_to_pty
write_to_pty.argtypes = [ctypes.c_char_p]
write_to_pty.restype = ctypes.c_int

cleanup_pty = pty_dll.cleanup_pty
cleanup_pty.argtypes = []
cleanup_pty.restype = None
