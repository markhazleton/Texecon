"""Collage Studio Windows launcher.

The first desktop shell uses the system browser for the existing editor while
keeping the Python service lifecycle under application control. Packaging can
replace the browser opener with an embedded WebView without changing the
project and renderer boundaries.
"""

from __future__ import annotations

import argparse
import threading
import time
import tkinter as tk
import webbrowser
from pathlib import Path
from tkinter import filedialog, messagebox

from .diagnostics import configure, event
from .process_manager import EditorProcess


class CollageStudioApp:
    def __init__(self, root: tk.Tk, editor_script: Path, project: Path, port: int = 8765):
        self.root = root
        self.project = project
        self.port = port
        self.editor = EditorProcess(editor_script, project)
        self.root.title('Collage Studio')
        self.root.geometry('440x220')
        self.status = tk.StringVar(value='Starting editor…')
        tk.Label(root, text='Collage Studio', font=('Segoe UI', 18, 'bold')).pack(pady=(24, 8))
        tk.Label(root, textvariable=self.status, wraplength=380).pack(pady=8)
        buttons = tk.Frame(root)
        buttons.pack(pady=14)
        tk.Button(buttons, text='Open Project', command=self.choose_project).pack(side=tk.LEFT, padx=5)
        tk.Button(buttons, text='Open Editor', command=self.open_editor).pack(side=tk.LEFT, padx=5)
        tk.Button(buttons, text='Exit', command=self.close).pack(side=tk.LEFT, padx=5)
        self.root.protocol('WM_DELETE_WINDOW', self.close)
        self.start()

    def start(self) -> None:
        try:
            self.editor.start()
            self.status.set(f'Editor ready for {self.project.name}')
            self.root.after(500, self.open_editor)
            event('editor-started', self.project.name)
        except Exception as error:
            self.status.set('The editor could not start.')
            messagebox.showerror('Collage Studio', str(error))
            event('editor-start-failed', str(error))

    def choose_project(self) -> None:
        selected = filedialog.askopenfilename(title='Open collage project', filetypes=[('JSON project', '*.json')])
        if selected:
            self.project = Path(selected)
            self.editor.config = self.project.resolve()
            self.status.set(f'Project selected: {self.project.name}. Restart the editor to load it.')

    def open_editor(self) -> None:
        webbrowser.open(f'http://127.0.0.1:{self.port}/')

    def close(self) -> None:
        self.editor.stop()
        self.root.destroy()


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--project', type=Path)
    parser.add_argument('--port', type=int, default=8765)
    parser.add_argument('--editor-script', type=Path,
                        default=Path(__file__).resolve().parents[1] / 'collage-editor.py')
    args = parser.parse_args()
    project = (args.project or args.editor_script.resolve().parents[1] / 'jared-e-hazleton-collage.json').resolve()
    configure(Path.home() / 'Collage Studio' / 'logs')
    root = tk.Tk()
    CollageStudioApp(root, args.editor_script, project, args.port)
    root.mainloop()


if __name__ == '__main__':
    main()
