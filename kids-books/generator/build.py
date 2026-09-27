"""Build every book: interior PDF, full-wrap cover PDF, and PNG previews.

    pip install reportlab pypdfium2 pillow
    python build.py            # all books
    python build.py 07 12      # only books whose folder starts with these numbers
"""
import os
import sys

import pypdfium2 as pdfium

import activity
import cookbook
import dots
import mandalas
import mazes
import seniors
import tracing
import wordsearch

# slug: (book, interior ink)
BOOKS = {
    "01-mazes-ages-4-8": (mazes.BOOK_1, "bw"),
    "02-letter-tracing-ages-3-5": (tracing, "bw"),
    "03-word-search-ages-6-8": (wordsearch.BOOK, "bw"),
    "04-mandala-coloring-ages-6-12": (mandalas, "bw"),
    "05-mazes-book-2-ages-6-10": (mazes.BOOK_2, "bw"),
    "06-dot-to-dot-ages-4-8": (dots.BOOK, "bw"),
    "07-christmas-activity-book-ages-4-8": (activity.CHRISTMAS, "bw"),
    "08-halloween-activity-book-ages-4-8": (activity.HALLOWEEN, "bw"),
    "09-seniors-good-old-days-word-search": (seniors.WORD_SEARCH, "bw"),
    "10-seniors-large-print-sudoku": (seniors.SUDOKU, "bw"),
    "11-dementia-activity-book": (seniors.DEMENTIA, "bw"),
    "12-seniors-easy-coloring-book": (seniors.SENIOR_COLORING, "bw"),
    "13-kids-cookbook-ages-8-12": (cookbook.BOOK, "color"),
}
OUT = os.path.join(os.path.dirname(__file__), "..", "books")


def print_cost(pages, ink):
    """KDP US paperback print cost (2026 rate card): black & white or standard color."""
    if ink == "color":
        return 1.00 + 0.0255 * pages
    return 2.30 if pages <= 108 else 1.00 + 0.012 * pages


def preview(pdf, png, page=0, scale=1.0):
    pdfium.PdfDocument(pdf)[page].render(scale=scale).to_pil().save(png)


def main(only=()):
    for slug, (book, ink) in BOOKS.items():
        if only and not slug.startswith(tuple(only)):
            continue
        d = os.path.join(OUT, slug)
        os.makedirs(d, exist_ok=True)
        interior = os.path.join(d, "interior.pdf")
        cover = os.path.join(d, "cover.pdf")
        pages = book.build_interior(interior)
        W, H, spine = book.build_cover(cover, pages)
        preview(cover, os.path.join(d, "cover-preview.png"), scale=1.2)
        sample = getattr(book, "sample_page", None)
        preview(interior, os.path.join(d, "sample-page.png"),
                page=sample if sample is not None else book.SAMPLE_PAGE, scale=1.0)
        print(f"{slug}: {pages} pages ({ink}) | cover {W / 72:.3f} x {H / 72:.3f} in | "
              f"spine {spine / 72:.3f} in | KDP print cost ${print_cost(pages, ink):.2f}")


if __name__ == "__main__":
    main(sys.argv[1:])
