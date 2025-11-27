from PIL import Image, ImageDraw, ImageFont
import random

# Settings
width, height = 2048, 1152
bg_color = (15, 15, 15)  # Dark background
numbers = ["3", "15", "25"]
font_path = "arial.ttf"  # Path to a .ttf font
font_size = 350  # Reduced size for mobile-safe viewing
glitch_amount = 15  # Glitch thickness
easter_eggs = ["VESSEL", "TAS", "TR33"]  # Hidden texts

# Create image
img = Image.new("RGB", (width, height), bg_color)
draw = ImageDraw.Draw(img)
font = ImageFont.truetype(font_path, font_size)

# Center coordinates
center = width // 2, height // 2

# Draw stacked numbers
for num in numbers:
    # Main number
    w, h = draw.textbbox((0, 0), num, font=font)[2:]  # width, height
    position = (center[0] - w // 2, center[1] - h // 2)
    draw.text(position, num, font=font, fill=(255, 255, 255))

    # Glitch effect
    for _ in range(glitch_amount):
        offset_x = random.randint(-25, 25)
        offset_y = random.randint(-15, 15)
        color = (
            random.randint(100, 255),
            random.randint(50, 255),
            random.randint(50, 255),
        )
        draw.text((position[0]+offset_x, position[1]+offset_y), num, font=font, fill=color)

# Add subtle Easter eggs
for text in easter_eggs:
    for _ in range(8):
        x = random.randint(0, width-200)
        y = random.randint(0, height-100)
        color = (
            random.randint(20, 70),
            random.randint(20, 70),
            random.randint(20, 70),
        )
        draw.text((x, y), text, font=font.font_variant(size=50), fill=color)

# Save
img.save("youtube_banner_glitch_safe.png")
print("Banner generated: youtube_banner_glitch_safe.png")
