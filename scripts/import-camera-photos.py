"""Import HEIC photos and unpaired MOV stills before npm run optimize:gallery.

Requires Pillow, pillow-heif, and imageio-ffmpeg in the Python environment.
Originals are retained; existing stills with the same stem are preferred.
"""

import os
from pathlib import Path
import subprocess

import imageio_ffmpeg
from PIL import Image, ImageOps
import pillow_heif


def main():
    pillow_heif.register_heif_opener()
    source = Path(__file__).resolve().parents[1] / "images"
    files = sorted(source.iterdir(), key=lambda item: item.name.lower())
    still_stems = {
        item.stem.lower()
        for item in files
        if item.suffix.lower() in {".jpg", ".jpeg", ".png", ".webp"}
    }
    converted = extracted = skipped = 0

    for item in files:
        if item.suffix.lower() != ".heic":
            continue
        if item.stem.lower() in still_stems:
            skipped += 1
            continue
        output = item.with_suffix(".jpg")
        with Image.open(item) as original:
            photo = ImageOps.exif_transpose(original)
            options = {"exif": photo.getexif().tobytes()}
            if photo.info.get("icc_profile"):
                options["icc_profile"] = photo.info["icc_profile"]
            photo.convert("RGB").save(output, quality=95, **options)
        os.utime(output, ns=(item.stat().st_atime_ns, item.stat().st_mtime_ns))
        still_stems.add(item.stem.lower())
        converted += 1
        print(f"Converted {item.name} -> {output.name}", flush=True)

    for item in files:
        if item.suffix.lower() != ".mov":
            continue
        output = item.with_name(f"{item.stem}-video-still.jpg")
        if item.stem.lower() in still_stems or output.exists():
            skipped += 1
            continue
        subprocess.run(
            [
                imageio_ffmpeg.get_ffmpeg_exe(), "-hide_banner", "-loglevel", "error",
                "-nostdin", "-n", "-i", str(item), "-vf", "thumbnail=100",
                "-frames:v", "1", "-q:v", "2", str(output),
            ],
            check=True,
        )
        with Image.open(output) as photo:
            photo.verify()
        os.utime(output, ns=(item.stat().st_atime_ns, item.stat().st_mtime_ns))
        extracted += 1
        print(f"Extracted {item.name} -> {output.name}", flush=True)

    print(f"Converted {converted} HEIC photos; extracted {extracted} MOV stills; skipped {skipped} existing/paired stills.")


if __name__ == "__main__":
    main()
