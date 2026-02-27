"""ID card tools: shared constants and helpers (Aadhar, PAN, Voter, etc.)."""
from typing import Tuple

# Standard Indian ID card dimensions in mm
CARD_WIDTH_MM = 85.6
CARD_HEIGHT_MM = 54.0


def mm_to_px(mm_val: float, dpi: int) -> int:
    """Convert mm to pixels at given DPI."""
    return int((mm_val / 25.4) * dpi)


def pdf_page_to_image(pdf_path: str, page_num: int = 0, dpi: int = 200):
    """Render a PDF page to a PIL Image at given DPI."""
    import fitz
    from PIL import Image as PILImage
    doc = fitz.open(pdf_path)
    page = doc[page_num]
    zoom = dpi / 72
    matrix = fitz.Matrix(zoom, zoom)
    pixmap = page.get_pixmap(matrix=matrix)
    img = PILImage.frombytes("RGB", [pixmap.width, pixmap.height], pixmap.samples)
    doc.close()
    return img


def draw_cut_marks(draw, x: int, y: int, w: int, h: int, color: Tuple[int, ...] = (150, 150, 150)) -> None:
    """Add dashed cut marks around a card region on a print layout image."""
    mark_len = 8
    gap = 3
    corners = [(x, y), (x + w, y), (x, y + h), (x + w, y + h)]
    for cx, cy in corners:
        draw.line([(cx - mark_len - gap, cy), (cx - gap, cy)], fill=color, width=1)
        draw.line([(cx + gap, cy), (cx + mark_len + gap, cy)], fill=color, width=1)
        draw.line([(cx, cy - mark_len - gap), (cx, cy - gap)], fill=color, width=1)
        draw.line([(cx, cy + gap), (cx, cy + mark_len + gap)], fill=color, width=1)
