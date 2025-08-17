$oldName = "REMEMBER_THE_PORT.avi"
$newName = "Research Log 1.avi"
$timestamp = Get-Date "1975-04-19 06:14:00"

# Run ffmpeg to copy video with metadata changes
ffmpeg -i $oldName -metadata title="DEAR SMILE KING - REMEMBER THE PORT SHOWN HERE" `
-metadata subtitle="Research Log 1" `
-metadata artist="HeWhoWeepsThriceButFeelsTwice" `
-metadata year="1975" `
-c copy $newName

# Set file timestamps
(Get-Item $newName).CreationTime = $timestamp
(Get-Item $newName).LastWriteTime = $timestamp
