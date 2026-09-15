"""Local collage editor. Start with: python videos/collage-editor.py"""

import argparse
from datetime import datetime
from functools import lru_cache
import hashlib
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
import importlib.util
from io import BytesIO
import json
import mimetypes
import re
from pathlib import Path
import secrets
import subprocess
import sys
import threading
from urllib.parse import unquote, urlsplit

from PIL import Image, ImageOps
from collage_project import AUDIO_DIR, DEFAULT_CONFIG, EFFECTS, LAYOUTS, MOTIONS, ROOT, audio_names, load_project, normalize_project, number, photo_names, photo_path

spec = importlib.util.spec_from_file_location('collage_renderer', ROOT / 'videos/create-collage.py')
renderer = importlib.util.module_from_spec(spec)
spec.loader.exec_module(renderer)
ASSETS = Path(__file__).with_name('editor')


def revision(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


@lru_cache(maxsize=256)
def thumbnail(name, modified):
    with Image.open(photo_path(name)) as source:
        photo = ImageOps.exif_transpose(source).convert('RGB')
        photo.thumbnail((360, 240), Image.Resampling.LANCZOS)
        stream = BytesIO()
        photo.save(stream, format='JPEG', quality=80)
        return stream.getvalue()


class EditorServer(ThreadingHTTPServer):
    daemon_threads = True

    def __init__(self, address, config):
        super().__init__(address, Handler)
        self.config = config
        self.token = secrets.token_urlsafe(32)
        self.lock = threading.Lock()
        self.job = {'state': 'idle', 'log': []}
        self.output = None


class Handler(BaseHTTPRequestHandler):
    def log_message(self, *args):
        pass

    def send(self, data, kind='application/json', status=200):
        if kind == 'application/json':
            data = json.dumps(data).encode()
        self.send_response(status)
        self.send_header('Content-Type', kind)
        self.send_header('Content-Length', str(len(data)))
        self.send_header('Cache-Control', 'no-store')
        self.send_header('X-Content-Type-Options', 'nosniff')
        self.send_header('Content-Security-Policy', "default-src 'self'; img-src 'self' blob:; media-src 'self' blob:; style-src 'self'; script-src 'self'; frame-ancestors 'none'")
        self.end_headers()
        try:
            self.wfile.write(data)
        except (BrokenPipeError, ConnectionResetError):
            pass

    def trusted(self, mutation=False):
        port = self.server.server_port
        hosts = {f'127.0.0.1:{port}', f'localhost:{port}'}
        if self.headers.get('Host') not in hosts:
            self.send({'error': 'Invalid local host.'}, status=403)
            return False
        if mutation and (self.headers.get('X-Editor-Token') != self.server.token or
                         self.headers.get('Origin', f'http://{self.headers.get("Host")}') not in {f'http://{h}' for h in hosts}):
            self.send({'error': 'Refresh the editor before saving.'}, status=403)
            return False
        return True

    def media(self, file, attachment=False):
        size = file.stat().st_size
        start, end = 0, size - 1
        requested = self.headers.get('Range')
        if requested:
            match = re.fullmatch(r'bytes=(\d*)-(\d*)', requested)
            if not match or (not match[1] and not match[2]):
                self.send({'error': 'Invalid range'}, status=416)
                return
            if match[1]:
                start = int(match[1])
                end = min(end, int(match[2])) if match[2] else end
            else:
                start = max(0, size - int(match[2]))
            if start > end or start >= size:
                self.send_response(416)
                self.send_header('Content-Range', f'bytes */{size}')
                self.end_headers()
                return
        self.send_response(206 if requested else 200)
        self.send_header('Content-Type', mimetypes.guess_type(file)[0] or 'application/octet-stream')
        self.send_header('Accept-Ranges', 'bytes')
        self.send_header('Cache-Control', 'no-store')
        if requested:
            self.send_header('Content-Range', f'bytes {start}-{end}/{size}')
        if attachment:
            self.send_header('Content-Disposition', f'attachment; filename="{file.name}"')
        self.send_header('Content-Length', str(end - start + 1))
        self.end_headers()
        with file.open('rb') as source:
            source.seek(start)
            remaining = end - start + 1
            try:
                while remaining:
                    chunk = source.read(min(1024 * 1024, remaining))
                    if not chunk:
                        break
                    self.wfile.write(chunk)
                    remaining -= len(chunk)
            except (BrokenPipeError, ConnectionResetError):
                pass

    def do_GET(self):
        if not self.trusted():
            return
        route = unquote(urlsplit(self.path).path)
        try:
            if route == '/api/project':
                with self.server.lock:
                    self.send({'project': load_project(self.server.config), 'revision': revision(self.server.config),
                               'file': str(self.server.config), 'token': self.server.token,
                               'photos': photo_names(), 'layouts': LAYOUTS, 'audio_files': audio_names(),
                               'effects': list(dict.fromkeys(EFFECTS)), 'motions': MOTIONS})
            elif route == '/api/status':
                with self.server.lock:
                    self.send(self.server.job)
            elif route.startswith('/photos/'):
                name = route.removeprefix('/photos/')
                if name not in photo_names():
                    raise ValueError('Photo not found.')
                self.send(thumbnail(name, (photo_path(name)).stat().st_mtime_ns), 'image/jpeg')
            elif route.startswith('/audio/'):
                name = route.removeprefix('/audio/')
                if name not in audio_names():
                    raise ValueError('Audio not found.')
                self.media(AUDIO_DIR / name)
            elif route == '/render/video':
                with self.server.lock:
                    output = self.server.output if self.server.job['state'] == 'complete' else None
                if output is None:
                    raise ValueError('No finished render is available yet.')
                self.media(output, attachment=not urlsplit(self.path).query.startswith('play'))
            elif route in ('/', '/editor.js', '/editor.css', '/enhancements.js'):
                file = ASSETS / ('index.html' if route == '/' else route[1:])
                self.send(file.read_bytes(), mimetypes.guess_type(file)[0] or 'text/plain')
            else:
                self.send({'error': 'Not found.'}, status=404)
        except (ValueError, OSError) as error:
            self.send({'error': str(error)}, status=400)

    def do_POST(self):
        if not self.trusted(mutation=True):
            return
        try:
            length = int(self.headers.get('Content-Length', '0'))
            if urlsplit(self.path).path == '/api/audio-upload':
                if not 0 < length <= 100 * 1024 * 1024:
                    raise ValueError('Choose an audio file up to 100 MB.')
                original = Path(unquote(self.headers.get('X-Filename', 'audio'))).name
                extension = Path(original).suffix.lower()
                if extension not in {'.mp3', '.wav', '.m4a', '.aac', '.ogg', '.flac'}:
                    raise ValueError('Choose MP3, WAV, M4A, AAC, OGG, or FLAC audio.')
                name = re.sub(r'[^a-zA-Z0-9_-]', '-', Path(original).stem)[:60] + '-' + secrets.token_hex(4) + extension
                AUDIO_DIR.mkdir(exist_ok=True)
                destination = AUDIO_DIR / name
                try:
                    with destination.open('xb') as target:
                        remaining = length
                        while remaining:
                            data = self.rfile.read(min(1024 * 1024, remaining))
                            if not data:
                                raise ValueError('Upload ended early.')
                            target.write(data)
                            remaining -= len(data)
                    duration = renderer.audio_duration(destination)
                except Exception:
                    destination.unlink(missing_ok=True)
                    raise
                self.send({'file': name, 'duration': duration, 'audio_files': audio_names()})
                return
            if not 0 < length <= 2_000_000:
                raise ValueError('Request must contain a project under 2 MB.')
            body = json.loads(self.rfile.read(length))
            route = urlsplit(self.path).path
            if route == '/api/validate':
                self.send({'project': normalize_project(body['project'])})
            elif route == '/api/preview':
                project = normalize_project(body['project'])
                index = body['scene']
                if not isinstance(index, int) or not 0 <= index < len(project['scenes']):
                    raise ValueError('Select a valid scene.')
                if 'time' in body:
                    seconds = number(body['time'], 'Playhead', 0, project['duration_seconds'])
                    frame = renderer.project_frame(project, seconds)
                else:
                    progress = number(body.get('progress', 0), 'Scene progress', 0, 1)
                    frame = renderer.scene_frame(project, project['scenes'][index], progress)
                frame.thumbnail((1280, 720), Image.Resampling.LANCZOS)
                stream = BytesIO()
                frame.save(stream, format='JPEG', quality=90)
                self.send(stream.getvalue(), 'image/jpeg')
            elif route == '/api/save':
                project = normalize_project(body['project'])
                with self.server.lock:
                    path = self.server.config
                    if body.get('revision') != revision(path):
                        self.send({'error': 'The JSON changed on disk. Export your edits, then reload the page before saving.'}, status=409)
                        return
                    backup = path.parent / 'backups' / f'{path.stem}-{datetime.now():%Y%m%d-%H%M%S-%f}.json'
                    backup.parent.mkdir(exist_ok=True)
                    backup.write_bytes(path.read_bytes())
                    temporary = path.with_name(f'.{path.name}.{secrets.token_hex(4)}.tmp')
                    temporary.write_text(json.dumps(project, indent=2) + '\n', encoding='utf-8')
                    temporary.replace(path)
                    self.send({'project': project, 'revision': revision(path), 'backup': str(backup)})
            elif route in ('/api/render', '/api/preview-video'):
                with self.server.lock:
                    if self.server.job['state'] == 'running':
                        raise ValueError('A render is already running.')
                    preview = route == '/api/preview-video'
                    if not preview and body.get('revision') != revision(self.server.config):
                        raise ValueError('Save the current project before rendering.')
                    project = normalize_project(body['project']) if preview else load_project(self.server.config)
                    start = number(body.get('start', 0), 'Preview start', 0, project['duration_seconds'] - 1 / 30) if preview else 0
                    duration = number(body.get('duration', 10), 'Preview duration', 1 / 30, 30) if preview else None
                    folder = ROOT / 'videos/renders'
                    folder.mkdir(exist_ok=True)
                    stem = f'collage-{datetime.now():%Y%m%d-%H%M%S-%f}'
                    snapshot = folder / f'{stem}.json'
                    snapshot.write_text(json.dumps(project, indent=2) + '\n', encoding='utf-8')
                    output = folder / f'{stem}.mp4'
                    self.server.output = output
                    self.server.job = {'state': 'running', 'log': ['Starting render…'], 'output': str(output),
                                       'preview': preview, 'start': start, 'duration': duration}
                    threading.Thread(target=render_job, args=(self.server, snapshot, output, start, duration), daemon=True).start()
                    self.send(self.server.job)
            else:
                self.send({'error': 'Not found.'}, status=404)
        except (ValueError, OSError, KeyError, TypeError) as error:
            self.send({'error': str(error)}, status=400)


def render_job(server, snapshot, output, start=0, duration=None):
    try:
        command = [sys.executable, '-u', str(ROOT / 'videos/create-collage.py'),
                   '--config', str(snapshot), '--output', str(output), '--start', str(start)]
        if duration is not None:
            command += ['--duration', str(duration)]
        process = subprocess.Popen(command,
                                   stdout=subprocess.PIPE, stderr=subprocess.STDOUT,
                                   text=True, encoding='utf-8', errors='replace')
        with process.stdout:
            for line in process.stdout:
                with server.lock:
                    server.job['log'] = (server.job['log'] + [line.rstrip()])[-60:]
        code = process.wait()
        with server.lock:
            server.job['state'] = 'complete' if code == 0 else 'failed'
    except OSError as error:
        with server.lock:
            server.job.update(state='failed', log=[str(error)])


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--port', type=int, default=8765)
    parser.add_argument('--config', type=Path, default=DEFAULT_CONFIG)
    args = parser.parse_args()
    load_project(args.config)
    server = EditorServer(('127.0.0.1', args.port), args.config.resolve())
    print(f'Collage editor: http://127.0.0.1:{server.server_port}\nProject: {server.config}', flush=True)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        server.server_close()


if __name__ == '__main__':
    main()
