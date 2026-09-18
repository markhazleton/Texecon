---
participants:
  owner: human
  planner: ai
  implementer: ai
  reviewer: human
  critic: ai
  scribe: ai
---

# Implementation Plan: Collage Studio Windows Desktop App

**Branch**: `001-windows-desktop-app` | **Date**: 2026-09-18 | **Spec**: [spec.md](spec.md)

## Rationale Summary

The current editor requires a developer environment and command-line startup. Add a native Windows shell around the existing local editor and renderer so family users can install, manage projects and folders, edit slideshows, and render MP4 files locally.

### Key Decisions

- Reuse the existing browser editor and Python renderer behind a desktop shell.
- Package the runtime and media renderer so no developer setup is required.
- Support per-project reference or managed-copy media modes.
- Publish versioned, code-signed installers through the static Texecon website.

### Architectural Impact

- Extract configurable project/media paths from repository-relative assumptions.
- Add desktop process lifecycle, native dialogs, packaging, signing, and release validation.
- Preserve the website's static publishing and SEO contract.

## Summary

The MVP is a Windows 10/11 64-bit desktop application with New/Open/Save/Save As, image and audio folder selection, existing slideshow editing, preview, MP4 rendering, and output access. The editor remains browser-based internally; the shell owns its local service and renderer.

## Technical Context

**Language/Version**: Python 3.x shell/runtime plus existing JavaScript editor assets; pin exact runtime during implementation.
**Primary Dependencies**: Existing Pillow, imageio-ffmpeg, editor assets, desktop webview toolkit, PyInstaller, installer/signing toolchain.
**Storage**: JSON projects, selected image/audio folders, optional project-managed media, and local renders.
**Testing**: Existing Python/editor tests, shell unit/integration tests, packaging tests, and clean-machine smoke tests.
**Target Platform**: Windows 10 and Windows 11, 64-bit, local/offline-first.
**Project Type**: Desktop application with embedded local web editor and background renderer.
**Performance Goals**: Usable editor within 10 seconds; visible status for operations over 2 seconds; editing remains responsive during rendering.
**Constraints**: No public listener by default; no required developer tools; safe paths, permissions, missing media, interrupted renders; signed public installer.
**Scale/Scope**: Single user, one active project, one render job at a time.

## Constitution Check

*GATE: PASS.* Static website output, canonical routes, crawlable download documentation, GitHub Pages compatibility, reproducible assets, existing quality gates, local privacy, safe paths, and signed installers are preserved. No constitution waivers are required.

## Project Structure

```text
videos/
├── collage-editor.py
├── collage_project.py
├── create-collage.py
├── editor/
├── desktop/                 # Windows shell and runtime coordination
└── desktop_tests/
packaging/windows/           # package assembly, installer, release manifest
scripts/                     # release/artifact validation
client/src/                  # static download documentation
client/public/downloads/     # published installer links/artifacts
```

**Structure Decision**: Keep editor and renderer code under `videos/`, isolate shell code under `videos/desktop/`, isolate Windows packaging under `packaging/windows/`, and keep website changes within existing static-site conventions.

## Complexity Tracking

No constitution violations identified.

## Implementation Notes

- 2026-09-18 (T004/T005/T009/T010): Added a Python desktop runtime foundation with validated project/media paths, atomic JSON persistence with backups, local diagnostics, process lifecycle control, and a first Windows-native launcher using the standard library. The editor remains browser-hosted in this first slice; embedded WebView packaging remains open.
- 2026-09-18 (T008): Focused desktop tests pass. The existing `videos/test_collage.py` suite currently has fixture failures for a missing photo and sandbox-restricted socket binding; these are recorded for Windows/fixture validation rather than treated as desktop-runtime regressions.
