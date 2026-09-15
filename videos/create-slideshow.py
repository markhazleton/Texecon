"""Create a silent full-screen slideshow from both local photo libraries."""
import argparse
from concurrent.futures import ThreadPoolExecutor
import json
from pathlib import Path
import subprocess
import tempfile
from PIL import Image, ImageEnhance, ImageFilter, ImageOps
import imageio_ffmpeg
from collage_project import ROOT, photo_names, photo_path

SIZE = (1920, 1080)
FPS = 30
EFFECTS = ['fade', 'smoothleft', 'dissolve', 'wipeup', 'smoothright',
           'circleopen', 'fade', 'wipedown', 'dissolve', 'circleclose']


def prepare(name):
    with Image.open(photo_path(name)) as source:
        photo = ImageOps.exif_transpose(source).convert('RGB')
        background = ImageOps.fit(photo, (480, 270), Image.Resampling.LANCZOS)
        background = background.filter(ImageFilter.GaussianBlur(18))
        background = ImageEnhance.Brightness(background).enhance(.55).resize(SIZE)
        photo = ImageOps.contain(photo, SIZE, Image.Resampling.LANCZOS)
        background.paste(photo, ((SIZE[0] - photo.width) // 2, (SIZE[1] - photo.height) // 2))
        return background


def run(arguments):
    result = subprocess.run([imageio_ffmpeg.get_ffmpeg_exe(), '-hide_banner',
                             '-loglevel', 'error', '-nostdin', *arguments],
                            capture_output=True, text=True)
    if result.returncode:
        raise RuntimeError(result.stderr)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--seconds', type=float, default=3, help='Uninterrupted hold per photo')
    parser.add_argument('--transition-seconds', type=float, default=.5)
    parser.add_argument('--output', type=Path, default=ROOT / 'videos/renders/JaredHazleton-AllPhotos-Slideshow.mp4')
    parser.add_argument('--limit', type=int, help='Render only the first N photos for verification')
    args = parser.parse_args()
    if not 1 <= args.seconds <= 120 or not 0 < args.transition_seconds <= 2:
        parser.error('Choose a hold from 1 to 120 seconds and a transition up to 2 seconds.')
    if args.limit is not None and args.limit < 1:
        parser.error('--limit must be positive')
    output = args.output.resolve()
    manifest = output.with_suffix('.json')
    if output.suffix.lower() != '.mp4' or output.exists() or manifest.exists():
        parser.error('Choose an unused .mp4 output filename.')
    names = photo_names()
    if args.limit is not None:
        names = names[:args.limit]
    if not names:
        parser.error('No photos found.')
    hold_frames = round(args.seconds * FPS)
    transition_frames = max(1, round(args.transition_seconds * FPS))
    hold, transition = hold_frames / FPS, transition_frames / FPS
    frame_count = len(names) * hold_frames + (len(names) - 1) * transition_frames
    output.parent.mkdir(parents=True, exist_ok=True)
    with tempfile.TemporaryDirectory(prefix='texecon-fullscreen-slideshow-') as temporary:
        folder = Path(temporary)

        def prepare_file(entry):
            index, name = entry
            destination = folder / f'photo-{index:04d}.png'
            prepare(name).save(destination, compress_level=1)
            return destination

        images = []
        with ThreadPoolExecutor(max_workers=2) as pool:
            for index, prepared in enumerate(pool.map(prepare_file, enumerate(names)), 1):
                images.append(prepared)
                if index % 25 == 0 or index == len(names):
                    print(f'Prepared {index}/{len(names)} photos', flush=True)

        def render(index):
            clip = folder / f'clip-{index:04d}.mp4'
            command = ['-n', '-loop', '1', '-framerate', str(FPS), '-i', str(images[index])]
            count = hold_frames
            if index + 1 < len(images):
                command += ['-loop', '1', '-framerate', str(FPS), '-i', str(images[index + 1]),
                            '-filter_complex_threads', '1', '-filter_complex',
                            f'[0:v][1:v]xfade=transition={EFFECTS[index % len(EFFECTS)]}:'
                            f'duration={transition}:offset={hold},format=yuv420p[v]', '-map', '[v]']
                count += transition_frames
            else:
                command += ['-vf', 'format=yuv420p']
            run([*command, '-frames:v', str(count), '-r', str(FPS), '-c:v', 'libx264',
                 '-preset', 'veryfast', '-crf', '20', '-threads', '2',
                 '-video_track_timescale', '15360', '-an', str(clip)])
            return clip

        clips = []
        with ThreadPoolExecutor(max_workers=2) as pool:
            for index, clip in enumerate(pool.map(render, range(len(names))), 1):
                clips.append(clip)
                if index % 10 == 0 or index == len(names):
                    print(f'Rendered {index}/{len(names)} slides ({round(index / len(names) * 100)}%)', flush=True)
        playlist = folder / 'concat.txt'
        playlist.write_text('\n'.join(f"file '{clip.name}'" for clip in clips), encoding='utf-8')
        run(['-n', '-f', 'concat', '-safe', '0', '-i', str(playlist),
             '-c', 'copy', '-movflags', '+faststart', str(output)])
    manifest.write_text(json.dumps({
        'title': 'Jared Hazleton - All Photos Slideshow', 'resolution': SIZE, 'fps': FPS,
        'hold_seconds': hold, 'transition_seconds': transition,
        'duration_seconds': frame_count / FPS, 'frame_count': frame_count, 'audio': False,
        'presentation': 'Full photo, full-screen blurred background, no titles or borders',
        'photos': names, 'transitions': [EFFECTS[i % len(EFFECTS)] for i in range(len(names) - 1)],
    }, indent=2) + '\n', encoding='utf-8')
    print(f'Created {output}; {len(names)} photos; {frame_count / FPS:g}s; '
          f'{output.stat().st_size / 1024**2:.1f} MiB', flush=True)


if __name__ == '__main__':
    main()
