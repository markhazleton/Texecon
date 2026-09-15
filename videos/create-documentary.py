"""Render the Jared E Hazleton documentary slideshow using Pillow and imageio-ffmpeg."""

from concurrent.futures import ThreadPoolExecutor
import json
from pathlib import Path
import subprocess
import tempfile

import imageio_ffmpeg
from PIL import Image, ImageDraw, ImageFont, ImageOps


ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / 'videos' / 'jared-e-hazleton-documentary.mp4'
FFMPEG = imageio_ffmpeg.get_ffmpeg_exe()
SIZE = (1920, 1080)
FPS = 30
FOCUS_PHOTO = '2019-07-14 18.07.33.jpg'


def run(arguments):
    subprocess.run([FFMPEG, '-hide_banner', '-loglevel', 'error', '-nostdin',
                    *arguments], check=True)


def prepare(photo, card=False, closing=False, heading='Jared E Hazleton', subtitle=None):
    frame = Image.new('RGB', SIZE, '#101419')
    with Image.open(photo) as original:
        picture = ImageOps.exif_transpose(original).convert('RGB')
        if card and photo.name == FOCUS_PHOTO:
            width, height = picture.size
            picture = picture.crop((int(width * 0.15), int(height * 0.36),
                                    int(width * 0.52), int(height * 0.97)))
        picture.thumbnail((760, 800) if card else (1740, 920), Image.Resampling.LANCZOS)
        x = 1060 + (760 - picture.width) // 2 if card else (1920 - picture.width) // 2
        frame.paste(picture, (x, (1080 - picture.height) // 2))
    if card:
        draw = ImageDraw.Draw(frame)
        words = heading.split()
        split = min(range(1, len(words)), key=lambda i: abs(len(' '.join(words[:i])) - len(' '.join(words[i:])))) if len(words) > 1 else 0
        lines = [' '.join(words[:split]), ' '.join(words[split:])] if split else [heading]
        font_size = 78
        title = ImageFont.truetype('C:/Windows/Fonts/georgia.ttf', font_size)
        while max(draw.textlength(line, font=title) for line in lines) > 850 and font_size > 8:
            font_size -= 2
            title = ImageFont.truetype('C:/Windows/Fonts/georgia.ttf', font_size)
        subtitle = subtitle if subtitle is not None else ('MOMENTS TO REMEMBER' if closing else 'A LIFE IN PHOTOGRAPHS')
        small_size = 28
        small = ImageFont.truetype('C:/Windows/Fonts/segoeui.ttf', small_size)
        while draw.textlength(subtitle, font=small) > 850 and small_size > 12:
            small_size -= 1
            small = ImageFont.truetype('C:/Windows/Fonts/segoeui.ttf', small_size)
        draw.line((140, 350, 280, 350), fill='#bba67b', width=3)
        for index, line in enumerate(lines):
            draw.text((140, 400 + index * 95), line, font=title, fill='#f4f0e8')
        draw.text((145, 635), subtitle, font=small, fill='#c7c3ba')
    return frame


def main():
    if OUTPUT.exists():
        raise SystemExit(f'Output already exists: {OUTPUT}')
    photos = sorted((p for p in (ROOT / 'images').iterdir()
                     if p.suffix.lower() in {'.jpg', '.jpeg', '.png', '.webp'}),
                    key=lambda p: p.name.casefold())
    portrait = ROOT / 'images' / FOCUS_PHOTO
    photos.remove(portrait)
    photos.insert(0, portrait)
    slides = [(portrait, True, False), *[(p, False, False) for p in photos],
              (portrait, True, True)]
    with tempfile.TemporaryDirectory(prefix='jared-documentary-') as directory:
        folder = Path(directory)

        def render(entry):
            index, (photo, card, closing) = entry
            focused = photo.name == FOCUS_PHOTO and not card
            duration = 6 if card else (8 if focused else 4)
            count = duration * FPS
            source = folder / f'{index:04d}.png'
            prepare(photo, card, closing).save(source)
            progress = f'(on/{count - 1})'
            # Smoothstep easing prevents abrupt starts and stops in camera motion.
            ease = f'({progress}*{progress}*(3-2*{progress}))'
            zoom = '1' if card else (f'1+0.055*{ease}' if index % 2 else f'1.055-0.055*{ease}')
            horizontal = f'(iw-iw/zoom)*(0.35+0.3*{ease})' if index % 3 else f'(iw-iw/zoom)*(0.65-0.3*{ease})'
            vertical = f'(ih-ih/zoom)*(0.4+0.2*{ease})'
            if focused:
                zoom = f'1.04+0.24*{ease}'
                horizontal = '(iw-iw/zoom)*0.36'
                vertical = '(ih-ih/zoom)*0.72'
            filters = (f"scale=3840:2160,zoompan=z='{zoom}':x='{horizontal}':y='{vertical}':"
                       f'd={count}:s=1920x1080:fps={FPS},'
                       f'fade=t=in:st=0:d=0.4,fade=t=out:st={duration - 0.4}:d=0.4,format=yuv420p')
            clip = folder / f'{index:04d}.mp4'
            run(['-n', '-i', str(source), '-vf', filters, '-frames:v', str(count),
                 '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '20',
                 '-threads', '2', '-an', str(clip)])
            return clip

        clips = []
        with ThreadPoolExecutor(max_workers=2) as pool:
            for index, clip in enumerate(pool.map(render, enumerate(slides))):
                clips.append(clip)
                if (index + 1) % 10 == 0 or index + 1 == len(slides):
                    print(f'Rendered {index + 1}/{len(slides)} slides', flush=True)
        playlist = folder / 'concat.txt'
        playlist.write_text('\n'.join(f"file '{clip.name}'" for clip in clips), encoding='utf-8')
        run(['-n', '-f', 'concat', '-safe', '0', '-i', str(playlist),
             '-c', 'copy', '-movflags', '+faststart', str(OUTPUT)])
    OUTPUT.with_suffix('.json').write_text(json.dumps({
        'title': 'Jared E Hazleton', 'photos': [p.name for p in photos],
        'duration_seconds': len(photos) * 4 + 16, 'resolution': SIZE,
        'fps': FPS, 'transition': '0.4-second fade out and fade in',
        'motion': 'Alternating eased zoom and pan, wide group framing',
        'audio': False, 'portrait_source': str(portrait.relative_to(ROOT)),
        'focus': {'photo': FOCUS_PHOTO, 'subject': 'Jared on the left, arms crossed',
                  'source': 'User-provided identification', 'seconds': 8},
    }, indent=2) + '\n', encoding='utf-8')
    print(f'Created {OUTPUT}', flush=True)


if __name__ == '__main__':
    main()
