"""Redacted local diagnostics for family support."""

from __future__ import annotations

import logging
from pathlib import Path


def configure(folder: str | Path) -> Path:
    target = Path(folder).expanduser().resolve()
    target.mkdir(parents=True, exist_ok=True)
    logging.basicConfig(filename=target / 'collage-studio.log', level=logging.INFO,
                        format='%(asctime)s %(levelname)s %(message)s')
    return target


def event(name: str, detail: str = '') -> None:
    logging.getLogger('collage-studio').info('%s %s', name, detail.replace('\\', '/'))
