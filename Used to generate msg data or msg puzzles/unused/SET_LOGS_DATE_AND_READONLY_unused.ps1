$targetDate = Get-Date "2525-03-15T00:00:00"

Get-ChildItem -File | ForEach-Object {
    try {
        # Set CreationTime and LastWriteTime
        $_.CreationTime = $targetDate
        $_.LastWriteTime = $targetDate

        # Set LastAccessTime also just for consistency (optional)
        $_.LastAccessTime = $targetDate

        # Make file read-only
        $_.IsReadOnly = $true

        Write-Host "Updated file:" $_.Name
    }
    catch {
        Write-Warning "Failed on file: $($_.Name) - $_"
    }
}
