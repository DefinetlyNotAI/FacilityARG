import ctypes
import random
import time
import tkinter as tk
from typing import List, Tuple, Optional, Any

from PIL import Image, ImageDraw, ImageFont, ImageTk


class ScreenTextOverlay:
    def __init__(
            self,
            duration: int = 30,
            sentences: Optional[List[str]] = None,
            font_path: str = "consola.ttf",
            font_size: int = 28,
            typing_speed: int = 50,  # ms per letter
            spawn_chance: float = 0.05,
            drift: Tuple[float, float] = (-1, 1),
            fade_delay: float = 2.0,
            fade_speed: int = 4,
            angle_range: Tuple[int, int] = (-30, 30),
            color: Tuple[int, int, int] = (255, 255, 255),
            transparent_color: str = "black",
            ordered: bool = False
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
        self.ordered = ordered
        self.color = color

        # State
        self.root: Optional[tk.Tk] = None
        self.canvas: Optional[tk.Canvas] = None
        self.width = 0
        self.height = 0
        self.active_texts: List[dict] = []
        self.start_time = 0
        self.font: Optional[ImageFont.FreeTypeFont] = None

    # noinspection PyUnresolvedReferences
    def run(self):
        self.root = tk.Tk()
        self.root.overrideredirect(True)
        self.root.attributes("-topmost", True)
        self.root.attributes("-transparentcolor", self.transparent_color)

        self.width = self.root.winfo_screenwidth()
        self.height = self.root.winfo_screenheight()
        self.root.geometry(f"{self.width}x{self.height}+0+0")

        hwnd = ctypes.windll.user32.GetParent(self.root.winfo_id())
        styles = ctypes.windll.user32.GetWindowLongW(hwnd, -20)
        ctypes.windll.user32.SetWindowLongW(hwnd, -20, styles | 0x80000 | 0x20)

        self.canvas = tk.Canvas(self.root, bg=self.transparent_color, highlightthickness=0)
        self.canvas.pack(fill="both", expand=True)

        try:
            self.font = ImageFont.truetype(self.font_path, self.font_size)
        except Exception:
            self.font = ImageFont.load_default()

        self.start_time = time.time()

        if self.ordered:
            self.__run_ordered(0)
        else:
            self.__update_text()

        self.root.mainloop()

    def _update_canvas_image(self, text_obj: dict, text_slice: Optional[str] = None) -> None:
        word = text_obj["word"] if text_slice is None else text_slice
        bbox = self.font.getbbox(word)
        w, h = bbox[2] - bbox[0], bbox[3] - bbox[1]
        img = Image.new("RGBA", (int(w) + 10, int(h) + 10), (0, 0, 0, 0))
        draw = ImageDraw.Draw(img)
        r, g, b = self.color  # unpack RGB tuple
        fill_color: Tuple[int, int, int, int] = (r, g, b, int(text_obj["alpha"]))
        draw.text((-bbox[0], -bbox[1]), word, font=self.font, fill=fill_color)
        rotated = img.rotate(text_obj["angle"], expand=True)
        tk_img_local: Any = ImageTk.PhotoImage(rotated)
        text_obj["tk_image"] = tk_img_local
        self.canvas.itemconfig(text_obj["id"], image=tk_img_local)

    # noinspection PyTypeChecker
    def __run_ordered(self, index: int):
        if index >= len(self.sentences):
            self.root.destroy()
            return

        word = self.sentences[index]
        x = self.width // 2
        y = self.height // 2

        text_obj = {
            "id": None,
            "word": word,
            "index": 0,
            "start": time.time(),
            "tk_image": None,
            "angle": 0,
            "alpha": 255
        }

        # Create empty image first
        temp_img = Image.new("RGBA", (200, 50), (0, 0, 0, 0))
        tk_img_local: Any = ImageTk.PhotoImage(temp_img)
        img_id = self.canvas.create_image(x, y, image=tk_img_local)
        text_obj["id"] = img_id
        text_obj["tk_image"] = tk_img_local
        self.active_texts.append(text_obj)

        # noinspection PyTypeChecker
        def type_and_fade() -> None:
            idx = text_obj["index"]
            if idx <= len(word):
                self._update_canvas_image(text_obj, word[:idx])
                text_obj["index"] += 1
                self.root.after(self.typing_speed, type_and_fade)
            else:
                self.root.after(int(self.fade_delay * 1000), fade_step)

        # noinspection PyTypeChecker
        def fade_step() -> None:
            text_obj["alpha"] -= self.fade_speed
            if text_obj["alpha"] <= 0:
                self.canvas.delete(text_obj["id"])
                self.active_texts.remove(text_obj)
                self.__run_ordered(index + 1)
                return
            self._update_canvas_image(text_obj, word)
            self.root.after(50, fade_step)

        type_and_fade()

    def __add_word(self):
        x = random.randint(0, self.width)
        y = random.randint(0, self.height)
        word = random.choice(self.sentences)
        angle = random.randint(*self.angle_range)

        temp_img = Image.new("RGBA", (200, 50), (0, 0, 0, 0))
        tk_img_local: Any = ImageTk.PhotoImage(temp_img)
        img_id = self.canvas.create_image(x, y, image=tk_img_local)

        text_obj = {
            "id": img_id,
            "word": word,
            "index": 0,
            "start": time.time(),
            "tk_image": tk_img_local,
            "angle": angle,
            "alpha": 255
        }
        self.active_texts.append(text_obj)
        self.__type_letter(text_obj)

    # noinspection PyTypeChecker
    def __type_letter(self, text_obj):
        idx = text_obj["index"]
        word = text_obj["word"]

        if idx > len(word):
            return

        self._update_canvas_image(text_obj, word[:idx])
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
                self._update_canvas_image(t, t["word"][:t["index"]])

        if random.random() < self.spawn_chance:
            self.__add_word()

        if now - self.start_time < self.duration:
            # noinspection PyTypeChecker
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
