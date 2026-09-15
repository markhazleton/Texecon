# Duplicate Image Cleanup Plan

Status as of the latest scan (`--sources`, all three passes):

| Metric | Value |
| --- | --- |
| Original photos across `images/` + `videos/published/` | 592 (623.1 MB) |
| Distinct photos | 326 (258 from `images/`, 68 from `videos/published/`) |
| Duplicate groups | 169 |
| Redundant files | 266 |
| Space reclaimable after cleanup | ~95 MB |

`unique/` now holds the best copy of each distinct photo plus
`unique/manifest.json`, which maps **every** superseded filename to its
surviving file.

"Best copy" means highest resolution, then highest encoder quality measured
from the JPEG quantization tables, then EXIF presence, then preferred library.

## Principles

1. **Nothing is deleted until the replacement is proven to work.** `unique/` is
   built by copying, so the originals stay intact through every phase below.
2. **Scripts fall back to the old layout.** Each consumer prefers `unique/` and
   silently uses `images/` when it is absent, so any phase can be rolled back by
   deleting `unique/`.
3. **Stale references self-heal.** Project files and captions keyed to a
   superseded photo are rewritten through the manifest's alias table instead of
   erroring or being dropped.

## Phase 0 — Build the library (done)

```powershell
& scripts\image-dedupe\.venv\Scripts\python.exe scripts\image-dedupe\find_duplicate_images.py --sources --export-unique
```

Re-run this any time photos are added. It is incremental: unchanged files are
served from the feature cache and only new files are copied.

Review `.image-dedupe/duplicate-images.md` before continuing. Pay attention to
groups whose confidence is near the threshold — those are the ones worth a
visual check.

## Phase 1 — Repoint consumers (done)

| Consumer | Change |
| --- | --- |
| [scripts/optimize-gallery.js](../optimize-gallery.js) | `sourceDirectory` prefers `unique/`; override with `GALLERY_SOURCE_DIR` |
| [scripts/import-camera-photos.py](../import-camera-photos.py) | New imports land in `unique/` |
| [videos/collage_project.py](../../videos/collage_project.py) | `photo_names()` / `photo_path()` read `unique/`; superseded names resolve through the manifest |
| [videos/create-documentary.py](../../videos/create-documentary.py) | Uses the shared library helpers instead of a hardcoded `images/` scan |
| [videos/test_collage.py](../../videos/test_collage.py) | Covers the `unique/` library and alias rewriting |

Verified: `python -m unittest test_collage` passes 12/12, including a full
render of the real 188-photo collage project sourced entirely from `unique/`.

Not repointed, deliberately:

- `client/public/images/memorial/**` — generated output, not a source library.
- `client/public/images/genealogy/**` — 8 hand-curated files with hardcoded
  paths in [Genealogy.tsx](../../client/src/memorial/Genealogy.tsx) and a live
  Open Graph URL (`https://texecon.com/images/genealogy/smith-history-009.jpg`).
  Moving these breaks a public URL for no dedupe benefit.
- `.knowledge/**` — self-contained archive with internally relative links.

## Phase 2 — Decide the memorial gallery scope (needs a decision)

**Do not run `npm run optimize:gallery` until this is settled.** The gallery is
a curated subset; `unique/` is the full library, so repointing it changes public
site content:

| Effect | Count |
| --- | --- |
| Existing gallery photos | 228 |
| Captions carried forward onto the surviving copy | 45 |
| Captions lost | 0 |
| Photos **added** to the public gallery | 132 (65 of them from `videos/published/`) |
| Resulting gallery size | 326 |

Caption retention is already handled: `optimize-gallery.js` reads the manifest's
`replaces` entries and remaps each superseded hash prefix to its keeper, so a
photo keeps its `photo-NN-<hash>` id, its position, and its hand-written title,
date and location even though its source file changed.

Pick one:

- **A. Full library** — accept all 339. Run `npm run optimize:gallery`, then
  review `client/src/data/memorial-photo-context.json` and write captions for
  the 145 new entries.
- **B. Keep the gallery as-is** — pin it to the old scope while still getting
  dedupe elsewhere:
  ```powershell
  $env:GALLERY_SOURCE_DIR = "images"; npm run optimize:gallery
  ```
- **C. Curate** — copy only the wanted additions into a separate folder and
  point `GALLERY_SOURCE_DIR` at it.

Whichever is chosen, diff `client/src/data/memorial-gallery.json` before
committing, and run `npm run test:run` to confirm `PhotoGallery.test.tsx` still
passes.

## Phase 3 — Burn in

Before deleting anything, exercise every consumer against `unique/`:

```powershell
cd videos; python -m unittest discover -s . -p "test_*.py"; cd ..
python videos/create-collage.py --config videos/jared-e-hazleton-collage.json --validate
npm run test:run
npm run build
```

Then commit `unique/` and the script changes, leaving `images/` and
`videos/published/` in place. Live with this for a release cycle. Disk cost
during burn-in is ~1.14 GB; that is the price of a reversible migration.

## Phase 4 — Retire the originals

Only after Phase 3 is signed off.

1. Confirm nothing outside the manifest still points at the old folders:

   ```powershell
   Select-String -Path scripts\*.js,scripts\*.py,videos\*.py -Pattern "'images'|\"images\"|videos/published"
   ```

2. Deal with the 7 files whose `metadata_from` field is set. These kept the
   better pixels but lost camera EXIF to a copy that is about to be deleted.
   Either accept the loss, or copy the EXIF across with a tool that does not
   re-encode (`piexif.insert`), or keep those specific originals.

3. Rewrite the stored collage projects so they no longer depend on the alias
   table. Loading and saving each project in the editor does this, because
   `normalize_project()` rewrites superseded names on load:

   ```powershell
   npm run video:editor   # open each project, save, close
   ```

4. Delete the originals in one reversible commit:

   ```powershell
   git rm -r --cached images videos/published
   Remove-Item -Recurse images, videos\published
   ```

   Keep this as its own commit with no other changes so it can be reverted
   cleanly.

5. Simplify `photo_libraries()` in `collage_project.py` to drop the legacy
   branch, and remove the `existsSync` fallback in `optimize-gallery.js`.

## Rolling back

At any point before Phase 4, `Remove-Item -Recurse unique` restores the previous
behaviour exactly — every consumer falls back to `images/` and
`videos/published/`. After Phase 4, roll back with `git revert` of the deletion
commit.

## Re-running after adding photos

```powershell
# 1. Drop new photos into unique/ (or images/ and re-export)
# 2. Rescan and refresh the manifest
& scripts\image-dedupe\.venv\Scripts\python.exe scripts\image-dedupe\find_duplicate_images.py --root unique --export-unique unique
# 3. Rebuild the gallery
npm run optimize:gallery
```

Scanning `unique/` against itself is the steady-state check: it should report
zero duplicate groups. Anything it finds is a new duplicate that slipped in.
