from PIL import Image, ImageEnhance, ImageOps, ImageFilter
import numpy as np
import random

def apply_film_grain(img, intensity=0.5):
    """Apply heavy realistic grain (film emulsion-style)"""
    width, height = img.size
    grain = np.random.normal(0, 30 * intensity, (height, width, 1))
    grain = np.repeat(grain, 3, axis=2)
    
    img_np = np.array(img).astype(np.float32)
    img_np += grain
    img_np = np.clip(img_np, 0, 255).astype(np.uint8)

    return Image.fromarray(img_np)

def channel_shift(img, r_offset=0, g_offset=1, b_offset=-1):
    """Simulate chemical aging via channel shifting"""
    r, g, b = img.split()
    r = ImageChops.offset(r, r_offset, 0)
    g = ImageChops.offset(g, g_offset, 0)
    b = ImageChops.offset(b, b_offset, 0)
    return Image.merge("RGB", (r, g, b))

def burn_edges(img, strength=0.9):
    """Apply a radial burn vignette"""
    width, height = img.size
    vignette = Image.new("L", (width, height), 0)
    for y in range(height):
        for x in range(width):
            dx = x - width/2
            dy = y - height/2
            dist = (dx*dx + dy*dy)**0.5
            max_dist = (width**2 + height**2)**0.5 / 2
            intensity = 255 - int((dist / max_dist)**2 * 255 * strength)
            vignette.putpixel((x, y), max(0, intensity))
    black_layer = Image.new("RGB", (width, height), (0, 0, 0))
    return Image.composite(img, black_layer, vignette)

def color_tint(img, tint=(230, 220, 180)):
    """Apply yellowish aged tint"""
    return Image.blend(img, Image.new("RGB", img.size, tint), 0.2)

def age_photo(img):
    img = img.convert("RGB")
    img = ImageOps.autocontrast(img, cutoff=5)
    img = color_tint(img)
    img = ImageEnhance.Color(img).enhance(0.4)  # desaturate
    img = apply_film_grain(img, intensity=0.6)
    img = img.filter(ImageFilter.GaussianBlur(0.8))
    img = burn_edges(img)
    return img

def process(input_path, output_path):
    img = Image.open(input_path)
    aged = age_photo(img)
    aged.save(output_path)
    print(f"[+] Saved to: {output_path}")

# Example usage
if __name__ == "__main__":
    process("facility.png", "facility_old.png")
