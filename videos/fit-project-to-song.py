"""Make every photo in a collage project unique and fit the runtime to its song.

Replaces repeated photos with unused ones from the library, then rescales scene
durations so the rendered video ends exactly when the soundtrack does. The
renderer trims audio to the video length, so a short video truncates the song.

    python videos/fit-project-to-song.py videos/JaredHazleton-WonderfulWorlds.json
    python videos/fit-project-to-song.py <config> --apply
"""

import argparse
import json
import re
import subprocess
import sys
from pathlib import Path

import imageio_ffmpeg

sys.path.insert(0, str(Path(__file__).resolve().parent))

from collage_project import AUDIO_DIR, load_project, normalize_project, photo_names

FPS = 30  # the collage renderer only supports 1920x1080 at 30 fps


def audio_duration(path: Path) -> float:
    result = subprocess.run(
        [imageio_ffmpeg.get_ffmpeg_exe(), '-hide_banner', '-i', str(path)],
        capture_output=True, text=True)
    match = re.search(r'Duration: (\d+):(\d+):(\d+(?:\.\d+)?)', result.stderr)
    if not match:
        raise SystemExit(f'Could not read the duration of {path.name}')
    hours, minutes, seconds = match.groups()
    return int(hours) * 3600 + int(minutes) * 60 + float(seconds)


def photo_ranking():
    """Order library photos best-first using the dedupe manifest, if present."""
    manifest = Path(__file__).resolve().parents[1] / 'unique' / 'manifest.json'
    if not manifest.is_file():
        return {}
    ranking = {}
    for entry in json.loads(manifest.read_text(encoding='utf-8')).get('files', []):
        width, _, height = entry['dimensions'].partition('x')
        ranking[entry['name']] = (int(width) * int(height), entry.get('quality', 0))
    return ranking


def deduplicate(scenes, library):
    """Give every slot its own photo, drawing the best unused stock available."""
    ranking = photo_ranking()
    used = {name for scene in scenes for name in scene['photos']}
    spare = sorted(
        (name for name in library if name not in used),
        key=lambda name: (ranking.get(name, (0, 0)), name),
        reverse=True,
    )
    seen, swaps, exhausted = set(), [], False
    for index, scene in enumerate(scenes, start=1):
        for position, name in enumerate(scene['photos']):
            if name not in seen:
                seen.add(name)
                continue
            if not spare:
                exhausted = True
                continue
            replacement = spare.pop(0)
            scene['photos'][position] = replacement
            seen.add(replacement)
            swaps.append((index, position + 1, name, replacement))
    return swaps, exhausted, len(spare)


def refit(scenes, target_seconds, transition, fps):
    """Distribute the target runtime across scenes, preserving their proportions."""
    overlap = (len(scenes) - 1) * transition
    target_frames = round((target_seconds + overlap) * fps)
    minimum = int(round(2 * transition * fps)) + 1

    current = [max(1, round(scene['duration'] * fps)) for scene in scenes]
    total = sum(current)
    scaled = [frames * target_frames / total for frames in current]
    frames = [max(minimum, int(value)) for value in scaled]

    # Largest-remainder allocation so the frames sum exactly to the target.
    remainders = sorted(range(len(scenes)), key=lambda i: scaled[i] - int(scaled[i]), reverse=True)
    position = 0
    while sum(frames) < target_frames:
        frames[remainders[position % len(remainders)]] += 1
        position += 1
    while sum(frames) > target_frames:
        candidates = [i for i in range(len(frames)) if frames[i] > minimum]
        if not candidates:
            raise SystemExit('Target runtime is shorter than the minimum scene lengths allow.')
        frames[max(candidates, key=lambda i: frames[i])] -= 1

    for scene, count in zip(scenes, frames):
        scene['duration'] = round(count / fps, 6)
    return sum(frames) / fps - overlap


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__,
                                     formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument('config', type=Path)
    parser.add_argument('--apply', action='store_true', help='Write the changes to the config.')
    args = parser.parse_args()

    # Normalising first resolves photo names that dedupe superseded, so the
    # repeat check sees the files the renderer will actually load.
    raw = normalize_project(load_project(args.config))
    scenes = raw['scenes']
    fps = raw.get('fps', FPS)
    transition = raw.get('transition_seconds', 1)

    music = (raw.get('sound') or {}).get('music') or {}
    if not music.get('file'):
        raise SystemExit('This project has no music track to fit against.')
    song = AUDIO_DIR / music['file']
    if not song.is_file():
        raise SystemExit(f'Soundtrack not found: {song}')
    target = audio_duration(song) - float(music.get('start') or 0)

    print(f'Project : {args.config.name}')
    print(f'Song    : {song.name} ({audio_duration(song):.3f}s)')
    print(f'Runtime : {raw["duration_seconds"]:.3f}s -> {target:.3f}s '
          f'({target - raw["duration_seconds"]:+.3f}s)')

    swaps, exhausted, spare_left = deduplicate(scenes, set(photo_names()))
    print(f'\nReplaced {len(swaps)} repeated photo(s); {spare_left} unused photos still in reserve')
    for index, slot, old, new in swaps:
        print(f'  scene {index:>3} slot {slot}: {old}  ->  {new}')
    if exhausted:
        print('  ! ran out of unused photos; some repeats remain')

    achieved = refit(scenes, target, transition, fps)
    raw['duration_seconds'] = round(achieved, 3)
    raw['unique_photos'] = len({name for scene in scenes for name in scene['photos']})

    checked = normalize_project(json.loads(json.dumps(raw)))
    slots = [name for scene in checked['scenes'] for name in scene['photos']]
    print(f'\nAfter   : {checked["duration_seconds"]:.3f}s over {len(checked["scenes"])} scenes')
    print(f'Photos  : {len(slots)} slots, {len(set(slots))} distinct')
    print(f'Drift   : {checked["duration_seconds"] - target:+.3f}s against the song')

    if abs(checked['duration_seconds'] - target) > 1 / fps:
        raise SystemExit('Refused to continue: runtime does not line up with the song.')
    if len(slots) != len(set(slots)):
        raise SystemExit('Refused to continue: photos are still repeated.')

    if args.apply:
        args.config.write_text(json.dumps(raw, indent=2) + '\n', encoding='utf-8')
        print(f'\nWrote {args.config}')
    else:
        print('\nDry run. Re-run with --apply to write these changes.')
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
