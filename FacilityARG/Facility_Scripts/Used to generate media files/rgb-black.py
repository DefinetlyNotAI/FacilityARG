from moviepy.editor import ImageClip, concatenate_videoclips
import subprocess

# === CONFIGURATION ===
image_filenames = ["red.webp", "green.webp", "blue.webp", "black.webp"]
fps = 2  # Very low fps for flashing and small size
duration_per_image = 1 / fps
total_duration = 240  # 4 minutes
repeats = int(total_duration * fps / len(image_filenames))

# === CREATE CLIPS ===
clips = []
for _ in range(repeats):
    for img in image_filenames:
        clip = ImageClip(img, duration=duration_per_image)
        clips.append(clip)

final_clip = concatenate_videoclips(clips, method="compose")
output_temp = "temp_output.mp4"
output_final = "flashing_compressed.mp4"

# === EXPORT TEMP MP4 ===
final_clip.write_videofile(output_temp, fps=fps, codec="libx264", bitrate="500k", audio=False)

# === COMPRESS WITH FFMPEG ===
subprocess.run([
    "ffmpeg", "-y", "-i", output_temp,
    "-c:v", "libx264", "-preset", "slow", "-crf", "32",
    "-movflags", "+faststart",
    "-pix_fmt", "yuv420p",
    output_final
])

print(f"✅ Final compressed video saved as: {output_final}")
