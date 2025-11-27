from PIL import Image, ImageDraw, ImageFont
import random

size = 800
bg = (10, 10, 10)
font_path = "arial.ttf"

img = Image.new("RGB", (size, size), bg)
draw = ImageDraw.Draw(img)
font = ImageFont.truetype(font_path, 260)

numbers = ["3", "15", "25"]

# Determine center position based on the largest text ("25")
bbox = draw.textbbox((0, 0), "25", font=font)
tw = bbox[2] - bbox[0]
th = bbox[3] - bbox[1]
x = (size - tw) // 2
y = (size - th) // 2

# Draw all stacked directly on top of each other at the same coordinates
for num in numbers:
    draw.text((x, y), num, font=font, fill=(255, 255, 255))

# Strong glitch with thicker slices and RGB bleed
def glitch(im, slice_height=20, shifts=40, max_shift=35):
    w, h = im.size
    base = im.copy()

    for _ in range(shifts):
        top = random.randint(0, h - slice_height)
        region = base.crop((0, top, w, top + slice_height))

        # RGB channel offsets for color bleed
        rx = random.randint(-max_shift, max_shift)
        gx = random.randint(-max_shift, max_shift)
        bx = random.randint(-max_shift, max_shift)

        r, g, b = region.split()

        r = r.transform(r.size, Image.AFFINE, (1, 0, rx, 0, 1, 0))
        g = g.transform(g.size, Image.AFFINE, (1, 0, gx, 0, 1, 0))
        b = b.transform(b.size, Image.AFFINE, (1, 0, bx, 0, 1, 0))

        region = Image.merge("RGB", (r, g, b))

        # Random horizontal shift for extra tear
        offset = random.randint(-max_shift, max_shift)
        shifted = Image.new("RGB", (w, slice_height))
        shifted.paste(region, (offset, 0))

        im.paste(shifted, (0, top))

    return im

img = glitch(img)
img.save("yt_pfp_glitched.png")

print("Saved yt_pfp_glitched.png")
