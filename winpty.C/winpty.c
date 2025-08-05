#define _CRT_SECURE_NO_WARNINGS
#include <windows.h>
#include <stdio.h>
#include <conio.h>

#define PROC_THREAD_ATTRIBUTE_PSEUDOCONSOLE 0x00020016
#define BUFFER_SIZE 1024

HANDLE hPC; // Pseudo console handle
HANDLE hProcess = NULL;
HANDLE hThread = NULL;

HANDLE hPipeInWrite = NULL;
HANDLE hPipeOutRead = NULL;

// Thread functions
DWORD WINAPI ReadStdout(LPVOID lpParam);
DWORD WINAPI WriteStdin(LPVOID lpParam);

// Utility: create inheritable pipe pair
void CreatePipePair(HANDLE* readHandle, HANDLE* writeHandle) {
    SECURITY_ATTRIBUTES saAttr = { sizeof(SECURITY_ATTRIBUTES), NULL, TRUE };

    if (!CreatePipe(readHandle, writeHandle, &saAttr, 0)) {
        fprintf(stderr, "CreatePipe failed: %lu\n", GetLastError());
        exit(1);
    }
}

int wmain(int argc, wchar_t** argv) {
    if (argc < 2) {
        fwprintf(stderr, L"Usage: %s <command>\n", argv[0]);
        return 1;
    }

    // Create pipes for ConPTY input/output
    HANDLE hInRead = NULL, hInWrite = NULL;
    HANDLE hOutRead = NULL, hOutWrite = NULL;

    CreatePipePair(&hInRead, &hInWrite);
    CreatePipePair(&hOutRead, &hOutWrite);

    COORD size = { 80, 25 };
    HRESULT hr = CreatePseudoConsole(size, hInRead, hOutWrite, 0, &hPC);
    if (FAILED(hr)) {
        fprintf(stderr, "CreatePseudoConsole failed: 0x%lx\n", hr);
        return 1;
    }

    CloseHandle(hInRead);
    CloseHandle(hOutWrite);

    // Init attribute list
    SIZE_T attrListSize = 0;
    InitializeProcThreadAttributeList(NULL, 1, 0, &attrListSize);

    PPROC_THREAD_ATTRIBUTE_LIST attrList = (PPROC_THREAD_ATTRIBUTE_LIST)malloc(attrListSize);
    if (!InitializeProcThreadAttributeList(attrList, 1, 0, &attrListSize)) {
        fprintf(stderr, "InitAttrList failed: %lu\n", GetLastError());
        return 1;
    }

    if (!UpdateProcThreadAttribute(attrList, 0, PROC_THREAD_ATTRIBUTE_PSEUDOCONSOLE, hPC, sizeof(HANDLE), NULL, NULL)) {
        fprintf(stderr, "UpdateProcThreadAttribute failed: %lu\n", GetLastError());
        return 1;
    }

    // Setup startup info
    STARTUPINFOEXW siEx = { 0 };
    siEx.StartupInfo.cb = sizeof(siEx);
    siEx.lpAttributeList = attrList;

    PROCESS_INFORMATION pi = { 0 };

    // Copy command line
    wchar_t cmdLine[1024];
    wcscpy(cmdLine, argv[1]);

    // Create process
    BOOL success = CreateProcessW(
        NULL,
        cmdLine,
        NULL,
        NULL,
        TRUE,
        EXTENDED_STARTUPINFO_PRESENT,
        NULL,
        NULL,
        &siEx.StartupInfo,
        &pi
    );

    if (!success) {
        fprintf(stderr, "CreateProcessW failed: %lu\n", GetLastError());
        return 1;
    }

    hProcess = pi.hProcess;
    hThread = pi.hThread;
    hPipeInWrite = hInWrite;
    hPipeOutRead = hOutRead;

    // Start IO threads
    CreateThread(NULL, 0, ReadStdout, NULL, 0, NULL);
    CreateThread(NULL, 0, WriteStdin, NULL, 0, NULL);

    // Wait for process to finish
    WaitForSingleObject(hProcess, INFINITE);

    // Cleanup
    ClosePseudoConsole(hPC);
    DeleteProcThreadAttributeList(attrList);
    free(attrList);
    CloseHandle(hPipeInWrite);
    CloseHandle(hPipeOutRead);
    CloseHandle(hProcess);
    CloseHandle(hThread);

    return 0;
}

DWORD WINAPI ReadStdout(LPVOID lpParam) {
    DWORD bytesRead;
    BYTE buffer[BUFFER_SIZE];

    while (ReadFile(hPipeOutRead, buffer, BUFFER_SIZE, &bytesRead, NULL) && bytesRead > 0) {
        fwrite(buffer, 1, bytesRead, stdout);
        fflush(stdout);
    }

    return 0;
}

DWORD WINAPI WriteStdin(LPVOID lpParam) {
    DWORD written;
    while (1) {
        int ch = _getch();
        if (!WriteFile(hPipeInWrite, &ch, 1, &written, NULL))
            break;
    }

    return 0;
}
