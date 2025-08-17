from PIL import Image, ImageDraw

def text_to_upscaled_binary_image(text, filename="qr-doppelganger.png"):
    # Step 1: Convert to 8-bit binary string
    binary_str = ''.join(format(ord(c), '08b') for c in text)
    binary_str = binary_str[:64].ljust(64, '0')
    print(binary_str)

    # Step 2: Convert to binary grid (no inversion)
    grid = [int(b) for b in binary_str]
    grid_2d = [grid[i:i+8] for i in range(0, 64, 8)]

    # Step 3: Create new 500x500 image with grey background
    pixel_size = 60
    spacing = 2
    image_size = (8 * pixel_size + 9 * spacing, 8 * pixel_size + 9 * spacing)
    img = Image.new("RGB", image_size, color=(128, 128, 128))  # Gray background
    draw = ImageDraw.Draw(img)

    # Step 4: Draw pixels with spacing
    for y in range(8):
        for x in range(8):
            color = (0, 0, 0) if grid_2d[y][x] == 1 else (255, 255, 255)
            top_left = (
                x * pixel_size + (x + 1) * spacing,
                y * pixel_size + (y + 1) * spacing
            )
            bottom_right = (
                top_left[0] + pixel_size,
                top_left[1] + pixel_size
            )
            draw.rectangle([top_left, bottom_right], fill=color)

    # Step 5: Save image
    img = img.resize((500, 500), resample=Image.NEAREST)  # Sharp upscaling
    img.save(filename)
    print(f"Saved upscaled 8x8 image as: {filename}")


text_to_upscaled_binary_image("Echoes")
