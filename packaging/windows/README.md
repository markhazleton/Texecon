# Collage Studio Windows Release

Create a public release by pushing a semantic version tag such as `v0.1.0`.
The `Build Collage Studio Release` workflow builds the bundled Windows app,
creates the Inno Setup installer, requires a protected code-signing certificate,
verifies the signature, creates a SHA-256 checksum, and attaches both files to
the GitHub release.

Required repository secrets:

- `WINDOWS_CERTIFICATE_BASE64`: base64-encoded code-signing `.pfx` certificate.
- `WINDOWS_CERTIFICATE_PASSWORD`: password for that certificate.

The private certificate is used only in the protected workflow environment and
must never be committed to the repository or printed in workflow logs.

## Test in the Windows VM

You do not need to publish a release or update texecon.com to test the app.
Run the **Build Collage Studio Test Installer** workflow from the GitHub Actions
tab, then download its `CollageStudio-windows-test` artifact and copy the
installer into the Windows VM.

Install Git, Python 3.11, and Inno Setup 6 in the VM. From a PowerShell prompt
at the repository root, run:

```powershell
.\packaging\windows\build-test.ps1
```

Install `packaging/windows/dist/CollageStudioSetup.exe` and verify:

1. The Start Menu and desktop shortcuts launch the app.
2. The editor opens without a Python or command prompt window.
3. A project JSON file opens and saves.
4. Image and audio folders can be selected.
5. A preview and MP4 render complete.
6. The output video opens from the app.
7. Closing the app leaves no orphaned editor or renderer process.

This test installer is intentionally unsigned. Do not distribute it publicly.

The website download page points to the stable asset URL:

`https://github.com/markhazleton/Texecon/releases/latest/download/CollageStudioSetup.exe`
