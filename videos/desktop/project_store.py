"""Safe persistence for desktop project metadata."""

from __future__ import annotations

import json
import os
import tempfile
from datetime import datetime
from pathlib import Path

SCHEMA_VERSION = 1


def load(path: str | Path) -> dict:
    project_path = Path(path).expanduser().resolve()
    try:
        with project_path.open(encoding='utf-8') as source:
            value = json.load(source)
    except json.JSONDecodeError as error:
        raise ValueError(f'Project JSON is invalid: {error.msg}.') from error
    if not isinstance(value, dict):
        raise ValueError('Project JSON must contain an object.')
    value.setdefault('desktop', {})
    value['desktop'].setdefault('schema_version', SCHEMA_VERSION)
    return value


def save(path: str | Path, project: dict, keep_backup: bool = True) -> Path | None:
    project_path = Path(path).expanduser().resolve()
    if project_path.suffix.lower() != '.json':
        raise ValueError('Project file must have a .json extension.')
    project_path.parent.mkdir(parents=True, exist_ok=True)
    backup = None
    if project_path.exists() and keep_backup:
        backup_dir = project_path.parent / 'backups'
        backup_dir.mkdir(exist_ok=True)
        backup = backup_dir / f'{project_path.stem}-{datetime.now():%Y%m%d-%H%M%S-%f}.json'
        backup.write_bytes(project_path.read_bytes())
    project.setdefault('desktop', {})['schema_version'] = SCHEMA_VERSION
    fd, temporary_name = tempfile.mkstemp(prefix=f'.{project_path.name}.', suffix='.tmp', dir=project_path.parent)
    try:
        with os.fdopen(fd, 'w', encoding='utf-8') as target:
            json.dump(project, target, indent=2)
            target.write('\n')
            target.flush()
            os.fsync(target.fileno())
        os.replace(temporary_name, project_path)
    except Exception:
        Path(temporary_name).unlink(missing_ok=True)
        raise
    return backup
