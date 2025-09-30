import winreg

from vessel.types import VesselObjects
from vessel.exceptionHandler import handler


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

# Minimise everything, and type on the screen creepy sentences, (if quit midway ignore it, don't quit) 4 sentences,
# slowly appear one by one, then after 4th sentence, open a web browser to a creepy site (maybe a site with a black
# background and red text, with some creepy music), After 15
# seconds of opening the browser, crash the system (fake)

# Use for creepy lines:
# overlay = self.textOverlay
# overlay.update(
#     duration=30,
#     sentences=["examples"],
#     font_path="consola.ttf",
#     font_size=28,
#     typing_speed=50,  # ms per letter
#     spawn_chance=0.05,  # probability of a new word per tick
#     drift=(-1, 1),  # x drift per frame
#     fade_delay=2.0,  # seconds before fading begins
#     fade_speed=4,  # alpha decrement per frame
#     angle_range=(-30, 30),  # rotation degrees
#     transparent_color="black"
# )
# overlay.run()

# For fake crash: self.utils.trigger_crash(fake=True)
