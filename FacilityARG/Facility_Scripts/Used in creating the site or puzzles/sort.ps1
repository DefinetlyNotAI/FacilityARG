# Sort-Zip-Hash.ps1
# Sorts all files in the current directory into year folders,

$yearDirs = @(1975, 1995, 2010, 2015, 2017)
$root = Get-Location

# Create directories if not exist
foreach ($year in $yearDirs) {
    $dir = Join-Path $root $year
    if (-not (Test-Path $dir)) {
        New-Item -ItemType Directory -Path $dir | Out-Null
    }
}

# Sort files (simple distribution by last modified year)
Get-ChildItem -File | ForEach-Object {
    $fileYear = $_.LastWriteTime.Year
    $targetDir = $null

    switch ($fileYear) {
        {$_ -lt 1980} { $targetDir = "1975"; break }
        {$_ -lt 2000} { $targetDir = "1995"; break }
        {$_ -lt 2012} { $targetDir = "2010"; break }
        {$_ -lt 2016} { $targetDir = "2015"; break }
        default        { $targetDir = "2017" }
    }

    Move-Item -Path $_.FullName -Destination (Join-Path $root $targetDir)
}
