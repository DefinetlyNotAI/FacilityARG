import ctypes
import json
import os
import re
import subprocess
import sys
from datetime import datetime
from pathlib import Path

import pyttsx3

from vessel import handler


# ----- Utils -----
class Utils:
    def __init__(self):
        self.engine = pyttsx3.init()

    @staticmethod
    def windows() -> bool:
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

    def tts_speak(self, message: str) -> None:
        self.engine.say(message)
        self.engine.runAndWait()

    @staticmethod
    def run_script(script_name: str) -> str | None:
        """
        Execute a Python script from the 'scripts/' directory.
        Only scripts ending with '_GENCODE.py' are allowed.
        """
        os.chdir(Path("scripts"))
        script_path = Path(script_name)

        if not script_path.exists():
            raise FileNotFoundError(f"Script not found: {script_path}")

        if not script_name.endswith("_GENCODE.py"):
            raise ValueError("Only scripts ending with '_GENCODE.py' are allowed.")

        try:
            # Run the script in a separate process
            result = subprocess.run(
                ["python", str(script_path)],
                capture_output=True,
                text=True,
                check=True
            )
            os.chdir(Path(".."))
            return result.stdout
        except subprocess.CalledProcessError as e:
            handler.exception(f"Script execution failed: {e.stderr}")
            os.chdir(Path(".."))
            sys.exit(-1)

    # noinspection PyUnresolvedReferences
    @staticmethod
    def trigger_crash():
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
            cmd = (
                'powershell -Command "Add-Type -AssemblyName System.Device; '
                '$loc = New-Object System.Device.Location.GeoCoordinateWatcher; '
                '$loc.Start(); Start-Sleep -Seconds 3; '
                '$loc.Position.Location | ConvertTo-Json"'
            )
            result = subprocess.check_output(cmd, shell=True, text=True)
            loc = json.loads(result)
            lat = loc.get("Latitude", "Unknown")
            lon = loc.get("Longitude", "Unknown")
            return {lat}, {lon}
        except Exception as e:
            return "Location unavailable", {e}
