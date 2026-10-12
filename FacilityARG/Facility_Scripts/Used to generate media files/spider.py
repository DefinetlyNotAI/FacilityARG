from moviepy.editor import ImageClip, concatenate_videoclips
import subprocess

# === CONFIGURATION ===
fps = 1  # very low FPS is fine since it's just stills
output_temp = "spider_temp.mp4"
output_final = "spider_sequence_compressed.mp4"

# === CLIP DEFINITIONS ===
clips = [
    ImageClip("spider.png", duration=3),
    ImageClip("spider1.png", duration=5),
    ImageClip("spider2.png", duration=5),
    ImageClip("spider3.png", duration=5),
    ImageClip("spider.png", duration=3)
]

# === COMBINE CLIPS ===
final_clip = concatenate_videoclips(clips, method="compose")

# === WRITE TEMP VIDEO ===
final_clip.write_videofile(output_temp, fps=fps, codec="libx264", bitrate="500k", audio=False)

# === COMPRESS FINAL VIDEO ===
subprocess.run([
    "ffmpeg", "-y", "-i", output_temp,
    "-c:v", "libx264", "-preset", "slow", "-crf", "32",
    "-movflags", "+faststart",
    "-pix_fmt", "yuv420p",
    output_final
])

print(f"✅ Final compressed video saved as: {output_final}")
