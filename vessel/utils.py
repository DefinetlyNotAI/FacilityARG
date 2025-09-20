import asyncio
import ctypes
import json
import os
import re
import signal
import subprocess
import sys
import tempfile
import time
import winreg as reg
from datetime import datetime

import edge_tts
import pygame

from vessel.createPuzzleVesselLogs import CreatePuzzleVesselLogs
from vessel.exceptionHandler import handler


# ----- Utils -----
class Utils:
    @staticmethod
    def ensure_windows() -> bool:
        try:
            return sys.platform.startswith('win')
        except Exception as e:
            handler.exception(f"Failed to check platform: {e}")
            return False

    @staticmethod
    def ensure_admin() -> bool:
        try:
            # noinspection PyUnresolvedReferences
            return ctypes.windll.shell32.IsUserAnAdmin() != 0
        except Exception:
            return False

    @staticmethod
    def set_console_title(title: str) -> None:
        try:
            subprocess.call(f"title {title}", shell=True)
        except Exception as e:
            handler.exception(f"Failed to set console title: {e}")

    # noinspection PyUnresolvedReferences
    @staticmethod
    def trigger_crash(fake: bool = False):
        if fake:
            raise RuntimeError("Fake crash triggered for testing purposes.")

        ctypes.windll.ntdll.RtlAdjustPrivilege(19, True, False, ctypes.byref(ctypes.c_bool()))
        ctypes.windll.ntdll.NtRaiseHardError(
            0xC0000022,
            0, 0, 0, 6, ctypes.byref(ctypes.c_uint())
        )

    @staticmethod
    def is_in_time_range(start: str, end: str) -> bool:
        # Validate time format
        time_pattern = r"^\d{2}:\d{2}$"
        if not re.match(time_pattern, start) or not re.match(time_pattern, end):
            raise ValueError("Start and end must be in 'HH:MM' format")

        # Parse hours and minutes
        start_hour, start_minute = map(int, start.split(":"))
        end_hour, end_minute = map(int, end.split(":"))

        # Validate 24-hour range
        if not (0 <= start_hour < 24 and 0 <= end_hour < 24 and 0 <= start_minute < 60 and 0 <= end_minute < 60):
            raise ValueError("Hours must be 00-23 and minutes 00-59")

        # Get current time
        now = datetime.now()
        current_minutes = now.hour * 60 + now.minute
        start_minutes = start_hour * 60 + start_minute
        end_minutes = end_hour * 60 + end_minute

        # Handle ranges that cross midnight
        if start_minutes <= end_minutes:
            return start_minutes <= current_minutes <= end_minutes
        else:
            return current_minutes >= start_minutes or current_minutes <= end_minutes

    @staticmethod
    def contains_secret(keyword: str, item: str) -> bool:
        return bool(re.search(rf"\b{re.escape(keyword)}\b", item, re.IGNORECASE))

    @staticmethod
    def get_windows_location() -> tuple[str, str]:
        try:
            # Multiline PowerShell script
            ps_script = """
            Add-Type -AssemblyName System.Device
            $loc = New-Object System.Device.Location.GeoCoordinateWatcher
            $loc.Start()
            Start-Sleep -Seconds 7
            $loc.Position.Location | ConvertTo-Json
            """
            # Run the PowerShell script
            result = subprocess.check_output(
                ["powershell", "-Command", ps_script],
                text=True
            )
            loc = json.loads(result)
            lat = loc.get("Latitude", "Unknown")
            lon = loc.get("Longitude", "Unknown")
            return lat, lon
        except Exception as e:
            return "Location unavailable", str(e)

    @staticmethod
    def is_console_environment() -> bool:
        """
        Returns False if the script is running in a non-console environment
        on Windows (e.g., PyCharm/VSCode built-in runner), where console
        capabilities are limited or unavailable.
        """
        # Check if stdin/stdout are attached to a real console
        if not sys.stdin.isatty() or not sys.stdout.isatty():
            return False

        # Use Windows API to check if a real console exists
        # GetConsoleWindow returns 0 if there is no associated console
        # noinspection PyUnresolvedReferences
        if ctypes.windll.kernel32.GetConsoleWindow() == 0:
            return False

        # Check common IDE environment variables
        ide_vars = [
            'PYCHARM_HOSTED',  # PyCharm
            'VSCODE_PID',      # VSCode
        ]
        for var in ide_vars:
            if var in os.environ:
                return False

        return True

    class TTSWrapper:
        """
        Simple custom TTS solution as the rest are buggy and garbage when you need to say things in order or with breaks...
        """
        def __init__(self, voice="en-US-AriaNeural"):
            self.voice = voice
            self._tmp_file = None
            self._stop_flag = False
            pygame.mixer.init()
            signal.signal(signal.SIGINT, self._handle_interrupt)

        # noinspection PyUnusedLocal
        def _handle_interrupt(self, signum, frame):
            print("\nKeyboardInterrupt caught! Stopping TTS...")
            self._stop_flag = True
            if self._tmp_file and os.path.exists(self._tmp_file):
                try:
                    pygame.mixer.music.stop()
                except Exception:
                    pass
            raise KeyboardInterrupt

        async def _speak_async(self, text: str):
            if self._stop_flag:
                return
            with tempfile.NamedTemporaryFile(delete=False, suffix=".mp3") as f:
                self._tmp_file = f.name

            # generate TTS
            tts = edge_tts.Communicate(text, self.voice)
            await tts.save(self._tmp_file)

            # load and play
            pygame.mixer.music.load(self._tmp_file)
            pygame.mixer.music.play()
            try:
                while pygame.mixer.music.get_busy():
                    if self._stop_flag:
                        pygame.mixer.music.stop()
                        break
                    pygame.time.wait(100)
            finally:
                # wait a short moment to ensure file is released
                time.sleep(0.1)
                if self._tmp_file and os.path.exists(self._tmp_file):
                    try:
                        os.remove(self._tmp_file)
                    except PermissionError:
                        # file still locked, try again later
                        pass
                self._tmp_file = None

        def speak(self, text: str):
            try:
                asyncio.run(self._speak_async(text))
            except KeyboardInterrupt:
                print("TTS stopped by user.")

    class KeywordManager:
        """
        The puzzle containing 5 keyword is set and managed here and links to the registry
        """
        @staticmethod
        def store(keyword: str, subkey=r"Software\VESSEL", value_name="Keywords") -> int:
            """
            Stores a keyword in the registry list if it doesn't exist and returns total number of keywords in registry.
            """
            try:
                # Open or create the subkey
                regkey = reg.CreateKey(reg.HKEY_CURRENT_USER, subkey)

                try:
                    # Try reading existing keywords
                    existing, _ = reg.QueryValueEx(regkey, value_name)
                    if not isinstance(existing, list):
                        existing = []
                except FileNotFoundError:
                    # Value does not exist yet
                    existing = []

                # Add keyword if it doesn't exist
                if keyword not in existing:
                    existing.append(keyword)
                    reg.SetValueEx(regkey, value_name, 0, reg.REG_MULTI_SZ, existing)

                reg.CloseKey(regkey)
                return len(existing)

            except Exception as e:
                handler.exception(f"Error accessing registry: {e}")
                return -1

        @staticmethod
        def delete(subkey=r"Software\VESSEL", value_name="Keywords") -> bool:
            """
            Deletes the registry value that stores the keywords.
            Returns True if deleted successfully, False otherwise.
            """
            try:
                regkey = reg.OpenKey(reg.HKEY_CURRENT_USER, subkey, 0, reg.KEY_SET_VALUE)
                reg.DeleteValue(regkey, value_name)
                reg.CloseKey(regkey)
                return True
            except FileNotFoundError:
                # Value or key does not exist
                return False
            except Exception as e:
                handler.exception(f"Error deleting value: {e}")
                return False

        @staticmethod
        def get_count(subkey=r"Software\VESSEL", value_name="Keywords") -> int:
            """
            Returns the number of keywords stored in the registry value.
            Returns 0 if the key or value does not exist.
            """
            try:
                regkey = reg.OpenKey(reg.HKEY_CURRENT_USER, subkey, 0, reg.KEY_READ)
                try:
                    keywords, _ = reg.QueryValueEx(regkey, value_name)
                    if isinstance(keywords, list):
                        return len(keywords)
                    else:
                        return 0
                except FileNotFoundError:
                    return 0
                finally:
                    reg.CloseKey(regkey)
            except FileNotFoundError:
                return 0
            except Exception as e:
                handler.exception(f"Error reading registry: {e}")
                return -1

    class VesselCompletion:
        """
        Simple class to manage and simplify if the player completed the VESSEL
        """
        def __init__(self, createLog: 'CreatePuzzleVesselLogs'):
            self.createLog = createLog

        def check_and_mark(self) -> bool:
            # Check if all logs exist
            all_exist = all(self.createLog.error_exist(ID=i) for i in range(1, 667)) and all(
                self.createLog.fight_exist(ID=i) for i in range(0, 43))

            if all_exist:
                key_path = r"Software\VESSEL\Completion"
                try:
                    # Open the key if it exists, otherwise create it
                    key = reg.CreateKey(reg.HKEY_CURRENT_USER, key_path)
                    # Set value "vessel_complete" to 1 (DWORD)
                    reg.SetValueEx(key, "vessel_complete", 0, reg.REG_DWORD, 1)
                    reg.CloseKey(key)
                except WindowsError as e:
                    handler.exception(f"Failed to set registry key: {e}")

            return all_exist

        @staticmethod
        def check_registry() -> bool:
            key_path = r"Software\VESSEL\Completion"
            try:
                key = reg.OpenKey(reg.HKEY_CURRENT_USER, key_path, 0, reg.KEY_READ)
                value, _ = reg.QueryValueEx(key, "vessel_complete")
                reg.CloseKey(key)
                return value == 1
            except FileNotFoundError:
                return False
            except Exception as e:
                handler.exception(f"Failed to read registry key: {e}")
                return False
