"""Audit a collage project for dead references and repeated pictures.

Checks every file the renderer will try to open, then reports any photo used
more than once either by name or by appearance.

    python videos/audit-project.py videos/JaredHazleton-WonderfulWorlds.json
"""

import argparse
import collections
import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

from collage_project import (AUDIO_DIR, load_project, normalize_project, photo_aliases,
                             photo_names, photo_path, primary_library)

ROOT = Path(__file__).resolve().parents[1]


def look_alike_groups(reports):
    groups = []
    for report in reports:
        path = Path(report)
        if not path.is_file():
            continue
        for group in json.loads(path.read_text(encoding='utf-8')).get('groups', []):
            groups.append([Path(entry['path']).name for entry in group['files']])
    return groups


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__,
                                     formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument('config', type=Path)
    parser.add_argument('--similar', type=Path, action='append', default=None,
                        help='Dedupe report naming photos that look alike (repeatable).')
    args = parser.parse_args()

    raw = json.loads(args.config.read_text(encoding='utf-8'))
    project = normalize_project(load_project(args.config))
    library = set(photo_names())
    aliases = photo_aliases()
    problems = 0

    print(f'Project : {args.config.name}')
    print(f'Library : {primary_library().name}/ ({len(library)} photos)')
    print(f'Scenes  : {len(project["scenes"])}')

    # 1. Photo references, checked against the file the renderer will open.
    print('\n== Photo references ==')
    where = collections.defaultdict(list)
    missing, rewritten = [], []
    for index, scene in enumerate(project['scenes'], start=1):
        for name in scene['photos']:
            where[name].append(index)
            if name not in library:
                missing.append((index, name))
                continue
            if not photo_path(name).is_file():
                missing.append((index, name))
    for index, scene in enumerate(raw['scenes'], start=1):
        for name in scene.get('photos', []):
            if name not in library and (aliases.get(name) or aliases.get(Path(name).name)):
                rewritten.append((index, name))
    print(f'  slots referenced      : {sum(len(v) for v in where.values())}')
    print(f'  resolve to a real file: {sum(len(v) for v in where.values()) - len(missing)}')
    if missing:
        problems += len(missing)
        print(f'  DEAD LINKS            : {len(missing)}')
        for index, name in missing:
            print(f'      scene {index}: {name}')
    else:
        print('  dead links            : none')
    if rewritten:
        print(f'  ! {len(rewritten)} stored name(s) only resolve through the dedupe alias table;')
        print('    saving from the editor rewrites them to the surviving file')

    # 2. Audio references.
    print('\n== Audio references ==')
    for kind, track in (project.get('sound') or {}).items():
        if not isinstance(track, dict):
            continue
        name = track.get('file') or ''
        if not name:
            print(f'  {kind:10}: (none)')
            continue
        path = AUDIO_DIR / name
        status = 'OK' if path.is_file() else 'DEAD LINK'
        if not path.is_file():
            problems += 1
        print(f'  {kind:10}: {status} - {name}')

    # 3. Repeated filenames.
    print('\n== Repeated photos ==')
    repeats = {name: scenes for name, scenes in where.items() if len(scenes) > 1}
    if repeats:
        problems += len(repeats)
        print(f'  photos used more than once: {len(repeats)}')
        for name, scenes in sorted(repeats.items()):
            print(f'      {name} in scenes {scenes}')
    else:
        print('  photos used more than once: none')

    # 4. Photos that merely look alike.
    reports = args.similar or [ROOT / '.image-dedupe/loose/duplicate-images.json']
    groups = look_alike_groups(reports)
    print(f'\n== Look-alike photos ({len(groups)} groups known) ==')
    clashes = [[n for n in group if n in where] for group in groups]
    clashes = [group for group in clashes if len(group) > 1]
    if clashes:
        problems += len(clashes)
        print(f'  look-alike pairs in the video: {len(clashes)}')
        for group in clashes:
            for name in group:
                print(f'      scenes {where[name]}: {name}')
            print()
    else:
        print('  look-alike pairs in the video: none')

    # 5. Library photos that no longer exist on disk.
    print('\n== Library integrity ==')
    orphans = [name for name in sorted(library) if not photo_path(name).is_file()]
    if orphans:
        problems += len(orphans)
        print(f'  library entries with no file: {len(orphans)}')
        for name in orphans[:10]:
            print(f'      {name}')
    else:
        print('  library entries with no file: none')

    print('\n' + '=' * 58)
    print('CLEAN' if not problems else f'{problems} problem(s) found')
    return 0 if not problems else 1


if __name__ == '__main__':
    raise SystemExit(main())
