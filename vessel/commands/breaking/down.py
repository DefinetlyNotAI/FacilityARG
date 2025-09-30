import ctypes
import os
import threading
import time
import winreg

import numpy as np
import pygame

from vessel.types import VesselObjects
from vessel.vfx import chaos_audio


class BreakingDown:
    REG_PATH = r"Software\VESSEL\highAF"

    def __init__(self, vt: 'VesselObjects'):
        self.fep = vt.fatalErrPopup
        self.createLog = vt.createLog
        self.utils = vt.utils
        self.textOverlay = vt.textOverlay

    # ================= Registry =================

    def is_already_ran(self):
        try:
            winreg.OpenKey(winreg.HKEY_CURRENT_USER, self.REG_PATH)
            return True
        except FileNotFoundError:
            return False

    def __save_registry(self):
        key = winreg.CreateKey(winreg.HKEY_CURRENT_USER, self.REG_PATH)
        winreg.SetValueEx(key, "Completed", 0, winreg.REG_SZ, "1")
        winreg.CloseKey(key)

    # ================= Audio =================

    @staticmethod
    def __play_audio(filename: str, duration: float = 43):
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

    # noinspection PyUnresolvedReferences
    @staticmethod
    def __show_jumpscare():
        pygame.init()
        pygame.mouse.set_visible(False)

        # 1. Force fullscreen at native resolution
        flags = pygame.FULLSCREEN | pygame.HWSURFACE | pygame.DOUBLEBUF
        screen = pygame.display.set_mode((0, 0), flags)

        # 2. Force topmost & focus using Win32
        hwnd = pygame.display.get_wm_info()["window"]  # get HWND from Pygame
        ctypes.windll.user32.SetForegroundWindow(hwnd)
        ctypes.windll.user32.SetWindowPos(
            hwnd, -1, 0, 0, 0, 0, 0x0001 | 0x0002
        )  # HWND_TOPMOST, SWP_NOSIZE | SWP_NOMOVE

        width, height = screen.get_size()
        running = True
        clock = pygame.time.Clock()
        duration = 15
        start_time = pygame.time.get_ticks()

        # Optional audio thread
        threading.Thread(target=chaos_audio, kwargs={"duration": duration}, daemon=True).start()

        while running:
            # Keep forcing foreground (prevents Alt-Tab losing focus)
            ctypes.windll.user32.SetForegroundWindow(hwnd)

            for event in pygame.event.get():
                if event.type in (pygame.QUIT, pygame.KEYDOWN, pygame.MOUSEBUTTONDOWN):
                    running = False

            # Pixel noise
            noise = np.random.randint(0, 256, (height, width, 3), dtype=np.uint8)
            noise = np.transpose(noise, (1, 0, 2))
            pygame.surfarray.blit_array(screen, noise)
            pygame.display.flip()

            if (pygame.time.get_ticks() - start_time) > duration * 1000:
                running = False

            clock.tick(60)

        pygame.quit()
        ctypes.windll.user32.SetCursorPos(width // 2, height // 2)

    # ================= Lore =================

    def __ask_questions(self):
        self.fep.trigger(["Yes", "Yes", "Yes"], "Question", "Do you believe?")
        self.fep.trigger(["Yes", "Yes", "Yes"], "Question", "Are you worthy?")
        self.fep.trigger(["Help", "Help", "Help"], "Question", "Cur dolor tibi placet?")  # "Why do you enjoy pain"

    # ================= Main Flow =================

    def run(self):
        try:
            self.__play_audio(filename=os.path.join(os.path.dirname(__file__), "..", "..", "data", "sob.mp3"),
                              duration=43)
            self.textOverlay.update(
                duration=43,
                sentences=[
                    "the void whispers",
                    "blood of the forsaken",
                    "ashen memory",
                    "shattered covenant",
                    "hollow psalm",
                    "pain without end",
                    "echo of the lost",
                    "the vessel weeps"
                ],
            )
            self.textOverlay.run()

            self.__show_jumpscare()
            self.__ask_questions()

            self.createLog.error_range(600, 660)
            self.__save_registry()
        except KeyboardInterrupt:
            self.utils.trigger_crash()
