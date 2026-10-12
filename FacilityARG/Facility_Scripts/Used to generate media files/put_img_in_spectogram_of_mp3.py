import numpy as np
import librosa
from PIL import Image
from pydub import AudioSegment
import soundfile as sf

def next_power_of_two(x):
    return 1 << (x - 1).bit_length()

def image_to_audio_custom(image_path, sr=22050, max_duration=10):
    # Load image in grayscale
    img = Image.open(image_path).convert('L')
    orig_w, orig_h = img.size
    
    # We'll treat width as time frames, height as freq bins in spectrogram
    time_frames = orig_w
    freq_bins = orig_h
    
    # To use ISTFT, freq_bins = n_fft//2 + 1 --> n_fft = 2*(freq_bins -1)
    n_fft = 2 * (freq_bins - 1)
    
    # n_fft must be a power of two for efficiency and compatibility
    n_fft = next_power_of_two(n_fft)
    
    # Recalculate freq_bins after rounding n_fft
    freq_bins = n_fft // 2 + 1
    
    # Adjust image height to freq_bins to match n_fft power of two rounding
    img = img.resize((time_frames, freq_bins), Image.LANCZOS)
    img_data = np.array(img) / 255.0
    
    # Choose hop_length so duration <= max_duration
    # duration = (time_frames * hop_length) / sr  --> hop_length = duration * sr / time_frames
    hop_length = int(min(512, max(32, (max_duration * sr) / time_frames)))
    
    duration = (time_frames * hop_length) / sr
    
    # Flip image vertically for correct spectrogram freq orientation
    img_data = np.flipud(img_data)
    
    # Scale magnitude so image brightness influences amplitude
    magnitude = img_data * 100
    
    # Add random phase to avoid artifacts
    random_phase = np.exp(1j * 2 * np.pi * np.random.rand(*magnitude.shape))
    S_complex = magnitude * random_phase
    
    # ISTFT to get audio waveform
    audio = librosa.istft(S_complex, hop_length=hop_length, win_length=n_fft, length=int(duration * sr))
    
    # Normalize audio volume to about 0.3 max amplitude
    audio = audio / np.max(np.abs(audio)) * 0.3
    
    return audio, sr, duration

def main():
    image_path = 'qr.png'
    original_audio_path = 'audio.mp3'
    output_audio_path = 'too_much_work.mp3'
    
    image_audio, sr, duration = image_to_audio_custom(image_path, max_duration=5)
    print(f"Image converted to audio: duration={duration:.2f}s")
    
    import soundfile as sf
    sf.write('temp_image_audio.wav', image_audio, sr)
    
    original = AudioSegment.from_file(original_audio_path)
    img_audio = AudioSegment.from_wav('temp_image_audio.wav')
    
    img_audio = img_audio - 15  # reduce volume
    
    # Create 1 second silence
    silence = AudioSegment.silent(duration=1000)  # duration in ms
    
    # Append image audio then silence to original audio
    combined = original + img_audio + silence
    
    combined.export(output_audio_path, format='mp3')
    print(f'Created {output_audio_path} with embedded image audio followed by 1s silence at the end.')


if __name__ == '__main__':
    main()
