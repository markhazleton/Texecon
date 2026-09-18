---
description: "Task list for Collage Studio Windows Desktop App"
participants:
  owner: human
  planner: ai
  implementer: ai
  reviewer: human
  critic: ai
  scribe: ai
---

# Tasks: Collage Studio Windows Desktop App

**Input**: Design documents from `.devspark.work/specs/001-windows-desktop-app/`
**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`, and `contracts/`

## Rationale Summary

The current slideshow editor requires a developer environment. This work packages it as a code-signed Windows application with native project/media management while preserving local editing and MP4 rendering.

## Format

Every task includes the required linkage fields. `/devspark.implement` replaces `TODO` references as work lands.

## Phase 1: Setup

- [X] T001 Create the desktop source, test, packaging, and release directories described in `.devspark.work/specs/001-windows-desktop-app/plan.md`
  - code_ref: videos/desktop/; videos/desktop_tests/; packaging/windows/
  - test_ref: n/a — directory structure verified by test discovery
  - knowledge_ref: .devspark.work/specs/001-windows-desktop-app/plan.md
  - code_ref: TODO
  - test_ref: TODO
  - knowledge_ref: TODO
- [X] T002 Pin the supported Windows/Python/runtime dependency versions in `packaging/windows/runtime-manifest.json`
  - code_ref: packaging/windows/runtime-manifest.json
  - test_ref: n/a — manifest presence and required signing/provenance fields verified during implementation
  - knowledge_ref: .devspark.work/specs/001-windows-desktop-app/research.md
  - code_ref: TODO
  - test_ref: TODO
  - knowledge_ref: TODO
- [ ] T003 [P] Add desktop developer and clean-machine validation commands to `videos/README.md`
  - code_ref: TODO
  - test_ref: TODO
  - knowledge_ref: TODO

## Phase 2: Foundational

- [X] T004 Implement validated project path and media configuration models in `videos/desktop/project_paths.py`
  - code_ref: videos/desktop/project_paths.py
  - test_ref: videos/desktop_tests/test_foundation.py::FoundationTests.test_project_paths_reject_escape
  - knowledge_ref: .devspark.work/specs/001-windows-desktop-app/data-model.md
  - code_ref: TODO
  - test_ref: TODO
  - knowledge_ref: TODO
- [X] T005 Implement safe JSON load, atomic save, backup, and schema-version handling in `videos/desktop/project_store.py`
  - code_ref: videos/desktop/project_store.py
  - test_ref: videos/desktop_tests/test_foundation.py::FoundationTests.test_save_is_reopenable_and_creates_backup
  - knowledge_ref: .devspark.work/specs/001-windows-desktop-app/data-model.md
  - code_ref: TODO
  - test_ref: TODO
  - knowledge_ref: TODO
- [ ] T006 Implement loopback-only editor process startup, session token handling, health checks, and shutdown in `videos/desktop/process_manager.py`
  <!-- WIP: lifecycle exists; session-token and health-check integration remain. -->
  - code_ref: TODO
  - test_ref: TODO
  - knowledge_ref: TODO
- [ ] T007 Refactor `videos/collage-editor.py` and `videos/collage_project.py` to accept configurable project, image, audio, and render roots while preserving current defaults
  - code_ref: TODO
  - test_ref: TODO
  - knowledge_ref: TODO
- [ ] T008 Add unit and integration coverage for path validation, safe saves, session protection, and backward-compatible default paths in `videos/desktop_tests/test_foundation.py`
  <!-- WIP: path and save coverage passes; session protection and backward-compatible editor integration remain. -->
  - code_ref: TODO
  - test_ref: TODO
  - knowledge_ref: TODO
- [X] T009 [P] Add structured local diagnostics for launch, project, media, and render lifecycle events in `videos/desktop/diagnostics.py`
  - code_ref: videos/desktop/diagnostics.py
  - test_ref: n/a — logging helper has no external side effects in unit scope
  - knowledge_ref: .devspark.work/specs/001-windows-desktop-app/plan.md
  - code_ref: TODO
  - test_ref: TODO
  - knowledge_ref: TODO

## Phase 3: User Story 1 — Install and open Collage Studio (P1) 🎯 MVP

**Goal**: A non-technical Windows user can install and launch the application without a command prompt or separate runtime setup.

**Independent test**: Install the signed package on a clean Windows 10/11 64-bit machine and reach the editor from the Start Menu or desktop shortcut.

- [X] T010 [US1] Implement the native application window, menus, startup screen, and local editor host in `videos/desktop/app.py`
  - code_ref: videos/desktop/app.py
  - test_ref: n/a — GUI smoke test requires Windows display environment
  - knowledge_ref: .devspark.work/specs/001-windows-desktop-app/quickstart.md
  - code_ref: TODO
  - test_ref: TODO
  - knowledge_ref: TODO
- [ ] T011 [US1] Add user-facing launch, runtime-missing, and editor-start failure messages in `videos/desktop/ui/status.py`
  - code_ref: TODO
  - test_ref: TODO
  - knowledge_ref: TODO
- [ ] T012 [P] [US1] Create reproducible application assembly and bundled-runtime configuration in `packaging/windows/build.py`
  - code_ref: TODO
  - test_ref: TODO
  - knowledge_ref: TODO
- [ ] T013 [US1] Create the Windows installer with Start Menu, desktop shortcut, uninstall support, version display, and file associations in `packaging/windows/installer-script.iss`
  - code_ref: TODO
  - test_ref: TODO
  - knowledge_ref: TODO
- [ ] T014 [US1] Add installer signature verification and clean-machine smoke validation in `packaging/windows/test_install.ps1`
  - code_ref: TODO
  - test_ref: TODO
  - knowledge_ref: TODO

## Phase 4: User Story 2 — Create or open a slideshow project (P1)

**Goal**: Users can create, open, save, and save-as JSON projects with unsaved-change protection.

**Independent test**: Create a project, save it, close and reopen it, then use Save As and confirm the original remains unchanged.

- [ ] T015 [P] [US2] Implement New, Open, Save, Save As, Close, and recent-project commands in `videos/desktop/project_commands.py`
  - code_ref: TODO
  - test_ref: TODO
  - knowledge_ref: TODO
- [ ] T016 [US2] Connect native project commands to the existing editor state and unsaved-change warning in `videos/desktop/app.py`
  - code_ref: TODO
  - test_ref: TODO
  - knowledge_ref: TODO
- [ ] T017 [US2] Add project command and malformed-JSON tests in `videos/desktop_tests/test_project_commands.py`
  - code_ref: TODO
  - test_ref: TODO
  - knowledge_ref: TODO

## Phase 5: User Story 3 — Select and manage media folders (P1)

**Goal**: Each project can select image/audio folders and independently reference or copy media.

**Independent test**: Exercise both media modes, reopen the project, and verify missing/unsupported media is explained without data loss.

- [ ] T018 [US3] Implement native image/audio folder selection and persisted per-project media mode in `videos/desktop/media_commands.py`
  - code_ref: TODO
  - test_ref: TODO
  - knowledge_ref: TODO
- [ ] T019 [US3] Implement validated managed-copy import, duplicate handling, and source-to-managed mapping in `videos/desktop/media_copy.py`
  - code_ref: TODO
  - test_ref: TODO
  - knowledge_ref: TODO
- [ ] T020 [US3] Update the editor API/media picker to enumerate selected roots and report missing, unsupported, and inaccessible files in `videos/collage-editor.py`
  - code_ref: TODO
  - test_ref: TODO
  - knowledge_ref: TODO
- [ ] T021 [US3] Add media reference/copy and missing-folder tests in `videos/desktop_tests/test_media_commands.py`
  - code_ref: TODO
  - test_ref: TODO
  - knowledge_ref: TODO

## Phase 6: User Story 4 — Edit, preview, and render a video (P1)

**Goal**: Users can edit the existing slideshow, preview it, render MP4, and open the output from the same app.

**Independent test**: Edit a valid project, preview it, render an MP4, and open the generated output.

- [ ] T022 [US4] Connect preview, render, cancel, progress, completion, and failure states to the native shell in `videos/desktop/render_commands.py`
  - code_ref: TODO
  - test_ref: TODO
  - knowledge_ref: TODO
- [ ] T023 [US4] Refactor renderer invocation to use packaged runtime paths, project snapshots, unique outputs, and safe subprocess arguments in `videos/create-collage.py`
  - code_ref: TODO
  - test_ref: TODO
  - knowledge_ref: TODO
- [ ] T024 [US4] Add Open Video and Open Output Folder actions using Windows defaults in `videos/desktop/output_commands.py`
  - code_ref: TODO
  - test_ref: TODO
  - knowledge_ref: TODO
- [ ] T025 [US4] Add render-job integration tests for success, failure, cancellation, duplicate render prevention, and preserved prior outputs in `videos/desktop_tests/test_render_commands.py`
  - code_ref: TODO
  - test_ref: TODO
  - knowledge_ref: TODO

## Phase 7: User Story 5 — Recover from common problems (P2)

**Goal**: Users receive actionable messages and retain work when files, permissions, storage, or rendering fail.

**Independent test**: Exercise invalid JSON, read-only paths, missing media, insufficient output access, and restart after interrupted rendering.

- [ ] T026 [US5] Add centralized user-facing error mapping and recovery actions in `videos/desktop/ui/errors.py`
  - code_ref: TODO
  - test_ref: TODO
  - knowledge_ref: TODO
- [ ] T027 [US5] Add crash-safe render cleanup and startup recovery detection in `videos/desktop/recovery.py`
  - code_ref: TODO
  - test_ref: TODO
  - knowledge_ref: TODO
- [ ] T028 [US5] Add failure/recovery integration tests in `videos/desktop_tests/test_recovery.py`
  - code_ref: TODO
  - test_ref: TODO
  - knowledge_ref: TODO

## Phase 8: Website distribution and release

- [ ] T029 [P] Add the static Collage Studio download page, installer instructions, supported Windows versions, release notes, and checksum display in `client/src/pages/downloads.tsx`
  - code_ref: TODO
  - test_ref: TODO
  - knowledge_ref: TODO
- [ ] T030 [P] Add versioned installer metadata and checksum validation to `packaging/windows/release-manifest.json`
  - code_ref: TODO
  - test_ref: TODO
  - knowledge_ref: TODO
- [ ] T031 Validate download links, signatures, checksums, canonical metadata, sitemap inclusion, and required `target/` artifacts in `scripts/validate-desktop-release.js`
  - code_ref: TODO
  - test_ref: TODO
  - knowledge_ref: TODO
- [ ] T032 Add CI packaging and release validation without weakening existing website quality gates in `.github/workflows/deploy.yml`
  - code_ref: TODO
  - test_ref: TODO
  - knowledge_ref: TODO

## Phase 9: Polish and cross-cutting validation

- [ ] T033 [P] Document development, clean-machine testing, signing, and release steps in `videos/README.md`
  - code_ref: TODO
  - test_ref: TODO
  - knowledge_ref: TODO
- [ ] T034 Run the full existing website checks and desktop test suite described in `.devspark.work/specs/001-windows-desktop-app/quickstart.md`
  - code_ref: TODO
  - test_ref: TODO
  - knowledge_ref: TODO
- [ ] T035 Perform a clean Windows installation, upgrade, uninstall, project migration, and signed-release acceptance pass in `packaging/windows/acceptance-results.md`
  - code_ref: TODO
  - test_ref: TODO
  - knowledge_ref: TODO

## Phase 10: Gate Remediation

- [ ] T036 [P] Inventory and pin bundled runtime, FFmpeg, and native binary provenance in `packaging/windows/runtime-manifest.json` (resolves: A1, C1)
  - code_ref: TODO
  - test_ref: TODO
  - knowledge_ref: TODO
- [ ] T037 [P] Implement protected signing configuration that never stores private keys in source or logs, and fail closed when signing inputs are absent in `packaging/windows/signing.py` (resolves: A1, C6)
  - code_ref: TODO
  - test_ref: TODO
  - knowledge_ref: TODO
- [ ] T038 Add canonical-root, filename/size/type, mutation-token, and safe subprocess security tests in `videos/desktop_tests/test_security_boundaries.py` (resolves: A2, C2)
  - code_ref: TODO
  - test_ref: TODO
  - knowledge_ref: TODO
- [ ] T039 Add atomic managed-copy, source-preservation, interrupted-save, interrupted-render, cancellation, and orphan-process recovery tests in `videos/desktop_tests/test_data_continuity.py` (resolves: A2, C3, C4)
  - code_ref: TODO
  - test_ref: TODO
  - knowledge_ref: TODO
- [ ] T040 Add immutable release artifacts, previous-version rollback links, signature/checksum verification, and upgrade/uninstall validation in `packaging/windows/release_validation.py` (resolves: A4, C5)
  - code_ref: TODO
  - test_ref: TODO
  - knowledge_ref: TODO
- [ ] T041 Add redacted diagnostics and an Open Logs action without exposing absolute private media paths in `videos/desktop/diagnostics.py` and `videos/desktop/ui/status.py` (resolves: C7)
  - code_ref: TODO
  - test_ref: TODO
  - knowledge_ref: TODO
- [ ] T042 Integrate the download route through the existing canonical content/navigation and static-page generation path in `client/src/pages/downloads.tsx` and the owning route/content files (resolves: A3)
  - code_ref: TODO
  - test_ref: TODO
  - knowledge_ref: TODO

## Dependencies and Execution Order

- Setup → Foundational → User Stories 1–4; User Story 5 depends on the shell and render flows.
- Website distribution can begin in parallel with User Stories 2–5 after the release manifest shape is agreed.
- User Story 1 is the MVP gate. User Stories 2–4 complete the core product. User Story 5 and release validation are required before public distribution.
- Parallel opportunities: T003/T009; T012/T015; T018/T029/T030; T026/T031.

## MVP Scope

T001–T014 establish and install the shell. The first usable product increment is T001–T025: install, open/create/save projects, select media, edit/preview, and render MP4. Public release additionally requires T026–T035.

## Gate Acknowledgements

Gate review findings are being remediated by Phase 10 before implementation begins. No findings are being waived.
