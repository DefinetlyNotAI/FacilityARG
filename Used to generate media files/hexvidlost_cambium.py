import os
import textwrap
from PIL import Image, ImageDraw, ImageFont
from moviepy.editor import ImageSequenceClip, AudioFileClip, concatenate_videoclips
from moviepy.video.fx.all import loop

# === CONFIGURATION ===
OUTPUT_VIDEO = "CambiumKnothole.mp4"
FRAME_SIZE = (64, 64)
FPS = 1
AUDIO_FILE = "wol.mp3"

# === SECRET MESSAGE ===
message = """
They buried the first Vessel under the tree.
It bloomed once.
Then never again.
Its rings record screams.
We cut it open. It remembered.
""".strip()

# === INTRO RIDDLE TEXT ===
riddle_text = "Six letters speak,\nthree colors repeat.\nThe answer lies in\nlight unseen."

# === Convert message to RGB triplets ===
def message_to_rgb_triplets(text):
    hex_str = text.encode('utf-8').hex()
    chunks = textwrap.wrap(hex_str, 6)
    rgb_values = []
    for chunk in chunks:
        chunk = chunk.ljust(6, '0')
        r = int(chunk[0:2], 16)
        g = int(chunk[2:4], 16)
        b = int(chunk[4:6], 16)
        rgb_values.append((r, g, b))
    return rgb_values

# === Generate solid color frames ===
def generate_color_frames(rgb_list, output_folder="frames"):
    os.makedirs(output_folder, exist_ok=True)
    frame_paths = []
    for idx, rgb in enumerate(rgb_list):
        img = Image.new("RGB", FRAME_SIZE, rgb)
        path = os.path.join(output_folder, f"frame_{idx+5:03}.png")  # offset by 5 for intro
        img.save(path)
        frame_paths.append(path)
    return frame_paths


# === Create video from frames and loop audio ===
def create_video_with_audio(message_frames, audio_path, output_path, fps=1):
    # Combine intro + message
    clip = ImageSequenceClip(message_frames, fps=fps)

    # Audio: loop to match non-intro section
    message_duration = len(message_frames) / fps
    audio = AudioFileClip(audio_path)
    if audio.duration < message_duration:
        audio = audio.fx(loop, duration=message_duration)

    # Pad 5 seconds of silence
    audio = audio.set_start(5)
    final = clip.set_audio(audio.set_duration(clip.duration))
    final.write_videofile(output_path, codec="libx264", audio_codec="aac")

# === MAIN ===
if __name__ == "__main__":
    print("[+] Encoding message to RGB...")
    rgb_data = message_to_rgb_triplets(message)

    print("[+] Generating intro (riddle) frames...")

    print(f"[+] Generating {len(rgb_data)} solid color message frames...")
    message_files = generate_color_frames(rgb_data)

    print("[+] Creating final video with audio...")
    create_video_with_audio(message_files, AUDIO_FILE, OUTPUT_VIDEO)

    print(f"[✓] Done! Output saved as: {OUTPUT_VIDEO}")
