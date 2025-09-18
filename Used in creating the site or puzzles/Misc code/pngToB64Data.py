import os
import base64

# Directories
input_dir = "img/crack"
output_dir = "crack/data"

# Make sure output directory exists
os.makedirs(output_dir, exist_ok=True)

# Loop over images 1.png to 7.png
for i in range(1, 8):
    input_path = os.path.join(input_dir, f"{i}.png")
    output_path = os.path.join(output_dir, f"{i}.data.png.b64")

    if not os.path.isfile(input_path):
        print(f"Warning: {input_path} does not exist, skipping.")
        continue

    # Read image and encode as base64
    with open(input_path, "rb") as f:
        image_bytes = f.read()
        encoded = base64.b64encode(image_bytes).decode("utf-8")

    # Write base64 to output file
    with open(output_path, "w") as f:
        f.write(encoded)

    print(f"Converted {input_path} -> {output_path}")
