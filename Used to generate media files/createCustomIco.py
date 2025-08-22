import os
import random
from PIL import Image, ImageDraw, ImageFont, ImageChops


class CorruptedIcon3:
    @staticmethod
    def _gen_icon(size=256):
        # Create base image
        img = Image.new("RGB", (size, size), "black")
        draw = ImageDraw.Draw(img)

        # Load font
        try:
            font = ImageFont.truetype("arial.ttf", size - 40)
        except Exception:
            font = ImageFont.load_default()

        # Draw number "3" centered
        bbox = font.getbbox("3")
        w, h = bbox[2] - bbox[0], bbox[3] - bbox[1]
        pos = ((size - w) // 2 - bbox[0], (size - h) // 2 - bbox[1])
        draw.text(pos, "3", font=font, fill="white")

        # Extract number region
        number_box = (pos[0], pos[1], pos[0] + w, pos[1] + h)
        number_region = img.crop(number_box)

        # RGB bleed / split effect
        r, g, b = number_region.split()
        r = ImageChops.offset(r, -5, 0)
        b = ImageChops.offset(b, 5, 0)
        split_region = Image.merge("RGB", (r, g, b))
        img.paste(split_region, number_box)

        # Heavy glitch slicing
        for _ in range(20):
            x1 = random.randint(pos[0], pos[0] + w)
            y1 = random.randint(pos[1], pos[1] + h)
            x2 = min(x1 + random.randint(10, 80), pos[0] + w)
            y2 = min(y1 + random.randint(2, 20), pos[1] + h)
            slice_ = img.crop((x1, y1, x2, y2))
            img.paste(slice_, (x1 + random.randint(-30, 30), y1))

        # Inverted random sections
        for _ in range(15):
            x1 = random.randint(0, size - 20)
            y1 = random.randint(0, size - 20)
            x2 = min(x1 + random.randint(10, 50), size)
            y2 = min(y1 + random.randint(10, 50), size)
            region = img.crop((x1, y1, x2, y2))
            region = ImageChops.invert(region)
            img.paste(region, (x1, y1))

        # Save PNG first (needed for ICO conversion)
        tmp_png = os.path.join(os.getcwd(), "number3_corrupted.png")
        img.save(tmp_png, "PNG")

        # Convert PNG to ICO
        bitmap = Image.open(tmp_png)
        icon_file = os.path.join(os.getcwd(), "number3_corrupted.ico")
        bitmap.save(icon_file, format="ICO", sizes=[(size, size)])

        return icon_file


# Usage
icon_path = CorruptedIcon3._gen_icon()
print(f"Corrupted number 3 icon saved at: {icon_path}")
