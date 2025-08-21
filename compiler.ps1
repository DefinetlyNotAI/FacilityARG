# ============================
# VESSEL.exe Hardened Build (PowerShell)
# ============================

$ErrorActionPreference = "Stop"

# --- Cleanup Function ---
function Cleanup {
    if (Test-Path ".\upx") {
        Write-SubInfo "Cleaning temporary UPX folder..."
        Remove-Item ".\upx" -Recurse -Force
    }
    if (Test-Path ".\vessel.exe.build") {
        Write-SubInfo "Cleaning vessel.exe.build folder..."
        Remove-Item ".\vessel.exe.build" -Recurse -Force
    }
    if (Test-Path ".\venv") {
        Write-SubInfo "Cleaning venv folder..."
        Remove-Item ".\venv" -Recurse -Force
    }
    if (Test-Path ".\nuitka-crash-report.xml") {
        Write-SubInfo "Removing nuitka-crash-report.xml..."
        Remove-Item ".\nuitka-crash-report.xml" -Force
    }
}

# --- Helper Functions ---
function Write-Info($msg) { Write-Host $msg -ForegroundColor Cyan }
function Write-SubInfo($msg) { Write-Host $msg -ForegroundColor Gray }
function Write-Success($msg) { Write-Host $msg -ForegroundColor Green }
function Write-ErrorAndExit($msg) {
    Write-Host "[ERROR] $msg" -ForegroundColor Red
    Cleanup
    exit 1
}

# --- Force Python 3.11 ---
$Python311Path = "C:\Users\Hp\AppData\Local\Microsoft\WindowsApps\python3.11.exe"
if (-Not (Test-Path $Python311Path)) {
    Write-ErrorAndExit "Python 3.11 not found at $Python311Path. Install it and try again."
}
Write-Info "Using Python 3.11 at $Python311Path"

# --- Permission Check for Python Packages ---
function Test-PackagePermissions {
    try {
        $tmpfile = [System.IO.Path]::Combine([System.IO.Path]::GetTempPath(), "pip_perm_test.tmp")
        Set-Content -Path $tmpfile -Value "test"
        Remove-Item $tmpfile
    } catch {
        Write-ErrorAndExit "Insufficient permissions to install Python packages. Run PowerShell as administrator or check your user rights."
    }
}

# --- Clean venv if exists ---
if (Test-Path ".\venv") {
    Write-Info "Removing existing virtual environment..."
    Remove-Item ".\venv" -Recurse -Force
}

# --- Clean old build outputs ---
$dirs = @("build","vessel.exe.build","vessel.exe.dist","vessel.exe.onefile-build")
foreach ($d in $dirs) { if (Test-Path $d) { Remove-Item $d -Recurse -Force } }
if (Test-Path "vessel.exe.exe") { Remove-Item "vessel.exe.exe" -Force }

# --- Test permissions ---
Write-SubInfo "Checking permissions..."
Test-PackagePermissions
Write-SubInfo "Permissions OK."

# --- Create venv with 3.11 ---
Write-Info "Creating virtual environment..."
try { & $Python311Path -m venv venv } catch { Write-ErrorAndExit "Failed to create venv." }

# --- Use venv Python ---
$VenvPython = ".\venv\Scripts\python.exe"

# --- Upgrade pip & install dependencies ---
Write-Info "Installing build dependencies..."
try {
    Write-SubInfo "Upgrading pip, wheel, setuptools..."
    & $VenvPython -m pip install --upgrade --no-cache-dir pip wheel setuptools 2>&1 | ForEach-Object { Write-Host $_ -ForegroundColor Gray }

    Write-SubInfo "Installing Nuitka, PyInstaller, colorama, prompt_toolkit..."
    & $VenvPython -m pip install --no-cache-dir nuitka pyinstaller colorama prompt_toolkit 2>&1 | ForEach-Object { Write-Host $_ -ForegroundColor Gray }

    if (-Not (Test-Path ".\requirements.txt")) {
        Write-ErrorAndExit "requirements.txt not found. Aborting build."
    }
    Write-SubInfo "Installing project requirements from requirements.txt..."
    & $VenvPython -m pip install --no-cache-dir -r requirements.txt 2>&1 | ForEach-Object { Write-Host $_ -ForegroundColor Gray }
} catch {
    Write-ErrorAndExit "Failed to install dependencies: $($_.Exception.Message)"
}


# --- Check for UPX ---
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

# --- Compile with Nuitka using MinGW64 ---
Write-Info "Compiling with Nuitka (standalone, MinGW64)..."
try {
    & $VenvPython -m nuitka `
        --standalone `
        --remove-output `
        --mingw64 `
        --lto=yes `
        vessel.exe.py
} catch {
    Write-ErrorAndExit "Compilation failed: $($_.Exception.Message)"
}

# --- Verify output ---
if (-Not (Test-Path ".\vessel.exe.dist\vessel.exe")) {
    Write-ErrorAndExit "Build finished but vessel.exe not found."
}

# --- Build complete ---
Write-Success ""
Write-Success "============================="
Write-Success "Build complete!"
Write-Success "EXE + deps located in: vessel.exe.dist\"
Write-Success "============================="

# --- Cleanup ---
& .\venv\Scripts\deactivate.bat
Cleanup
