"""Validated paths used by a Collage Studio project."""

from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path
from typing import Literal

MediaMode = Literal['reference', 'managed-copy']


def _directory(value: str | Path, label: str) -> Path:
    path = Path(value).expanduser().resolve()
    if not path.exists() or not path.is_dir():
        raise ValueError(f'{label} must be an existing folder: {path}')
    return path


def _inside(path: Path, root: Path) -> bool:
    try:
        path.relative_to(root)
        return True
    except ValueError:
        return False


@dataclass(frozen=True)
class MediaLocation:
    mode: MediaMode
    source: Path | None = None
    managed: Path | None = None

    def validate(self, label: str) -> 'MediaLocation':
        if self.mode not in ('reference', 'managed-copy'):
            raise ValueError(f'{label} media mode must be reference or managed-copy.')
        if self.mode == 'reference':
            if self.source is None:
                raise ValueError(f'{label} reference mode requires a source folder.')
            return MediaLocation(self.mode, _directory(self.source, f'{label} source'))
        if self.managed is None:
            raise ValueError(f'{label} managed-copy mode requires a managed folder.')
        return MediaLocation(self.mode, managed=_directory(self.managed, f'{label} managed'))


@dataclass(frozen=True)
class ProjectPaths:
    project_file: Path
    images: MediaLocation
    audio: MediaLocation
    render_folder: Path

    def validate(self) -> 'ProjectPaths':
        project_file = Path(self.project_file).expanduser().resolve()
        if project_file.suffix.lower() != '.json':
            raise ValueError('Project file must have a .json extension.')
        render = _directory(self.render_folder, 'Render')
        return ProjectPaths(project_file, self.images.validate('Image'), self.audio.validate('Audio'), render)

    @staticmethod
    def choose(project_file: str | Path, image_folder: str | Path, audio_folder: str | Path,
               render_folder: str | Path, image_mode: MediaMode = 'reference',
               audio_mode: MediaMode = 'reference') -> 'ProjectPaths':
        image = MediaLocation(image_mode, source=Path(image_folder) if image_mode == 'reference' else None,
                              managed=Path(image_folder) if image_mode == 'managed-copy' else None)
        audio = MediaLocation(audio_mode, source=Path(audio_folder) if audio_mode == 'reference' else None,
                              managed=Path(audio_folder) if audio_mode == 'managed-copy' else None)
        return ProjectPaths(Path(project_file), image, audio, Path(render_folder)).validate()

    def root_for(self, kind: Literal['image', 'audio']) -> Path:
        location = self.images if kind == 'image' else self.audio
        root = location.source if location.mode == 'reference' else location.managed
        assert root is not None
        return root

    def safe_child(self, kind: Literal['image', 'audio'], name: str) -> Path:
        root = self.root_for(kind)
        child = (root / name).resolve()
        if not _inside(child, root):
            raise ValueError(f'{kind.title()} path escapes its selected folder.')
        return child
