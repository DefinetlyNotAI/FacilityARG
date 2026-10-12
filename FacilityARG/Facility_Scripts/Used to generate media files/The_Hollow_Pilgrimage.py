import asyncio
import os
from pydub import AudioSegment
from gtts import gTTS
import edge_tts
from PIL import Image
from moviepy.editor import AudioFileClip, ImageSequenceClip
import glob

# OUTPUT DIRECTORY
os.makedirs("output_segments", exist_ok=True)

# SECTION DATA: (text, engine, voice_name)
sections: list[tuple[str, str, str | None, bool | None]] = [
    # TTS begins-low, slow, ominous
    ("Did you mistake the smoke for dawn? An credidisti auroram esse fumum? Did you think the ash would pave you on? Via ignota, via mortis. You came for light, now all is gone-Only cinders greet the hopeful fawn.",
     "edge", "en-US-GuyNeural", None),

    # brief crackling pause, then rising intensity
    ("Was it fate that drew your stride? Or just the itch to bleed with pride? In gloria vana, sanguis placet. Either way, you’re crucified, Beneath the weight you deified.",
     "gtts", None, None),

    # Spoken interlude, poetic
    ("No sanctuary - just rusted spires, Cracked bells tolling funeral choirs. Each step you take ignites the mire, A path that screams but never tires. The choir howls, the marrow shakes-Even silence learns to break. Silencio... fractum est . There is no end, no give, no take-Only what you failed to fake.",
     "edge", "en-GB-RyanNeural", None),

    # Chant, pitch intensifies
    ("Venite, venite, ossa camminanti. You stitched-together wretch of wanting. This vault of bone and soot and mesh Is not a tomb-it is a test. Nulla pace. Nulla morte. Solo l'attesa. Drink deep from wells where truth has drowned, Speak oaths in tongues no longer found, And wear this crown-of thorns and sound, That weeps each time it’s passed around.",
     "gtts", None, None),

    # CHORUS SECTION (shouting tone)
    ("MARCH! THROUGH SHRIEKING OVAL VEINS! FLOODED FIELDS! TWISTED BRAINS! EACH! WHISPERED! VOW! DECAYS! EVERY TRUTH YOU ONCE OBEYED! THIS IS THE CHOIR OF MAN UNMADE! ECCE HOMO! FRACTUS! LACERATUS! YOUR NAME?! FORGOTTEN! YOUR FATE?! ENGRAVED! IN ROT! IN GLASS! IN A SILENCE THAT SWAYS!",
     "edge", "en-US-ChristopherNeural", True),

    # Sudden drop, nearly whispering
    ("Do you feel it now? The myth collapsing? The pulse behind the wall, still grasping? There’s nothing left of you-just asking. Dissolutio… incarnata.",
     "edge", "en-US-AnaNeural", None),

    # Final crawl, somber
    ("CRAWL, THEN. THROUGH FIELDS OF WIRE. TASTE THE STATIC. FEED THE FIRE. YOU ARE NOT THE FIRST TO TIRE, BUT YOU MAY BE THE LAST TO LIE. BENEATH THE COLD UNSEEING SKY, WHERE EVEN STARS COME HERE TO DIE. Non omnis moriar... ma nulla resta.",
     "gtts", None, None),

    # Final Voice (deep reverb, pitch dropped)
    ("Et peregrinatio finitur... In tenebris, per sanguinem, per silenzio eterno... Requiesce? No... Ricomincia.",
     "edge", "en-US-GuyNeural", None),
]


async def generate_edge_tts(text, voice, filename):
    communicate = edge_tts.Communicate(text=text, voice=voice)
    await communicate.save(filename)


def generate_gtts(text, filename):
    tts = gTTS(text)
    tts.save(filename)


async def generate_all_segments():
    audio_segments = []

    for idx, (text, engine, voice, is_anger) in enumerate(sections):
        filename = f"output_segments/segment_{idx}.mp3"

        if engine == "edge":
            print(f"[Edge] Generating: {text[:30]}...")
            await generate_edge_tts(text, voice, filename)
        elif engine == "gtts":
            print(f"[gTTS] Generating: {text[:30]}...")
            generate_gtts(text, filename)
        else:
            raise ValueError(f"Unknown engine: {engine}")

        # Load segment
        audio = AudioSegment.from_file(filename)
        # Normalize volume
        audio = audio.set_frame_rate(44100).set_channels(2)
        audio_segments.append(audio)

    return audio_segments


def stitch_segments(segments, output_path="The_Hollow_Pilgrimage.mp4"):
    # Export final audio to a temporary file
    temp_audio_path = "output_segments/final_audio.mp3"
    final_audio = segments[0]
    for seg in segments[1:]:
        final_audio = final_audio.append(seg, crossfade=300)
    final_audio.export(temp_audio_path, format="mp3")

    # Gather images from media/
    image_files = sorted(glob.glob("media/*"))
    if not image_files:
        raise FileNotFoundError("No images found in media/")

    # Calculate number of images needed
    audio_clip = AudioFileClip(temp_audio_path)
    duration = audio_clip.duration
    img_duration = 0.1  # 100ms per image
    num_images_needed = int(duration / img_duration) + 1

    # Loop images as needed
    images = [image_files[i % len(image_files)] for i in range(num_images_needed)]

    # Create video clip
    # Find the largest image dimensions
    max_width, max_height = 0, 0
    for img_path in images:
        with Image.open(img_path) as img:
            w, h = img.size
            if w > max_width:
                max_width = w
            if h > max_height:
                max_height = h

    # Pad all images to the largest size with a black background
    padded_images = []
    for img_path in images:
        with Image.open(img_path) as img:
            bg = Image.new("RGB", (max_width, max_height), (0, 0, 0))
            offset = ((max_width - img.width) // 2, (max_height - img.height) // 2)
            bg.paste(img, offset)
            temp_path = f"output_segments/padded_{os.path.basename(img_path)}"
            bg.save(temp_path)
            padded_images.append(temp_path)
    images = padded_images

    video_clip = ImageSequenceClip(images, fps=20).set_audio(audio_clip)
    video_clip.write_videofile(output_path, codec="libx264", audio_codec="aac", fps=20)

    print(f"[✓] Final video saved to: {output_path}")


if __name__ == "__main__":
    stitch_segments(asyncio.get_event_loop().run_until_complete(generate_all_segments()))
