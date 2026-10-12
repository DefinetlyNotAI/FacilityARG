import ffmpeg

# Concatenate audio1 + audio2
ffmpeg.input('concat:gunload.mp3|gunshot.mp3').output('gun.mp3').run()
