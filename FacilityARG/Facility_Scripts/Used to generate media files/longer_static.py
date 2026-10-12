import subprocess

# Input and output filenames
input_file = "moyo.mp3"
output_file = "moyo_long.mp3"

# FFmpeg command to loop the input 121 times
cmd = [
    "ffmpeg",
    "-stream_loop", "120",  # 120 loops + original = 241 total
    "-i", input_file,
    "-c", "copy",          # copy codec to avoid re-encoding
    output_file
]

# Run the command
subprocess.run(cmd)
