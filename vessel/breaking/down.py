import ctypes
import os
import random
import threading
import time
import tkinter as tk
import winreg

import numpy as np
import pygame
from PIL import Image, ImageDraw, ImageFont, ImageTk

from vessel.vsa.lfe import LoreFatalError
from vessel.createPuzzleVesselLogs import CreatePuzzleVesselLogs
from vessel.utils import Utils


class BreakingDown:
    REG_PATH = r"Software\VESSEL\highAF"

    def __init__(self, lfe: "LoreFatalError", createLog: "CreatePuzzleVesselLogs", utils: "Utils"):
        self.lfe = lfe
        self.createLog = createLog
        self.utils = utils

    # ================= Registry =================

    def already_ran(self):
        try:
            winreg.OpenKey(winreg.HKEY_CURRENT_USER, self.REG_PATH)
            return True
        except FileNotFoundError:
            return False

    def save_registry(self):
        key = winreg.CreateKey(winreg.HKEY_CURRENT_USER, self.REG_PATH)
        winreg.SetValueEx(key, "Completed", 0, winreg.REG_SZ, "1")
        winreg.CloseKey(key)

    # ================= Audio =================

    @staticmethod
    def play_audio(filename: str, duration: float = 43):
        """Play audio in a loop using pygame.mixer for the given duration (seconds)."""
        def _play_loop():
            try:
                pygame.mixer.init()
                pygame.mixer.music.load(filename)
                pygame.mixer.music.play(-1)
                start_time = time.time()
                while time.time() - start_time < duration:
                    time.sleep(0.1)
                pygame.mixer.music.stop()
            except Exception as e:
                print(f"[Audio Error] {e}")

        threading.Thread(target=_play_loop, daemon=True).start()

    # ================= Visuals =================

    def show_jumpscare(self):
        pygame.init()
        info = pygame.display.Info()
        screen = pygame.display.set_mode((info.current_w, info.current_h), pygame.FULLSCREEN)
        pygame.display.set_caption("JUMPSCARE!")

        width, height = screen.get_size()
        running = True
        clock = pygame.time.Clock()
        duration = 1.5  # seconds
        start_time = pygame.time.get_ticks()

        while running:
            for event in pygame.event.get():
                if event.type in (pygame.QUIT, pygame.KEYDOWN, pygame.MOUSEBUTTONDOWN):
                    self.utils.trigger_crash(fake=True)  # fake BSOD if user tries to quit
                    running = False

            # Pixel noise (correct dimensions!)
            noise = np.random.randint(0, 256, (width, height, 3), dtype=np.uint8)
            pygame.surfarray.blit_array(screen, noise)
            pygame.display.flip()

            if (pygame.time.get_ticks() - start_time) > duration * 1000:
                running = False

            clock.tick(60)

        pygame.quit()
        os.system('cls')

    # noinspection PyUnresolvedReferences
    @staticmethod
    def text_overlay(duration=43):
        """Transparent, click-through overlay with drifting, typed, fading words."""
        words = ["flesh", "memory", "lost", "error", "fracture", "hollow", "pain", "vessel"]

        root = tk.Tk()
        root.overrideredirect(True)
        root.attributes("-topmost", True)
        root.attributes("-transparentcolor", "black")

        # Fullscreen
        width = root.winfo_screenwidth()
        height = root.winfo_screenheight()
        root.geometry(f"{width}x{height}+0+0")

        # Transparent click-through setup (Windows only)
        hwnd = ctypes.windll.user32.GetParent(root.winfo_id())
        styles = ctypes.windll.user32.GetWindowLongW(hwnd, -20)
        ctypes.windll.user32.SetWindowLongW(hwnd, -20, styles | 0x80000 | 0x20)
        # WS_EX_LAYERED (0x80000) | WS_EX_TRANSPARENT (0x20)

        canvas = tk.Canvas(root, bg="black", highlightthickness=0)
        canvas.pack(fill="both", expand=True)

        start_time = time.time()
        active_texts = []

        try:
            font = ImageFont.truetype("consola.ttf", 24)
        except:
            font = ImageFont.load_default()

        def add_word():
            x = random.randint(0, width)
            y = random.randint(0, height)
            word = random.choice(words)
            angle = random.randint(-30, 30)

            temp_img = Image.new("RGBA", (200, 50), (0, 0, 0, 0))
            tk_image = ImageTk.PhotoImage(temp_img)
            img_id = canvas.create_image(x, y, image=tk_image)

            active_texts.append({
                "id": img_id,
                "word": word,
                "index": 0,
                "start": time.time(),
                "tk_image": tk_image,
                "angle": angle,
                "alpha": 255
            })

            type_letter(active_texts[-1])

        def type_letter(text_obj):
            idx = text_obj["index"]
            word = text_obj["word"]
            if idx > len(word):
                return
            bbox = font.getbbox(word[:idx])
            w, h = bbox[2]-bbox[0], bbox[3]-bbox[1]
            img = Image.new("RGBA", (int(w)+10, int(h)+10), (0,0,0,0))
            draw = ImageDraw.Draw(img)
            draw.text((-bbox[0], -bbox[1]), word[:idx], font=font, fill=(255,255,255,text_obj["alpha"]))
            rotated = img.rotate(text_obj["angle"], expand=True)
            tk_image = ImageTk.PhotoImage(rotated)
            text_obj["tk_image"] = tk_image
            canvas.itemconfig(text_obj["id"], image=tk_image)
            text_obj["index"] += 1
            if text_obj["index"] <= len(word):
                # noinspection PyTypeChecker
                root.after(50, lambda: type_letter(text_obj))

        def update():
            now = time.time()
            for t in active_texts[:]:
                canvas.move(t["id"], random.uniform(-1,1), random.uniform(-0.5,0.5))
                age = now - t["start"]
                if age > 2:
                    t["alpha"] -= 4
                    if t["alpha"] <= 0:
                        canvas.delete(t["id"])
                        active_texts.remove(t)
                        continue
                    idx = t["index"]
                    bbox = font.getbbox(t["word"][:idx])
                    w, h = bbox[2]-bbox[0], bbox[3]-bbox[1]
                    img = Image.new("RGBA", (int(w)+10, int(h)+10), (0,0,0,0))
                    draw = ImageDraw.Draw(img)
                    draw.text((-bbox[0], -bbox[1]), t["word"][:idx], font=font, fill=(255,255,255,t["alpha"]))
                    rotated = img.rotate(t["angle"], expand=True)
                    tk_image = ImageTk.PhotoImage(rotated)
                    t["tk_image"] = tk_image
                    canvas.itemconfig(t["id"], image=tk_image)

            if random.random() < 0.05:
                add_word()

            if now - start_time < duration:
                # noinspection PyTypeChecker
                root.after(50, update)
            else:
                root.destroy()

        update()
        root.mainloop()

    # ================= Lore =================

    def ask_questions(self):
        self.lfe.trigger(["Yes", "Yes", "Yes"], "Question", "Do you believe?")
        self.lfe.trigger(["Yes", "Yes", "Yes"], "Question", "Are you worthy?")
        self.lfe.trigger(["Help", "Help", "Help"], "Question", "Cur dolor tibi placet?")  # "Why do you enjoy pain"

    # ================= Main Flow =================

    def run(self):
        try:
            if self.already_ran():
                print("Already ran. Exiting.")
                return

            self.play_audio("sob.mp3", duration=5)
            self.text_overlay(duration=5)

            self.show_jumpscare()
            self.ask_questions()

            self.createLog.error_range(652, 665)
            self.save_registry()
        except KeyboardInterrupt:
            self.utils.trigger_crash(fake=True)


if __name__ == "__main__":
    exp = BreakingDown(
        LoreFatalError(),
        CreatePuzzleVesselLogs(
            fight_destination="== GENERATED ITEMS ==/logs/fight",
            error_destination="== GENERATED ITEMS ==/logs/error"
        ),
        Utils()
    )
    exp.run()
