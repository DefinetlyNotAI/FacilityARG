import subprocess
from PIL import Image, ImageDraw, ImageFont
import os

def run(cmd):
    print(f"Running: {cmd}")
    result = subprocess.run(cmd, shell=True, capture_output=True, text=True)
    if result.returncode != 0:
        print("Error:", result.stderr)
        raise Exception(f"Command failed: {cmd}")
    return result.stdout

def create_binary_image(filename="binary_frame.png"):
    binary_text = ("01010100 01101000 01101001 01110011 00100000 01101001 01110011 00100000 "
                   "01100001 00100000 01110010 01100101 01100100 00100000 01101000 01100101 "
                   "01110010 01110010 01101001 01101110 01100111 00101100 00100000 01100001 "
                   "01101100 01110100 01101000 01101111 01110101 01100111 01101000 00100000 "
                   "01110100 01101000 01100101 00100000 01110110 01101001 01100100 01100101 "
                   "01101111 00100000 01101001 01110011 00100000 01101110 01101111 01110100")
    width, height = 1920, 1080
    img = Image.new('RGB', (width, height), color='white')
    draw = ImageDraw.Draw(img)

    try:
        font = ImageFont.truetype("DejaVuSansMono.ttf", 32)
    except:
        font = ImageFont.load_default()

    bbox = draw.textbbox((0, 0), binary_text, font=font)
    text_width = bbox[2] - bbox[0]
    text_height = bbox[3] - bbox[1]

    x = (width - text_width) // 2
    y = (height - text_height) // 2
    draw.text((x, y), binary_text, fill='black', font=font)
    img.save(filename)
    print(f"Image saved as {filename}")

def main():
    input_video = "SMILE.mp4"
    binary_img = "binary_frame.png"
    binary_vid = "binary_frame.mp4"
    part1 = "part1.mp4"
    part2 = "part2.mp4"
    part1_conv = "part1_conv.mp4"
    part2_conv = "part2_conv.mp4"
    binary_vid_conv = "binary_frame_conv.mp4"
    concat_file = "inputs.txt"
    output_video = "tr33.mp4"

    timestamp = 195.025  # 3 minutes 15.025 seconds
    frame_duration = 0.033  # 1 frame at ~30fps

    # 1. Create the binary text image
    create_binary_image(binary_img)

    # 2. Split the video
    run(f"ffmpeg -y -i {input_video} -c copy -t {timestamp} {part1}")
    run(f"ffmpeg -y -i {input_video} -c copy -ss {timestamp} {part2}")

    # 3. Convert image to 1-frame video
    run(f"ffmpeg -y -loop 1 -i {binary_img} -c:v libx264 -t {frame_duration} -pix_fmt yuv420p -r 30 {binary_vid}")

    # 4. Re-encode all parts to have matching codec and params
    run(f"ffmpeg -y -i {part1} -c:v libx264 -pix_fmt yuv420p -r 30 -an {part1_conv}")
    run(f"ffmpeg -y -i {binary_vid} -c:v libx264 -pix_fmt yuv420p -r 30 -an {binary_vid_conv}")
    run(f"ffmpeg -y -i {part2} -c:v libx264 -pix_fmt yuv420p -r 30 -an {part2_conv}")

    # 5. Create concat input file
    with open(concat_file, "w") as f:
        f.write(f"file '{part1_conv}'\n")
        f.write(f"file '{binary_vid_conv}'\n")
        f.write(f"file '{part2_conv}'\n")

    # 6. Concatenate
    run(f"ffmpeg -y -f concat -safe 0 -i {concat_file} -c copy {output_video}")

    print(f"Done! Output video is {output_video}")

if __name__ == "__main__":
    main()
