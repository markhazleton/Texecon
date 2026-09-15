# Image Duplicate Finder

Finds duplicate and near-duplicate images in this repository by comparing
**pixel content**. Filenames, timestamps and EXIF are never used to decide
whether two images match — they only appear in the report to help you pick
which copy to keep.

## How it works

Three independent passes run over every image, and their results are merged:

| Pass | Technique | Catches |
| --- | --- | --- |
| 1. Exact | SHA-256 of file bytes | Byte-identical copies |
| 2. Perceptual | 256-bit pHash (DCT) **and** 256-bit dHash (gradient), both required to agree | Re-encodes, resizes, WebP/JPEG variants, quality changes, small crops |
| 3. Semantic | CLIP ViT-B/32 embeddings, cosine similarity, **corroborated by hash distance** | Different crops, zooms, re-edits and rescans of the same photo |

Requiring pHash **and** dHash to agree independently is what keeps precision
high: a single weak hash will match any two photos with a similar tonal
layout, but two structurally different hashes rarely agree by chance.

The semantic pass needs the corroboration gate because CLIP rates two *different*
photos of the same scene as highly similar. Measured on this repository, at
cosine 0.94 it proposed 54 matches the hashes had not found and 29 of them were
structurally unrelated — real photos that would have been deleted. Requiring a
match to also be within `--semantic-max-distance` hash bits removes those while
keeping the genuine crops and re-edits.

Images are rotated according to their EXIF orientation flag before hashing, so a
photo stored sideways still matches a physically rotated copy.

## Choosing the best copy

Within a group the keeper is decided in this order:

1. **Resolution**, bucketed at ~4% steps so a trivially larger copy cannot win.
2. **Encoder quality**. For JPEG this is recovered from the file's own
   quantization tables, which is a direct measurement of how much the encoder
   threw away; other formats fall back to bytes-per-pixel.
3. **EXIF presence**, then the preferred library, then file size.

Groups whose members disagree on framing are flagged `review: cropped` or
`review: rotated` rather than resolved automatically — which framing to keep is
an editorial decision the tool should not make.

Matches are grouped with union-find, then each group is **re-anchored around
its best copy**. Without that step, transitive chaining (A~B, B~C, so A~C)
merges unrelated photos into one giant group.

## Building the `unique/` library

`--export-unique` copies one version of every distinct image into a flat
library, together with a `manifest.json` that maps every superseded filename to
its surviving file:

```powershell
& scripts\image-dedupe\.venv\Scripts\python.exe scripts\image-dedupe\find_duplicate_images.py --sources --export-unique
```

`--sources` restricts the scan to the original photo libraries (`images/` and
`videos/published/`). Without it the scan also covers
`client/public/images/memorial/`, where every photo's own thumb/960/1600
renditions are correctly but uselessly reported as duplicates of each other.

The export is incremental and idempotent — re-running copies only new files, and
scanning the finished library against itself reports zero duplicates.

See [CLEANUP-PLAN.md](CLEANUP-PLAN.md) for the staged migration that repoints
the build scripts at `unique/` and eventually retires the originals.

### Manifest shape

```json
{
  "count": 326,
  "superseded": 266,
  "files": [
    {
      "name": "IMGP0209.jpg",
      "source": "videos/published/IMGP0209.jpg",
      "sha256": "...",
      "dimensions": "3264x2448",
      "quality": 98.4,
      "exif": false,
      "metadata_from": "images/IMGP0209.jpg",
      "replaces": [{ "source": "images/IMGP0209.jpg", "sha256": "..." }]
    }
  ],
  "aliases": { "images/IMGP0209.jpg": "IMGP0209.jpg" }
}
```

`aliases` keys include both the repo-relative path and the bare filename.
`replaces` carries the superseded SHA-256 so `optimize-gallery.js` can move a
photo's hand-written caption onto the surviving copy. `metadata_from` is set
when the best copy has better pixels but a superseded sibling holds camera EXIF
it lacks — check those before deleting originals.

## Setup

Requires Python 3.11–3.13 (PyTorch has no 3.14 wheels yet).

```powershell
py -3.13 -m venv scripts\image-dedupe\.venv
& scripts\image-dedupe\.venv\Scripts\python.exe -m pip install -r scripts\image-dedupe\requirements.txt
```

For the ML pass on a machine without a GPU, install the CPU build of PyTorch
instead of the default wheel:

```powershell
& scripts\image-dedupe\.venv\Scripts\python.exe -m pip install torch torchvision --index-url https://download.pytorch.org/whl/cpu
```

The CLIP weights (~600 MB) download once on first run and are cached by
Hugging Face. If PyTorch is missing the script automatically falls back to
MobileNetV3, and if that is missing too it skips pass 3 and still reports
exact and perceptual duplicates.

## Usage

```powershell
# Full repo scan, all three passes
& scripts\image-dedupe\.venv\Scripts\python.exe scripts\image-dedupe\find_duplicate_images.py

# Fast: hashing only, no model download
& scripts\image-dedupe\.venv\Scripts\python.exe scripts\image-dedupe\find_duplicate_images.py --no-semantic

# Limit to specific folders
& scripts\image-dedupe\.venv\Scripts\python.exe scripts\image-dedupe\find_duplicate_images.py --root client\public\images\memorial --root images

# Stricter matching, plus a deletion script to review
& scripts\image-dedupe\.venv\Scripts\python.exe scripts\image-dedupe\find_duplicate_images.py --hash-threshold 12 --similarity 0.97 --delete-script .image-dedupe\remove.ps1
```

### Key options

| Option | Default | Notes |
| --- | --- | --- |
| `--root` | repo root | Repeatable. |
| `--sources` | off | Scan only `images/` and `videos/published/`. |
| `--export-unique [DIR]` | off | Write the deduplicated library to `DIR` (default `unique`). |
| `--hardlink` | off | Hard-link into the export instead of copying. Same volume only. |
| `--prefer` | source libraries | Path prefix favoured when copies are otherwise equal. Repeatable, highest first. |
| `--hash-threshold` | `20` | Max Hamming distance out of 256 bits, required of pHash *and* dHash. Lower is stricter; `10`–`14` for near-identical only. |
| `--similarity` | `0.95` | Min CLIP cosine similarity. |
| `--semantic-max-distance` | `60` | Max hash distance out of 256 a semantic match may have. Lower is stricter; this is what stops CLIP merging different photos of one scene. |
| `--no-semantic` | off | Skips the ML pass entirely. |
| `--include-build-output` | off | Also scans `target/` and `dist/`, which mirror `client/public` and produce expected duplicates. |
| `--min-bytes` | `4096` | Skips icons and sprites. |
| `--out` | `.image-dedupe` | Never point this at `target/` — that directory is published to GitHub Pages. |
| `--no-cache` | off | Rebuilds the feature cache from scratch. |

## Output

Written to `.image-dedupe/` (gitignored):

- `duplicate-images.md` — reviewable table per group, with `KEEP` marked.
- `duplicate-images.json` — full machine-readable result including per-file
  SHA-256, dimensions and the match reason for each group.
- `feature-cache.json` — hashes and embeddings keyed by path + mtime + size,
  so re-runs skip unchanged files.

Nothing is ever deleted. `--delete-script` emits a PowerShell file with every
`Remove-Item` **commented out** for you to review and uncomment.

## Caveats

- Perceptual hashing is rotation-sensitive; a 90°-rotated copy will not match.
- Heavily cropped photos are found by the semantic pass, not by hashing.
- `target/` and `client/public/images` legitimately contain the same files;
  `target/` is excluded by default for that reason.
- `.heic`/`.heif` support requires the optional `pillow-heif` package.
