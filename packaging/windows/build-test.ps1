$ErrorActionPreference = 'Stop'

Write-Host 'Building unsigned Collage Studio test installer...'
python --version
python -m pip install --upgrade pip
python -m pip install -r requirements-desktop.txt
python packaging/windows/build.py

$iscc = Join-Path ${env:ProgramFiles(x86)} 'Inno Setup 6\ISCC.exe'
if (-not (Test-Path $iscc)) {
  Write-Host 'Inno Setup 6 is not installed.'
  Write-Host 'Install it from https://jrsoftware.org/isinfo.php, then rerun this script.'
  exit 1
}

$env:COLLAGE_STUDIO_VERSION = '0.1.0-test'
& $iscc '/DAppVersion=0.1.0-test' 'packaging/windows/installer-script.iss'

$installer = 'packaging/windows/dist/CollageStudioSetup.exe'
if (-not (Test-Path $installer)) {
  throw "Installer was not created: $installer"
}

Write-Host "Unsigned test installer created: $installer"
