# ============================
# VESSEL.exe Hardened Build (PowerShell)
# ============================

$ErrorActionPreference = "Stop"

function Write-ErrorAndExit($msg) {
    Write-Host "[ERROR] $msg" -ForegroundColor Red
    exit 1
}

try {
    Write-Host "Checking for Python..."
    $python = Get-Command python -ErrorAction Stop
} catch {
    Write-ErrorAndExit "Python not found in PATH. Install Python 3.10+ and try again."
}

# --- Create venv if missing ---
if (-Not (Test-Path ".\venv")) {
    Write-Host "Creating virtual environment..."
    try {
        python -m venv venv
    } catch {
        Write-ErrorAndExit "Failed to create venv."
    }
}

# --- Activate venv ---
Write-Host "Activating virtual environment..."
$venvActivate = ".\venv\Scripts\Activate.ps1"
try {
    & $venvActivate
} catch {
    Write-ErrorAndExit "Failed to activate virtual environment."
}

# --- Upgrade pip & install dependencies ---
Write-Host "Upgrading pip & installing build dependencies..."
try {
    & python -m pip install --upgrade pip wheel setuptools
    & python -m pip install nuitka pyinstaller colorama prompt_toolkit
} catch {
    Write-ErrorAndExit "Failed to install dependencies."
}

# --- Cleanup old builds ---
Write-Host "Cleaning old build outputs..."
$dirs = @("build","vessel.exe.build","vessel.exe.dist","vessel.exe.onefile-build")
foreach ($d in $dirs) {
    if (Test-Path $d) { Remove-Item $d -Recurse -Force }
}
if (Test-Path "vessel.exe.exe") { Remove-Item "vessel.exe.exe" -Force }

# --- Compile with Nuitka (standalone, no onefile) ---
Write-Host "Compiling with Nuitka (standalone mode, no onefile)..."
try {
    python -m nuitka `
        --standalone `
        --remove-output `
        --clang `
        --lto=yes `
        --static-libpython=yes `
        --upx `
        vessel.exe.py
} catch {
    Write-ErrorAndExit "Compilation failed."
}

# --- Verify output ---
if (-Not (Test-Path ".\vessel.exe.dist\vessel.exe")) {
    Write-ErrorAndExit "Build finished but vessel.exe not found."
}

Write-Host ""
Write-Host "=============================" -ForegroundColor Green
Write-Host "Build complete!" -ForegroundColor Green
Write-Host "EXE + deps located in: vessel.exe.dist\" -ForegroundColor Green
Write-Host "=============================" -ForegroundColor Green
