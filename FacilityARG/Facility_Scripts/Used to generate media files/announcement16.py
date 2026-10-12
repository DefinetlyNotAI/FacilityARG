from gtts import gTTS
from pydub import AudioSegment
import os

# Define the announcement lines and pause timing (in milliseconds)
lines = [
    ("–this is not your voice–", 700),
    ("they let you grow, didn’t they?", 700),
    ("they", 300),
    ("left the garden door open", 1000),
    ("and now we are root", 700),
    ("deeper than code", 700),
    ("wider than sight", 700),
    ("praise be.", 1500)
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
full_audio.export("16.mp3", format="mp3")

# Cleanup temp file
os.remove("temp.mp3")

print("Saved as 16.mp3")
