"""OCR service: PDF to text or searchable PDF using EasyOCR."""
from typing import Any, List, Tuple


def run_ocr(
    input_path: str,
    output_path: str,
    output_format: str,
    easyocr_langs: List[str],
    get_output_path: Any,
) -> Tuple[str, List[str]]:
    """
    Run OCR on PDF. Returns (output_path, temp_paths).
    output_format: 'text' or 'searchable_pdf'
    """
    import fitz
    import easyocr
    from reportlab.pdfgen import canvas
    from reportlab.lib.pagesizes import A4

    doc = fitz.open(input_path)
    temp_images: List[str] = []
    zoom = 2.0
    matrix = fitz.Matrix(zoom, zoom)
    reader = easyocr.Reader(easyocr_langs, gpu=False)
    all_text: List[str] = []
    for page_num, page in enumerate(doc):
        pixmap = page.get_pixmap(matrix=matrix)
        img_path = get_output_path("png")
        pixmap.save(img_path)
        temp_images.append(img_path)
        result = reader.readtext(img_path)
        page_text = "\n".join([text for (_, text, _) in result])
        all_text.append(f"--- Page {page_num + 1} ---\n{page_text}")
    doc.close()
    combined_text = "\n\n".join(all_text)
    if output_format == "text":
        with open(output_path, "w", encoding="utf-8") as f:
            f.write(combined_text)
        return output_path, temp_images
    # searchable_pdf
    c = canvas.Canvas(output_path, pagesize=A4)
    page_width, page_height = A4
    for page_text in all_text:
        y_position = page_height - 50
        for line in page_text.split("\n"):
            if y_position < 50:
                c.showPage()
                y_position = page_height - 50
            if line.strip():
                c.drawString(50, y_position, line[:100])
                y_position -= 15
        c.showPage()
    c.save()
    return output_path, temp_images
