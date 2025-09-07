# ============================
# VESSEL.exe Hardened Build (PowerShell) - Local GCC only
# ============================

param(
    [switch]$Cleanup
)

$ErrorActionPreference = "Stop"

# --- Helper Functions ---
function Write-Info($msg) { Write-Host $msg -ForegroundColor Cyan }
function Write-SubInfo($msg) { Write-Host $msg -ForegroundColor Gray }
function Write-Success($msg) { Write-Host $msg -ForegroundColor Green }
function Write-ErrorAndExit($msg) { Write-Host "[ERROR] $msg" -ForegroundColor Red; if ($Cleanup) { Cleanup }; exit 1 }

# --- Cleanup Function ---
function Cleanup {
    $paths = @(".\upx", ".\vessel.exe.build", ".\venv", ".\nuitka-crash-report.xml")
    foreach ($p in $paths) {
        if (Test-Path $p) {
            Write-SubInfo "Cleaning $p ..."
            Remove-Item $p -Recurse -Force -ErrorAction SilentlyContinue
        }
    }
}

# --- Force Python 3.11 ---
$Python311Path = "C:\Users\Hp\AppData\Local\Microsoft\WindowsApps\python3.11.exe"
if (-Not (Test-Path $Python311Path)) { Write-ErrorAndExit "Python 3.11 not found at $Python311Path. Install it and try again." }
Write-Info "Using Python 3.11 at $Python311Path"

# --- Check/create venv ---
$VenvPython = ".\venv\Scripts\python.exe"
if (Test-Path ".\venv") {
    Write-Info "Existing virtual environment found. Reusing..."
} else {
    Write-Info "Creating virtual environment..."
    try { & $Python311Path -m venv venv } catch { Write-ErrorAndExit "Failed to create venv." }
}

# --- Upgrade pip & install dependencies silently ---
$env:PIP_DISABLE_PIP_VERSION_CHECK = "1"
$env:PIP_NO_WARN_SCRIPT_LOCATION = "0"
Write-Info "Installing/upgrading build dependencies..."
try {
    & $VenvPython -m pip install --upgrade pip wheel setuptools --quiet
    & $VenvPython -m pip install nuitka pyinstaller colorama prompt_toolkit --quiet
} catch { Write-ErrorAndExit "Failed to install build dependencies: $($_.Exception.Message)" }

# --- Install project requirements silently ---
if (-Not (Test-Path ".\requirements.txt")) { Write-ErrorAndExit "requirements.txt not found. Aborting build." }
Write-SubInfo "Installing project requirements..."
& $VenvPython -m pip install --quiet --use-pep517 -r requirements.txt 2>$null 1>$null
Write-SubInfo "Requirements installed."

# --- UPX handling ---
Write-Info "Checking for UPX..."
try {
    $upx = Get-Command upx -ErrorAction SilentlyContinue
    if (-not $upx) {
        Write-SubInfo "UPX not found. Downloading..."
        $upxUrl = "https://github.com/upx/upx/releases/download/v4.0.2/upx-4.0.2-win64.zip"
        $upxZip = "$env:TEMP\upx.zip"
        Invoke-WebRequest -Uri $upxUrl -OutFile $upxZip
        Expand-Archive -Path $upxZip -DestinationPath ".\upx" -Force
        Remove-Item $upxZip
        $env:PATH = "$PWD\upx\upx-4.0.2-win64;$env:PATH"
        Write-SubInfo "UPX installed and added to PATH."
    } else { Write-SubInfo "UPX found." }
} catch { Write-ErrorAndExit "Failed to install or detect UPX." }

# --- Detect Python bitness ---
$PythonArch = & $VenvPython -c "import struct; print(struct.calcsize('P')*8)"
Write-SubInfo "Detected Python architecture: $PythonArch-bit"

# --- Detect GCC ---
if ($PythonArch -eq 64) { $GCCExe = "C:\msys64\mingw64\bin\gcc.exe" } else { $GCCExe = "C:\msys64\mingw32\bin\gcc.exe" }
if (-Not (Test-Path $GCCExe)) { Write-ErrorAndExit "Expected GCC not found at $GCCExe" }
Write-SubInfo "Using GCC at: $GCCExe"
$env:PATH = "$($GCCExe | Split-Path);$env:PATH"

# --- Compile with Nuitka ---
Write-Info "Compiling with Nuitka (standalone, MinGW)..."
try {
    & $VenvPython -m nuitka `
        --standalone `
        --windows-icon-from-ico=extra\number3_corrupted.ico `
        --remove-output `
        --mingw64 `
        --lto=yes `
        --include-package=edge_tts `
        --include-package=pygame `
        --include-package=DateTime `
        --include-package=prompt_toolkit `
        --include-package=keyboard `
        --include-package=numpy `
        --include-package=pygetwindow `
        --include-package=sounddevice `
        --include-package=PIL `
        --include-package=win32_setctime `
        --include-package=colorlog `
        --include-package=colorama `
        --include-data-dir=vessel/scripts/data=./vessel/scripts/data `
        vessel.exe.py
} catch { Write-ErrorAndExit "Compilation failed: $($_.Exception.Message)" }

# --- Verify output ---
if (-Not (Test-Path ".\vessel.exe.dist\vessel.exe")) { Write-ErrorAndExit "Build finished but vessel.exe not found." }

# --- Build complete ---
Write-Success ""
Write-Success "============================="
Write-Success "Build complete!"
Write-Success "EXE + deps located in: dist\"
Write-Success "============================="

# --- Optional Cleanup ---
if ($Cleanup) { Cleanup }
Rename-Item -Path ".\vessel.exe.dist" -NewName "dist"
