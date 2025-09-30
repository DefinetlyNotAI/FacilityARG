import winreg


class strikeTheEnd:
    @staticmethod
    def update_registry_key(value: int = 1) -> bool:
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
    def check_registry_key() -> bool:
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
            print(f"Error reading registry: {e}")
            return False
