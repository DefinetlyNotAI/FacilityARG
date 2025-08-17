import os
import platform
import random
import time
from datetime import datetime
from subprocess import run

import cv2
import numpy as np
from PIL import Image
from moviepy.editor import ImageSequenceClip, AudioFileClip

# === CONFIG ===
FPS = 2
DURATION = 7.5
FRAME_COUNT = int(DURATION * FPS)
RESOLUTION = (1280, 720)  # Width, Height
file_path = "tree.report.mkv"
target_date = datetime(2525, 3, 15, 12, 0, 0)  # Noon for consistency
timestamp = time.mktime(target_date.timetuple())


# === LOAD & RESIZE UTILS ===
def load_and_fit(img_path, size):
    img = Image.open(img_path).convert("RGBA")
    img.thumbnail(size, Image.Resampling.LANCZOS)

    # Create white background
    bg = Image.new("RGBA", size, (255, 255, 255, 255))
    x = (size[0] - img.width) // 2
    y = (size[1] - img.height) // 2
    bg.paste(img, (x, y), img)
    return cv2.cvtColor(np.array(bg.convert("RGB")), cv2.COLOR_RGB2BGR)


def add_vhs_glitch(img):
    glitched = img.copy()

    # Channel shift
    for i in range(3):
        offset = random.randint(-5, 5)
        glitched[:, :, i] = np.roll(glitched[:, :, i], offset, axis=1)

    # Tearing lines
    for _ in range(random.randint(1, 2)):
        y = random.randint(0, glitched.shape[0] - 10)
        h = random.randint(5, 20)
        offset = random.randint(-40, 40)
        glitched[y:y + h] = np.roll(glitched[y:y + h], offset, axis=1)

    # Noise
    noise = np.random.randint(0, 25, glitched.shape, dtype='uint8')
    glitched = cv2.add(glitched, noise)

    return glitched


# === FRAME GENERATION ===
frames = []

# Load flashing images
flash_imgs = [load_and_fit(f'25-{i}.png', RESOLUTION) for i in [1, 2, 3]]
timer_img = load_and_fit('timer.png', RESOLUTION)

# First 3 frames: timer.png on white
for _ in range(3):
    frames.append(add_vhs_glitch(timer_img))

# Next 12 frames: flashing images
for _ in range(12):
    img = random.choice(flash_imgs)
    frames.append(add_vhs_glitch(img))

# Convert to RGB for MoviePy
frames_rgb = [cv2.cvtColor(f, cv2.COLOR_BGR2RGB) for f in frames]

# === CREATE VIDEO ===
audio = AudioFileClip("broken.mp3").subclip(0, DURATION)
clip = ImageSequenceClip(frames_rgb, fps=FPS).set_audio(audio)
clip.write_videofile("tree_temp.mkv", codec="libx264", audio_codec="aac")

# === CORRUPT METADATA ===
corrupted_meta = {
    "title": "␀␛[TR33:corrupt]␓",
    "comment": "DATA_LOSS (0x3F0009)",
    "genre": "██████████",
}

meta_args = []
for k, v in corrupted_meta.items():
    meta_args.extend(["-metadata", f"{k}={v}"])

run([
    "ffmpeg", "-i", "tree_temp.mkv",
    *meta_args,
    "-c", "copy",
    "tree.report.mkv"
], check=True)

os.remove("tree_temp.mkv")

# === Set modification & access times (Unix + Windows) ===
os.utime(file_path, (timestamp, timestamp))

# === Windows-specific: Set creation time too ===
if platform.system() == 'Windows':
    import pywintypes
    import win32file
    import win32con

    win_time = pywintypes.Time(target_date)
    handle = win32file.CreateFile(
        file_path,
        win32con.GENERIC_WRITE,
        0,
        None,
        win32con.OPEN_EXISTING,
        win32con.FILE_ATTRIBUTE_NORMAL,
        None
    )
    win32file.SetFileTime(handle, win_time, win_time, win_time)
    handle.close()
