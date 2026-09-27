"""Build every book: interior PDF, full-wrap cover PDF, and PNG previews.

    pip install reportlab pypdfium2 pillow
    python build.py
"""
import os

import pypdfium2 as pdfium

import common as cm
import mandalas
import mazes
import tracing
import wordsearch

BOOKS = {
    "01-mazes-ages-4-8": mazes,
    "02-letter-tracing-ages-3-5": tracing,
    "03-word-search-ages-6-8": wordsearch,
    "04-mandala-coloring-ages-6-12": mandalas,
}
OUT = os.path.join(os.path.dirname(__file__), "..", "books")


def print_cost(pages):
    """KDP US black-and-white paperback print cost (2026 rate card)."""
    return 2.30 if pages <= 108 else 1.00 + 0.012 * pages


def preview(pdf, png, page=0, scale=1.0):
    pdfium.PdfDocument(pdf)[page].render(scale=scale).to_pil().save(png)


def main():
    for slug, mod in BOOKS.items():
        d = os.path.join(OUT, slug)
        os.makedirs(d, exist_ok=True)
        interior = os.path.join(d, "interior.pdf")
        cover = os.path.join(d, "cover.pdf")
        pages = mod.build_interior(interior)
        W, H, spine = mod.build_cover(cover, pages)
        preview(cover, os.path.join(d, "cover-preview.png"), scale=1.2)
        preview(interior, os.path.join(d, "sample-page.png"), page=mod.SAMPLE_PAGE, scale=1.0)
        print(f"{slug}: {pages} pages | cover {W / 72:.3f} x {H / 72:.3f} in | "
              f"spine {spine / 72:.3f} in | KDP print cost ${print_cost(pages):.2f}")


if __name__ == "__main__":
    main()
