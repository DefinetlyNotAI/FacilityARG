import os
import math
import random
from PIL import Image, ImageDraw

# Output folder
output_dir = "img/crack"
os.makedirs(output_dir, exist_ok=True)

# Screen parameters
width, height = 800, 600
num_frames = 7

# Crack parameters
num_radial = 7           # main cracks from impact
radial_step = 40         # pixels per frame
radial_deviation = 0.05  # radians
branch_chance = 0.3
branch_angle_range = math.pi / 4
tangential_chance = 0.25
tangential_length = 10
micro_chance = 0.2

# Impact point
impact = (width//2 + random.randint(-30,30), height//2 + random.randint(-30,30))

# Crack data structures
radial_cracks = []
tangential_cracks = []

# Initialize radial cracks
for i in range(num_radial):
    angle = i * 2*math.pi/num_radial + random.uniform(-0.1,0.1)
    radial_cracks.append({
        'start': impact,
        'angle': angle,
        'length': 0,
        'path': [impact]
    })

def grow_radial(crack):
    """Extend radial crack by one step with slight deviation."""
    x0, y0 = crack['path'][-1]
    angle = crack['angle'] + random.uniform(-radial_deviation, radial_deviation)
    x1 = int(x0 + radial_step * math.cos(angle))
    y1 = int(y0 + radial_step * math.sin(angle))
    x1 = max(0, min(width-1, x1))
    y1 = max(0, min(height-1, y1))
    crack['path'].append((x1, y1))
    crack['length'] += radial_step
    crack['angle'] = angle
    return (x1, y1)

def generate_branches(crack):
    """Generate branches at the tip of radial cracks."""
    branches = []
    if random.random() < branch_chance:
        tip = crack['path'][-1]
        branch_angle = crack['angle'] + random.uniform(-branch_angle_range, branch_angle_range)
        branches.append({
            'start': tip,
            'angle': branch_angle,
            'length': 0,
            'path': [tip]
        })
    return branches

def generate_tangential(crack):
    """Generate small perpendicular tangential cracks along radial cracks."""
    tangents = []
    for pt in crack['path']:
        if random.random() < tangential_chance:
            angle = crack['angle'] + math.pi/2 * random.choice([-1,1])
            x0, y0 = pt
            x1 = int(x0 + tangential_length * math.cos(angle))
            y1 = int(y0 + tangential_length * math.sin(angle))
            x1 = max(0, min(width-1, x1))
            y1 = max(0, min(height-1, y1))
            tangents.append({'path': [pt, (x1, y1)]})
    return tangents

# Simulation frames
for frame in range(1, num_frames+1):
    img = Image.new("RGBA", (width, height), (255,255,255,0))
    draw = ImageDraw.Draw(img)

    # Grow radial cracks
    new_branches = []
    for crack in radial_cracks:
        grow_radial(crack)
        new_branches.extend(generate_branches(crack))
    radial_cracks.extend(new_branches)

    # Generate tangential cracks for all radial cracks
    tangential_cracks = []
    for crack in radial_cracks:
        tangential_cracks.extend(generate_tangential(crack))

    # Draw radial cracks
    for crack in radial_cracks:
        if len(crack['path']) > 1:
            draw.line(crack['path'], fill=(0,0,0,255), width=2)

    # Draw tangential cracks
    for tcrack in tangential_cracks:
        draw.line(tcrack['path'], fill=(0,0,0,255), width=1)

    # Save frame
    img.save(f"{output_dir}/{frame}.png")
    print(f"Generated frame {frame}")

print("CRT-style radial+tangential progressive glass cracks generated!")
