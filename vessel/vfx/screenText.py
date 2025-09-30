import ctypes
import random
import time
import tkinter as tk
from typing import List, Tuple, Optional

from PIL import Image, ImageDraw, ImageFont, ImageTk


class ScreenTextOverlay:
    def __init__(
            self,
            duration: int = 30,
            sentences: Optional[List[str]] = None,
            font_path: str = "consola.ttf",
            font_size: int = 28,
            typing_speed: int = 50,   # ms per letter
            spawn_chance: float = 0.05,  # probability of a new word per tick
            drift: Tuple[float, float] = (-1, 1),  # x drift per frame
            fade_delay: float = 2.0,  # seconds before fading begins
            fade_speed: int = 4,      # alpha decrement per frame
            angle_range: Tuple[int, int] = (-30, 30),  # rotation degrees
            transparent_color: str = "black"
    ):
        self.duration = duration
        self.sentences = sentences or ["Un-init"]
        self.font_path = font_path
        self.font_size = font_size
        self.typing_speed = typing_speed
        self.spawn_chance = spawn_chance
        self.drift = drift
        self.fade_delay = fade_delay
        self.fade_speed = fade_speed
        self.angle_range = angle_range
        self.transparent_color = transparent_color

        # State
        self.root = None
        self.canvas = None
        self.width = 0
        self.height = 0
        self.active_texts = []
        self.start_time = 0
        self.font = None

    # noinspection PyUnresolvedReferences
    def run(self):
        self.root = tk.Tk()
        self.root.overrideredirect(True)
        self.root.attributes("-topmost", True)
        self.root.attributes("-transparentcolor", self.transparent_color)

        # Fullscreen
        self.width = self.root.winfo_screenwidth()
        self.height = self.root.winfo_screenheight()
        self.root.geometry(f"{self.width}x{self.height}+0+0")

        # Transparent click-through (Windows only)
        hwnd = ctypes.windll.user32.GetParent(self.root.winfo_id())
        styles = ctypes.windll.user32.GetWindowLongW(hwnd, -20)
        ctypes.windll.user32.SetWindowLongW(hwnd, -20, styles | 0x80000 | 0x20)

        self.canvas = tk.Canvas(self.root, bg=self.transparent_color, highlightthickness=0)
        self.canvas.pack(fill="both", expand=True)

        # Font
        try:
            self.font = ImageFont.truetype(self.font_path, self.font_size)
        except Exception:
            self.font = ImageFont.load_default()

        self.start_time = time.time()
        self.__update_text()
        self.root.mainloop()

    def __add_word(self):
        x = random.randint(0, self.width)
        y = random.randint(0, self.height)
        word = random.choice(self.sentences)
        angle = random.randint(*self.angle_range)

        temp_img = Image.new("RGBA", (200, 50), (0, 0, 0, 0))
        tk_image = ImageTk.PhotoImage(temp_img)
        img_id = self.canvas.create_image(x, y, image=tk_image)

        text_obj = {
            "id": img_id,
            "word": word,
            "index": 0,
            "start": time.time(),
            "tk_image": tk_image,
            "angle": angle,
            "alpha": 255
        }
        self.active_texts.append(text_obj)
        self.__type_letter(text_obj)

    def __type_letter(self, text_obj):
        idx = text_obj["index"]
        word = text_obj["word"]

        if idx > len(word):
            return

        bbox = self.font.getbbox(word[:idx])
        w, h = bbox[2] - bbox[0], bbox[3] - bbox[1]
        img = Image.new("RGBA", (w + 10, h + 10), (0, 0, 0, 0))
        draw = ImageDraw.Draw(img)
        draw.text((-bbox[0], -bbox[1]), word[:idx], font=self.font, fill=(255, 255, 255, text_obj["alpha"]))
        rotated = img.rotate(text_obj["angle"], expand=True)
        tk_image = ImageTk.PhotoImage(rotated)

        text_obj["tk_image"] = tk_image
        self.canvas.itemconfig(text_obj["id"], image=tk_image)
        text_obj["index"] += 1

        if text_obj["index"] <= len(word):
            self.root.after(self.typing_speed, lambda: self.__type_letter(text_obj))

    def __update_text(self):
        now = time.time()

        for t in self.active_texts[:]:
            self.canvas.move(
                t["id"],
                random.uniform(self.drift[0], self.drift[1]),
                random.uniform(self.drift[0] / 2, self.drift[1] / 2)
            )
            age = now - t["start"]
            if age > self.fade_delay:
                t["alpha"] -= self.fade_speed
                if t["alpha"] <= 0:
                    self.canvas.delete(t["id"])
                    self.active_texts.remove(t)
                    continue
                idx = t["index"]
                bbox = self.font.getbbox(t["word"][:idx])
                w, h = bbox[2] - bbox[0], bbox[3] - bbox[1]
                img = Image.new("RGBA", (w + 10, h + 10), (0, 0, 0, 0))
                draw = ImageDraw.Draw(img)
                draw.text((-bbox[0], -bbox[1]), t["word"][:idx], font=self.font, fill=(255, 255, 255, t["alpha"]))
                rotated = img.rotate(t["angle"], expand=True)
                tk_image = ImageTk.PhotoImage(rotated)
                t["tk_image"] = tk_image
                self.canvas.itemconfig(t["id"], image=tk_image)

        if random.random() < self.spawn_chance:
            self.__add_word()

        if now - self.start_time < self.duration:
            self.root.after(50, self.__update_text)
        else:
            self.root.destroy()

    def update(self, **kwargs) -> None:
        """
        Dynamically update overlay settings while running.
        Example:
            overlay.update(sentences=["new words"], font_size=40, spawn_chance=0.1)
        """
        for key, value in kwargs.items():
            if hasattr(self, key):
                setattr(self, key, value)

                # If font or font size changes, reload font
                if key in ("font_path", "font_size"):
                    try:
                        self.font = ImageFont.truetype(self.font_path, self.font_size)
                    except Exception:
                        self.font = ImageFont.load_default()
            else:
                raise AttributeError(f"Invalid attribute: {key}")


overlay = ScreenTextOverlay()
overlay.update(
    duration=30,
    sentences=["None"],
    font_path="consola.ttf",
    font_size=28,
    typing_speed=50,  # ms per letter
    spawn_chance=0.05,  # probability of a new word per tick
    drift=(-1, 1),  # x drift per frame
    fade_delay=2.0,  # seconds before fading begins
    fade_speed=4,  # alpha decrement per frame
    angle_range=(-30, 30),  # rotation degrees
    transparent_color="black"
)
overlay.run()
