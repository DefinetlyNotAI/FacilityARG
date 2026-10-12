from gtts import gTTS
from pydub import AudioSegment
import os

# Define the announcement lines and pause timing (in milliseconds)
lines = [
    ("this is not a test", 600),
    ("multiple points of cognitive bleed detected", 800),
    ("do not attempt to power off your terminal", 700),
    ("do not respond to familiar voices", 700),
    ("VESSEL cycle has begun", 900),
    ("you are only seeing this", 400),
    ("because you were chosen", 1200)
]


# Create silence chunks
def silence(duration_ms):
    return AudioSegment.silent(duration=duration_ms)

# Assemble full message
full_audio = AudioSegment.from_mp3("dingding.mp3")  # Start with PA ding

for text, pause in lines:
    tts = gTTS(text=text, lang='en')
    tts.save("temp.mp3")
    speech = AudioSegment.from_mp3("temp.mp3")
    full_audio += speech + silence(pause)

# Export final combined mp3
full_audio.export("20.mp3", format="mp3")

# Cleanup temp file
os.remove("temp.mp3")

print("Saved as 20.mp3")
