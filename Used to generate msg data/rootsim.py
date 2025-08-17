import ctypes
import os
import sys
import time
import turtle

from PIL import Image, ImageDraw

# ========== CONFIGURATION ==========
leaf_file = "leaf.txt"
sapling_file = "sapling.png"
grow_file = "grow.png"

message = "Thou art far too greedy... and for thy sin, thou shalt suffer a fate most unkind."

THE_LEAF = """---------------------------------------------------------------------


I stand without a soul, yet I breathe with every breath you take.
My arms reach wide, but never touch the sky—they only pretend.
I wear a crown yet have no mind to rule,
My roots drink from darkness but fear the light.

I am not alive, yet I die in your mind if you forget me.
I hold memories in rings no eye can see,
A silent witness to time's cruel trick—
What am I, that lives between earth and thought?


---------------------------------------------------------------------


willow  sapling  maple  pine  leaf  hazel  needle  lumber  branch  cedar  leaf  sap  leaf  canopy  moss  sapling  lichen  photosynthesis  redwood  root  deciduous  cherry  needle  sapling  wood  spruce  pollen  sap  bark  poplar  sapling  moss  needle  twig  seed  poplar  hazel  elm  bark  forest  pine  sequoia  fir  birch  pollen  branch  willow  sap  pollen  oak  pollen  birch  maple  stump  oak  willow  fir  pine  sapling  photosynthesis  twig  photosynthesis  twig  ash  elm  willow  hazel  canopy  moss  root  grove  redwood  pine  trunk  twig  hazel  moss  sap  branch  lumber  hazel  fir  redwood  root  lichen  grove  stump  pine  elm  branch  ash  forest  deciduous  hazel  grove  root  wood  pollen  oak  root  redwood  leaf  forest  wood  elm  sequoia  spruce  stump  root  needle  deciduous  evergreen  cypress  sequoia  willow  hazel  sequoia  photosynthesis  cherry  forest  redwood  grove  spruce  needle  lichen  root  pollen  cypress  fir  trunk  grove  redwood  seed  trunk  redwood  twig  bark  lumber  redwood  evergreen  twig  shade  deciduous  seed  ash  trunk  grove  willow  trunk  cypress  ash  seed  spruce  grove  bark  needle  moss  shade  redwood  shade  branch  shade  cedar  wood  sapling  leaf  cherry  deciduous  hazel  cypress  pine  leaf  pine  sap  shade  trunk  cedar  pine  sapling  ash  redwood  lichen  cherry  cypress  
elm  sap  wood  hazel  wood  oak  hazel  
leaf  moss  root  birch  ash  root  needle forest  canopy 
evergreen  forest  ash  elm needle ash
photosynthesis  poplar 
moss  stump  seed  acorn  cypress cherry 
acorn  needle  pollen  cypress  sap 
sequoia  poplar  bark  cypress  forest  leaf 
cypress  birch 
branch  twig  branch  cherry  needle  seed 
needle  lumber  twig  elm  pine  moss 
bark  branch  twig 
spruce  bark  redwood  deciduous  sapling 
leaf  willow  bark  grove  sapling 
wood  leaf  cherry  deciduous  evergreen 
cypress  acorn  root  elm 
pollen  spruce  leaf  sap  branch  sequoia 
poplar  pollen  bark  root  pine  canopy 
lumber  cherry  pine  leaf  lumber 
sapling  pollen  acorn 
twig  pine  sap  birch 
shade  stump  cherry 
pollen  canopy  trunk  cherry  lumber  ash 
trunk  grove  shade  seed 
needle  photosynthesis  wood  grove  twig 
cherry  forest 
canopy  photosynthesis  needle 
grove  poplar  lumber  acorn  cherry 
sapling  stump  twig  root  wood  hazel 
evergreen  seed  photosynthesis 
moss  lichen  root 
poplar  sequoia  sap  shade 
birch  spruce  hazel 
moss  shade  elm 
lumber  shade  cedar  sequoia  oak 
trunk  deciduous  elm  pine  ash  cedar 
ash  fir  deciduous  redwood 
bark  wood  seed  forest 
root  branch  sap  photosynthesis  sap 
trunk  grove  willow 
lichen  lumber  elm  willow  acorn  forest 
seed  lichen  bark  moss 
ash  moss  maple  shade 
fir  spruce  elm  lichen  pollen  moss 
willow  birch  sap  lichen  hazel 
deciduous  ash  pollen  fir  forest  root 
deciduous  stump  cedar 
deciduous  acorn 
willow  root  canopy  oak  hazel  grove 
leaf  willow  sapling 
deciduous  photosynthesis  pollen 
fir  photosynthesis 
ash  twig  lichen 
sequoia  willow  forest  grove  cherry 
acorn  deciduous  fir 
pine  stump  deciduous  elm 
grove  elm  lichen  grove  twig  acorn  cherry 
ash  branch  poplar 
photosynthesis  deciduous 
photosynthesis  trunk  needle 
moss  lichen  deciduous  moss 
needle  spruce  lichen  willow  leaf  stump 
moss  sap  evergreen 
spruce  hazel  moss 
pollen  seed  elm  bark  sequoia  canopy  elm 
forest  sequoia  spruce 
evergreen  forest  lichen 
cedar  bark  grove  seed 
sapling  willow  poplar 
photosynthesis  pollen 
sapling  oak  cherry 
hazel  maple  sap  sequoia 
photosynthesis  sapling 
forest  ash  leaf  spruce  deciduous  pollen 
cherry  evergreen  cedar  pine  elm  stump 
photosynthesis  cherry 
forest  redwood 
poplar  acorn  ash 
pollen  hazel  cedar  branch  grove 
willow  elm  lumber  stump  cedar  poplar 
grove  bark  needle 
lumber  shade  deciduous  bark  ash 
redwood  root  cherry  sapling 
grove  branch  acorn 
sap  lumber  poplar  leaf  fir  sap 
hazel  fir  ash  sap 
lumber  redwood  elm  redwood  needle 
oak  deciduous  needle  stump 
needle  cypress  lumber 
forest  redwood  oak  ash 
photosynthesis  lumber  stump  trunk 
oak  redwood  forest  canopy  spruce 
photosynthesis  root  elm  twig  photosynthesis 
willow  acorn  redwood  sapling  cypress 
evergreen  seed 
sequoia  cedar  acorn  cherry  ash  lichen 
moss  seed  shade  root 
pine  sap  shade  branch  lumber  sequoia 
sapling  pine  twig  fir 
canopy  forest  willow  oak 
cherry  root  deciduous  spruce  lichen 
cedar  moss  oak  wood  fir  maple  lichen 
leaf  cedar  bark  branch 
branch  canopy  maple  root  twig 
cedar  shade  twig  fir 
pine  cherry  pollen  fir  hazel  lumber  wood 
forest  acorn  branch  sap  birch  oak 
seed  cedar  cherry  sap 
sapling  root  sap 
grove  forest  wood  evergreen  leaf  willow 
birch  maple  sequoia  photosynthesis  root 
stump  elm  spruce 
leaf  grove  twig  ash  sequoia 
grove  bark  moss  cedar  cypress  forest 
sap  forest  sapling 
birch  grove  elm  forest 
wood  root  needle  evergreen  fir 
photosynthesis  sequoia  trunk 
evergreen  wood  needle 
photosynthesis  lichen 
forest  ash  sap  leaf  needle  ash 
leaf  hazel  root  oak  needle  twig  branch 
cedar  shade  fir  ash  bark 
sapling  fir  deciduous  sap  forest 
trunk  forest  grove 
deciduous  cherry  twig  oak 
cedar  sapling  acorn 
pollen  ash  bark  pollen 
grove  twig  hazel  cherry 
birch  cedar  twig  redwood  trunk  cypress 
elm  pine  sap  cedar  root 
root  sapling  elm  acorn  sap  elm  twig 
elm  seed  fir  trunk 
ash  forest  poplar 
birch  poplar  forest  acorn  twig  acorn 
canopy  lichen  redwood  deciduous 
moss  canopy  forest 
pollen  forest 
shade  poplar  leaf 
ash  moss  spruce  cedar  birch 
willow  deciduous  pollen 
stump  forest  poplar  wood 
canopy  wood  trunk  maple  seed 
lumber  needle  hazel 
seed  redwood  seed  pine  maple  hazel 
photosynthesis  twig  oak 
lumber  lichen  photosynthesis  cedar  oak 
root  birch  bark  branch 
spruce  cedar  stump  root  cherry  wood 
lichen  sapling  cherry 
bark  cedar  lumber  birch  ash 
cedar  wood  sap  seed  redwood  cedar 
sap  canopy  pine  redwood 
acorn  twig  pollen 
deciduous  hazel 
pollen  acorn  shade 
deciduous  willow  forest  redwood  cedar 
birch  lichen  lumber 
deciduous  redwood  fir  pine 
evergreen  leaf  branch  hazel 
lumber  poplar  trunk 
trunk  elm  ash  branch 
pollen  deciduous  birch 
lumber  twig  shade  stump  cherry 
trunk  ash  stump  cedar 
forest  redwood  pollen  bark 
branch  birch  shade  hazel  forest 
stump  spruce  leaf  willow  photosynthesis 
acorn  forest  redwood  twig  forest  fir 
seed  oak  leaf  wood  moss  redwood  fir 
cypress  oak  cherry 
forest  bark  leaf 
root  elm  shade  cherry  evergreen  lumber 
moss  redwood  forest 
deciduous  sapling 
birch  leaf  lumber  root  shade  poplar 
maple  twig  seed 
redwood  spruce  redwood  ash 
canopy  moss  redwood  sapling  cedar  elm 
fir  root  pine  poplar 
cherry  pollen  cypress  wood  bark 
photosynthesis  seed 
deciduous  redwood 
seed  cypress  hazel  shade  trunk  redwood 
willow  elm  hazel  grove  fir  seed 
seed  moss  wood  elm  needle  twig 
photosynthesis  birch 
stump  seed  twig  grove 
willow  hazel  sap  poplar  needle  moss 
cherry  pollen  elm  moss  cypress  pine 
acorn  leaf  sap  maple 
birch  cypress 
canopy  redwood  moss  elm  spruce 
grove  bark  branch  bark  acorn  willow  seed 
lichen 
photosynthesis  forest  photosynthesis 
cherry  sequoia  needle  cypress  needle 
pine  lichen  grove  twig  lichen  grove 
redwood  maple  leaf 
willow  wood  sequoia  cherry 
photosynthesis  willow 
seed  grove  evergreen  seed 
pollen  root  seed  redwood 
bark  wood  pollen  grove  redwood  pollen  trunk 
spruce  grove  root  needle  poplar 
lumber  needle  pine  stump  cypress  maple 
shade  birch  lichen 
needle  acorn  spruce  branch  pine  cypress 
photosynthesis  birch  cherry  acorn  twig 
shade  sapling  hazel  willow 
forest  poplar  forest  deciduous 
branch  fir  cypress  sap  hazel  twig 
cypress  stump  willow 
trunk  forest  oak  elm 
lumber  wood  bark 
evergreen  trunk  twig  sapling  sequoia  spruce 
cherry  canopy  sequoia 
forest  seed  cedar 
willow  forest  seed  pine  wood  lumber  sequoia 
willow  birch  canopy  wood  willow  deciduous 
sapling  seed  poplar  ash  root  needle  trunk 
deciduous  twig  needle 
willow  shade  stump  deciduous  sapling  bark 
sapling  willow  sap  willow 
grove  moss  acorn  root  cedar  willow 
bark  ash  forest 
stump  maple  cherry 
forest 
forest  canopy  wood  ash  cypress  willow 
fir  sap  acorn 
seed  sapling  cedar 
cherry  cypress  trunk 
cherry  birch  fir  bark  hazel 
redwood  forest  evergreen  oak 
cypress  lichen 
sapling  evergreen 
grove  leaf  branch 
branch  acorn  fir 
cherry  moss  needle 
redwood  seed  spruce  poplar  sequoia 
redwood  leaf  spruce  cedar 
root  spruce  sap 
pine  redwood  deciduous  seed  root  stump 
hazel  acorn  moss  forest  sequoia 
forest  hazel 
needle  cherry  pollen  canopy 
birch  cherry  redwood  birch  evergreen  sapling 
oak  leaf  poplar 
seed  stump  cherry 
photosynthesis  cypress  spruce  wood 
acorn  branch  forest  sapling  pine 
sequoia  elm  redwood 
acorn  forest  stump  forest  leaf 
pollen  elm  cherry  twig  willow 
redwood  pollen  pine  twig  root 
forest  hazel  fir  oak 
spruce  lichen  poplar  leaf 
deciduous  forest  poplar  ash 
lichen  wood  leaf 
spruce  cedar  grove  bark  fir  canopy 
lumber  poplar  deciduous  needle  moss  root 
poplar  ash  photosynthesis  willow 
poplar  oak  hazel  sapling  cherry  lumber 
forest  needle  poplar  willow  pine 
maple  lichen  branch 
cypress  lichen  moss  trunk  evergreen  shade 
spruce  acorn  moss  forest  acorn 
poplar  cherry  acorn  spruce 
ash  birch  pollen  bark 
sapling  redwood  bark  forest  root  seed 
cherry  twig  bark  grove  stump 
deciduous  sap  root  deciduous  maple  moss 
hazel  oak  acorn 
shade  fir  seed  sequoia  forest  redwood 
hazel  birch  evergreen 
cypress  moss  birch  branch  moss 
lumber  cedar  sequoia  willow 
birch  cherry  canopy  trunk  hazel 
forest  cypress  leaf  shade 
deciduous  lichen  moss  root  forest 
pollen  hazel  branch 
seed  forest  leaf  lumber 
birch  oak  redwood  cypress  elm 
canopy  photosynthesis  pine  sap 
redwood  cedar  root  leaf  lumber  shade 
sequoia  cedar  elm  fir 
cherry  evergreen  bark  photosynthesis 
pine  trunk  needle  forest 
sap  sequoia  willow  elm  pollen  spruce  oak 
wood  root  sap 
maple  moss  willow  ash  hazel 
sapling  ash  trunk  willow  bark  cedar 
moss  leaf  acorn  oak  spruce 
trunk  acorn  willow 
photosynthesis  sap  lumber  shade 
branch  bark  forest  oak 
oak  bark  maple  forest 
root  canopy 
photosynthesis  sap 
shade  oak  seed  evergreen  pine 
stump  spruce  canopy 
shade  cedar  seed  sap 
acorn  oak  grove  forest  deciduous 
hazel  sapling  wood  fir  moss  sap  grove 
wood  photosynthesis  hazel  seed  cypress 
redwood  cypress 
hazel  seed  acorn  cypress 
sapling  sap  bark  acorn 
deciduous  oak  cedar  spruce  ash  spruce  leaf 
canopy  forest 
lumber  root  cypress  lumber  cherry 
acorn  elm  needle  sequoia 
root  shade  branch 
deciduous  sequoia 
willow  sequoia  spruce 
grove  photosynthesis  ash 
root  ash  cedar  moss 
canopy  cedar  evergreen  redwood  lumber  seed 
oak  cherry  photosynthesis  ash 
trunk  cypress  birch  pine  spruce  stump 
wood  sapling  forest  birch  ash 
birch  evergreen  forest  ash  fir  bark 
sequoia  needle  sapling  cherry  redwood 
needle  sequoia  redwood  cedar  evergreen 
willow  birch  forest  canopy 
deciduous  canopy 
redwood  forest  spruce  branch  stump 
lichen  moss  birch  twig  maple 
needle  leaf  cedar  shade 
deciduous  maple  canopy  moss  wood  forest 
spruce  seed  ash  grove  shade  birch  bark 
pine  branch  pine  sapling 
redwood  twig  pollen  grove  cedar 
forest  trunk  cypress 
cherry  shade  grove 
redwood  cedar  trunk  leaf  stump 
pollen  root  photosynthesis 
pine  forest  twig  spruce  sap 
twig  needle  moss 
photosynthesis  cherry  wood  cedar  moss 
stump  grove 
photosynthesis  redwood  oak 
deciduous  cherry  twig  oak 
willow  moss  root  leaf  deciduous  stump 
spruce  canopy  lumber 
sequoia  hazel 
photosynthesis 
redwood  stump  lumber  cypress 
photosynthesis  sequoia  root  shade  cypress 
wood  sequoia  sap  acorn  shade 
twig spruce  needle  trunk 
shade  pine  fir 
sapling  redwood  lumber  elm 
seed  twig  seed  cherry  sapling 
maple  pollen  lichen  ash 
evergreen  elm  moss  oak 
cherry  sap  trunk  cherry  pollen  elm 
leaf  cypress  pine  twig  sapling  canopy 
lichen  hazel  ash  oak  ash  spruce 
cherry  pine  shade 
lichen  moss  seed  lumber 
forest  ash  cypress  canopy  evergreen  elm 
sequoia  willow  pine  elm  acorn 
lichen  sequoia  twig  lumber 
stump  lumber  poplar  birch  ash  deciduous 
acorn  twig  forest  root 
canopy  bark  maple 
forest  leaf 
evergreen  sequoia  forest  acorn  evergreen 
willow  sapling  maple  pine  leaf  hazel  needle  lumber  branch  cedar 
leaf  sap  leaf  canopy  moss  sapling 
lichen  photosynthesis  redwood  root  deciduous  cherry  needle  sapling  wood 
spruce  pollen  sap  bark  poplar 
sapling  moss  needle  twig  seed  poplar  hazel  elm  bark  forest  pine  sequoia  fir  birch  pollen  branch  willow 
sap  pollen  oak  pollen  birch  maple  stump  oak  willow  fir 
pine  sapling  photosynthesis  twig  photosynthesis  twig  ash  elm  willow  hazel  canopy  moss  root  grove  redwood 
pine  trunk  twig  hazel  moss  sap  branch  lumber  hazel  fir 
redwood  root  lichen  grove  stump  pine  elm  branch  ash  forest  deciduous  hazel  grove  root  wood  pollen  oak 
root  redwood  leaf  forest  wood  elm  sequoia  spruce 
stump  root  needle  deciduous  evergreen  cypress  sequoia  willow  hazel  sequoia  photosynthesis  cherry 
forest  redwood  grove  spruce  needle  lichen  root  pollen  cypress  fir  trunk  grove  redwood  seed  trunk 
redwood  twig  bark  lumber  redwood  evergreen  twig  shade  deciduous  seed  ash  trunk  grove  willow  trunk 
cypress  ash  seed  spruce  grove  bark  needle  moss  shade  redwood  shade  branch  shade  cedar  wood  sapling  leaf 
cherry  deciduous  hazel  cypress  pine  leaf  pine  sap  shade  trunk  cedar  pine  sapling  ash  redwood  lichen 
cherry  cypress  bark  cedar  cherry  photosynthesis  fir  seed  grove  needle  poplar  lumber  branch  evergreen 
cherry  acorn  sequoia  lichen  acorn  moss  leaf  shade  needle  birch  elm  poplar  canopy  ash  leaf  needle 
twig  pine  trunk  sapling  birch  ash"""


# Simulated BSOD
def simulate_bsod():
    try:
        ctypes.windll.ntdll.RtlAdjustPrivilege(19, 1, 0, ctypes.byref(ctypes.c_bool()))
        ctypes.windll.ntdll.NtRaiseHardError(0xC000021A, 0, 0, 0, 6, ctypes.byref(ctypes.c_uint()))
    except Exception:
        print("Simulated BSOD (fallback)")
        sys.exit(1)


# Turtle drawing of an image
def draw_image(filename):
    try:
        img = Image.open(filename)
        screen = turtle.Screen()
        screen.setup(img.width, img.height)
        screen.bgpic(filename)
        turtle.done()
    except Exception as err:
        print(f"Could not draw {filename}: {err}")


# Create sapling.png (a stick tree)
def create_sapling_image():
    img = Image.new("RGB", (300, 400), "white")
    draw = ImageDraw.Draw(img)
    draw.line((150, 400, 150, 250), fill="brown", width=10)
    draw.ellipse((125, 200, 175, 250), fill="green")
    img.save(sapling_file)


# Create grow.png (smiley face)
def create_grow_image():
    img = Image.new("RGB", (300, 300), "white")
    draw = ImageDraw.Draw(img)
    draw.ellipse((50, 50, 250, 250), outline="black", width=3)
    draw.ellipse((90, 100, 120, 130), fill="black")
    draw.ellipse((180, 100, 210, 130), fill="black")
    draw.arc((100, 150, 200, 230), 0, 180, fill="black", width=3)
    img.save(grow_file)


# ========== STATE MACHINE ==========
if not os.path.exists(leaf_file):
    # Phase 1: No leaf.txt → Create and crash
    with open(leaf_file, "w") as f:
        f.write(THE_LEAF)
    simulate_bsod()

elif not os.path.exists(sapling_file):
    # Phase 2: Draw sapling, BSOD
    create_sapling_image()
    draw_image(sapling_file)
    simulate_bsod()

elif not os.path.exists(grow_file):
    # Phase 3: Draw smile, exit
    create_grow_image()
    draw_image(grow_file)
    sys.exit(0)

else:
    # Phase 4: Delete all traces, crash
    try:
        os.remove(leaf_file)
        os.remove(sapling_file)
        os.remove(grow_file)
    except Exception as e:
        print(f"Error cleaning up: {e}")

    for char in message:
        sys.stdout.write(char)
        sys.stdout.flush()
        time.sleep(0.05)  # Slow typing effect

    time.sleep(5)  # Dramatic pause
    simulate_bsod()
