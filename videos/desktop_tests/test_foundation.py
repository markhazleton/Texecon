import json
import tempfile
import unittest
from pathlib import Path

from videos.desktop.project_paths import ProjectPaths
from videos.desktop.project_store import load, save


class FoundationTests(unittest.TestCase):
    def test_project_paths_reject_escape(self):
        with tempfile.TemporaryDirectory() as folder:
            root = Path(folder)
            paths = ProjectPaths.choose(root / 'project.json', root, root, root)
            with self.assertRaises(ValueError):
                paths.safe_child('image', '../outside.jpg')

    def test_save_is_reopenable_and_creates_backup(self):
        with tempfile.TemporaryDirectory() as folder:
            path = Path(folder) / 'project.json'
            save(path, {'title': 'first'})
            backup = save(path, {'title': 'second'})
            self.assertIsNotNone(backup)
            self.assertEqual(load(path)['title'], 'second')
            self.assertEqual(json.loads(Path(backup).read_text())['title'], 'first')

    def test_invalid_json_has_actionable_error(self):
        with tempfile.TemporaryDirectory() as folder:
            path = Path(folder) / 'bad.json'
            path.write_text('{')
            with self.assertRaisesRegex(ValueError, 'invalid'):
                load(path)
