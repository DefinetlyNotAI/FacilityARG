#include <windows.h>
#include <stdio.h>
#include <conio.h>

#define PROC_THREAD_ATTRIBUTE_PSEUDOCONSOLE 0x00020016
#define BUFFER_SIZE 1024

static HANDLE hPC = NULL;
static HANDLE hPipeInWrite = NULL;
static HANDLE hPipeOutRead = NULL;
static HANDLE hProcess = NULL;
static HANDLE hThread = NULL;
static HANDLE hStdoutThread = NULL;

DWORD WINAPI ReadStdout(LPVOID lpParam) {
    DWORD bytesRead;
    BYTE buffer[BUFFER_SIZE];

    while (ReadFile(hPipeOutRead, buffer, BUFFER_SIZE, &bytesRead, NULL) && bytesRead > 0) {
        fwrite(buffer, 1, bytesRead, stdout);
        fflush(stdout);
    }

    return 0;
}

__declspec(dllexport)
int start_pty(const wchar_t* cmdline) {
    HANDLE hInRead, hOutWrite;
    SECURITY_ATTRIBUTES sa = { sizeof(SECURITY_ATTRIBUTES), NULL, TRUE };

    if (!CreatePipe(&hInRead, &hPipeInWrite, &sa, 0)) return -1;
    if (!CreatePipe(&hPipeOutRead, &hOutWrite, &sa, 0)) return -2;

    COORD size = { 80, 25 };
    HRESULT hr = CreatePseudoConsole(size, hInRead, hOutWrite, 0, &hPC);
    if (FAILED(hr)) return -3;

    CloseHandle(hInRead);
    CloseHandle(hOutWrite);

    SIZE_T attrListSize = 0;
    InitializeProcThreadAttributeList(NULL, 1, 0, &attrListSize);
    PPROC_THREAD_ATTRIBUTE_LIST attrList = (PPROC_THREAD_ATTRIBUTE_LIST)malloc(attrListSize);
    InitializeProcThreadAttributeList(attrList, 1, 0, &attrListSize);
    UpdateProcThreadAttribute(attrList, 0, PROC_THREAD_ATTRIBUTE_PSEUDOCONSOLE, hPC, sizeof(HANDLE), NULL, NULL);

    STARTUPINFOEXW siEx = { 0 };
    siEx.StartupInfo.cb = sizeof(siEx);
    siEx.lpAttributeList = attrList;

    PROCESS_INFORMATION pi;
    if (!CreateProcessW(NULL, (LPWSTR)cmdline, NULL, NULL, TRUE, EXTENDED_STARTUPINFO_PRESENT,
                        NULL, NULL, &siEx.StartupInfo, &pi)) {
        return -4;
    }

    hProcess = pi.hProcess;
    hThread = pi.hThread;

    hStdoutThread = CreateThread(NULL, 0, ReadStdout, NULL, 0, NULL);

    return 0;
}

__declspec(dllexport)
int write_to_pty(const char* input) {
    if (!hPipeInWrite) return -1;
    DWORD written;
    WriteFile(hPipeInWrite, input, (DWORD)strlen(input), &written, NULL);
    return (int)written;
}

__declspec(dllexport)
void cleanup_pty() {
    if (hPC) ClosePseudoConsole(hPC);
    if (hPipeInWrite) CloseHandle(hPipeInWrite);
    if (hPipeOutRead) CloseHandle(hPipeOutRead);
    if (hProcess) CloseHandle(hProcess);
    if (hThread) CloseHandle(hThread);
}
