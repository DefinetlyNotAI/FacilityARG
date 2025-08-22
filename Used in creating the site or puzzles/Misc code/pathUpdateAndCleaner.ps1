# Requires admin
$mingwPaths = @(
    "C:\msys64\mingw32\bin",
    "C:\msys64\mingw64\bin"
)

$regPath = "HKLM:\SYSTEM\CurrentControlSet\Control\Session Manager\Environment"
$currentPath = (Get-ItemProperty -Path $regPath -Name Path).Path

# Split and trim
$pathArray = $currentPath.Split(";") | ForEach-Object { ($_ -replace "[\\]+$","").Trim() } | Where-Object { $_ -ne "" }

$removedEntries = @()
$finalPaths = @()

foreach ($p in $pathArray) {
    if ((Test-Path $p -PathType Container) -or (Test-Path $p -PathType Leaf)) {
        if (-not ($finalPaths -contains $p)) { $finalPaths += $p }
        else { $removedEntries += $p } # duplicate
    } else {
        $removedEntries += $p
    }
}

# Add MSYS2 paths if they exist
foreach ($p in $mingwPaths) {
    if ((Test-Path $p -PathType Container) -and (-not ($finalPaths -contains $p))) {
        $finalPaths += $p
    }
}

# Print removed in yellow
foreach ($r in $removedEntries) {
    Write-Host "Removed PATH entry: $r" -ForegroundColor Yellow
}

# Update system PATH
$newPath = ($finalPaths -join ";")
Set-ItemProperty -Path $regPath -Name Path -Value $newPath

Write-Host "System PATH updated successfully."
Write-Host "New PATH:"
Write-Host $newPath
