# ============================
# VESSEL.exe Hardened Build (PowerShell) - Local GCC only
# ============================

param(
    [switch]$NoCleanup,
    [switch]$NoUpx,
    [switch]$NoDownload,
    [switch]$Verbose
)

# --- Logging helpers ---
function Log { param($msg) ; Write-Host "[INFO]       $msg" -ForegroundColor Cyan }
function Sub { param($msg) ; Write-Host "             $msg" -ForegroundColor Gray }
function Ok  { param($msg) ; Write-Host "[SUCCESS]    $msg" -ForegroundColor Green }
function Err { param($msg) ; Write-Host "[ERROR]      $msg" -ForegroundColor Red }

# --- Cleanup ---
function Cleanup {
    $toRemove = @(
        ".\vessel.exe.build",                # Nuitka intermediate build folder
        ".\nuitka-crash-report.xml",         # Nuitka crash report
        "$TempRoot\nuitka.out",              # Nuitka stdout log
        "$TempRoot\nuitka.err"               # Nuitka stderr log
    )

    foreach ($p in $toRemove) {
        if (Test-Path $p) {
            Remove-Item $p -Recurse -Force -ErrorAction SilentlyContinue
        }
    }
}

# --- Fatal error handler ---
function Fatal([string]$msg, [int]$code = 1) {
    Err $msg
    if (-not $NoCleanup) {
        Log "Cleaning up build artifacts and temps"
        Cleanup
    }
    exit $code
}

# --- Ctrl+C handler ---
$global:nuitkaProc = $null
Register-EngineEvent Console.CancelKeyPress -Action {
    Write-Host "`n[INFO] Ctrl+C detected, killing Nuitka and running cleanup..." -ForegroundColor Yellow
    if ($global:nuitkaProc -and !$global:nuitkaProc.HasExited) { $global:nuitkaProc.Kill() }
    Log "Cleaning up build artifacts and temps"
    Cleanup
    exit 1
} | Out-Null

# --- Paths ---
$ScriptRoot   = (Get-Location).ProviderPath
$ResourcesDir = Join-Path $ScriptRoot "resources"
$TempRoot     = Join-Path $ResourcesDir ".build_temp"
$TempPython   = Join-Path $TempRoot "python311"
$VenvDir      = Join-Path $ResourcesDir "venv"
$VenvPython   = Join-Path $VenvDir "Scripts\python.exe"
$Requirements = Join-Path $ScriptRoot "requirements.txt"
$LocalUpxDir  = Join-Path $ResourcesDir "upx"
$DistRoot     = Join-Path $ScriptRoot "dist"
$NuitkaTarget = Join-Path $ScriptRoot "vessel.exe.py"
$Gcc64Path    = "C:\msys64\mingw64\bin\gcc.exe"
$Gcc32Path    = "C:\msys64\mingw32\bin\gcc.exe"

# Ensure temp root exists
if (-not (Test-Path $TempRoot)) { New-Item -Path $TempRoot -ItemType Directory -Force | Out-Null }

# --- Retry download helper ---
function RetryInvokeWebRequest {
    param(
        [string]$Uri,
        [string]$OutFile,
        [int]$Retries = 3,
        [int]$DelaySeconds = 3
    )
    for ($i = 1; $i -le $Retries; $i++) {
        try {
            Invoke-WebRequest -Uri $Uri -OutFile $OutFile -UseBasicParsing -ErrorAction Stop
            return $true
        } catch {
            Sub "Download attempt $i failed: $($_.Exception.Message)"
            if ($i -lt $Retries) { Start-Sleep -Seconds $DelaySeconds }
        }
    }
    return $false
}

# --- Python and venv functions ---
function EnsurePython311 {
    Log "Setting up Python"
    Sub "Locating Python 3.11"
    $pyExe = Join-Path $TempPython "python.exe"
    if (Test-Path $pyExe) { Ok "Using existing embedded Python at $pyExe"; return $pyExe }

    $candidates = @()
    try { $p = (Get-Command python3.11 -ErrorAction SilentlyContinue).Source; if ($p) { $candidates += $p } } catch {}
    try { $p = (Get-Command python -ErrorAction SilentlyContinue).Source; if ($p) { $candidates += $p } } catch {}

    foreach ($c in $candidates) {
        try {
            $ver = & $c --version 2>&1
            if ($ver -match "3\.11") { Ok "Found Python 3.11: $c"; return $c }
        } catch {}
    }

    if ($NoDownload) { Fatal "Python 3.11 not found and download disabled" }

    if (-not (Test-Path $TempRoot)) { New-Item -Path $TempRoot -ItemType Directory | Out-Null }
    $embedZip = Join-Path $TempRoot "python-3.11-embed.zip"
    $embedUrl = "https://www.python.org/ftp/python/3.11.9/python-3.11.9-embed-amd64.zip"
    Sub "Downloading embedded Python to temporary folder"
    if (-not (RetryInvokeWebRequest -Uri $embedUrl -OutFile $embedZip)) { Fatal "Failed to download Python embed zip" }
    Sub "Extracting embedded Python to $TempPython"
    Expand-Archive -Path $embedZip -DestinationPath $TempPython -Force
    Remove-Item $embedZip -ErrorAction SilentlyContinue

    if (-not (Test-Path $pyExe)) { Fatal "Embedded Python extraction failed" }
    Sub "Using temporary Python at $pyExe"
    return $pyExe
}

function EnsureVenv([string]$BasePython) {
    if (-not (Test-Path $VenvDir)) {
        Log "Creating virtual environment with $BasePython"
        & $BasePython -m venv $VenvDir
    } else { Log "Reusing existing virtual environment" }

    if (-not (Test-Path $VenvPython)) { Fatal "Virtual environment python missing" }
    return $VenvPython
}

function Install-BuildDeps([string]$Py) {
    Log "Installing Build Dependencies"
    & $Py -m pip install --upgrade pip wheel setuptools --quiet
    & $Py -m pip install nuitka pyinstaller colorama prompt_toolkit --quiet
    Ok "Build dependencies installed"
}

function Install-Requirements([string]$Py) {
    if (-not (Test-Path $Requirements)) { Fatal "requirements.txt missing" }
    Log "Installing project requirements"
    & $Py -m pip install --use-pep517 -r $Requirements --quiet
    Ok "Project requirements installed"
}

# --- UPX ---
function EnsureUPX {
    Log "Ensuring UPX is available for Nuitka"
    if ($NoUpx) { Sub "Skipping UPX"; return $null }
    $upxCmd = Get-Command upx -ErrorAction SilentlyContinue
    if ($upxCmd) { Sub "UPX found in PATH: $($upxCmd.Source)"; return $upxCmd.Source }

    if (Test-Path $LocalUpxDir) {
        $found = Get-ChildItem -Path $LocalUpxDir -Recurse -Filter "upx.exe" | Select-Object -First 1
        if ($found) { Sub "Found local UPX at $($found.FullName)"; $env:PATH="$($found.Directory.FullName);$env:PATH"; return $found.FullName }
    }

    if ($NoDownload) { Sub "UPX missing, downloads disabled"; return $null }

    $upxUrl = "https://github.com/upx/upx/releases/download/v4.0.2/upx-4.0.2-win64.zip"
    $tmpZip = Join-Path $TempRoot "upx.zip"
    Log "Downloading UPX from github: v4.0.2 Windows x64"
    if (-not (RetryInvokeWebRequest -Uri $upxUrl -OutFile $tmpZip)) { Sub "Failed to download UPX"; return $null }
    New-Item -Path $LocalUpxDir -ItemType Directory -Force | Out-Null
    Expand-Archive -Path $tmpZip -DestinationPath $LocalUpxDir -Force
    Remove-Item $tmpZip -ErrorAction SilentlyContinue
    $downloaded = Get-ChildItem -Path $LocalUpxDir -Recurse -Filter "upx.exe" | Select-Object -First 1
    if (-not $downloaded) { Sub "UPX archive missing upx.exe"; return $null }
    Ok "UPX installed at $($downloaded.FullName)"
    $env:PATH = "$($downloaded.Directory.FullName);$env:PATH"
    return $downloaded.FullName
}

# --- GCC ---
function DetectGCC([string]$Py) {
    $arch = & $Py -c "import struct; print(struct.calcsize('P')*8)" 2>&1
    Sub "Detected Python architecture: $arch-bit"
    if ($arch -match "64") {
        if (Test-Path $Gcc64Path) { Log "Using GCC 64-bit"; return $Gcc64Path }
    } else {
        if (Test-Path $Gcc32Path) { Log "Using GCC 32-bit"; return $Gcc32Path }
    }
    Fatal "Expected GCC not found"
}

# --- Prepare dist ---
function PrepareDist {
    if (Test-Path $DistRoot) {
        Log "Detected existing dist/ folder. Cleaning before rebuild."
        Remove-Item $DistRoot -Recurse -Force -ErrorAction SilentlyContinue
    }
    New-Item -Path $DistRoot -ItemType Directory -Force | Out-Null
}

# --- Compile Nuitka with streaming verbose ---
function CompileNuitka([string]$Py, [string]$GccExe, [string]$UpxPath) {
    Log "Compiling with Nuitka"
    $nuitkaOut = Join-Path $TempRoot "nuitka.out"
    $nuitkaErr = Join-Path $TempRoot "nuitka.err"
    Remove-Item -Path $nuitkaOut -ErrorAction SilentlyContinue
    Remove-Item -Path $nuitkaErr -ErrorAction SilentlyContinue

    $venvRoot = Split-Path (Split-Path $VenvPython -Parent) -Parent
    $pyqtPlugins = Join-Path $venvRoot "Lib\site-packages\PyQt6\Qt6\plugins\platforms"
    Sub "Using PyQt6 plugins from: $pyqtPlugins"

    $nuitkaArgs = @(
        "--standalone",
        "--remove-output",
        "--mingw64",
        "--lto=yes",
        "--windows-icon-from-ico=resources/extra/number3_corrupted.ico",
        "--include-package=edge_tts",
        "--include-package=pygame",
        "--include-package=DateTime",
        "--include-package=prompt_toolkit",
        "--include-package=keyboard",
        "--include-package=numpy",
        "--include-package=pygetwindow",
        "--include-package=sounddevice",
        "--include-package=PIL",
        "--include-package=win32_setctime",
        "--include-package=colorlog",
        "--include-package=colorama",
        "--include-package=pythonnet",
        "--include-package=pyautogui",
        "--include-package=PyQt6",
        "--include-package=PyQt6.QtCore",
        "--include-data-dir=vessel/data=./vessel/data",
        "--include-data-dir=$pyqtPlugins=PyQt6\Qt6\plugins\platforms",
        $NuitkaTarget
    )

    Log "Starting Nuitka compilation. This may take several minutes..."
    $startArgs = @("-m", "nuitka") + $nuitkaArgs
    $global:nuitkaProc = Start-Process -FilePath $Py -ArgumentList $startArgs -NoNewWindow -PassThru `
        -RedirectStandardOutput $nuitkaOut -RedirectStandardError $nuitkaErr

    # --- Stream output while process runs ---
    while (-not $global:nuitkaProc.HasExited) {
        if ($Verbose) {
            if (Test-Path $nuitkaOut) {
                Get-Content $nuitkaOut -Tail 10 | ForEach-Object { Write-Host $_ -ForegroundColor Gray }
            }
        }
        Start-Sleep -Milliseconds 500
    }
    $global:nuitkaProc.WaitForExit()

    $stderrText = ""
    if (Test-Path $nuitkaErr) { $stderrText = (Get-Content -Raw -Path $nuitkaErr).Trim() }

    if ($global:nuitkaProc.ExitCode -ne 0 -or ($stderrText -ne "")) {
        if ($stderrText -ne "") {
            $indented = (($stderrText -split "`n") | ForEach-Object { "              $_" }) -join "`n"
            Fatal "Nuitka failed with exit code $($global:nuitkaProc.ExitCode). STDERR:`n$indented"
        } else {
            Fatal "Nuitka failed with exit code $($global:nuitkaProc.ExitCode), and no stderr output captured."
        }
    }

    $expectedExe = Join-Path (Join-Path $ScriptRoot "vessel.exe.dist") "vessel.exe"
    if (-not (Test-Path $expectedExe)) { Fatal "Build finished but vessel.exe missing?" }

    if ($UpxPath) { & upx --best --lzma $expectedExe; Ok "UPX compression completed successfully" } else { Sub "Skipping UPX compression" }

    Rename-Item -Path ".\vessel.exe.dist" -NewName "VESSEL"
    Move-Item -Path "VESSEL" -Destination $DistRoot
    Log "Final build moved to dist\VESSEL\"
}

# --- Main ---
try {
    Log "Starting build process"
    $basePython = EnsurePython311
    $venvPy = EnsureVenv -BasePython $basePython
    Install-BuildDeps -Py $venvPy
    Install-Requirements -Py $venvPy
    Ok "Completed Python and VENV setup successfully"

    $upxExe = EnsureUPX
    $gcc = DetectGCC -Py $venvPy
    Ok "UPX and GCC checks completed successfully"

    PrepareDist
    CompileNuitka -Py $venvPy -GccExe $gcc -UpxPath $upxExe

    Write-Host "`n`n=============================" -ForegroundColor Green
    Write-Host "Build complete!" -ForegroundColor Green
    Write-Host "dist\VESSEL contains exe and dependencies" -ForegroundColor Green
    Write-Host "=============================" -ForegroundColor Green
} catch { Fatal "Unhandled exception: $($_.Exception.Message)" } finally { if (-not $NoCleanup) { Cleanup } }
