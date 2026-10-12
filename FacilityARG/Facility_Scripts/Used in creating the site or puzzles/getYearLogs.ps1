$years = @(1975, 1995, 2010, 2015, 2017)
$root = Get-Location

foreach ($year in $years) {
    $folder = Join-Path $root $year
    if (-not (Test-Path $folder)) { continue }

    # Extract numbers from filenames like error_log_{number}.ext
    $numbers = Get-ChildItem -Path $folder -File | ForEach-Object {
        if ($_ -match 'error_log_(\d+)\.') { [int]$matches[1] }
    } | Sort-Object

    $numbersText = if ($numbers.Count -gt 0) { ($numbers -join ', ') } else { 'none' }
    Write-Output "$year = {$numbersText}"
}
