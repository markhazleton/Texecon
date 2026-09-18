"""Validate editing, persistence, and a short end-to-end MP4 render."""

from copy import deepcopy
from io import BytesIO
import math
import struct
import wave
from PIL import Image, ImageChops
import importlib.util
import json
from pathlib import Path
import subprocess
import sys
import tempfile
import threading
import unittest
from unittest.mock import patch
from urllib.error import HTTPError
from urllib.request import Request, urlopen

from collage_project import AUDIO_DIR, DEFAULT_CONFIG, LAYOUTS, ROOT, load_project, normalize_project, photo_animation, photo_names, photo_path
from collage_compositor import geometry, scene_frame, transition_frame

spec = importlib.util.spec_from_file_location('editor_server', ROOT / 'videos/collage-editor.py')
editor = importlib.util.module_from_spec(spec)
spec.loader.exec_module(editor)


class ProjectTests(unittest.TestCase):
    def setUp(self):
        self.project = load_project()

    def test_photo_sources_support_collisions_thumbnails_and_rendering(self):
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary)
            unique = root / 'unique'
            unique.mkdir()
            Image.new('RGB', (40, 30), 'blue').save(unique / 'shared.png')
            with patch('collage_project.ROOT', root):
                self.assertEqual(photo_names(), ['shared.png'])
                self.assertEqual(photo_path('shared.png'), unique / 'shared.png')
                project = deepcopy(self.project)
                project['scenes'] = [project['scenes'][0]]
                project['scenes'][0]['photos'] = ['shared.png']
                normalized = normalize_project(project)
                self.assertEqual(scene_frame(normalized, normalized['scenes'][0]).size, (1920, 1080))
                with Image.open(BytesIO(editor.thumbnail('shared.png', 0))) as thumb:
                    self.assertEqual(thumb.size, (40, 30))
                    self.assertGreater(thumb.getpixel((0, 0))[2], 240)
                for invalid in ['../shared.png', 'videos/published/shared.png', 'unique/manifest.json']:
                    with self.assertRaises(ValueError):
                        photo_path(invalid)
            editor.thumbnail.cache_clear()

    def test_unique_library_supersedes_legacy_folders_and_rewrites_aliases(self):
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary)
            (root / 'images').mkdir()
            unique = root / 'unique'
            unique.mkdir()
            Image.new('RGB', (40, 30), 'red').save(root / 'images/retired.png')
            Image.new('RGB', (40, 30), 'blue').save(unique / 'kept.png')
            (unique / 'manifest.json').write_text(json.dumps(
                {'aliases': {'retired.png': 'kept.png',
                             'videos/published/retired.webp': 'kept.png'}}))
            with patch('collage_project.ROOT', root):
                self.assertEqual(photo_names(), ['kept.png'])
                self.assertEqual(photo_path('kept.png'), unique / 'kept.png')
                # Names dedupe retired still resolve through the manifest.
                self.assertEqual(photo_path('retired.png'), unique / 'kept.png')
                self.assertEqual(photo_path('videos/published/retired.webp'), unique / 'kept.png')
                project = deepcopy(self.project)
                project['scenes'] = [project['scenes'][0]]
                project['scenes'][0]['photos'] = ['retired.png']
                self.assertEqual(normalize_project(project)['scenes'][0]['photos'], ['kept.png'])
                for invalid in ['../kept.png', 'missing.png', 'unique/manifest.json']:
                    with self.assertRaises(ValueError):
                        photo_path(invalid)

    def test_scene_titles_are_optional_and_validated(self):
        for scene in self.project['scenes']:
            scene.pop('title', None)
        self.assertEqual(normalize_project(self.project)['scenes'][0]['title'], '')
        self.project['scenes'][0]['title'] = 'Family vacation memories'
        self.assertEqual(normalize_project(self.project)['scenes'][0]['title'], 'Family vacation memories')
        for invalid in [None, 123, 'x' * 81]:
            self.project['scenes'][0]['title'] = invalid
            with self.assertRaises(ValueError):
                normalize_project(self.project)

    def test_legacy_sequence_and_unknown_fields_survive(self):
        raw = json.loads(DEFAULT_CONFIG.read_text())
        raw['editor_note'] = 'Keep this note'
        normalized = normalize_project(raw)
        available = set(photo_names())
        self.assertEqual([len(s['photos']) for s in raw['scenes']],
                         [len(s['photos']) for s in normalized['scenes']])
        for scene in normalized['scenes']:
            # Superseded names are rewritten, but every result must exist.
            self.assertTrue(available.issuperset(scene['photos']))
        self.assertEqual(normalized['editor_note'], 'Keep this note')
        self.assertEqual(normalized['duration_seconds'], round(sum(s['duration'] for s in raw['scenes']) - (len(raw['scenes']) - 1) * raw['transition_seconds'], 3))
        self.assertEqual(normalized['scenes'][1]['transition'], raw['scenes'][1].get('transition', 'smoothleft'))

    def test_invalid_projects_fail_before_rendering(self):
        for field, value in [('duration', -1), ('duration', float('nan')), ('duration', 2),
                             ('transition', 'not-a-filter'), ('motion', 'unknown'),
                             ('photos', ['../client/index.html'])]:
            with self.subTest(field=field, value=value):
                project = deepcopy(self.project)
                project['scenes'][1][field] = value
                with self.assertRaises(ValueError):
                    normalize_project(project)
        self.project['scenes'][1]['layout'][0][2] = 1920
        with self.assertRaises(ValueError):
            normalize_project(self.project)

    def test_summary_recalculates_after_editing(self):
        self.project['scenes'] = self.project['scenes'][:2]
        self.project['scenes'][1]['duration'] = 9
        self.project['transition_seconds'] = 0.5
        result = normalize_project(self.project)
        self.assertEqual(result['duration_seconds'], self.project['scenes'][0]['duration'] + 8.5)
        self.assertEqual(result['unique_photos'], len({name for scene in self.project['scenes'] for name in scene['photos']}))

    def test_background_motion_layout_and_focal_point_change_pixels(self):
        project = self.project
        scene = project['scenes'][1]
        scene['layout'] = deepcopy(LAYOUTS['Four photos'])
        scene.pop('layout_end', None)
        scene['motion'] = 'still'
        base = scene_frame(project, scene)
        scene['background'] = {'style': 'gradient', 'color': '#502510', 'color2': '#152a55', 'brightness': .8}
        self.assertIsNotNone(ImageChops.difference(base, scene_frame(project, scene)).getbbox())
        scene['photo_motion'] = [photo_animation({'end': {'x': 100, 'rotation': 5, 'zoom': 1.8}, 'focal': {'x': .25, 'y': .5}})]
        scene['layout_end'] = deepcopy(LAYOUTS['Feature + two'])
        normalize_project(project)
        start = geometry(scene, 0, 0)
        end = geometry(scene, 0, 1)
        self.assertNotEqual(start['width'], end['width'])
        self.assertEqual(end['rotation'], 5)
        self.assertIsNotNone(ImageChops.difference(scene_frame(project, scene, 0), scene_frame(project, scene, 1)).getbbox())
        left = scene_frame(project, scene, 1)
        scene['photo_motion'][0]['focal']['x'] = .9
        self.assertIsNotNone(ImageChops.difference(left, scene_frame(project, scene, 1)).getbbox())

    def test_morph_has_continuous_endpoints_and_shared_photo_motion(self):
        first = deepcopy(self.project['scenes'][1])
        first['layout'] = deepcopy(LAYOUTS['Four photos'])
        first.pop('layout_end', None)
        second = deepcopy(first)
        first['motion'] = second['motion'] = 'still'
        first['transition'] = 'morph'
        second['layout'] = deepcopy(LAYOUTS['Feature + two'])
        a = transition_frame(self.project, first, second, 0, 1, 0)
        b = transition_frame(self.project, first, second, 1, 1, 0)
        self.assertIsNone(ImageChops.difference(a, scene_frame(self.project, first, 1)).getbbox())
        self.assertIsNone(ImageChops.difference(b, scene_frame(self.project, second, 0)).getbbox())
        midpoint = transition_frame(self.project, first, second, .5, 1, 0)
        first['transition'] = 'fade'
        self.assertIsNotNone(ImageChops.difference(midpoint, transition_frame(self.project, first, second, .5, 1, 0)).getbbox())

    def test_new_settings_reject_invalid_values(self):
        for setting in [{'background': {'color': 'not-a-color'}}, {'sound': {'music': {'file': '../secret.mp3'}}}]:
            with self.assertRaises(ValueError):
                normalize_project({**self.project, **setting})
        for animation in [{'end': {'zoom': .5}}, {'focal': {'x': 2, 'y': .5}}, {'start': {'rotation': 90}}]:
            with self.assertRaises(ValueError):
                photo_animation(animation)


class ServerTests(unittest.TestCase):
    def setUp(self):
        self.temporary = tempfile.TemporaryDirectory(prefix='collage-editor-test-')
        self.config = Path(self.temporary.name) / 'project.json'
        self.config.write_bytes(DEFAULT_CONFIG.read_bytes())
        self.server = editor.EditorServer(('127.0.0.1', 0), self.config)
        self.thread = threading.Thread(target=self.server.serve_forever, daemon=True)
        self.thread.start()
        self.base = f'http://127.0.0.1:{self.server.server_port}'

    def tearDown(self):
        self.server.shutdown()
        self.server.server_close()
        self.thread.join()
        self.temporary.cleanup()

    def request(self, route, body=None, token=True):
        headers = {'Content-Type': 'application/json'}
        if token:
            headers['X-Editor-Token'] = self.server.token
        req = Request(self.base + route, data=json.dumps(body).encode() if body is not None else None,
                      headers=headers)
        with urlopen(req, timeout=20) as response:
            return response.read()

    def test_save_backup_conflict_and_preview(self):
        before = self.config.read_bytes()
        initial = json.loads(self.request('/api/project'))
        initial['project']['title'] = 'Editor verification'
        initial['project']['scenes'][1]['duration'] = 8
        saved = json.loads(self.request('/api/save', initial))
        self.assertEqual(load_project(self.config)['title'], 'Editor verification')
        self.assertEqual(Path(saved['backup']).read_bytes(), before)
        with self.assertRaises(HTTPError) as conflict:
            self.request('/api/save', initial)
        self.assertEqual(conflict.exception.code, 409)
        conflict.exception.close()
        preview = self.request('/api/preview', {'project': saved['project'], 'scene': 1})
        self.assertTrue(preview.startswith(b'\xff\xd8'))
        with self.assertRaises(HTTPError) as forbidden:
            self.request('/api/save', saved, token=False)
        self.assertEqual(forbidden.exception.code, 403)
        forbidden.exception.close()
        with self.assertRaises(HTTPError) as missing:
            self.request('/photos/../package.json')
        missing.exception.close()

    def test_edited_project_renders_without_overwriting_source(self):
        initial = json.loads(self.request('/api/project'))
        project = initial['project']
        project['title'] = 'Short editor render'
        project['transition_seconds'] = 0.2
        project['scenes'] = project['scenes'][:3]
        for index, scene in enumerate(project['scenes']):
            scene.update(duration=1.2, motion='pan-left', transition=['radial', 'smoothright', 'fade'][index])
        self.request('/api/save', initial)
        original = self.config.read_bytes()
        output = Path(self.temporary.name) / 'verification.mp4'
        subprocess.run([sys.executable, str(ROOT / 'videos/create-collage.py'), '--config', str(self.config),
                        '--output', str(output)], check=True, capture_output=True, timeout=90)
        self.assertEqual(self.config.read_bytes(), original)
        result = json.loads(output.with_suffix('.render.json').read_text())
        self.assertEqual(result['title'], 'Short editor render')
        self.assertEqual(result['duration_seconds'], 3.2)
        check = subprocess.run([editor.renderer.documentary.FFMPEG, '-v', 'error', '-xerror',
                                '-i', str(output), '-progress', 'pipe:1', '-f', 'null', '-'],
                               check=True, capture_output=True, text=True, timeout=30)
        self.assertIn('frame=96', check.stdout)

    def test_audio_upload_mix_preview_range_and_media_seeking(self):
        stream = BytesIO()
        with wave.open(stream, 'wb') as wav:
            wav.setnchannels(1)
            wav.setsampwidth(2)
            wav.setframerate(16000)
            wav.writeframes(b''.join(struct.pack('<h', round(5000 * math.sin(2 * math.pi * 440 * n / 16000))) for n in range(16000)))
        uploaded = []
        try:
            for name in ('music.wav', 'narration.wav'):
                request = Request(self.base + '/api/audio-upload', data=stream.getvalue(),
                                  headers={'X-Editor-Token': self.server.token, 'X-Filename': name, 'Content-Type': 'application/octet-stream'})
                with urlopen(request) as response:
                    result = json.load(response)
                uploaded.append(result['file'])
                self.assertAlmostEqual(result['duration'], 1, places=1)
            request = Request(self.base + '/audio/' + uploaded[0], headers={'Range': 'bytes=0-15'})
            with urlopen(request) as response:
                self.assertEqual(response.status, 206)
                self.assertEqual(len(response.read()), 16)
            project = load_project(self.config)
            project['scenes'] = project['scenes'][:2]
            project['transition_seconds'] = .2
            for scene in project['scenes']:
                scene['duration'] = 1.5
            project['sound']['music'].update(file=uploaded[0], volume=.2, fade_in=.1, fade_out=.2)
            project['sound']['narration'].update(file=uploaded[1], start=.5, fade_in=.1, fade_out=.2)
            project = normalize_project(project)
            output = Path(self.temporary.name) / 'with-audio.mp4'
            editor.renderer.render_project(project, output, start=.4, duration=1.2)
            result = json.loads(output.with_suffix('.render.json').read_text())
            self.assertEqual(result['render_range'], {'start': .4, 'duration': 1.2})
            check = subprocess.run([editor.renderer.documentary.FFMPEG, '-v', 'error', '-xerror', '-i', str(output),
                                    '-map', '0:a:0', '-ac', '1', '-f', 's16le', 'pipe:1'], capture_output=True, check=True)
            samples = struct.unpack('<' + 'h' * (len(check.stdout) // 2), check.stdout)
            self.assertGreater(max(abs(v) for v in samples), 100)
            self.assertLess(max(abs(v) for v in samples), 32767)
        finally:
            for name in uploaded:
                path = AUDIO_DIR / name
                self.assertEqual(path.resolve().parent, AUDIO_DIR.resolve())
                path.unlink(missing_ok=True)


if __name__ == '__main__':
    unittest.main()
