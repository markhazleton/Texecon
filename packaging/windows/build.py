"""Build the Collage Studio Windows executable with PyInstaller."""

from pathlib import Path
import shutil
import subprocess
import sys

ROOT = Path(__file__).resolve().parents[2]
DIST = ROOT / 'packaging' / 'windows' / 'dist'
WORK = ROOT / 'packaging' / 'windows' / 'build'


def main() -> None:
    DIST.mkdir(parents=True, exist_ok=True)
    command = [
        sys.executable, '-m', 'PyInstaller', '--noconfirm', '--clean', '--windowed',
        '--name', 'CollageStudio', '--paths', str(ROOT),
        '--add-data', f'{ROOT / "videos" / "editor"};videos/editor',
        '--add-data', f'{ROOT / "videos" / "create-collage.py"};videos',
        '--add-data', f'{ROOT / "videos" / "collage_project.py"};videos',
        '--distpath', str(DIST), '--workpath', str(WORK),
        str(ROOT / 'videos' / 'desktop' / 'app.py'),
    ]
    subprocess.run(command, cwd=ROOT, check=True)
    executable = DIST / 'CollageStudio' / 'CollageStudio.exe'
    if not executable.exists():
        raise SystemExit(f'PyInstaller did not produce {executable}')
    print(executable)


if __name__ == '__main__':
    main()
