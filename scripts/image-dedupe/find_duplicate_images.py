#!/usr/bin/env python3
"""Find duplicate and near-duplicate images by comparing pixel content.

Detection runs in three independent passes and merges the results:

1. Exact      - SHA-256 of the file bytes (byte-identical copies).
2. Perceptual - 256-bit pHash (DCT) AND 256-bit dHash (gradient) must both
                agree. Catches re-encodes, resizes, quality changes and
                minor crops without matching merely similar-looking photos.
3. Semantic   - CLIP (or MobileNetV3) embeddings compared by cosine
                similarity. Catches burst shots, re-edits, crops and
                scans of the same photo that perceptual hashing misses.

Filenames, timestamps and EXIF are never used to decide similarity; they
only appear in the report to help you choose which copy to keep.

Usage:
    python scripts/image-dedupe/find_duplicate_images.py
    python scripts/image-dedupe/find_duplicate_images.py --root client/public/images
    python scripts/image-dedupe/find_duplicate_images.py --no-semantic --hash-threshold 12
    python scripts/image-dedupe/find_duplicate_images.py --delete-script .image-dedupe/remove.ps1
"""

from __future__ import annotations

import argparse
import hashlib
import json
import math
import shutil
import sys
import time
from dataclasses import dataclass, field
from pathlib import Path
from typing import Iterable, Iterator, Sequence

try:
    import numpy as np
except ImportError:  # pragma: no cover - dependency guard
    sys.exit("numpy is required. Run: pip install -r scripts/image-dedupe/requirements.txt")

try:
    from PIL import Image, ImageFile, ImageOps
except ImportError:  # pragma: no cover - dependency guard
    sys.exit("Pillow is required. Run: pip install -r scripts/image-dedupe/requirements.txt")

try:
    import imagehash
except ImportError:  # pragma: no cover - dependency guard
    sys.exit("imagehash is required. Run: pip install -r scripts/image-dedupe/requirements.txt")

# Truncated JPEGs are common in scanned archives; decode what we can.
ImageFile.LOAD_TRUNCATED_IMAGES = True
Image.MAX_IMAGE_PIXELS = None

try:  # optional: adds .heic/.heif support
    import pillow_heif

    pillow_heif.register_heif_opener()
except ImportError:
    pass


IMAGE_EXTENSIONS = {
    ".jpg",
    ".jpeg",
    ".png",
    ".webp",
    ".gif",
    ".bmp",
    ".tif",
    ".tiff",
    ".heic",
    ".heif",
    ".avif",
}

DEFAULT_EXCLUDES = [
    "node_modules",
    ".git",
    ".venv",
    "venv",
    "__pycache__",
    "target",
    "dist",
    "coverage",
    ".vite",
]

# Original photo libraries. Everything under client/public/images/memorial is
# generated from these by scripts/optimize-gallery.js, so scanning it would
# report each photo's own thumb/960/1600 renditions as duplicates.
SOURCE_LIBRARIES = ["images", "videos/published"]

CACHE_VERSION = 5
HASH_SIZE = 16  # 16x16 grid -> 256 bits per hash
HASH_BITS = HASH_SIZE * HASH_SIZE
POPCOUNT = np.unpackbits(np.arange(256, dtype=np.uint8)[:, None], axis=1).sum(1).astype(np.uint16)

# Mean of the JPEG standard luminance quantization table (ITU-T T.81 Annex K),
# used to recover the encoder's quality setting from a file's own table.
STANDARD_LUMA_MEAN = 31.90625


# --------------------------------------------------------------------------- #
# Model
# --------------------------------------------------------------------------- #


@dataclass
class ImageRecord:
    path: Path
    rel: str
    size_bytes: int
    mtime: float
    sha256: str = ""
    width: int = 0
    height: int = 0
    phash: np.ndarray | None = None  # packed 256-bit DCT hash
    dhash: np.ndarray | None = None  # packed 256-bit gradient hash
    embedding: np.ndarray | None = None  # L2-normalised float32 vector
    quality: float = 0.0  # estimated encoder quality, 0-100
    has_exif: bool = False
    priority: int = 0  # higher wins ties; set from --prefer
    error: str = ""

    @property
    def pixels(self) -> int:
        return self.width * self.height

    @property
    def aspect(self) -> float:
        return self.width / self.height if self.height else 0.0

    @property
    def rank(self) -> tuple:
        """Sort key for choosing the best copy; larger is better.

        Resolution is bucketed at ~4% steps so that a copy which is only
        trivially larger cannot win against a visibly better encode.
        """
        bucket = round(math.log2(self.pixels) * 16) if self.pixels else 0
        return (bucket, round(self.quality, 1), self.has_exif, self.priority,
                self.size_bytes, -len(self.rel))


@dataclass
class Cluster:
    members: list[ImageRecord]
    reasons: set[str] = field(default_factory=set)
    min_score: float = 1.0

    def keeper(self) -> ImageRecord:
        """Best copy: resolution, then encoder quality, then EXIF and library."""
        return max(self.members, key=lambda r: r.rank)


class UnionFind:
    def __init__(self, count: int) -> None:
        self._parent = list(range(count))

    def find(self, item: int) -> int:
        while self._parent[item] != item:
            self._parent[item] = self._parent[self._parent[item]]
            item = self._parent[item]
        return item

    def union(self, left: int, right: int) -> None:
        root_l, root_r = self.find(left), self.find(right)
        if root_l != root_r:
            self._parent[root_r] = root_l


# --------------------------------------------------------------------------- #
# Discovery + feature extraction
# --------------------------------------------------------------------------- #


def discover_images(roots: Sequence[Path], excludes: Sequence[str], min_bytes: int) -> list[Path]:
    exclude_set = {e.lower() for e in excludes}
    found: dict[Path, None] = {}
    for root in roots:
        if not root.exists():
            print(f"  ! skipping missing path: {root}")
            continue
        for path in root.rglob("*"):
            if path.suffix.lower() not in IMAGE_EXTENSIONS or not path.is_file():
                continue
            if any(part.lower() in exclude_set for part in path.parts):
                continue
            try:
                if path.stat().st_size < min_bytes:
                    continue
            except OSError:
                continue
            found[path.resolve()] = None
    return sorted(found)


def sha256_of(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def perceptual_bits(image: Image.Image) -> tuple[np.ndarray, np.ndarray]:
    """Two complementary 256-bit hashes: DCT-based and gradient-based."""
    phash = imagehash.phash(image, hash_size=HASH_SIZE).hash.flatten().astype(np.uint8)
    dhash = imagehash.dhash(image, hash_size=HASH_SIZE).hash.flatten().astype(np.uint8)
    return np.packbits(phash), np.packbits(dhash)


def load_rgb(path: Path) -> tuple[Image.Image, tuple[int, int]]:
    """Return an upright RGB image plus its true size.

    draft() rescales JPEGs in place for a fast partial decode, so the real
    dimensions have to be read before it runs or originals look smaller than
    the derivatives made from them.
    """
    image = Image.open(path)
    true_size = image.size
    if (image.getexif().get(274) or 1) in (5, 6, 7, 8):
        true_size = (true_size[1], true_size[0])
    image.draft("RGB", (512, 512))
    # Orientation must be applied before hashing, or a photo stored sideways
    # with an EXIF rotation flag will not match a physically rotated copy.
    return ImageOps.exif_transpose(image).convert("RGB"), true_size


def encoder_quality(image: Image.Image, size_bytes: int, pixels: int) -> float:
    """Estimate encoding quality on a 0-100 scale so copies can be compared.

    For JPEG this inverts the libjpeg quality scaling from the file's own
    quantization table, which is a direct measurement rather than a guess.
    Other formats fall back to bytes-per-pixel, which tracked the quantization
    tables closely on this repository's photos.
    """
    table = getattr(image, "quantization", None)
    if table and 0 in table:
        scale = 100.0 * (float(np.mean(table[0])) / STANDARD_LUMA_MEAN)
        quality = 100.0 - scale / 2 if scale < 100 else 5000.0 / scale
        return max(1.0, min(100.0, quality))
    return max(1.0, min(100.0, (size_bytes / max(pixels, 1)) * 250))


def extract_features(records: list[ImageRecord], cache: dict) -> None:
    total = len(records)
    for index, record in enumerate(records, start=1):
        key = record.rel
        cached = cache.get(key)
        if cached and cached["mtime"] == record.mtime and cached["size"] == record.size_bytes:
            record.sha256 = cached["sha256"]
            record.width = cached["width"]
            record.height = cached["height"]
            record.quality = cached["quality"]
            record.has_exif = cached["exif"]
            record.phash = np.frombuffer(bytes.fromhex(cached["p"]), dtype=np.uint8)
            record.dhash = np.frombuffer(bytes.fromhex(cached["d"]), dtype=np.uint8)
            continue

        try:
            record.sha256 = sha256_of(record.path)
            with Image.open(record.path) as raw:
                exif = raw.getexif()
                record.has_exif = bool(exif.get(271) or exif.get(272) or exif.get(306))
                record.width, record.height = raw.size
                if (exif.get(274) or 1) in (5, 6, 7, 8):
                    record.width, record.height = record.height, record.width
                record.quality = encoder_quality(raw, record.size_bytes, record.pixels)
                raw.draft("RGB", (512, 512))
                with ImageOps.exif_transpose(raw).convert("RGB") as image:
                    record.phash, record.dhash = perceptual_bits(image)
        except Exception as exc:  # noqa: BLE001 - report and continue
            record.error = f"{type(exc).__name__}: {exc}"
            continue

        cache[key] = {
            "mtime": record.mtime,
            "size": record.size_bytes,
            "sha256": record.sha256,
            "width": record.width,
            "height": record.height,
            "quality": record.quality,
            "exif": record.has_exif,
            "p": record.phash.tobytes().hex(),
            "d": record.dhash.tobytes().hex(),
        }
        if index % 50 == 0 or index == total:
            print(f"  hashed {index}/{total}", end="\r", flush=True)
    print()


# --------------------------------------------------------------------------- #
# Semantic embeddings (optional ML pass)
# --------------------------------------------------------------------------- #


def build_embedder(model_name: str):
    """Return (name, callable(list[PIL.Image]) -> np.ndarray) or (None, None)."""
    try:
        import torch
    except ImportError:
        print("  ! torch not installed - skipping semantic pass (pip install torch)")
        return None, None

    device = "cuda" if torch.cuda.is_available() else "cpu"

    try:
        from transformers import CLIPModel, CLIPProcessor

        model = CLIPModel.from_pretrained(model_name).to(device).eval()
        processor = CLIPProcessor.from_pretrained(model_name)

        @torch.inference_mode()
        def encode(images):
            batch = processor(images=images, return_tensors="pt").to(device)
            output = model.get_image_features(**batch)
            # transformers >=5 returns a model output object instead of a tensor.
            if not torch.is_tensor(output):
                for attribute in ("image_embeds", "pooler_output", "last_hidden_state"):
                    candidate = getattr(output, attribute, None)
                    if candidate is not None:
                        output = candidate
                        break
            if output.ndim == 3:
                output = output[:, 0, :]
            return output.float().cpu().numpy()

        return f"CLIP {model_name} ({device})", encode
    except Exception as exc:  # noqa: BLE001 - fall back to torchvision
        print(f"  ! CLIP unavailable ({type(exc).__name__}); trying MobileNetV3")

    try:
        from torchvision import transforms
        from torchvision.models import MobileNet_V3_Large_Weights, mobilenet_v3_large

        weights = MobileNet_V3_Large_Weights.DEFAULT
        model = mobilenet_v3_large(weights=weights).to(device).eval()
        model.classifier = torch.nn.Identity()
        preprocess = transforms.Compose(
            [
                transforms.Resize(256),
                transforms.CenterCrop(224),
                transforms.ToTensor(),
                transforms.Normalize(
                    mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]
                ),
            ]
        )

        @torch.inference_mode()
        def encode(images):
            batch = torch.stack([preprocess(img) for img in images]).to(device)
            return model(batch).float().cpu().numpy()

        return f"MobileNetV3 ({device})", encode
    except Exception as exc:  # noqa: BLE001
        print(f"  ! MobileNetV3 unavailable ({type(exc).__name__}) - skipping semantic pass")
        return None, None


def compute_embeddings(
    records: list[ImageRecord], encode, cache: dict, model_key: str, batch_size: int
) -> None:
    pending: list[ImageRecord] = []
    for record in records:
        cached = cache.get(record.rel)
        if (
            cached
            and cached["mtime"] == record.mtime
            and cached["size"] == record.size_bytes
            and cached["model"] == model_key
        ):
            record.embedding = np.frombuffer(bytes.fromhex(cached["vec"]), dtype=np.float32)
        else:
            pending.append(record)

    done = len(records) - len(pending)
    for start in range(0, len(pending), batch_size):
        chunk = pending[start : start + batch_size]
        images, usable = [], []
        for record in chunk:
            try:
                images.append(load_rgb(record.path)[0])
                usable.append(record)
            except Exception as exc:  # noqa: BLE001
                record.error = record.error or f"{type(exc).__name__}: {exc}"
        if not usable:
            continue
        try:
            vectors = encode(images)
        except Exception as exc:  # noqa: BLE001
            print(f"  ! embedding batch failed: {exc}")
            continue
        finally:
            for image in images:
                image.close()

        norms = np.linalg.norm(vectors, axis=1, keepdims=True)
        vectors = (vectors / np.maximum(norms, 1e-8)).astype(np.float32)
        for record, vector in zip(usable, vectors):
            record.embedding = vector
            cache[record.rel] = {
                "mtime": record.mtime,
                "size": record.size_bytes,
                "model": model_key,
                "vec": vector.tobytes().hex(),
            }
        done += len(chunk)
        print(f"  embedded {done}/{len(records)}", end="\r", flush=True)
    print()


# --------------------------------------------------------------------------- #
# Pair finding
# --------------------------------------------------------------------------- #


def exact_pairs(records: list[ImageRecord]) -> Iterator[tuple[int, int, float]]:
    buckets: dict[str, list[int]] = {}
    for index, record in enumerate(records):
        if record.sha256:
            buckets.setdefault(record.sha256, []).append(index)
    for indices in buckets.values():
        head = indices[0]
        for other in indices[1:]:
            yield head, other, 1.0


def bit_distance(left: np.ndarray, right: np.ndarray) -> int:
    return int(POPCOUNT[np.bitwise_xor(left, right)].sum())


def perceptual_score(a: ImageRecord, b: ImageRecord, threshold: int) -> float | None:
    """Both hashes must independently agree, which prevents chance matches."""
    if a.phash is None or b.phash is None:
        return None
    dist_p = bit_distance(a.phash, b.phash)
    if dist_p > threshold:
        return None
    dist_d = bit_distance(a.dhash, b.dhash)
    if dist_d > threshold:
        return None
    return 1.0 - (dist_p + dist_d) / (2 * HASH_BITS)


def hamming_pairs(
    records: list[ImageRecord], threshold: int, chunk: int = 256
) -> Iterator[tuple[int, int, float]]:
    usable = [i for i, r in enumerate(records) if r.phash is not None]
    if len(usable) < 2:
        return
    p_matrix = np.stack([records[i].phash for i in usable])
    d_matrix = np.stack([records[i].dhash for i in usable])
    count = len(usable)

    for start in range(0, count, chunk):
        stop = min(start + chunk, count)
        p_dist = POPCOUNT[np.bitwise_xor(p_matrix[start:stop, None, :], p_matrix[None, :, :])].sum(2)
        candidates = p_dist <= threshold
        # Only compare each unordered pair once.
        for row in range(stop - start):
            candidates[row, : start + row + 1] = False
        rows, cols = np.nonzero(candidates)
        for row, col in zip(rows, cols):
            left, right = usable[start + int(row)], usable[int(col)]
            dist_d = bit_distance(records[left].dhash, records[right].dhash)
            if dist_d > threshold:
                continue
            yield left, right, 1.0 - (int(p_dist[row, col]) + dist_d) / (2 * HASH_BITS)
        print(f"  compared {stop}/{count}", end="\r", flush=True)
    print()


def structural_distance(a: ImageRecord, b: ImageRecord) -> int:
    """Worst-case hash distance, used to sanity-check semantic matches."""
    if a.phash is None or b.phash is None:
        return HASH_BITS
    return max(bit_distance(a.phash, b.phash), bit_distance(a.dhash, b.dhash))


def cosine_pairs(
    records: list[ImageRecord], threshold: float, max_distance: int, chunk: int = 512
) -> Iterator[tuple[int, int, float]]:
    usable = [i for i, r in enumerate(records) if r.embedding is not None]
    if len(usable) < 2:
        return
    matrix = np.stack([records[i].embedding for i in usable])
    count = len(usable)

    for start in range(0, count, chunk):
        block = matrix[start : start + chunk]
        similarity = block @ matrix.T
        rows, cols = np.nonzero(similarity >= threshold)
        for row, col in zip(rows, cols):
            left = start + int(row)
            right = int(col)
            if left >= right:
                continue
            # CLIP rates two different photos of one scene as highly similar, so
            # a semantic match only counts if the images are structurally close.
            if structural_distance(records[usable[left]], records[usable[right]]) > max_distance:
                continue
            yield usable[left], usable[right], float(similarity[row, col])


# --------------------------------------------------------------------------- #
# Reporting
# --------------------------------------------------------------------------- #


def compare(a: ImageRecord, b: ImageRecord, threshold: int, similarity: float, max_distance: int):
    """Return (score, reason) for a pair, or None when they are not duplicates."""
    if a.sha256 and a.sha256 == b.sha256:
        return 1.0, "exact"
    score = perceptual_score(a, b, threshold)
    if score is not None:
        return score, "perceptual"
    if a.embedding is not None and b.embedding is not None:
        cosine = float(np.dot(a.embedding, b.embedding))
        if cosine >= similarity and structural_distance(a, b) <= max_distance:
            return cosine, "semantic"
    return None


def build_clusters(
    records: list[ImageRecord],
    pairs: Iterable[tuple[int, int, float, str]],
    threshold: int,
    similarity: float,
    max_distance: int,
) -> list[Cluster]:
    """Group by connected components, then split each component around leaders.

    Raw connected components chain together images that are each similar to a
    neighbour but not to one another. Re-anchoring every member against the
    best copy in the group keeps only genuine duplicates together.
    """
    union = UnionFind(len(records))
    for left, right, _score, _reason in pairs:
        union.union(left, right)

    components: dict[int, list[ImageRecord]] = {}
    for index, record in enumerate(records):
        components.setdefault(union.find(index), []).append(record)

    clusters: list[Cluster] = []
    for members in components.values():
        if len(members) < 2:
            continue
        remaining = sorted(members, key=lambda r: r.rank, reverse=True)
        while len(remaining) > 1:
            leader = remaining.pop(0)
            cluster = Cluster(members=[leader])
            leftovers: list[ImageRecord] = []
            for candidate in remaining:
                verdict = compare(leader, candidate, threshold, similarity, max_distance)
                if verdict is None:
                    leftovers.append(candidate)
                    continue
                score, reason = verdict
                cluster.members.append(candidate)
                cluster.reasons.add(reason)
                cluster.min_score = min(cluster.min_score, score)
            if len(cluster.members) > 1:
                clusters.append(cluster)
            remaining = leftovers

    for cluster in clusters:
        cluster.members.sort(key=lambda r: r.rank, reverse=True)
    clusters.sort(key=lambda c: (-sum(m.size_bytes for m in c.members[1:]), c.members[0].rel))
    return clusters


def human_bytes(value: int) -> str:
    step = float(value)
    for unit in ("B", "KB", "MB", "GB"):
        if step < 1024 or unit == "GB":
            return f"{step:.1f} {unit}"
        step /= 1024
    return f"{step:.1f} GB"


def framing_note(cluster: Cluster) -> str:
    """Flag groups whose members disagree on framing.

    Equally-sized copies with different aspect ratios mean one is cropped or
    rotated. Which one is wanted is an editorial call, so say so rather than
    silently discarding the alternative framing.
    """
    keeper = cluster.keeper()
    for member in cluster.members:
        if member is keeper or not member.aspect or not keeper.aspect:
            continue
        if abs(keeper.aspect / member.aspect - 1) <= 0.03:
            continue
        # Reciprocal aspects mean one copy is on its side, not cropped.
        return "rotated" if abs(keeper.aspect * member.aspect - 1) < 0.05 else "cropped"
    return ""


def write_reports(
    clusters: list[Cluster],
    records: list[ImageRecord],
    out_dir: Path,
    settings: dict,
) -> tuple[Path, Path, int]:
    out_dir.mkdir(parents=True, exist_ok=True)
    reclaimable = sum(
        m.size_bytes for c in clusters for m in c.members if m is not c.keeper()
    )

    payload = {
        "generated": time.strftime("%Y-%m-%dT%H:%M:%S"),
        "settings": settings,
        "scanned": len(records),
        "failed": [{"path": r.rel, "error": r.error} for r in records if r.error],
        "duplicate_groups": len(clusters),
        "duplicate_files": sum(len(c.members) - 1 for c in clusters),
        "reclaimable_bytes": reclaimable,
        "groups": [
            {
                "match": sorted(cluster.reasons),
                "confidence": round(cluster.min_score, 4),
                "review": framing_note(cluster),
                "keep": cluster.keeper().rel,
                "files": [
                    {
                        "path": member.rel,
                        "bytes": member.size_bytes,
                        "dimensions": f"{member.width}x{member.height}",
                        "quality": round(member.quality, 1),
                        "exif": member.has_exif,
                        "sha256": member.sha256,
                        "keep": member is cluster.keeper(),
                    }
                    for member in cluster.members
                ],
            }
            for cluster in clusters
        ],
    }

    json_path = out_dir / "duplicate-images.json"
    json_path.write_text(json.dumps(payload, indent=2), encoding="utf-8")

    flagged = [c for c in clusters if framing_note(c)]
    lines = [
        "# Duplicate Image Report",
        "",
        f"- Generated: {payload['generated']}",
        f"- Images scanned: {len(records)}",
        f"- Duplicate groups: {len(clusters)}",
        f"- Redundant files: {payload['duplicate_files']}",
        f"- Reclaimable space: {human_bytes(reclaimable)}",
        f"- Groups needing a framing decision: {len(flagged)}",
        "",
        "`KEEP` is the highest-resolution copy, breaking ties on encoder quality.",
        "Groups marked **review** hold different crops or rotations of one photo, so",
        "which framing to keep is a judgement call. Review before deleting.",
        "",
    ]
    for number, cluster in enumerate(clusters, start=1):
        note = framing_note(cluster)
        heading = f"## Group {number} - {', '.join(sorted(cluster.reasons))} "
        heading += f"(confidence {cluster.min_score:.3f})"
        if note:
            heading += f" - **review: {note}**"
        lines.append(heading)
        lines.append("")
        lines.append("| | File | Dimensions | Quality | EXIF | Size |")
        lines.append("| --- | --- | --- | --- | --- | --- |")
        for member in cluster.members:
            marker = "KEEP" if member is cluster.keeper() else "dup"
            lines.append(
                f"| {marker} | `{member.rel}` | {member.width}x{member.height} "
                f"| {member.quality:.0f} | {'yes' if member.has_exif else '-'} "
                f"| {human_bytes(member.size_bytes)} |"
            )
        lines.append("")

    md_path = out_dir / "duplicate-images.md"
    md_path.write_text("\n".join(lines), encoding="utf-8")
    return json_path, md_path, reclaimable


def write_delete_script(clusters: list[Cluster], target: Path) -> None:
    target.parent.mkdir(parents=True, exist_ok=True)
    lines = [
        "# Review every line before running. Generated by find_duplicate_images.py.",
        "# Nothing is deleted until you uncomment the Remove-Item calls.",
        "",
    ]
    for number, cluster in enumerate(clusters, start=1):
        keeper = cluster.keeper()
        lines.append(f"# Group {number}: keep {keeper.rel}")
        for member in cluster.members:
            if member is keeper:
                continue
            lines.append(f'# Remove-Item -LiteralPath "{member.path}" -Force')
        lines.append("")
    target.write_text("\n".join(lines), encoding="utf-8")


# --------------------------------------------------------------------------- #
# Unique library export
# --------------------------------------------------------------------------- #


def export_unique(
    records: list[ImageRecord],
    clusters: list[Cluster],
    dest: Path,
    hardlink: bool,
) -> dict:
    """Write one copy of every distinct image into `dest` as a flat library.

    Every group contributes its keeper; images in no group are distinct and are
    copied as-is. The manifest's alias table maps every original path (and bare
    filename) to its surviving file so callers can resolve stale references.
    """
    superseded: dict[str, list[ImageRecord]] = {}
    dropped: set[str] = set()
    for cluster in clusters:
        keeper = cluster.keeper()
        others = [m for m in cluster.members if m is not keeper]
        superseded.setdefault(keeper.rel, []).extend(others)
        dropped.update(m.rel for m in others)

    survivors = [r for r in records if r.rel not in dropped and not r.error]
    survivors.sort(key=lambda r: r.rel)

    dest.mkdir(parents=True, exist_ok=True)
    existing = {p.name for p in dest.iterdir() if p.is_file() and p.name != "manifest.json"}
    taken: set[str] = set()
    taken_lower: set[str] = set()
    entries: list[dict] = []
    aliases: dict[str, str] = {}
    metadata_gaps: list[tuple[str, str]] = []
    copied = 0

    for record in survivors:
        stem, suffix = record.path.stem, record.path.suffix.lower()
        name = f"{stem}{suffix}"
        if name.lower() in taken_lower:
            # Distinct images that happen to share a filename keep both.
            name = f"{stem}-{record.sha256[:8]}{suffix}"
        taken.add(name)
        taken_lower.add(name.lower())

        target = dest / name
        if not target.exists() or target.stat().st_size != record.size_bytes:
            if hardlink:
                try:
                    if target.exists():
                        target.unlink()
                    target.hardlink_to(record.path)
                except OSError:
                    shutil.copy2(record.path, target)
            else:
                shutil.copy2(record.path, target)
            copied += 1

        replaces = superseded.get(record.rel, [])
        # The best pixels and the surviving EXIF are not always the same file.
        metadata_from = next(
            (m.rel for m in replaces if m.has_exif and not record.has_exif), ""
        )
        if metadata_from:
            metadata_gaps.append((name, metadata_from))
        entries.append(
            {
                "name": name,
                "source": record.rel,
                "sha256": record.sha256,
                "bytes": record.size_bytes,
                "dimensions": f"{record.width}x{record.height}",
                "quality": round(record.quality, 1),
                "exif": record.has_exif,
                "metadata_from": metadata_from,
                "replaces": [{"source": m.rel, "sha256": m.sha256} for m in replaces],
            }
        )
        for alias_source in [record, *replaces]:
            aliases[alias_source.rel] = name
            aliases.setdefault(Path(alias_source.rel).name, name)

    stale = existing - taken
    manifest = {
        "generated": time.strftime("%Y-%m-%dT%H:%M:%S"),
        "count": len(entries),
        "superseded": len(dropped),
        "files": entries,
        "aliases": dict(sorted(aliases.items())),
    }
    (dest / "manifest.json").write_text(json.dumps(manifest, indent=2), encoding="utf-8")

    print(f"  wrote {copied} file(s), library now holds {len(entries)} unique images")
    if metadata_gaps:
        print(f"  ! {len(metadata_gaps)} kept file(s) have better pixels but lost EXIF to a")
        print("    superseded copy; see \"metadata_from\" in the manifest before deleting originals")
    if stale:
        print(f"  ! {len(stale)} file(s) in {dest.name}/ are no longer produced by this scan:")
        for name in sorted(stale)[:10]:
            print(f"      {name}")
    return manifest


# --------------------------------------------------------------------------- #
# Entry point
# --------------------------------------------------------------------------- #


def parse_args(argv: Sequence[str] | None = None) -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument(
        "--root",
        action="append",
        default=None,
        help="Directory to scan (repeatable). Defaults to the repository root.",
    )
    parser.add_argument(
        "--sources",
        action="store_true",
        help=f"Scan only the original photo libraries ({', '.join(SOURCE_LIBRARIES)}), not generated renditions.",
    )
    parser.add_argument(
        "--exclude",
        action="append",
        default=[],
        help="Extra directory name to skip (repeatable).",
    )
    parser.add_argument(
        "--include-build-output",
        action="store_true",
        help="Also scan target/ and dist/ (they mirror client/public and create false positives).",
    )
    parser.add_argument(
        "--hash-threshold",
        type=int,
        default=20,
        help=(
            "Max Hamming distance out of 256 bits, required independently of both "
            "pHash and dHash (default 20; lower is stricter)."
        ),
    )
    parser.add_argument(
        "--similarity",
        type=float,
        default=0.95,
        help="Min cosine similarity for the semantic pass (default 0.95).",
    )
    parser.add_argument(
        "--semantic-max-distance",
        type=int,
        default=60,
        help=(
            "Max hash distance out of 256 that a semantic match may still have "
            "(default 60). Stops CLIP merging different photos of the same scene."
        ),
    )
    parser.add_argument(
        "--prefer",
        action="append",
        default=None,
        metavar="PREFIX",
        help=(
            "Repo-relative path prefix to favour when copies are otherwise equal "
            f"(repeatable, highest priority first; defaults to {' then '.join(SOURCE_LIBRARIES)})."
        ),
    )
    parser.add_argument("--no-semantic", action="store_true", help="Skip the ML embedding pass.")
    parser.add_argument(
        "--model",
        default="openai/clip-vit-base-patch32",
        help="HuggingFace CLIP model id for the semantic pass.",
    )
    parser.add_argument("--batch-size", type=int, default=32, help="Embedding batch size.")
    parser.add_argument(
        "--min-bytes", type=int, default=4096, help="Ignore files smaller than this (default 4096)."
    )
    parser.add_argument(
        "--out",
        default=".image-dedupe",
        help="Report output directory (default .image-dedupe; never target/, which is published).",
    )
    parser.add_argument("--delete-script", help="Also write a commented-out PowerShell deletion script.")
    parser.add_argument(
        "--export-unique",
        nargs="?",
        const="unique",
        default=None,
        metavar="DIR",
        help="Copy one version of every distinct image into DIR (default 'unique') with a manifest.",
    )
    parser.add_argument(
        "--hardlink",
        action="store_true",
        help="Hard-link into the export directory instead of copying (saves disk, same volume only).",
    )
    parser.add_argument("--no-cache", action="store_true", help="Ignore and overwrite the feature cache.")
    return parser.parse_args(argv)


def main(argv: Sequence[str] | None = None) -> int:
    args = parse_args(argv)
    repo_root = Path(__file__).resolve().parents[2]
    if args.root:
        roots = [Path(r).resolve() for r in args.root]
    elif args.sources:
        roots = [(repo_root / lib).resolve() for lib in SOURCE_LIBRARIES]
    else:
        roots = [repo_root]

    excludes = list(DEFAULT_EXCLUDES) + list(args.exclude)
    if args.include_build_output:
        excludes = [e for e in excludes if e not in {"target", "dist"}]

    print(f"Repo root: {repo_root}")
    print(f"Scanning:  {', '.join(str(r) for r in roots)}")
    paths = discover_images(roots, excludes, args.min_bytes)
    print(f"Found {len(paths)} candidate images.\n")
    if len(paths) < 2:
        print("Nothing to compare.")
        return 0

    records: list[ImageRecord] = []
    preferences = args.prefer if args.prefer else SOURCE_LIBRARIES
    for path in paths:
        stat = path.stat()
        try:
            rel = str(path.relative_to(repo_root)).replace("\\", "/")
        except ValueError:
            rel = str(path).replace("\\", "/")
        priority = next(
            (len(preferences) - i for i, p in enumerate(preferences) if rel.startswith(p)), 0
        )
        records.append(
            ImageRecord(
                path=path,
                rel=rel,
                size_bytes=stat.st_size,
                mtime=stat.st_mtime,
                priority=priority,
            )
        )

    cache_path = repo_root / args.out / "feature-cache.json"
    cache = {"version": CACHE_VERSION, "features": {}, "embeddings": {}}
    if cache_path.exists() and not args.no_cache:
        try:
            loaded = json.loads(cache_path.read_text(encoding="utf-8"))
            if loaded.get("version") == CACHE_VERSION:
                cache = loaded
        except (json.JSONDecodeError, OSError):
            pass

    print("Pass 1/3 - checksums and perceptual hashes")
    extract_features(records, cache["features"])

    pairs: list[tuple[int, int, float, str]] = []
    pairs += [(a, b, s, "exact") for a, b, s in exact_pairs(records)]
    print(f"  exact matches: {len(pairs)}")

    print(f"\nPass 2/3 - perceptual comparison (pHash and dHash within {args.hash_threshold}/256 bits)")
    perceptual = [(a, b, s, "perceptual") for a, b, s in hamming_pairs(records, args.hash_threshold)]
    pairs += perceptual
    print(f"  perceptual matches: {len(perceptual)}")

    if args.no_semantic:
        print("\nPass 3/3 - semantic comparison SKIPPED (--no-semantic)")
    else:
        print(f"\nPass 3/3 - semantic comparison (cosine >= {args.similarity}, "
              f"structural distance <= {args.semantic_max_distance})")
        model_name, encode = build_embedder(args.model)
        if encode is not None:
            print(f"  model: {model_name}")
            compute_embeddings(records, encode, cache["embeddings"], args.model, args.batch_size)
            semantic = [
                (a, b, s, "semantic")
                for a, b, s in cosine_pairs(records, args.similarity, args.semantic_max_distance)
            ]
            pairs += semantic
            print(f"  semantic matches: {len(semantic)}")

    cache_path.parent.mkdir(parents=True, exist_ok=True)
    cache_path.write_text(json.dumps(cache), encoding="utf-8")

    clusters = build_clusters(
        records, pairs, args.hash_threshold, args.similarity, args.semantic_max_distance
    )
    settings = {
        "roots": [str(r) for r in roots],
        "hash_threshold": args.hash_threshold,
        "similarity": args.similarity,
        "semantic_max_distance": args.semantic_max_distance,
        "semantic": not args.no_semantic,
        "model": args.model,
    }
    json_path, md_path, reclaimable = write_reports(
        clusters, records, repo_root / args.out, settings
    )

    if args.delete_script:
        script_path = Path(args.delete_script)
        if not script_path.is_absolute():
            script_path = repo_root / script_path
        write_delete_script(clusters, script_path)
        print(f"Delete script: {script_path}")

    if args.export_unique:
        dest = Path(args.export_unique)
        if not dest.is_absolute():
            dest = repo_root / dest
        print(f"\nExporting unique library to {dest}")
        export_unique(records, clusters, dest, args.hardlink)

    failures = [r for r in records if r.error]
    flagged = sum(1 for c in clusters if framing_note(c))
    print("\n" + "=" * 60)
    print(f"Duplicate groups:  {len(clusters)}")
    print(f"Redundant files:   {sum(len(c.members) - 1 for c in clusters)}")
    print(f"Reclaimable space: {human_bytes(reclaimable)}")
    if flagged:
        print(f"Needs review:      {flagged} group(s) differ in crop or rotation")
    if failures:
        print(f"Unreadable files:  {len(failures)}")
    print(f"Reports:           {md_path}")
    print(f"                   {json_path}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
