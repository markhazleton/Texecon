# Desktop Shell Contract

The shell and local editor communicate through a loopback-only internal boundary.

Required operations: `open-project`, `save-project`, `select-media`, `preview`, `render`, `cancel-render`, and `open-output`.

Safety requirements:

- Bind locally by default and require an application-created session token for mutations.
- Validate paths before reads, writes, copies, or subprocess execution.
- Save atomically with a recoverable backup.
- Render from a snapshot and never overwrite a completed output.

