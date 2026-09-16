"""Shared project validation for the collage editor and renderer."""

from copy import deepcopy
import json
import math
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DEFAULT_CONFIG = ROOT / 'videos/jared-e-hazleton-collage.json'
EFFECTS = ['fade', 'smoothleft', 'dissolve', 'wipeup', 'circleopen',
           'smoothright', 'fade', 'wipedown', 'radial', 'dissolve']
MOTIONS = ['push-in', 'pull-out', 'pan-left', 'pan-right', 'still']
DEFAULT_EFFECTS = EFFECTS.copy()
EFFECTS.append('morph')
AUDIO_DIR = ROOT / 'videos/audio'
BACKGROUND = {'style': 'solid', 'color': '#101419', 'color2': '#394655', 'blur': 30, 'brightness': 1}
POSE = {'x': 0, 'y': 0, 'scale': 1, 'rotation': 0, 'zoom': 1}
LAYOUTS = {
    'Pair': [[90, 170, 852, 800], [978, 170, 852, 800]],
    'Feature + two': [[90, 170, 1100, 800], [1226, 170, 604, 382], [1226, 588, 604, 382]],
    'Four photos': [[90, 170, 852, 382], [978, 170, 852, 382],
                    [90, 588, 852, 382], [978, 588, 852, 382]],
    'Three columns': [[90, 170, 556, 800], [682, 170, 556, 800], [1274, 170, 556, 800]],
}


def audio_names():
    return sorted((p.name for p in AUDIO_DIR.glob('*') if p.is_file() and p.suffix.lower() in
                   {'.mp3', '.wav', '.m4a', '.aac', '.ogg', '.flac'}), key=str.casefold)


def primary_library():
    """The complete, deduplicated image library used by the video editor."""
    return ROOT / 'unique'


def photo_libraries():
    return ((primary_library(), ''),)


def library_label():
    return primary_library().name


def photo_aliases():
    """Map superseded photo names to their surviving file in unique/."""
    manifest = primary_library() / 'manifest.json'
    key = (str(manifest), manifest.stat().st_mtime_ns if manifest.is_file() else None)
    if getattr(photo_aliases, '_key', object()) != key:
        data = json.loads(manifest.read_text(encoding='utf-8')) if key[1] else {}
        photo_aliases._key = key
        photo_aliases._value = data.get('aliases', {})
    return photo_aliases._value


def background(value):
    if not isinstance(value, dict):
        raise ValueError('Background must be an object.')
    result = {**BACKGROUND, **value}
    if result['style'] not in ('solid', 'gradient', 'paper', 'blur'):
        raise ValueError('Choose a solid, gradient, paper, or blur background.')
    for key in ('color', 'color2'):
        if not isinstance(result[key], str) or not re.fullmatch(r'#[0-9a-fA-F]{6}', result[key]):
            raise ValueError('Background colors must be six-digit hex colors.')
    number(result['blur'], 'Background blur', 0, 80)
    number(result['brightness'], 'Background brightness', 0.1, 1.5)
    return result


def photo_animation(value):
    if not isinstance(value, dict):
        raise ValueError('Photo animation must be an object.')
    result = deepcopy(value)
    for key in ('start', 'end'):
        pose = result.setdefault(key, {})
        if not isinstance(pose, dict):
            raise ValueError('Photo keyframes must be objects.')
        result[key] = {**POSE, **pose}
        for field, bounds in {'x': (-960, 960), 'y': (-540, 540), 'scale': (0.3, 2),
                              'rotation': (-30, 30), 'zoom': (1, 3)}.items():
            number(result[key][field], f'Photo {key} {field}', *bounds)
    focal = result.setdefault('focal', {'x': 0.5, 'y': 0.5})
    if not isinstance(focal, dict):
        raise ValueError('Focal point must be an object.')
    for axis in ('x', 'y'):
        number(focal.get(axis), f'Focal {axis}', 0, 1)
    return result


def photo_names():
    names = []
    for folder, prefix in photo_libraries():
        names.extend(prefix + p.name for p in folder.glob('*')
                     if p.is_file() and p.suffix.lower() in {'.jpg', '.jpeg', '.png', '.webp'})
    return sorted(names, key=str.casefold)


def photo_path(name):
    """Resolve image IDs from unique/, retaining aliases via its manifest."""
    if not isinstance(name, str):
        raise ValueError(f'Photo not found in {library_label()}: {name!r}')
    if name.startswith('unique/'):
        name = name.removeprefix('unique/')
    if name not in photo_names():
        alias = photo_aliases().get(name) or photo_aliases().get(Path(name).name)
        if alias is None or alias not in photo_names():
            raise ValueError(f'Photo not found in {library_label()}: {name!r}')
        name = alias
    return primary_library() / name


def number(value, label, minimum, maximum):
    if (isinstance(value, bool) or not isinstance(value, (int, float))
            or not math.isfinite(value) or not minimum <= value <= maximum):
        raise ValueError(f'{label} must be a number between {minimum} and {maximum}.')
    return value


def normalize_project(raw):
    if not isinstance(raw, dict) or not isinstance(raw.get('scenes'), list):
        raise ValueError('Open a collage project with a scenes array. images-slideshow.json is a different format.')
    project = deepcopy(raw)
    if project.get('schema_version', 1) != 1:
        raise ValueError('Unsupported project schema version.')
    title = project.get('title')
    if not isinstance(title, str) or not title.strip() or len(title) > 80:
        raise ValueError('Title must contain 1–80 characters.')
    if project.get('resolution', [1920, 1080]) != [1920, 1080] or project.get('fps', 30) != 30:
        raise ValueError('This renderer supports 1920 × 1080 at 30 fps.')
    project['background'] = background(project.get('background', {}))
    tracks = project.setdefault('sound', {})
    if not isinstance(tracks, dict):
        raise ValueError('Sound must be an object.')
    for kind in ('music', 'narration'):
        track = tracks.setdefault(kind, {})
        if not isinstance(track, dict):
            raise ValueError('Audio tracks must be objects.')
        defaults = {'file': '', 'volume': 0.3 if kind == 'music' else 1, 'start': 0,
                    'fade_in': 2 if kind == 'music' else 0.1, 'fade_out': 3 if kind == 'music' else 0.1,
                    'loop': kind == 'music'}
        tracks[kind] = track = {**defaults, **track}
        if not isinstance(track['file'], str) or (track['file'] and track['file'] not in audio_names()):
            raise ValueError(f'{kind.title()} audio file is missing from videos/audio.')
        for field, bounds in {'volume': (0, 2), 'start': (0, 60000), 'fade_in': (0, 30), 'fade_out': (0, 30)}.items():
            number(track[field], f'{kind} {field}', *bounds)
        if not isinstance(track['loop'], bool) or (kind == 'narration' and track['loop']):
            raise ValueError('Loop must be boolean; narration cannot loop.')
    tracks.setdefault('duck_music', True)
    if not isinstance(tracks['duck_music'], bool):
        raise ValueError('Music ducking must be true or false.')
    transition = number(project.get('transition_seconds', 1), 'Transition duration', 0.1, 2)
    transition = round(transition * 30) / 30
    scenes = project['scenes']
    if not 1 <= len(scenes) <= 500:
        raise ValueError('A project must contain 1–500 scenes.')
    available = set(photo_names())
    aliases = photo_aliases()
    used = set()
    for index, scene in enumerate(scenes):
        label = f'Scene {index + 1}'
        if not isinstance(scene, dict):
            raise ValueError(f'{label} must be an object.')
        photos = scene.get('photos')
        if not isinstance(photos, list) or not 1 <= len(photos) <= 4:
            raise ValueError(f'{label} needs 1–4 photos.')
        for position, name in enumerate(photos):
            if not isinstance(name, str):
                raise ValueError(f'{label}: photo does not exist in {library_label()}: {name!r}')
            if name.startswith('unique/'):
                name = name.removeprefix('unique/')
                photos[position] = name
            if name not in available:
                # Rewrite photos that dedupe superseded onto their surviving file.
                resolved = aliases.get(name) or aliases.get(Path(name).name)
                if resolved not in available:
                    raise ValueError(
                        f'{label}: photo does not exist in {library_label()}: {name!r}')
                photos[position] = resolved
        used.update(photos)
        duration = number(scene.get('duration'), f'{label} duration', 1, 120)
        duration = round(duration * 30) / 30
        if duration <= 2 * transition:
            raise ValueError(f'{label} must be longer than twice the transition duration.')
        scene['duration'] = duration
        for field, limit in (('title', 80), ('caption', 160), ('chapter', 60)):
            scene.setdefault(field, '')
            if not isinstance(scene[field], str) or len(scene[field]) > limit:
                raise ValueError(f'{label} {field} must contain at most {limit} characters.')
        if 'background' in scene:
            scene['background'] = background(scene['background'])
        animations = scene.setdefault('photo_motion', [])
        if not isinstance(animations, list) or len(animations) > len(photos):
            raise ValueError(f'{label} needs at most one animation per photo.')
        scene['photo_motion'] = [photo_animation(entry) for entry in animations]
        for flag in ('card', 'closing'):
            if flag in scene and not isinstance(scene[flag], bool):
                raise ValueError(f'{label} {flag} must be true or false.')
        scene.setdefault('transition', DEFAULT_EFFECTS[index % len(DEFAULT_EFFECTS)])
        if scene['transition'] not in EFFECTS:
            raise ValueError(f'{label} has an unsupported transition.')
        scene.setdefault('motion', 'still' if scene.get('card') else ('push-in' if index % 2 else 'pull-out'))
        if scene['motion'] not in MOTIONS:
            raise ValueError(f'{label} has an unsupported motion.')
        if scene.get('card'):
            if len(photos) != 1:
                raise ValueError(f'{label}: a title card requires exactly one photo.')
            scene.setdefault('subtitle', 'MOMENTS TO REMEMBER' if scene.get('closing') else 'A LIFE IN PHOTOGRAPHS')
            if not isinstance(scene['subtitle'], str) or len(scene['subtitle']) > 80:
                raise ValueError(f'{label} subtitle must contain at most 80 characters.')
        else:
            layout = scene.get('layout')
            if not isinstance(layout, list) or not len(photos) <= len(layout) <= 4:
                raise ValueError(f'{label} needs one layout slot per photo (up to four).')
            for box in layout:
                if not isinstance(box, (list, tuple)) or len(box) != 4:
                    raise ValueError(f'{label} layout slots must be [x, y, width, height].')
                x, y, width, height = [number(v, f'{label} layout coordinate', 0, 1920) for v in box]
                if any(int(v) != v for v in box) or width < 80 or height < 80 or x + width > 1920 or y + height > 1080:
                    raise ValueError(f'{label} layout slots must fit within the 1920 × 1080 frame and be at least 80px wide/high.')
            if 'layout_end' in scene and scene['layout_end'] is None:
                del scene['layout_end']
            if scene.get('layout_end') is not None:
                end = scene['layout_end']
                if not isinstance(end, list) or not len(photos) <= len(end) <= 4:
                    raise ValueError(f'{label} ending layout must have enough slots for its photos (up to four).')
                for box in end:
                    if not isinstance(box, list) or len(box) != 4:
                        raise ValueError('Ending layout slots must be [x, y, width, height].')
                    x, y, w, h = [number(v, 'Ending layout coordinate', 0, 1920) for v in box]
                    if any(int(v) != v for v in box) or w < 80 or h < 80 or x + w > 1920 or y + h > 1080:
                        raise ValueError('Ending layout must fit the video frame.')
    project.update(schema_version=1, resolution=[1920, 1080], fps=30, audio=any(tracks[k]['file'] for k in ('music', 'narration')),
                   transition_seconds=transition, unique_photos=len(used),
                   transitions=sorted({s['transition'] for s in scenes[:-1]}),
                   duration_seconds=round(sum(s['duration'] for s in scenes) - (len(scenes) - 1) * transition, 3))
    return project


def load_project(path=DEFAULT_CONFIG):
    return normalize_project(json.loads(Path(path).read_text(encoding='utf-8-sig')))
