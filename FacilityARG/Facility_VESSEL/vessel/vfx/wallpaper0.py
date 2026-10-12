import ctypes
import os
import random

from PIL import Image, ImageDraw, ImageFont, ImageChops


class WallPaper0:
    # noinspection PyTypeChecker
    @staticmethod
    def _gen_wallpaper():
        W, H = 1920, 1080
        Image.new("RGB", (W, H), "black")

        # Fonts
        try:
            big_font = ImageFont.truetype("arial.ttf", 600)
            small_font = ImageFont.truetype("consola.ttf", 20)
        except Exception:
            big_font = ImageFont.load_default()
            small_font = ImageFont.load_default()

        hex_text = "50 52 41 49 53 45 20 42 45"

        # Measure hex text size to tile properly
        hex_bbox = small_font.getbbox(hex_text)
        hex_w = hex_bbox[2] - hex_bbox[0]
        hex_h = hex_bbox[3] - hex_bbox[1]

        # Draw tiled hex background
        bg = Image.new("RGB", (W, H), "black")
        bg_draw = ImageDraw.Draw(bg)
        for y in range(0, H, hex_h + 5):  # add small padding
            for x in range(0, W, hex_w + 10):
                bg_draw.text((x, y), hex_text, font=small_font, fill=(80, 80, 80))

        # Flip background upside down
        bg = bg.transpose(Image.Transpose.ROTATE_180)

        # Copy to final image
        final = bg.copy()

        # Draw the big "0"
        bbox = big_font.getbbox("0")
        w, h = bbox[2] - bbox[0], bbox[3] - bbox[1]
        pos = ((W - w) // 2 - bbox[0], (H - h) // 2 - bbox[1])
        draw_final = ImageDraw.Draw(final)
        draw_final.text(pos, "0", font=big_font, fill="white")

        # Extract 0 region
        zero_box = ((W - w) // 2, (H - h) // 2, (W + w) // 2, (H + h) // 2)
        zero_region = final.crop(zero_box)

        # Apply RGB bleed
        r, g, b = zero_region.split()
        r = ImageChops.offset(r, -5, 0)  # red shift left
        b = ImageChops.offset(b, 5, 0)  # blue shift right
        zero_glitch = Image.merge("RGB", (r, g, b))
        final.paste(zero_glitch, zero_box)

        # Heavy glitch slicing on "0"
        for _ in range(30):
            x1 = random.randint(pos[0], pos[0] + w)
            y1 = random.randint(pos[1], pos[1] + h)
            x2 = min(x1 + random.randint(20, 200), pos[0] + w)
            y2 = min(y1 + random.randint(2, 20), pos[1] + h)
            slice_ = final.crop((x1, y1, x2, y2))
            final.paste(slice_, (x1 + random.randint(-50, 50), y1))

        # Save in script directory
        script_dir = os.path.dirname(os.path.abspath(__file__))
        os.makedirs(script_dir, exist_ok=True)
        save_path = os.path.join(script_dir, "wallpaper0.bmp")
        final.save(save_path, "BMP")

        return save_path

    @staticmethod
    def _set_wallpaper(image_path):
        # noinspection PyUnresolvedReferences
        ctypes.windll.user32.SystemParametersInfoW(20, 0, image_path, 3)

    def create(self):
        wallpaper_path = self._gen_wallpaper()
        self._set_wallpaper(wallpaper_path)
