# Collage Studio

Run `npm run video:editor` from the repository root, then open
<http://127.0.0.1:8765>. Keep the terminal running while editing or rendering.
The editor is local to this computer. It requires Python, Pillow, and
imageio-ffmpeg (already used by the video scripts).

The editable source is **jared-e-hazleton-collage.json**. The older
`images-slideshow.json` describes the single-photo slideshow and is not a collage
project. Existing collage manifests load automatically; saving adds explicit
per-scene transition and motion settings while retaining their existing sequence.

Each scene has an optional **Scene title** in Scene settings (up to 80 characters).
The storyboard shows its first 10 characters; hover to read the full title. Untitled
scenes keep their scene-type label. Titles are saved with the project.

1. Select a scene in the storyboard. Set its position to move it, or use Add,
   Duplicate, Remove, and Undo.
2. Choose a layout, replace/add/remove photos, and use the photo arrows to change
   their positions. Smaller layouts require removing extra photos first.
3. Edit scene duration, camera motion, outgoing transition, card subtitle, film
   title, and the shared transition length. Scrub the motion timeline to inspect
   any time in the film, or use Play for a silent interactive preview.
4. **Save project** updates the JSON and keeps the previous file in `backups/`.
   If another program changes the JSON, export your edits and reload before saving.
5. **Render MP4** saves first, takes a snapshot, and creates a new timestamped video
   in `renders/`. You can continue editing while it renders. The progress panel
   provides a download link when finished. Earlier videos are not overwritten.

**Open JSON** imports a collage into the current editing session; it does not
switch the server's save destination. **Export JSON** downloads a validated copy.
Unsaved changes trigger a browser warning if you leave. Undo is available for the
last 50 edits in the current session.

To use a different project as the save destination:

```powershell
python videos/collage-editor.py --config videos/my-project.json --port 8766
```

To validate or render directly:

```powershell
python videos/create-collage.py --config videos/jared-e-hazleton-collage.json --validate
python videos/create-collage.py --config videos/jared-e-hazleton-collage.json --output videos/my-edit.mp4
python -m unittest discover -s videos -p "test_*.py"
node --test videos/editor/editor.test.mjs
```

The renderer creates 1920 × 1080, 30 fps H.264 MP4s, with optional AAC audio. Photo names must match
files directly inside `unique/`. The photo picker uses this complete deduplicated
library. Each scene needs 1–4 photos; cards need one.
Layouts use `[x, y, width, height]` pixel coordinates, and custom coordinates are
preserved. Preset layout selection replaces them explicitly. Durations are rounded
to frames; each scene must exceed twice the shared transition duration.

Optional scene fields: `transition` (fade, dissolve, smoothleft, smoothright,
wipeup, wipedown, circleopen, radial, morph), `motion` (push-in, pull-out, pan-left,
pan-right, still), and `subtitle` for title cards. The final scene has no outgoing
transition. Summary counts and duration are recalculated on save. Render manifests
use `.render.json` so rendering never overwrites the source project.

The identified Jared photo retains its existing portrait crop on title cards;
other selected photos fit proportionally. Website routes, SEO, and publishing are
unaffected by this local tool.

## Cinematic backgrounds

Choose **Whole film** or **This scene** under Background. Styles include a solid
color, two-color gradient, paper texture, and a blurred version of the first photo.
Color, blur, and brightness are saved in `background`. A scene override takes
precedence; **Use film background for this scene** removes that override.

## Independent motion and focal points

Select a photograph under **Move each photograph**. Apply float, push-in, slide,
or tilt presets, or edit its start/end keyframes. Offset, scale, rotation, and
internal zoom interpolate smoothly. **Edit start/end position** outlines the photo
on the preview; drag the outline to position it. You can also type exact offsets.
**Animate all photos** applies alternating float and zoom effects.

Click the focal-point image to mark the subject, or enter normalized X/Y values.
Internal zoom crops toward that point. This is manual framing, not face recognition.
Independent motion is stored in `photo_motion`, aligned with the `photos` array;
moving/removing a photo moves/removes its animation too. Presets switch whole-scene
camera motion to Still, so the two motions do not compete.

## Changing layouts

**Animate toward layout** interpolates from `layout` to `layout_end` during a scene.
The ending layout must have enough slots for the photos. **Continue photos in next
scene** copies the photos and their ending poses into a new scene and sets the
previous transition to Morph. Pick a different layout in the new scene: shared
photos now expand, shrink, and move between their positions without disappearing.
Cards use a crossfade when Morph is selected.

## Sound, captions, and chapters

Use **Import audio** for MP3, WAV, M4A, AAC, OGG, or FLAC files up to 100 MB.
Choose the imported file under Music bed or Narration. Music can loop; both tracks
have volume, start time, and fade controls. **Lower music under narration** applies
audio ducking. Recorded narration is supported; the editor does not synthesize a
voice. Files live in `videos/audio/` and are referenced by filename in `sound`.
The `audio` summary flag is derived from the selected tracks.

Scene `caption` and `chapter` fields display a lower caption and chapter heading.
Captions follow scene timing; adjust the scene duration to trim their time on screen.
Use opening/closing cards and their subtitles for dedicated chapter introductions.

## Motion timeline and short previews

The playhead shows minutes:seconds.frames. Scene chips jump to scenes; use Duration
to trim a scene. Interactive playback samples the same compositor as the renderer;
its frame rate depends on the computer and it is silent. **Render this section**
creates a true 30 fps preview, including audio, from the current unsaved edits.
Choose a start time and up to 30 seconds. Preview files and full exports appear in
the inline player, support seeking, and use the same Download MP4 link. Only one
video job runs at a time. Existing edits and renders are preserved.

```powershell
python videos/create-collage.py --config videos/jared-e-hazleton-collage.json --start 20 --duration 10 --output videos/preview.mp4
```

`examples/cinematic-demo.json` demonstrates backgrounds, independent movement,
focal zoom, captions, chapters, and a layout morph. Open it in the editor to explore
it, or launch with `--config videos/examples/cinematic-demo.json` to edit it separately.


## Full-screen silent slideshow

Run `python videos/create-slideshow.py` to make
`renders/JaredHazleton-AllPhotos-Slideshow.mp4` from every JPG, JPEG, PNG,
or WebP directly inside `unique/`. Each file appears once, sorted by filename.
The output JSON records the complete photo order.

Each photo holds for three seconds, followed by a half-second transition.
Fades, dissolves, slides, wipes, and circular reveals alternate. Portraits retain
the entire image over a blurred full-screen background; there are no added
headings, borders, or audio. Output is 1920 x 1080 at 30 fps.

Use `--seconds 3.5`, `--transition-seconds 0.5`, and `--output videos/renders/new-name.mp4`
to customize a new render. Existing output files are never overwritten.
Use `--limit 11 --output videos/renders/test-name.mp4` for a short transition check.
