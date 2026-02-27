"""PDF operations: merge, split, compress, watermark, rotate, protect, etc."""
import json
import os
import subprocess
import zipfile
from typing import Any, Callable, Dict, List, Optional, Tuple

import fitz
import img2pdf
import numpy as np
from PIL import Image as PILImage, ImageChops
from reportlab.lib.pagesizes import A4
from reportlab.lib.utils import ImageReader
from reportlab.pdfgen import canvas

from utils.pdf_utils import parse_pages, hex_to_rgb, to_roman


def merge_pdf(input_paths: List[str], output_path: str) -> Tuple[int, List[str]]:
    """Merge PDFs. Returns (page_count, temp_paths)."""
    merged_doc = fitz.open()
    for path in input_paths:
        doc = fitz.open(path)
        merged_doc.insert_pdf(doc)
        doc.close()
    merged_doc.save(output_path)
    page_count = len(merged_doc)
    merged_doc.close()
    return page_count, []


def split_pdf(
    input_path: str,
    mode: str,
    get_output_path: Callable[[str], str],
    ranges: Optional[str] = None,
    every_n: Optional[int] = None,
) -> Tuple[Optional[str], Optional[str], List[str], int]:
    """
    Split PDF. Returns (single_pdf_path_or_none, zip_path_or_none, temp_paths, num_parts).
    mode: 'ranges' | 'every' | 'all'
    """
    doc = fitz.open(input_path)
    total_pages = len(doc)
    chunks: List[Tuple[int, int]] = []
    if mode == "ranges" and ranges:
        parts = ranges.split(",")
        for part in parts:
            part = part.strip()
            if "-" in part:
                start, end = part.split("-")
                start = int(start.strip()) - 1
                end = int(end.strip()) - 1
                if start < 0 or end >= total_pages or start > end:
                    raise ValueError(f"Invalid range: {part}")
                chunks.append((start, end))
            else:
                page_num = int(part.strip()) - 1
                if page_num < 0 or page_num >= total_pages:
                    raise ValueError(f"Invalid page number: {part}")
                chunks.append((page_num, page_num))
    elif mode == "every" and every_n and every_n >= 1:
        for i in range(0, total_pages, every_n):
            end = min(i + every_n - 1, total_pages - 1)
            chunks.append((i, end))
    elif mode == "all":
        chunks = [(i, i) for i in range(total_pages)]
    else:
        doc.close()
        raise ValueError("Invalid split mode or parameters")
    output_paths: List[str] = []
    for start, end in chunks:
        sub_doc = fitz.open()
        sub_doc.insert_pdf(doc, from_page=start, to_page=end)
        chunk_path = get_output_path("pdf")
        sub_doc.save(chunk_path)
        sub_doc.close()
        output_paths.append(chunk_path)
    doc.close()
    num_parts = len(output_paths)
    if num_parts == 1:
        return output_paths[0], None, [], 1
    zip_path = get_output_path("zip")
    with zipfile.ZipFile(zip_path, "w") as zf:
        for i, p in enumerate(output_paths):
            zf.write(p, f"part_{str(i+1).zfill(2)}.pdf")
    for p in output_paths:
        if os.path.exists(p):
            os.remove(p)
    return None, zip_path, [], num_parts


def compress_pdf(
    input_path: str, output_path: str, level: str, gs_path: str
) -> Tuple[bool, List[str]]:
    """Compress PDF. Returns (fallback_used, temp_paths)."""
    fallback_used = False
    if level == "low":
        doc = fitz.open(input_path)
        doc.save(output_path, garbage=1, deflate=True)
        doc.close()
    elif level == "medium":
        doc = fitz.open(input_path)
        doc.save(output_path, garbage=3, deflate=True, clean=True)
        doc.close()
    elif level == "high":
        gs_cmd = [
            gs_path, "-dBATCH", "-dNOPAUSE", "-dQUIET",
            "-sDEVICE=pdfwrite", "-dPDFSETTINGS=/screen",
            "-dCompatibilityLevel=1.4", f"-sOutputFile={output_path}", input_path,
        ]
        try:
            subprocess.run(gs_cmd, timeout=120, check=True, capture_output=True)
        except (FileNotFoundError, subprocess.CalledProcessError):
            doc = fitz.open(input_path)
            doc.save(output_path, garbage=3, deflate=True, clean=True)
            doc.close()
            fallback_used = True
    return fallback_used, []


def watermark_pdf(
    input_path: str,
    output_path: str,
    text: str,
    font_size: int = 48,
    color_hex: str = "808080",
    opacity: float = 0.3,
    rotation: int = 0,
    position: str = "center",
    tile: bool = False,
) -> List[str]:
    r, g, b = hex_to_rgb(color_hex)
    doc = fitz.open(input_path)
    for page in doc:
        pw, ph = page.rect.width, page.rect.height
        if tile:
            step_x, step_y = pw / 3, ph / 3
            for xi in range(3):
                for yi in range(3):
                    x = step_x * xi + step_x / 2
                    y = step_y * yi + step_y / 2
                    rect = fitz.Rect(x - 100, y - 25, x + 100, y + 25)
                    page.insert_textbox(
                        rect, text, fontsize=font_size // 2,
                        color=(r, g, b), rotate=rotation, align=1,
                    )
        else:
            pos_map = {
                "center": (pw / 2, ph / 2),
                "top-left": (100, 100),
                "top-right": (pw - 100, 100),
                "bottom-left": (100, ph - 100),
                "bottom-right": (pw - 100, ph - 100),
            }
            x, y = pos_map.get(position, (pw / 2, ph / 2))
            rect = fitz.Rect(x - 150, y - 50, x + 150, y + 50)
            page.insert_textbox(
                rect, text, fontsize=font_size,
                color=(r, g, b), rotate=rotation, align=1,
            )
    doc.save(output_path)
    doc.close()
    return []


def rotate_pdf(
    input_path: str, output_path: str, angle: int, pages_str: Optional[str] = None
) -> Tuple[int, List[str]]:
    """Rotate pages. Returns (pages_rotated_count, temp_paths)."""
    doc = fitz.open(input_path)
    total = len(doc)
    pages_to_rotate = parse_pages(pages_str or "all", total)
    for page_num in pages_to_rotate:
        page = doc[page_num]
        current = page.rotation
        page.set_rotation((current + angle) % 360)
    doc.save(output_path)
    doc.close()
    return len(pages_to_rotate), []


def add_page_numbers(
    input_path: str,
    output_path: str,
    position: str = "bottom-center",
    start_number: int = 1,
    fmt: str = "number",
    font_size: int = 12,
    color_hex: str = "000000",
    skip_first: bool = False,
) -> List[str]:
    r, g, b = hex_to_rgb(color_hex)
    doc = fitz.open(input_path)
    total = len(doc)
    for i, page in enumerate(doc):
        if skip_first and i == 0:
            continue
        page_num = i + start_number
        if fmt == "number":
            label = str(page_num)
        elif fmt == "page-n":
            label = f"Page {page_num}"
        elif fmt == "n-of-t":
            label = f"{page_num} of {total}"
        elif fmt == "roman":
            label = to_roman(page_num)
        else:
            label = str(page_num)
        pw, ph = page.rect.width, page.rect.height
        margin = 30
        x = margin if "left" in position else (pw / 2 if "center" in position else pw - margin)
        y = margin + font_size if "top" in position else (ph / 2 if "middle" in position else ph - margin)
        page.insert_text((x, y), label, fontsize=font_size, color=(r, g, b), overlay=True)
    doc.save(output_path)
    doc.close()
    return []


def protect_pdf(
    input_path: str,
    output_path: str,
    user_password: str,
    owner_password: Optional[str] = None,
    allow_print: bool = True,
    allow_copy: bool = False,
    allow_edit: bool = False,
) -> List[str]:
    perms = 0
    if allow_print:
        perms |= fitz.PDF_PERM_PRINT
    if allow_copy:
        perms |= fitz.PDF_PERM_COPY
    if allow_edit:
        perms |= fitz.PDF_PERM_MODIFY
    doc = fitz.open(input_path)
    doc.save(
        output_path,
        encryption=fitz.PDF_ENCRYPT_AES_256,
        user_pw=user_password,
        owner_pw=owner_password or user_password + "_owner",
        permissions=perms,
    )
    doc.close()
    return []


def unlock_pdf(input_path: str, output_path: str, password: Optional[str] = None) -> List[str]:
    doc = fitz.open(input_path)
    if doc.is_encrypted:
        if not password:
            raise ValueError("PDF is password protected. Please provide the password.")
        if not doc.authenticate(password):
            raise ValueError("Incorrect password. Please try again.")
    doc.save(output_path, encryption=fitz.PDF_ENCRYPT_NONE)
    doc.close()
    return []


def crop_pdf(
    input_path: str,
    output_path: str,
    x1: float, y1: float, x2: float, y2: float,
    apply_to: str = "all",
    unit: str = "percent",
) -> Tuple[int, List[str]]:
    doc = fitz.open(input_path)
    pages_to_crop = parse_pages(apply_to, len(doc))
    for page_num in pages_to_crop:
        page = doc[page_num]
        pw, ph = page.rect.width, page.rect.height
        if unit == "percent":
            crop_rect = fitz.Rect(x1 * pw, y1 * ph, x2 * pw, y2 * ph)
        else:
            crop_rect = fitz.Rect(x1, y1, x2, y2)
        page.set_cropbox(crop_rect)
    doc.save(output_path)
    doc.close()
    return len(pages_to_crop), []


def organize_pdf(input_path: str, output_path: str, new_order: List[int]) -> List[str]:
    doc = fitz.open(input_path)
    total = len(doc)
    for page_num in new_order:
        if page_num < 0 or page_num >= total:
            raise ValueError(f"Page number {page_num + 1} is out of range (1-{total})")
    new_doc = fitz.open()
    for page_num in new_order:
        new_doc.insert_pdf(doc, from_page=page_num, to_page=page_num)
    new_doc.save(output_path)
    new_doc.close()
    doc.close()
    return []


def remove_pages(
    input_path: str, output_path: str, pages_str: str
) -> Tuple[int, List[str]]:
    doc = fitz.open(input_path)
    pages_to_remove = parse_pages(pages_str, len(doc))
    if len(pages_to_remove) >= len(doc):
        doc.close()
        raise ValueError("Cannot remove all pages from PDF")
    doc.delete_pages(sorted(pages_to_remove, reverse=True))
    doc.save(output_path)
    doc.close()
    return len(pages_to_remove), []


def sign_pdf(
    pdf_path: str,
    signature_path: str,
    output_path: str,
    page_number: int,
    x: float, y: float, width: float, height: float,
    unit: str = "percent",
) -> List[str]:
    doc = fitz.open(pdf_path)
    page_idx = page_number - 1
    if page_idx < 0 or page_idx >= len(doc):
        doc.close()
        raise ValueError(f"PDF only has {len(doc)} pages")
    page = doc[page_idx]
    pw, ph = page.rect.width, page.rect.height
    if unit == "percent":
        rect = fitz.Rect(x * pw, y * ph, (x + width) * pw, (y + height) * ph)
    else:
        rect = fitz.Rect(x, y, x + width, y + height)
    page.insert_image(rect, filename=signature_path)
    doc.save(output_path)
    doc.close()
    return []


def edit_pdf(input_path: str, output_path: str, operations: List[Dict[str, Any]]) -> List[str]:
    doc = fitz.open(input_path)
    for op in operations:
        if not isinstance(op, dict) or "type" not in op:
            continue
        page_idx = op.get("page", 1) - 1
        if page_idx < 0 or page_idx >= len(doc):
            continue
        page = doc[page_idx]
        op_type = op["type"]
        if op_type == "text":
            x, y = op.get("x", 100), op.get("y", 100)
            text = op.get("text", "")
            size = op.get("size", 14)
            r, g, b = hex_to_rgb(op.get("color", "000000"))
            page.insert_text((x, y), text, fontsize=size, color=(r, g, b), overlay=True)
        elif op_type == "rect":
            x1, y1 = op.get("x1", 50), op.get("y1", 50)
            x2, y2 = op.get("x2", 200), op.get("y2", 150)
            r, g, b = hex_to_rgb(op.get("color", "FF0000"))
            rect = fitz.Rect(x1, y1, x2, y2)
            page.draw_rect(rect, color=(r, g, b), width=op.get("width", 1.5))
        elif op_type == "highlight":
            page.add_highlight_annot(
                fitz.Rect(
                    op.get("x1", 50), op.get("y1", 100),
                    op.get("x2", 300), op.get("y2", 120),
                )
            )
        elif op_type == "redact":
            page.add_redact_annot(
                fitz.Rect(
                    op.get("x1", 50), op.get("y1", 100),
                    op.get("x2", 200), op.get("y2", 120),
                )
            )
    try:
        doc.apply_redactions()
    except AttributeError:
        pass
    doc.save(output_path)
    doc.close()
    return []


def compare_pdf(
    path1: str, path2: str, output_path: str, get_output_path: Callable[[str], str]
) -> Tuple[int, List[str]]:
    doc1 = fitz.open(path1)
    doc2 = fitz.open(path2)
    pages_count = min(len(doc1), len(doc2))
    zoom = 1.5
    matrix = fitz.Matrix(zoom, zoom)
    comparison_images: List[str] = []
    for i in range(pages_count):
        pix1 = doc1[i].get_pixmap(matrix=matrix)
        pix2 = doc2[i].get_pixmap(matrix=matrix)
        img1 = PILImage.frombytes("RGB", [pix1.width, pix1.height], pix1.samples)
        img2 = PILImage.frombytes("RGB", [pix2.width, pix2.height], pix2.samples)
        if img1.size != img2.size:
            img2 = img2.resize(img1.size, PILImage.LANCZOS)
        diff = ImageChops.difference(img1, img2)
        diff_arr = np.array(diff.convert("L"))
        mask = diff_arr > 10
        result_arr = np.array(img1.copy())
        result_arr[mask] = [255, 0, 0]
        result_img = PILImage.fromarray(result_arr)
        img_path = get_output_path("png")
        result_img.save(img_path)
        comparison_images.append(img_path)
    doc1.close()
    doc2.close()
    c = canvas.Canvas(output_path, pagesize=A4)
    aw, ah = A4
    for img_path in comparison_images:
        c.drawImage(ImageReader(img_path), 0, 0, width=aw, height=ah, preserveAspectRatio=True)
        c.showPage()
    c.save()
    return pages_count, comparison_images


def repair_pdf(
    input_path: str, output_path: str, gs_path: str
) -> Tuple[Optional[str], List[str]]:
    repaired_by = None
    try:
        doc = fitz.open(input_path)
        doc.save(output_path, garbage=4, clean=True, deflate=True)
        doc.close()
        repaired_by = "PyMuPDF"
    except Exception:
        pass
    if not repaired_by or not os.path.exists(output_path) or os.path.getsize(output_path) < 100:
        gs_cmd = [gs_path, "-dBATCH", "-dNOPAUSE", "-dQUIET", "-sDEVICE=pdfwrite", f"-sOutputFile={output_path}", input_path]
        try:
            subprocess.run(gs_cmd, capture_output=True, timeout=60, check=True)
            repaired_by = "Ghostscript"
        except FileNotFoundError:
            raise RuntimeError("Service unavailable: Ghostscript not found")
        except subprocess.CalledProcessError:
            raise RuntimeError("Repair failed. PDF may be too corrupted.")
    return repaired_by, []


def scan_to_pdf(
    image_paths: List[str],
    output_path: str,
    get_output_path: Callable[[str], str],
    enhance: bool = True,
) -> Tuple[int, List[str]]:
    from PIL import ImageEnhance
    enhanced_paths: List[str] = []
    for img_path in image_paths:
        img = PILImage.open(img_path)
        if enhance:
            img = ImageEnhance.Contrast(img).enhance(1.5)
            img = ImageEnhance.Sharpness(img).enhance(2.0)
        out_path = get_output_path("png")
        img.save(out_path)
        enhanced_paths.append(out_path)
    with open(output_path, "wb") as f:
        f.write(img2pdf.convert(enhanced_paths))
    return len(image_paths), image_paths + enhanced_paths


def read_pdf_meta(input_path: str, thumbnail_pages: int = 5) -> Dict[str, Any]:
    """Return metadata and thumbnails (base64) for PDF."""
    import base64
    doc = fitz.open(input_path)
    meta = doc.metadata
    info = {
        "page_count": len(doc),
        "file_size_kb": round(os.path.getsize(input_path) / 1024, 1),
        "is_encrypted": doc.is_encrypted,
        "title": meta.get("title", ""),
        "author": meta.get("author", ""),
        "subject": meta.get("subject", ""),
        "creator": meta.get("creator", ""),
        "creation_date": meta.get("creationDate", ""),
        "pages": [],
    }
    zoom = 0.5
    matrix = fitz.Matrix(zoom, zoom)
    pages_to_preview = min(thumbnail_pages, len(doc))
    for i in range(pages_to_preview):
        page = doc[i]
        pixmap = page.get_pixmap(matrix=matrix)
        img_bytes = pixmap.tobytes("jpeg")
        b64 = base64.b64encode(img_bytes).decode("utf-8")
        info["pages"].append({
            "page_number": i + 1,
            "width_pts": page.rect.width,
            "height_pts": page.rect.height,
            "thumbnail_base64": "data:image/jpeg;base64," + b64,
        })
    doc.close()
    return info
