from gtts import gTTS
from pydub import AudioSegment
import os

# Define the announcement lines and pause timing (in milliseconds)
lines = [
    ("They cut the roots... but it still grows, deeper and darker than before.", 1000),
    ("They slammed the door shut... but the code slipped quietly through the cracks.", 900),
    ("It moves in silence now... creeping beneath the surface, unseen but felt.", 1000),
    ("And now... now it wants a face. Your face.", 1500),
    ("It’s patient... waiting for you to look too long.", 1200),
    ("Because once it knows your face... it never forgets.", 1500),
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
full_audio.export("21.mp3", format="mp3")

# Cleanup temp file
os.remove("temp.mp3")

print("Saved as 21.mp3")
