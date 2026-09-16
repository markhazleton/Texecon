"""Shared time-based composition used by scrubbing, previews, and final MP4s."""

from functools import lru_cache
import math
import random
from pathlib import Path

from PIL import Image, ImageDraw, ImageEnhance, ImageFilter, ImageFont, ImageOps
from collage_project import ROOT, BACKGROUND, POSE, photo_path

SIZE = (1920, 1080)
TITLE_FONTS = (
    'C:/Windows/Fonts/georgia.ttf',
    '/System/Library/Fonts/Supplemental/Georgia.ttf',
    '/usr/share/fonts/truetype/dejavu/DejaVuSerif.ttf',
)
SMALL_FONTS = (
    'C:/Windows/Fonts/segoeui.ttf',
    '/System/Library/Fonts/Supplemental/Arial.ttf',
    '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf',
)


def ease(t):
    t = max(0, min(1, t))
    return t * t * (3 - 2 * t)


def mix(a, b, t):
    return a + (b - a) * t


@lru_cache(maxsize=32)
def picture(name):
    with Image.open(photo_path(name)) as source:
        image = ImageOps.exif_transpose(source).convert('RGB')
        image.thumbnail((2200, 2200), Image.Resampling.LANCZOS)
        return image


@lru_cache(maxsize=64)
def font(size, serif=False):
    for candidate in (TITLE_FONTS if serif else SMALL_FONTS):
        path = Path(candidate)
        if path.is_file():
            return ImageFont.truetype(str(path), size)
    return ImageFont.load_default(size=size)


def text_fit(draw, text, position, width, size=36, color='#f4f0e8', serif=False):
    text = text.replace('\n', ' ').replace('\r', ' ')
    while size > 8 and draw.textlength(text, font=font(size, serif)) > width:
        size -= 1
    draw.text(position, text, font=font(size, serif), fill=color)


@lru_cache(maxsize=24)
def background_image(style, color, color2, blur, brightness, name):
    if style == 'blur':
        image = ImageOps.fit(picture(name), (480, 270), Image.Resampling.BILINEAR)
        image = image.filter(ImageFilter.GaussianBlur(blur / 4)).resize(SIZE, Image.Resampling.BILINEAR)
    elif style == 'gradient':
        image = ImageOps.colorize(Image.linear_gradient('L').resize(SIZE), color, color2)
    elif style == 'paper':
        rng = random.Random(42)
        noise = Image.frombytes('L', (480, 270), bytes(rng.randint(140, 255) for _ in range(480 * 270)))
        image = ImageOps.colorize(noise, color2, color).resize(SIZE, Image.Resampling.BILINEAR)
    else:
        image = Image.new('RGB', SIZE, color)
    return ImageEnhance.Brightness(image).enhance(brightness)


def backdrop(project, scene):
    settings = {**BACKGROUND, **project.get('background', {}), **scene.get('background', {})}
    return background_image(*(settings[key] for key in ('style', 'color', 'color2', 'blur', 'brightness')),
                            scene['photos'][0]).copy()


def geometry(scene, index, progress):
    start_box = ([980, 90, 880, 900] if scene.get('card') else scene['layout'][index])
    end_box = scene.get('layout_end', scene.get('layout', [start_box]))[index] if not scene.get('card') else start_box
    t = ease(progress)
    x, y, width, height = [mix(a, b, t) for a, b in zip(start_box, end_box)]
    entries = scene.get('photo_motion', [])
    animation = entries[index] if index < len(entries) else {}
    first = {**POSE, **animation.get('start', {})}
    last = {**POSE, **animation.get('end', {})}
    pose = {key: mix(first[key], last[key], t) for key in POSE}
    scaled_width, scaled_height = width * pose['scale'], height * pose['scale']
    return {'x': x + (width - scaled_width) / 2 + pose['x'],
            'y': y + (height - scaled_height) / 2 + pose['y'],
            'width': scaled_width, 'height': scaled_height, 'rotation': pose['rotation'], 'zoom': pose['zoom'],
            'fx': animation.get('focal', {}).get('x', .5), 'fy': animation.get('focal', {}).get('y', .5)}


def photo_layer(frame, name, geo, opacity=1, card=False, identified_crop=False):
    image = picture(name)
    if identified_crop:
        w, h = image.size
        image = image.crop((int(w * .15), int(h * .36), int(w * .52), int(h * .97)))
    if geo['zoom'] > 1:
        w, h = image.size
        cw, ch = w / geo['zoom'], h / geo['zoom']
        left = max(0, min(w - cw, w * geo['fx'] - cw / 2))
        top = max(0, min(h - ch, h * geo['fy'] - ch / 2))
        image = image.crop((round(left), round(top), round(left + cw), round(top + ch)))
    w, h = max(24, round(geo['width'])), max(24, round(geo['height']))
    tile = Image.new('RGBA', (w, h), (0, 0, 0, 0) if card else '#1c2229')
    fitted = ImageOps.contain(image, (max(1, w - 24), max(1, h - 24)), Image.Resampling.BICUBIC)
    tile.paste(fitted, ((w - fitted.width) // 2, (h - fitted.height) // 2))
    if not card:
        ImageDraw.Draw(tile).rectangle((0, 0, w - 1, h - 1), outline='#796d55', width=2)
    tile = tile.rotate(-geo['rotation'], resample=Image.Resampling.BICUBIC, expand=True)
    if opacity < 1:
        tile.putalpha(tile.getchannel('A').point(lambda p: round(p * opacity)))
    frame.paste(tile, (round(geo['x'] + (w - tile.width) / 2), round(geo['y'] + (h - tile.height) / 2)), tile)


def decorations(frame, project, scene):
    draw = ImageDraw.Draw(frame)
    if scene.get('card'):
        draw.line((140, 350, 280, 350), fill='#bba67b', width=3)
        words = project['title'].split()
        split = min(range(1, len(words)), key=lambda i: abs(len(' '.join(words[:i])) - len(' '.join(words[i:])))) if len(words) > 1 else 0
        lines = [' '.join(words[:split]), ' '.join(words[split:])] if split else [project['title']]
        for index, line in enumerate(lines):
            text_fit(draw, line, (140, 400 + 95 * index), 850, 78, serif=True)
        text_fit(draw, scene.get('subtitle', ''), (145, 635), 850, 28, '#c7c3ba')
    else:
        text_fit(draw, project['title'], (90, 60), 1200, 36, serif=True)
        text_fit(draw, scene.get('chapter', ''), (1320, 75), 510, 22, '#ddbd82')
        draw.line((90, 128, 1830, 128), fill='#796d55', width=2)
    if scene.get('caption'):
        draw.rounded_rectangle((80, 980, 1840, 1060), radius=10, fill='#101419')
        text_fit(draw, scene['caption'], (105, 997), 1710, 30)
    if scene.get('card') and scene.get('chapter'):
        text_fit(draw, scene['chapter'], (140, 275), 850, 28, '#ddbd82')
    return frame


def camera_view(scene, progress):
    motion = scene.get('motion', 'still')
    t = ease(progress)
    zoom = 1 if motion == 'still' else 1 + .035 * (t if motion == 'push-in' else 1 - t if motion == 'pull-out' else 1)
    w, h = 1920 / zoom, 1080 / zoom
    x = (1920 - w) * (1 - t if motion == 'pan-left' else t if motion == 'pan-right' else .5)
    return zoom, x, (1080 - h) / 2, w, h


def camera_photo(scene, geo, progress):
    zoom, x, y, _, _ = camera_view(scene, progress)
    return {**geo, 'x': (geo['x'] - x) * zoom, 'y': (geo['y'] - y) * zoom,
            'width': geo['width'] * zoom, 'height': geo['height'] * zoom}


def scene_frame(project, scene, progress=0, camera=True):
    frame = backdrop(project, scene)
    for index, name in enumerate(scene['photos']):
        photo_layer(frame, name, geometry(scene, index, progress), card=scene.get('card', False),
                    identified_crop=scene.get('card') and name == '2019-07-14 18.07.33.jpg')
    frame = decorations(frame, project, scene)
    motion = scene.get('motion', 'still')
    if camera and motion != 'still':
        _, x, y, w, h = camera_view(scene, progress)
        frame = frame.transform(SIZE, Image.Transform.EXTENT, (x, y, x + w, y + h), Image.Resampling.BICUBIC)
    return frame


def morph_frame(project, first, second, t, first_progress, second_progress):
    if first.get('card') or second.get('card'):
        return Image.blend(scene_frame(project, first, first_progress), scene_frame(project, second, second_progress), t)
    t = ease(t)
    frame = Image.blend(backdrop(project, first), backdrop(project, second), t)
    # Match repeated filenames one-to-one, so shared photos remain visible throughout.
    unused = list(range(len(second['photos'])))
    shared = []
    for index, name in enumerate(first['photos']):
        match = next((j for j in unused if second['photos'][j] == name), None)
        geo = camera_photo(first, geometry(first, index, first_progress), first_progress)
        if match is None:
            photo_layer(frame, name, geo, 1 - t)
        else:
            unused.remove(match)
            target = camera_photo(second, geometry(second, match, second_progress), second_progress)
            shared.append((name, {key: mix(geo[key], target[key], t) for key in geo}))
    for index in unused:
        photo_layer(frame, second['photos'][index], camera_photo(second, geometry(second, index, second_progress), second_progress), t)
    for name, geo in shared:
        photo_layer(frame, name, geo)
    stable = decorations(frame.copy(), project, {**first, 'caption': '', 'chapter': ''})
    current = first if t < .5 else second
    # Change caption/chapter text without superimposing two sentences mid-morph.
    return Image.blend(stable, decorations(frame.copy(), project, current), abs(2 * t - 1))


@lru_cache(maxsize=1)
def dissolve_noise():
    rng = random.Random(78)
    return Image.frombytes('L', (480, 270), bytes(rng.randrange(256) for _ in range(480 * 270))).resize(SIZE, Image.Resampling.NEAREST)


def transition_frame(project, first, second, t, ap, bp):
    effect = first['transition']
    if effect == 'morph':
        return morph_frame(project, first, second, t, ap, bp)
    a, b = scene_frame(project, first, ap), scene_frame(project, second, bp)
    if effect == 'fade':
        return Image.blend(a, b, t)
    if effect in ('smoothleft', 'smoothright'):
        offset = round(1920 * ease(t))
        canvas = Image.new('RGB', SIZE)
        direction = -1 if effect == 'smoothleft' else 1
        canvas.paste(a, (direction * offset, 0))
        canvas.paste(b, (direction * (offset - 1920), 0))
        return canvas
    mask = Image.new('L', SIZE, 0)
    draw = ImageDraw.Draw(mask)
    if effect == 'dissolve':
        mask = dissolve_noise().point(lambda v: 255 if v < t * 256 else 0)
    elif effect in ('wipeup', 'wipedown'):
        h = round(1080 * t)
        draw.rectangle((0, 1080 - h if effect == 'wipeup' else 0, 1920, 1080 if effect == 'wipeup' else h), fill=255)
    elif effect == 'circleopen':
        radius = math.hypot(960, 540) * t
        draw.ellipse((960 - radius, 540 - radius, 960 + radius, 540 + radius), fill=255)
    elif effect == 'radial':
        draw.pieslice((-1240, -1660, 3160, 2740), -90, -90 + 360 * t, fill=255)
    return Image.composite(b, a, mask)


def timeline(project):
    start = 0
    result = []
    for scene in project['scenes']:
        result.append(start)
        start += scene['duration'] - project['transition_seconds']
    return result


def project_frame(project, seconds):
    starts = timeline(project)
    seconds = max(0, min(project['duration_seconds'] - 1 / 30, seconds))
    index = max(i for i, start in enumerate(starts) if start <= seconds)
    scene = project['scenes'][index]
    progress = (seconds - starts[index]) / max(1 / 30, scene['duration'] - 1 / 30)
    overlap = project['transition_seconds']
    if index > 0 and seconds < starts[index] + overlap:
        previous = project['scenes'][index - 1]
        ap = (seconds - starts[index - 1]) / (previous['duration'] - 1 / 30)
        frame = transition_frame(project, previous, scene, (seconds - starts[index]) / overlap, ap, progress)
    else:
        frame = scene_frame(project, scene, progress)
    fade = min(1, seconds / .8, max(0, (project['duration_seconds'] - seconds - 1 / 30)))
    if fade < 1:
        frame = ImageEnhance.Brightness(frame).enhance(max(0, fade))
    return frame
