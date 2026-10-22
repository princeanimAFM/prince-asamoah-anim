"""Prepare product and lookbook photos for the site.

Usage: python3 -I scripts/prepare_photos.py <folder with the original photos>

Each entry below names an original file, an optional crop box (left, top, right, bottom) and a
treatment:
  "shoot"   professional photos that are already edited: resize and a light sharpen only.
  "phone"   phone photos and screenshots: gentle levels, colour and contrast lift, upscale
            small images, and sharpen, so they sit well next to the shoot photos.
The output is saved as high-quality JPEG without camera or location data. The site then serves
AVIF/WebP versions at the right size for each screen (next/image).
"""
import sys
from pathlib import Path

from PIL import Image, ImageEnhance, ImageFilter, ImageOps

OUT = Path(__file__).resolve().parent.parent / "public"
LONG_SIDE = 2000

PHOTOS = [
    # (output path, original file, crop box, treatment)
    ("products/patchwork-pink-corduroy-trousers.jpg", "64b52dab-image.jpg", None, "phone"),
    ("products/patchwork-corduroy-set.jpg", "a0772720-image.jpg", None, "phone"),
    ("products/patchwork-denim-trousers.jpg", "011395b5-image.jpg", (0, 272, 592, 1004), "phone"),
    ("products/patchwork-denim-jacket.jpg", "6f1a4d1f-image.jpg", (0, 322, 592, 976), "phone"),
    ("products/patchwork-corduroy-trousers.jpg", "cb604523-image.jpg", None, "phone"),
    ("products/patchwork-corduroy-trousers-teal.jpg", "93c4512e-image.jpg", (0, 300, 498, 906), "phone"),
    ("products/kwadwoman-patchwork-shoot.jpg", "0d36f33d-image.jpg", (0, 125, 828, 999), "shoot"),
    ("lookbook/city-casual.jpg", "7870e9d7-image.jpg", None, "shoot"),
    ("lookbook/city-casual-2.jpg", "cad18657-image.jpg", None, "shoot"),
    ("lookbook/city-casual-3.jpg", "919c3cbf-image.jpg", None, "shoot"),
    ("lookbook/cream-and-black.jpg", "74d03160-image.jpg", None, "shoot"),
    ("lookbook/sharp-commute.jpg", "8e9fbac3-image.jpg", None, "shoot"),
    ("lookbook/sharp-commute-2.jpg", "2b703bd8-image.jpg", None, "shoot"),
    ("lookbook/autumn-layers.jpg", "0f2147a5-image.jpg", None, "phone"),
    ("lookbook/patchwork-weekend.jpg", "49440125-image.jpg", (220, 420, 960, 1600), "phone"),
]


def fit(im: Image.Image, long_side: int) -> Image.Image:
    scale = long_side / max(im.size)
    if scale >= 1 and max(im.size) >= 1200:
        return im  # big enough already; never enlarge good photos
    scale = min(scale, 2.0)  # small screenshots: enlarge at most 2x
    return im.resize((round(im.width * scale), round(im.height * scale)), Image.Resampling.LANCZOS)


def prepare(src: Path, box, treatment: str) -> Image.Image:
    im = ImageOps.exif_transpose(Image.open(src)).convert("RGB")
    if box:
        im = im.crop(box)
    if treatment == "phone":
        im = ImageOps.autocontrast(im, cutoff=0.4, preserve_tone=True)
        im = ImageEnhance.Color(im).enhance(1.08)
        im = ImageEnhance.Contrast(im).enhance(1.05)
        im = fit(im, LONG_SIDE)
        im = im.filter(ImageFilter.UnsharpMask(radius=1.6, percent=55, threshold=3))
    else:
        im = fit(im, LONG_SIDE)
        im = im.filter(ImageFilter.UnsharpMask(radius=0.8, percent=25, threshold=2))
    return im


def main(folder: str) -> None:
    for out, name, box, treatment in PHOTOS:
        im = prepare(Path(folder) / name, box, treatment)
        target = OUT / out
        target.parent.mkdir(parents=True, exist_ok=True)
        # No exif= argument, so no camera or location data is written.
        im.save(target, "JPEG", quality=90, subsampling=0, optimize=True, progressive=True)
        print(f"{out}: {im.width}x{im.height}")


if __name__ == "__main__":
    main(sys.argv[1])
