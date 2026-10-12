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
            if ($Verbose) { Sub "Removed: $p" }
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

# --- Remove bloat modules before Nuitka ---
function Remove-BloatModules {
    $bloatPaths = @(
        (Join-Path $VenvDir "Lib\site-packages\colorama\tests"),   # directory
        (Join-Path $VenvDir "Lib\site-packages\numpy\conftest.py") # file
    )

    foreach ($p in $bloatPaths) {
        if (Test-Path $p) {
            if (Get-Item $p -ErrorAction SilentlyContinue | Where-Object { $_.PSIsContainer }) {
                Remove-Item $p -Recurse -Force -ErrorAction SilentlyContinue
                if ($Verbose) { Sub "Removed bloat directory: $p" }
            } else {
                Remove-Item $p -Force -ErrorAction SilentlyContinue
                if ($Verbose) { Sub "Removed bloat file: $p" }
            }
        } else {
            if ($Verbose) { Sub "Bloat path not found, skipping: $p" }
        }
    }
}


# --- Compile Nuitka with maximal verbose output ---
function CompileNuitka([string]$Py, [string]$GccExe, [string]$UpxPath) {
    Log "Preparing to remove bloat modules for anti-bloat optimization"
    Remove-BloatModules

    Log "Compiling with Nuitka"
    $nuitkaOut = Join-Path $TempRoot "nuitka.out"
    $nuitkaErr = Join-Path $TempRoot "nuitka.err"
    Remove-Item -Path $nuitkaOut -ErrorAction SilentlyContinue
    Remove-Item -Path $nuitkaErr -ErrorAction SilentlyContinue

    # Base paths
    $venvRoot = Split-Path (Split-Path $VenvPython -Parent) -Parent
    $pyqtBase = Join-Path $venvRoot "Lib\site-packages\PyQt6\Qt6"
    if ($Verbose) { Sub "PyQt6 base assumed at: $pyqtBase" }

    $nuitkaArgs = @(
        "--standalone",
        "--remove-output",
        "--mingw64",
        "--lto=yes",
        "--windows-icon-from-ico=resources/extra/number3_corrupted.ico",

        # Explicit packages
        "--include-package=edge_tts",
        "--include-package=pygame",
        "--include-package=datetime",
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

        # Project data
        "--include-data-dir=vessel/data=./vessel/data",

        # Enable Nuitka's PyQt6 & tkinter plugin (handles DLLs/plugins)
        "--enable-plugin=pyqt6",
        "--enable-plugin=tk-inter",
        $NuitkaTarget
    )

    $startArgs = @("-m", "nuitka") + $nuitkaArgs

    if ($Verbose) {
        Log "Running Nuitka compilation with live output..."
        & $Py @startArgs
        if ($LASTEXITCODE -ne 0) { Fatal "Nuitka compilation failed with exit code $LASTEXITCODE" }
    } else {
        Log "Running Nuitka compilation quietly (tailing output)..."
        Sub "You may not be able to exit the script while running"
        $global:nuitkaProc = Start-Process -FilePath $Py -ArgumentList $startArgs -NoNewWindow -PassThru `
            -RedirectStandardOutput $nuitkaOut -RedirectStandardError $nuitkaErr

        while (-not $global:nuitkaProc.HasExited) {
            if (Test-Path $nuitkaOut) {
                Get-Content $nuitkaOut -Tail 20 | ForEach-Object { Write-Host $_ -ForegroundColor Gray }
            }
            Start-Sleep -Milliseconds 250
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
    }

    $expectedExe = Join-Path (Join-Path $ScriptRoot "vessel.exe.dist") "vessel.exe"
    if (-not (Test-Path $expectedExe)) { Fatal "Build finished but vessel.exe missing?" }

    if ($UpxPath) {
        & upx --best --lzma $expectedExe
        Ok "UPX compression completed successfully"
    } else {
        Sub "Skipping UPX compression"
    }

    # Move vessel.exe.dist into dist first
    Move-Item -Path ".\vessel.exe.dist" -Destination $DistRoot
    Rename-Item -Path (Join-Path $DistRoot "vessel.exe.dist") -NewName "VESSEL"

    # Copy extra resources into dist
    $extras = @(
        "resources/extra/Tribute_to_a_supporter_and_a_friend.zip",
        "resources/extra/README.txt"
    )
    foreach ($file in $extras) {
        Copy-Item -Path $file -Destination $DistRoot -Force
        if ($Verbose) { Sub "Copied extra file: $file" }
    }

    Log "Final build moved to dist\VESSEL\ and extras copied"
}


# --- Main ---
try {
    Log "Starting build process"
    if ($Verbose) {
        Sub "Following paths will be used:"
        Sub "- Python 3.11;"
        Sub "  - Local Python 3.11 path    => $TempPython"
        Sub "  - Local Python VENV path    => $VenvDir"
        Sub "  - Requirements.txt file     => $Requirements"
        Sub "  - Nuitka Target             => $NuitkaTarget"
        Sub "- Dist root path              => $DistRoot"
        Sub "- Local UPX path              => $LocalUpxDir"
        Sub "- Compiler path (this script) => $ScriptRoot`n"
        if ($NoCleanup) { Sub "NoCleanup enabled, build artifacts will remain after completion" }
        if ($NoUpx) { Sub "NoUpx enabled, UPX compression will be skipped - Not preferred" }
        if ($NoDownload) { Sub "NoDownload enabled, no external downloads will be performed - Not preferred" }
    }

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

    if (-not $NoCleanup) { Cleanup }

    Write-Host "`n`n=============================" -ForegroundColor Green
    Write-Host "Build complete!" -ForegroundColor Green
    Write-Host "dist\VESSEL contains exe and dependencies" -ForegroundColor Green
    Write-Host "=============================" -ForegroundColor Green
} catch { Fatal "Unhandled exception: $($_.Exception.Message)" }
