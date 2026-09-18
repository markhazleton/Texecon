# Data Model: Collage Studio Windows Desktop App

## Desktop Project

- `project_file`: JSON file path.
- `display_name`: user-facing name.
- `image_media_mode`, `audio_media_mode`: `reference` or `managed-copy`.
- `image_source`, `audio_source`: selected source folders for reference mode.
- `image_managed_folder`, `audio_managed_folder`: project folders for copy mode.
- `render_folder`: output folder.
- `schema_version`: migration and compatibility version.

Paths are normalized and validated. Copy operations remain within managed roots. Saves are atomic with recoverable backups.

## Render Job

- `job_id`, `project_snapshot`, `output_path`, `progress`, `error`.
- `state`: `idle`, `queued`, `running`, `completed`, `failed`, or `cancelled`.

Only one job may run per application instance. A running job transitions to exactly one terminal state.

## Media Item

- `relative_name`, `kind`, `size`, `modified_time`, and `availability`.
- Availability is `available`, `missing`, `unsupported`, or `inaccessible`.

## Release

- `version`, `installer_url`, `sha256`, `signature_status`, and `supported_windows`.

