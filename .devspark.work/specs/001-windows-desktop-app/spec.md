---
classification: full-spec
risk_level: high
target_workflow: specify-full
required_artifacts: spec, plan, tasks
recommended_next_step: plan
required_gates: checklist, analyze, critic
participants:
  owner: human
  planner: ai
  implementer: ai
  reviewer: human
  critic: ai
  scribe: ai
---

# Feature Specification: Collage Studio Windows Desktop App

**Feature Branch**: `001-windows-desktop-app`
**Created**: 2026-09-18
**Status**: In Progress
**Input**: User description: "Build a standalone Windows desktop application for Collage Studio, installable from texecon.com, with a native Windows shell that lets users create and open slideshow JSON projects, choose image and audio folders, edit slideshows, preview scenes, render MP4 videos with the existing generator, and open saved outputs."

## Rationale Summary

### Core Problem

The existing slideshow editor is enjoyable to use but requires repository files, a Python environment, command-line startup, and manual local-server operation. Family users need a straightforward Windows application that can be installed and used without technical setup while retaining the editor and video generator they already like.

### Decision Summary

Create an installable Windows desktop application that hosts the existing slideshow editor and video generator locally. The application will provide native project and folder management while keeping photos, audio, JSON projects, and rendered videos under the user's control.

### Key Drivers

- Make the editor usable by non-technical family members.
- Preserve the current editing, preview, and MP4-rendering experience.
- Keep media and project data local and private.
- Deliver installation and updates through texecon.com.

### Source Inputs

- Existing Collage Studio editor documentation and workflow.
- Existing JSON-based collage project format.
- Existing local video rendering workflow.
- Conversation decisions: Windows desktop app, native shell, configurable image/audio folders, integrated video generation.

### Tradeoffs Considered

- Hosted web application: not selected because it adds accounts, cloud storage, upload handling, rendering infrastructure, and ongoing operating cost.
- Standalone native rewrite: not selected because it would discard the existing editor and duplicate mature editing behavior.
- Selected: a Windows shell hosting the existing local editor and renderer, balancing usability, privacy, and reuse.

### Architectural Impact

- The editor must support a user-selected project file and media folders rather than relying on one repository layout.
- The video generator remains part of the installed application and must run without separate developer tools.
- The website must provide a discoverable download and installation path without changing the static site's publishing model.
- Existing project JSON files should remain usable where their referenced media is available.

### Reviewer Guidance

Reviewers should focus on first-run simplicity, project and media path safety, preservation of existing editing behavior, reliable video rendering, installer usability, and whether the website download experience remains compatible with the static publishing workflow.

## User Scenarios & Testing

### User Story 1 - Install and open Collage Studio (Priority: P1)

As a family member, I want to install and launch Collage Studio from Windows so that I can use the slideshow editor without installing Python, command-line tools, or project dependencies myself.

**Why this priority**: Installation and launch are the entry point for every other capability.

**Independent Test**: On a clean supported Windows computer, download the installer from texecon.com, complete installation, launch the application, and reach the editor without a command prompt or manual dependency setup.

**Acceptance Scenarios**:

1. **Given** a supported Windows computer without development tools installed, **When** the user installs and launches the application, **Then** the application opens successfully with clear first-run guidance.
2. **Given** the application is installed, **When** the user launches it from the Start Menu or desktop shortcut, **Then** the application opens without requiring a terminal window.
3. **Given** the installer is downloaded from texecon.com, **When** the user views the download page, **Then** the supported Windows version, download size, and basic installation instructions are visible.

### User Story 2 - Create or open a slideshow project (Priority: P1)

As a family member, I want to create, open, save, and save-as slideshow JSON projects so that my work is organized and recoverable.

**Why this priority**: Project ownership and persistence are required for a useful desktop application.

**Independent Test**: Create a project, select its media folders, save it, close the application, reopen the JSON file, and confirm that the project settings and media references are restored.

**Acceptance Scenarios**:

1. **Given** the application is open, **When** the user chooses New Project, **Then** the application creates an editable project with an obvious unsaved state.
2. **Given** an existing valid project JSON file, **When** the user opens it, **Then** the editor loads its scenes and available media.
3. **Given** unsaved edits, **When** the user attempts to close or open another project, **Then** the application offers to save, discard, or cancel.
4. **Given** a project is saved, **When** the user chooses Save As, **Then** the original project remains unchanged and a new JSON file is created.

### User Story 3 - Select and manage media folders (Priority: P1)

As a family member, I want to point a project at folders containing images and audio so that I can use my own media without copying it into a special application directory.

**Why this priority**: The requested desktop workflow depends on ordinary folders selected through Windows dialogs.

**Independent Test**: Select an image folder and an audio folder, confirm that the editor lists the supported files, remove or rename a source file, and verify that the application explains missing media clearly.

**Acceptance Scenarios**:

1. **Given** a project is open, **When** the user selects an image folder, **Then** supported images appear in the editor's media picker.
2. **Given** a project is open, **When** the user selects an audio folder, **Then** supported audio files appear in the editor's audio controls.
3. **Given** a selected folder contains unsupported or hidden files, **When** the media library loads, **Then** unsupported files are ignored and the application remains usable.
4. **Given** a project references media that is unavailable, **When** the project opens, **Then** the application identifies the missing folder or files and lets the user choose a replacement folder.

### User Story 4 - Edit, preview, and render a video (Priority: P1)

As a family member, I want to edit scenes, preview the result, and render an MP4 from the same application so that I do not need a separate video-generation tool.

**Why this priority**: Integrated rendering is the core value of the existing editor and must remain available in the desktop product.

**Independent Test**: Open a project with images and optional audio, change a scene, preview it, render an MP4, and open the resulting video from the application.

**Acceptance Scenarios**:

1. **Given** a valid project with available media, **When** the user edits a scene and chooses Preview, **Then** the application displays the updated scene or slideshow preview.
2. **Given** a valid project, **When** the user chooses Render Video, **Then** the application shows progress and prevents conflicting render jobs.
3. **Given** rendering completes, **When** the user chooses Open Video, **Then** the generated MP4 opens using the user's default Windows video application.
4. **Given** rendering fails, **When** the failure is reported, **Then** the application provides a plain-language explanation and preserves the project and previous renders.

### User Story 5 - Recover from common problems (Priority: P2)

As a family member, I want understandable recovery options when files, permissions, or rendering conditions are invalid so that I can continue without technical support.

**Why this priority**: Local files and video rendering create predictable failure cases that should not result in lost work.

**Independent Test**: Exercise missing folders, read-only projects, invalid JSON, insufficient disk space, and closing the application during rendering; confirm that the user receives actionable feedback and existing files remain safe.

**Acceptance Scenarios**:

1. **Given** a project file cannot be read, **When** the user opens it, **Then** the application reports the problem and leaves the current project unchanged.
2. **Given** a project or media folder is read-only, **When** the user saves or renders, **Then** the application reports the permission issue and offers an alternate location where appropriate.
3. **Given** the user closes the application during rendering, **When** the application is reopened, **Then** the project remains available and any completed render remains intact.

### Edge Cases

- A selected image or audio folder is moved, renamed, disconnected, or unavailable at startup.
- A project contains malformed JSON, an unsupported older field, or a reference to duplicate media.
- A media file is deleted or renamed after it has been used in a scene.
- A project is saved while another program changes the JSON file.
- The user starts a second render while the first is still running.
- The output location lacks sufficient free space or write permission.
- The application is upgraded while projects and renders exist from an earlier version.
- The user cancels a folder dialog, save dialog, render, or close confirmation.

## Requirements

### Functional Requirements

- **FR-001**: The application MUST install and launch on supported Windows computers without requiring users to install development runtimes or command-line dependencies separately.
- **FR-002**: The application MUST provide native actions for New Project, Open Project, Save, Save As, and Close.
- **FR-003**: The application MUST read and write slideshow project files in JSON format.
- **FR-004**: The application MUST allow each project to identify an image folder and an audio folder through native folder-selection dialogs, with the choice to reference the original folders or copy selected media into project-managed storage.
- **FR-005**: The application MUST preserve the existing slideshow editing capabilities, including scene editing, transitions, motion, captions, audio controls, preview, and undo behavior, subject to compatibility review during planning.
- **FR-006**: The application MUST include the video-generation capability and render MP4 files from the active project without requiring a separate application.
- **FR-007**: The application MUST show render progress, completion, cancellation or failure state, and the location of the resulting video.
- **FR-008**: The application MUST preserve existing project files and completed renders when a new render fails or is interrupted.
- **FR-009**: The application MUST detect missing, unsupported, or inaccessible media and provide an actionable message for both referenced media and project-managed media.
- **FR-010**: The application MUST warn users about unsaved changes before replacing or closing the active project.
- **FR-011**: The application MUST provide a way to open the rendered video and its containing folder using Windows defaults.
- **FR-012**: The application MUST provide a download page on texecon.com with the installer, supported Windows versions, release notes, and installation instructions.
- **FR-013**: The application MUST support versioned releases so users can identify the installed version and update to a newer installer.
- **FR-014**: The application MUST avoid exposing project files, media, or the local editor service to the public internet by default.
- **FR-015**: The application MUST retain recoverable backups or safe-save behavior for project JSON when saving changes.
- **FR-016**: Publicly distributed installers MUST be code-signed so Windows users receive a verifiable publisher identity and reduced SmartScreen friction.
- **FR-017**: The application MUST persist each project's media ownership choice and clearly identify whether media is referenced in place or copied into project-managed storage.

### Key Entities

- **Project**: A slideshow definition stored as JSON, including scenes, settings, media references, and output preferences.
- **Media Library**: A user-selected image and audio folder pair associated with a project.
- **Render Job**: A requested video generation operation with input project state, progress, status, output location, and error details.
- **Application Installation**: A versioned installed copy of the desktop product, including its editor, renderer, and required runtime assets.
- **Release**: A downloadable application version published through texecon.com with compatibility information and release notes.

### Scope Boundaries

In scope: Windows installation, native project and folder management, existing slideshow editing, local preview, local MP4 rendering, output access, safe error handling, and website distribution.

Out of scope: cloud accounts, multi-user collaboration, online project synchronization, public media sharing, mobile applications, macOS/Linux installers, and a new online rendering service.

## Success Criteria

### Measurable Outcomes

- **SC-001**: A first-time user can download and install the application from texecon.com and reach an editable project within 5 minutes without using a command prompt.
- **SC-002**: At least 90% of representative test users can create or open a project, select media folders, save changes, and reopen the project without assistance.
- **SC-003**: At least 95% of valid test projects that render successfully through the current generator also render successfully through the installed desktop application.
- **SC-004**: No test scenario involving a failed or cancelled render causes loss of the source project or an earlier completed render.
- **SC-005**: The installer succeeds on clean supported Windows test machines with no separate Python, FFmpeg, or developer-tool installation.
- **SC-006**: The website download page clearly identifies the current release and provides a working installer download for supported Windows systems.
- **SC-007**: The application remains responsive enough to provide visible progress or status feedback during every render lasting longer than 2 seconds.

## Assumptions

- The first release targets Windows 10 and Windows 11 unless planning identifies a compatibility constraint.
- Users will manage their own image, audio, JSON, and rendered-video folders.
- Existing project JSON compatibility is desirable, but unsupported legacy formats may require a migration message rather than silent conversion.
- The first release is intended for family or small-group use and does not require accounts or licensing enforcement.
- The repository's static website remains the distribution and documentation surface; the desktop application is a separate downloadable artifact.
- Installer signing, automatic updates, and exact release hosting details require confirmation during planning.

## Clarifications

### Session 2026-09-18

- Q: Should the first release use an unsigned installer, or must it be code-signed to minimize Windows SmartScreen warnings? → A: The publicly distributed installer must be code-signed.
- Q: Should the application copy selected media into a project-managed folder, or should projects retain references to the user's original folders? → A: Each project may choose independently between referencing original folders and copying media into project-managed storage.

## Open Questions
