import tempfile
import unittest
from pathlib import Path

from videos.desktop.process_manager import EditorProcess


class ProcessManagerTests(unittest.TestCase):
    def test_stop_is_safe_when_not_started(self):
        with tempfile.TemporaryDirectory() as folder:
            process = EditorProcess(Path(folder) / 'editor.py', Path(folder) / 'project.json')
            process.stop()
            self.assertIsNone(process.process)
