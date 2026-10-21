"""Put flat-lay product photos on a clean studio background.

Usage (after prepare_photos.py), in a virtualenv with `pip install "rembg[cpu]" pillow`:
  python3 -I scripts/studio_background.py public/products patchwork-denim-jacket [more names...]

Cuts the garment out with the BiRefNet model (runs on this computer; nothing is uploaded),
centres it on the shop's warm off-white background with a soft shadow, and saves it as
public/products/<name>-studio.jpg (a new file name, so browsers and the image cache don't keep
showing the old photo). Check the result: pale fabric on a pale floor can confuse it.
"""
import sys
from pathlib import Path

from PIL import Image, ImageFilter
from rembg import new_session, remove

W, H = 1500, 2000
BACKGROUND = (241, 238, 232)  # --color-sand


def studio(photo: Image.Image, session) -> Image.Image:
    cut = remove(photo.convert("RGB"), session=session, post_process_mask=True)
    cut = cut.crop(cut.getchannel("A").point(lambda a: 255 if a > 20 else 0).getbbox())
    scale = min(W * 0.84 / cut.width, H * 0.86 / cut.height)
    cut = cut.resize((round(cut.width * scale), round(cut.height * scale)), Image.Resampling.LANCZOS)
    canvas = Image.new("RGB", (W, H), BACKGROUND)
    x, y = (W - cut.width) // 2, (H - cut.height) // 2 - 20
    shadow = Image.new("L", (W, H), 0)
    shadow.paste(cut.getchannel("A").point(lambda a: int(a * 0.28)), (x + 10, y + 22))
    canvas.paste((60, 50, 40), (0, 0, W, H), shadow.filter(ImageFilter.GaussianBlur(26)))
    canvas.paste(cut, (x, y), cut)
    return canvas


def main(folder: str, names: list[str]) -> None:
    session = new_session("birefnet-general")
    for name in names:
        path = Path(folder) / f"{name}.jpg"
        studio(Image.open(path), session).save(path.with_name(f"{name}-studio.jpg"), "JPEG", quality=90, subsampling=0, optimize=True, progressive=True)
        print(f"{name}-studio.jpg: done")


if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2:])
