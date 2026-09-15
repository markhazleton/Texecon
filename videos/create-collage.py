"""Render a collage project, or a time range, with motion and optional audio."""

import argparse
from datetime import datetime
import importlib.util
import json
from pathlib import Path
import re
import subprocess
import tempfile

from collage_project import AUDIO_DIR, DEFAULT_CONFIG, ROOT, load_project, number
from collage_compositor import project_frame, scene_frame

spec = importlib.util.spec_from_file_location('documentary', ROOT / 'videos/create-documentary.py')
documentary = importlib.util.module_from_spec(spec)
spec.loader.exec_module(documentary)
FPS = 30


def audio_duration(path):
    result = subprocess.run([documentary.FFMPEG, '-hide_banner', '-i', str(path)], capture_output=True, text=True)
    match = re.search(r'Duration: (\d+):(\d+):(\d+(?:\.\d+)?)', result.stderr)
    if not match or not re.search(r'Audio:', result.stderr):
        raise ValueError(f'Cannot read audio: {path.name}')
    return int(match[1]) * 3600 + int(match[2]) * 60 + float(match[3])


def attach_audio(project, silent, output, start, duration):
    sound = project['sound']
    tracks = [(kind, sound[kind]) for kind in ('music', 'narration') if sound[kind]['file']]
    if not tracks:
        documentary.run(['-n', '-i', str(silent), '-c', 'copy', '-movflags', '+faststart', str(output)])
        return
    args = ['-n', '-i', str(silent)]
    filters, names = [], []
    full_duration = project['duration_seconds']
    for index, (kind, track) in enumerate(tracks, 1):
        file = AUDIO_DIR / track['file']
        source_duration = audio_duration(file)
        if track['loop']:
            args += ['-stream_loop', '-1']
        args += ['-i', str(file)]
        audible = max(.001, min(full_duration - track['start'], full_duration if track['loop'] else source_duration))
        fade_in, fade_out = min(track['fade_in'], audible), min(track['fade_out'], audible)
        filters.append(f'[{index}:a]aresample=48000,aformat=channel_layouts=stereo,asetpts=PTS-STARTPTS,'
                       f'atrim=duration={audible},volume={track["volume"]},'
                       f'afade=t=in:st=0:d={max(.001, fade_in)},'
                       f'afade=t=out:st={max(0, audible - fade_out)}:d={max(.001, fade_out)},'
                       f'adelay={round(track["start"] * 1000)}:all=1,apad,atrim=duration={full_duration}[{kind}]')
        names.append(kind)
    if len(names) == 2:
        if sound.get('duck_music', True):
            filters += ['[narration]asplit=2[voice][side]',
                        '[music][side]sidechaincompress=threshold=0.02:ratio=8:attack=30:release=400[bed]',
                        '[bed][voice]amix=inputs=2:duration=longest:normalize=0[mixed]']
        else:
            filters.append('[music][narration]amix=inputs=2:duration=longest:normalize=0[mixed]')
        track_name = 'mixed'
    else:
        track_name = names[0]
    filters.append(f'[{track_name}]atrim=start={start}:duration={duration},asetpts=PTS-STARTPTS,alimiter=limit=0.95:latency=1[out]')
    documentary.run([*args, '-filter_complex_threads', '1', '-filter_complex', ';'.join(filters),
                     '-map', '0:v:0', '-map', '[out]', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k',
                     '-t', str(duration), '-movflags', '+faststart', str(output)])


def render_project(project, destination, start=0, duration=None):
    output = Path(destination).resolve()
    manifest = output.with_suffix('.render.json')
    if output.suffix.lower() != '.mp4' or output.exists() or manifest.exists():
        raise ValueError('Choose a new output filename ending in .mp4.')
    number(start, 'Preview start', 0, project['duration_seconds'] - 1 / FPS)
    duration = project['duration_seconds'] - start if duration is None else duration
    number(duration, 'Render duration', 1 / FPS, project['duration_seconds'])
    duration = min(duration, project['duration_seconds'] - start)
    count = max(1, round(duration * FPS))
    duration = count / FPS
    output.parent.mkdir(parents=True, exist_ok=True)
    with tempfile.TemporaryDirectory(prefix='collage-render-') as temporary:
        silent = Path(temporary) / 'silent.mp4'
        log = Path(temporary) / 'encoder.log'
        command = [documentary.FFMPEG, '-hide_banner', '-loglevel', 'error', '-n',
                   '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', '1920x1080', '-r', str(FPS),
                   '-i', 'pipe:0', '-an', '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '20',
                   '-pix_fmt', 'yuv420p', '-threads', '2', '-video_track_timescale', '15360', str(silent)]
        print(f'Rendering {duration:.2f}s from {start:.2f}s ({count} frames)', flush=True)
        with log.open('w') as errors:
            process = subprocess.Popen(command, stdin=subprocess.PIPE, stderr=errors)
            try:
                for frame in range(count):
                    process.stdin.write(project_frame(project, start + frame / FPS).tobytes())
                    if frame % 120 == 0:
                        print(f'Frames {frame + 1}/{count} ({round((frame + 1) / count * 100)}%)', flush=True)
                process.stdin.close()
                if process.wait() != 0:
                    raise RuntimeError('Video encoder failed: ' + log.read_text())
            except BaseException:
                process.kill()
                process.wait()
                process.stdin.close()
                raise
        print('Mixing soundtrack and preparing MP4...', flush=True)
        attach_audio(project, silent, output, start, duration)
    manifest.write_text(json.dumps({**project, 'render_range': {'start': start, 'duration': duration}}, indent=2) + '\n', encoding='utf-8')
    print(f'Created {output}; duration {duration}s; {output.stat().st_size / 1024**2:.1f} MiB', flush=True)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--config', type=Path, default=DEFAULT_CONFIG)
    parser.add_argument('--output', type=Path)
    parser.add_argument('--validate', action='store_true')
    parser.add_argument('--start', type=float, default=0)
    parser.add_argument('--duration', type=float)
    args = parser.parse_args()
    try:
        project = load_project(args.config)
        if args.validate:
            print(f'Valid project: {len(project["scenes"])} scenes, {project["duration_seconds"]} seconds')
            return
        output = args.output or ROOT / 'videos/renders' / f'collage-{datetime.now():%Y%m%d-%H%M%S-%f}.mp4'
        render_project(project, output, args.start, args.duration)
    except (ValueError, OSError, RuntimeError) as error:
        parser.exit(1, f'{error}\n')


if __name__ == '__main__':
    main()
