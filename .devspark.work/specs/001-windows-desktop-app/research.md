# Research: Collage Studio Windows Desktop App

## Decisions

- **Native shell with embedded local editor**: preserves the current browser editor and reduces rewrite risk.
- **Bundled runtime and renderer**: clean Windows machines must not need Python, Pillow, or FFmpeg installed separately.
- **Versioned signed installer**: public downloads need publisher trust, rollback identification, and repeatable release metadata.
- **Explicit media mode**: each project persists whether it references original folders or copies media into managed storage.
- **Loopback-only service**: prevents accidental network exposure while retaining the existing local editor architecture.

## Alternatives rejected

Hosted service adds accounts, cloud storage, and remote rendering. A native editor rewrite duplicates mature behavior. An unsigned or prerequisite-based distribution weakens the requested family-friendly install experience.

