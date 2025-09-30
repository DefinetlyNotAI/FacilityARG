import ctypes
import sys
import time
import webbrowser
import winreg
from typing import List
from pathlib import Path

from vessel.exceptionHandler import handler
from vessel.types import VesselObjects


class StrikeTheEnd:
    def __init__(self, vt: 'VesselObjects'):
        self.utils = vt.utils
        self.vesselCompletionUtil = vt.vesselCompletionUtil
        self.Lore = vt.Lore
        self.utils = vt.utils
        self.overlay = vt.textOverlay

    @staticmethod
    def __update_registry_key(value: int = 1) -> bool:
        r"""Creates or updates HKCU\Software\VESSEL\haveThe100Struck with given integer value."""
        try:
            key_path = r"Software\VESSEL"
            # Create/open the key under HKEY_CURRENT_USER
            key = winreg.CreateKey(winreg.HKEY_CURRENT_USER, key_path)
            # Set the value
            winreg.SetValueEx(key, "haveThe100Struck", 0, winreg.REG_DWORD, value)
            winreg.CloseKey(key)
            return True
        except Exception as e:
            print(f"Failed to create registry key: {e}")
            return False

    @staticmethod
    def __check_registry_key() -> bool:
        """Returns True if haveThe100Struck == 1, False if not set or != 1."""
        try:
            key_path = r"Software\VESSEL"
            key = winreg.OpenKey(winreg.HKEY_CURRENT_USER, key_path, 0, winreg.KEY_READ)
            value, reg_type = winreg.QueryValueEx(key, "haveThe100Struck")
            winreg.CloseKey(key)

            if value == 1:
                return True
            else:
                return False
        except FileNotFoundError:
            # Key or value not found
            return False
        except Exception as e:
            handler.exception(f"Error reading registry: {e}")
            return False

    def is_allowed_to_run(self):
        """
        Returns True if all conditions are satisfied else False.

        Once True is returned, the regkey is set to True, so even if crashed it won't work

        Conditions:
        1) All lore values have been seen
        2) The VESSEL has been complete
        3) Current LORE value is 100
        4) Not previously run
        """
        all_lore_unlocked = self.vesselCompletionUtil.check_registry()
        all_lore_seen = all(self.utils.is_lore_prev_seen(lid) for lid in range(1, 101))
        lore_100 = self.Lore == 100
        not_run_prev = not self.__check_registry_key()
        allowed = all_lore_unlocked and all_lore_seen and lore_100 and not_run_prev
        return allowed

    # noinspection PyUnresolvedReferences
    def execute_strike_sequence(self):
        """
        Minimise everything, type 4 creepy sentences on the overlay (slow typing),
        open a creepy page in the browser, wait 15 seconds, then trigger a fake crash.

        This method runs synchronously and uses safe fallbacks. It will not attempt a real crash.
        """
        try:
            # 1) Minimise all windows (simulate Win+D). Windows only.
            try:
                if sys.platform.startswith("win"):
                    # VK_LWIN = 0x5B, 'D' = 0x44
                    user32 = ctypes.windll.user32
                    # Press Win down
                    user32.keybd_event(0x5B, 0, 0, 0)
                    # Press D
                    user32.keybd_event(0x44, 0, 0, 0)
                    # Release D
                    user32.keybd_event(0x44, 0, 2, 0)
                    # Release Win
                    user32.keybd_event(0x5B, 0, 2, 0)
                    time.sleep(0.25)
                else:
                    # Non windows fallback: attempt to open a harmless blank page to shift focus
                    webbrowser.open("about:blank")
            except Exception as e_min:
                handler.exception(f"Minimise attempt failed: {e_min}")

            # 2) Prepare creepy sentences
            sentences: List[str] = [
                "they listen with roots and patience",
                "the room remembers the way you breathe",
                "small things rot into larger truths",
                "when the last clock stops, it asks your name",
                "so listen"
            ]

            # 3) Start overlay update and run
            try:
                self.overlay.update(
                    sentences=sentences,
                    font_size=50,
                    typing_speed=30,
                    fade_delay=1.5,
                    fade_speed=3,
                    ordered=True,
                    transparent_color="black",
                    color=(255, 0, 0),
                )
                self.overlay.run()
            except Exception as e_ov:
                handler.exception(f"Overlay failed: {e_ov}")

            # 4) Open a small creepy page in the default browser
            try:
                webbrowser.open(str(Path(__file__).parent / "data/smile.html"), new=2)
            except Exception as e_web:
                handler.exception(f"Failed to open creepy page: {e_web}")

            # 5) Mark in registry that sequence has run, to prevent repeat runs
            try:
                self.__update_registry_key(1)
            except Exception as e_update:
                handler.exception(f"Update registry failed: {e_update}")

            # 6) Wait 15 seconds, then trigger fake crash
            try:
                time.sleep(15)
                self.utils.trigger_crash()
            except Exception as e_cr:
                handler.exception(f"Failed to trigger fake crash: {e_cr}")

        except Exception as e:
            handler.exception(f"execute_strike_sequence failed: {e}")
