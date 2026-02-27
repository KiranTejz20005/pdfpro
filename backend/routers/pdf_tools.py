import json
import os
import subprocess
from typing import List, Optional

from fastapi import APIRouter, File, UploadFile, HTTPException, BackgroundTasks, Query, Form
from fastapi.responses import FileResponse, JSONResponse

from config import settings
from services import pdf_ops, ocr
from utils.file_utils import save_upload, get_output_path, cleanup_files, check_file_size

router = APIRouter()

# Merge multiple PDF files into one
@router.post('/merge')
async def merge_pdf(
    background_tasks: BackgroundTasks,
    files: List[UploadFile] = File(...)
):
    if len(files) < 2:
        raise HTTPException(400, "Minimum 2 PDF files required for merging")
    if len(files) > settings.MAX_FILES_MERGE:
        raise HTTPException(400, f"Maximum {settings.MAX_FILES_MERGE} PDF files allowed")
    for f in files:
        if not (f.filename or "").lower().endswith('.pdf'):
            raise HTTPException(400, f"File {f.filename} is not a PDF")
    input_paths = []
    for f in files:
        await check_file_size(f)
        input_paths.append(await save_upload(f))
    import fitz
    for i, path in enumerate(input_paths):
        doc = fitz.open(path)
        if doc.is_encrypted:
            doc.close()
            cleanup_files(*input_paths)
            raise HTTPException(400, f"File {files[i].filename} is password protected")
        doc.close()
    output_path = get_output_path('pdf')
    try:
        page_count, _ = pdf_ops.merge_pdf(input_paths, output_path)
        background_tasks.add_task(cleanup_files, output_path, *input_paths)
        return FileResponse(
            path=output_path,
            media_type="application/pdf",
            filename="merged.pdf",
            headers={"X-Page-Count": str(page_count)}
        )
    except HTTPException:
        cleanup_files(output_path, *input_paths)
        raise
    except Exception as e:
        cleanup_files(output_path, *input_paths)
        raise HTTPException(500, f"Merge failed: {str(e)}")

# Split PDF into multiple files
@router.post('/split')
async def split_pdf(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    mode: str = Form(...),
    ranges: Optional[str] = Form(default=None),
    every_n: Optional[int] = Form(default=None)
):
    if mode not in ['ranges', 'every', 'all']:
        raise HTTPException(400, "mode must be 'ranges', 'every', or 'all'")
    if not (file.filename or "").lower().endswith('.pdf'):
        raise HTTPException(400, "Only PDF files are accepted")
    if mode == 'ranges' and not ranges:
        raise HTTPException(400, "ranges parameter required for 'ranges' mode")
    if mode == 'every' and (not every_n or every_n < 1):
        raise HTTPException(400, "every_n must be >= 1 for 'every' mode")
    await check_file_size(file)
    input_path = await save_upload(file)
    try:
        single_path, zip_path, temp_paths, num_parts = pdf_ops.split_pdf(
            input_path, mode, get_output_path, ranges=ranges, every_n=every_n
        )
        if single_path:
            background_tasks.add_task(cleanup_files, input_path, single_path, *temp_paths)
            return FileResponse(path=single_path, media_type="application/pdf", filename="split.pdf")
        if zip_path:
            background_tasks.add_task(cleanup_files, input_path, zip_path, *temp_paths)
            return FileResponse(
                path=zip_path,
                media_type="application/zip",
                filename="split_parts.zip",
                headers={"X-Parts-Count": str(num_parts)}
            )
        raise HTTPException(500, "Split produced no output")
    except ValueError as e:
        cleanup_files(input_path)
        raise HTTPException(400, str(e))
    except HTTPException:
        cleanup_files(input_path)
        raise
    except Exception as e:
        cleanup_files(input_path)
        raise HTTPException(500, f"Split failed: {str(e)}")

# Compress PDF file
@router.post('/compress')
async def compress_pdf(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    level: str = Query(default='medium')
):
    if level not in ['low', 'medium', 'high']:
        raise HTTPException(400, "level must be 'low', 'medium', or 'high'")
    if not (file.filename or "").lower().endswith('.pdf'):
        raise HTTPException(400, "Only PDF files are accepted")
    await check_file_size(file)
    input_path = await save_upload(file)
    output_path = get_output_path('pdf')
    try:
        fallback_used, _ = pdf_ops.compress_pdf(input_path, output_path, level, settings.get_ghostscript_path())
        original_size = os.path.getsize(input_path)
        compressed_size = os.path.getsize(output_path)
        savings_percent = round((1 - compressed_size / original_size) * 100, 1)
        headers = {
            "X-Original-Size-KB": str(original_size // 1024),
            "X-Compressed-Size-KB": str(compressed_size // 1024),
            "X-Savings-Percent": str(savings_percent)
        }
        if fallback_used:
            headers["X-Compression-Note"] = "Ghostscript unavailable, used medium compression"
        background_tasks.add_task(cleanup_files, input_path, output_path)
        fn = (file.filename or "").rsplit(".", 1)[0] + "_compressed.pdf" if "." in (file.filename or "") else "compressed.pdf"
        return FileResponse(path=output_path, media_type="application/pdf", filename=fn, headers=headers)
    except HTTPException:
        cleanup_files(input_path, output_path)
        raise
    except Exception as e:
        cleanup_files(input_path, output_path)
        raise HTTPException(500, f"Compression failed: {str(e)}")

# Add watermark to PDF
@router.post('/watermark')
async def watermark_pdf(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    text: str = Form(...),
    font_size: int = Form(default=48),
    color: str = Form(default='808080'),
    opacity: float = Form(default=0.3),
    rotation: int = Form(default=0),
    position: str = Form(default='center'),
    tile: bool = Form(default=False)
):
    if not (0.0 <= opacity <= 1.0):
        raise HTTPException(400, "opacity must be between 0.0 and 1.0")
    if rotation % 90 != 0:
        raise HTTPException(400, "rotation must be a multiple of 90 (0, 90, 180, 270)")
    if position not in ['center', 'top-left', 'top-right', 'bottom-left', 'bottom-right']:
        raise HTTPException(400, "position must be one of: center, top-left, top-right, bottom-left, bottom-right")
    if len(color) != 6 or not all(c in '0123456789ABCDEFabcdef' for c in color):
        raise HTTPException(400, "color must be a valid 6-character hex string")
    if not (file.filename or "").lower().endswith('.pdf'):
        raise HTTPException(400, "Only PDF files are accepted")
    await check_file_size(file)
    input_path = await save_upload(file)
    output_path = get_output_path('pdf')
    try:
        pdf_ops.watermark_pdf(input_path, output_path, text, font_size, color, opacity, rotation, position, tile)
        background_tasks.add_task(cleanup_files, input_path, output_path)
        fn = (file.filename or "").rsplit(".", 1)[0] + "_watermarked.pdf" if "." in (file.filename or "") else "watermarked.pdf"
        return FileResponse(path=output_path, media_type="application/pdf", filename=fn)
    except HTTPException:
        cleanup_files(input_path, output_path)
        raise
    except Exception as e:
        cleanup_files(input_path, output_path)
        raise HTTPException(500, f"Watermark failed: {str(e)}")

# Simple test endpoint - returns PDF info
@router.post('/test-upload')
async def test_upload(file: UploadFile = File(...)):
    """Test endpoint to verify file upload works"""
    import fitz
    try:
        if not (file.filename or "").lower().endswith('.pdf'):
            raise HTTPException(400, "Only PDF files accepted")
        input_path = await save_upload(file)
        doc = fitz.open(input_path)
        info = {
            "filename": file.filename,
            "pages": len(doc),
            "size_kb": round(os.path.getsize(input_path) / 1024, 2),
            "message": "PDF Tools are working correctly!"
        }
        doc.close()
        os.remove(input_path)
        
        return JSONResponse(content=info)
    except Exception as e:
        return JSONResponse(content={"error": str(e)}, status_code=500)

# Rotate PDF pages
@router.post('/rotate')
async def rotate_pdf(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    angle: int = Form(...),
    pages: Optional[str] = Form(default=None)
):
    if angle not in [90, 180, 270]:
        raise HTTPException(400, "angle must be exactly 90, 180, or 270")
    if not (file.filename or "").lower().endswith('.pdf'):
        raise HTTPException(400, "Only PDF files are accepted")
    await check_file_size(file)
    input_path = await save_upload(file)
    output_path = get_output_path('pdf')
    try:
        count, _ = pdf_ops.rotate_pdf(input_path, output_path, angle, pages)
        background_tasks.add_task(cleanup_files, input_path, output_path)
        fn = (file.filename or "").rsplit(".", 1)[0] + "_rotated.pdf" if "." in (file.filename or "") else "rotated.pdf"
        return FileResponse(path=output_path, media_type="application/pdf", filename=fn, headers={"X-Pages-Rotated": str(count)})
    except HTTPException:
        cleanup_files(input_path, output_path)
        raise
    except Exception as e:
        cleanup_files(input_path, output_path)
        raise HTTPException(500, f"Rotation failed: {str(e)}")

# Add page numbers to PDF
@router.post('/add-page-numbers')
async def add_page_numbers(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    position: str = Form(default='bottom-center'),
    start_number: int = Form(default=1),
    fmt: str = Form(default='number'),
    font_size: int = Form(default=12),
    color: str = Form(default='000000'),
    skip_first: bool = Form(default=False)
):
    valid_positions = ['top-left', 'top-center', 'top-right', 'middle-left', 'middle-center', 'middle-right', 'bottom-left', 'bottom-center', 'bottom-right']
    if position not in valid_positions:
        raise HTTPException(400, f"position must be one of: {', '.join(valid_positions)}")
    if fmt not in ['number', 'page-n', 'n-of-t', 'roman']:
        raise HTTPException(400, "fmt must be: number, page-n, n-of-t, or roman")
    if len(color) != 6 or not all(c in '0123456789ABCDEFabcdef' for c in color):
        raise HTTPException(400, "color must be a valid 6-character hex string")
    if not (file.filename or "").lower().endswith('.pdf'):
        raise HTTPException(400, "Only PDF files are accepted")
    await check_file_size(file)
    input_path = await save_upload(file)
    output_path = get_output_path('pdf')
    try:
        pdf_ops.add_page_numbers(input_path, output_path, position, start_number, fmt, font_size, color, skip_first)
        background_tasks.add_task(cleanup_files, input_path, output_path)
        fn = (file.filename or "").rsplit(".", 1)[0] + "_numbered.pdf" if "." in (file.filename or "") else "numbered.pdf"
        return FileResponse(path=output_path, media_type="application/pdf", filename=fn)
    except HTTPException:
        cleanup_files(input_path, output_path)
        raise
    except Exception as e:
        cleanup_files(input_path, output_path)
        raise HTTPException(500, f"Add page numbers failed: {str(e)}")

# Protect PDF with password and permissions
@router.post('/protect')
async def protect_pdf(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    user_password: str = Form(...),
    owner_password: Optional[str] = Form(default=None),
    allow_print: bool = Form(default=True),
    allow_copy: bool = Form(default=False),
    allow_edit: bool = Form(default=False)
):
    if not (4 <= len(user_password) <= 128):
        raise HTTPException(400, "user_password must be 4-128 characters")
    if not (file.filename or "").lower().endswith('.pdf'):
        raise HTTPException(400, "Only PDF files are accepted")
    await check_file_size(file)
    input_path = await save_upload(file)
    output_path = get_output_path('pdf')
    try:
        pdf_ops.protect_pdf(input_path, output_path, user_password, owner_password, allow_print, allow_copy, allow_edit)
        background_tasks.add_task(cleanup_files, input_path, output_path)
        fn = (file.filename or "").rsplit(".", 1)[0] + "_protected.pdf" if "." in (file.filename or "") else "protected.pdf"
        return FileResponse(path=output_path, media_type="application/pdf", filename=fn)
    except HTTPException:
        cleanup_files(input_path, output_path)
        raise
    except Exception as e:
        cleanup_files(input_path, output_path)
        raise HTTPException(500, f"Protection failed: {str(e)}")

# Unlock password-protected PDF
@router.post('/unlock')
async def unlock_pdf(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    password: Optional[str] = Form(default=None)
):
    if not (file.filename or "").lower().endswith('.pdf'):
        raise HTTPException(400, "Only PDF files are accepted")
    await check_file_size(file)
    input_path = await save_upload(file)
    output_path = get_output_path('pdf')
    try:
        pdf_ops.unlock_pdf(input_path, output_path, password)
        background_tasks.add_task(cleanup_files, input_path, output_path)
        fn = (file.filename or "").rsplit(".", 1)[0] + "_unlocked.pdf" if "." in (file.filename or "") else "unlocked.pdf"
        return FileResponse(path=output_path, media_type="application/pdf", filename=fn)
    except ValueError as e:
        cleanup_files(input_path, output_path)
        if "password" in str(e).lower() and "incorrect" in str(e).lower():
            raise HTTPException(401, str(e))
        raise HTTPException(400, str(e))
    except HTTPException:
        cleanup_files(input_path, output_path)
        raise
    except Exception as e:
        cleanup_files(input_path, output_path)
        raise HTTPException(500, f"Unlock failed: {str(e)}")

# Crop PDF pages
@router.post('/crop')
async def crop_pdf(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    x1: float = Form(...),
    y1: float = Form(...),
    x2: float = Form(...),
    y2: float = Form(...),
    apply_to: str = Form(default='all'),
    unit: str = Form(default='percent')
):
    if x1 >= x2:
        raise HTTPException(400, "x1 must be less than x2")
    if y1 >= y2:
        raise HTTPException(400, "y1 must be less than y2")
    if unit not in ['percent', 'points']:
        raise HTTPException(400, "unit must be 'percent' or 'points'")
    if unit == 'percent' and not (0.0 <= x1 <= 1.0 and 0.0 <= y1 <= 1.0 and 0.0 <= x2 <= 1.0 and 0.0 <= y2 <= 1.0):
        raise HTTPException(400, "For percent mode, all values must be between 0.0 and 1.0")
    if not (file.filename or "").lower().endswith('.pdf'):
        raise HTTPException(400, "Only PDF files are accepted")
    await check_file_size(file)
    input_path = await save_upload(file)
    output_path = get_output_path('pdf')
    try:
        count, _ = pdf_ops.crop_pdf(input_path, output_path, x1, y1, x2, y2, apply_to, unit)
        background_tasks.add_task(cleanup_files, input_path, output_path)
        fn = (file.filename or "").rsplit(".", 1)[0] + "_cropped.pdf" if "." in (file.filename or "") else "cropped.pdf"
        return FileResponse(path=output_path, media_type="application/pdf", filename=fn, headers={"X-Pages-Cropped": str(count)})
    except HTTPException:
        cleanup_files(input_path, output_path)
        raise
    except Exception as e:
        cleanup_files(input_path, output_path)
        raise HTTPException(500, f"Crop failed: {str(e)}")

# Organize PDF - reorder pages
@router.post('/organize')
async def organize_pdf(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    new_order: str = Form(...)
):
    if not (file.filename or "").lower().endswith('.pdf'):
        raise HTTPException(400, "Only PDF files are accepted")
    try:
        order = [int(x.strip()) - 1 for x in new_order.split(',')]
    except ValueError:
        raise HTTPException(400, "new_order must be comma-separated page numbers")
    await check_file_size(file)
    input_path = await save_upload(file)
    output_path = get_output_path('pdf')
    try:
        pdf_ops.organize_pdf(input_path, output_path, order)
        background_tasks.add_task(cleanup_files, input_path, output_path)
        fn = (file.filename or "").rsplit(".", 1)[0] + "_organized.pdf" if "." in (file.filename or "") else "organized.pdf"
        return FileResponse(path=output_path, media_type="application/pdf", filename=fn)
    except ValueError as e:
        cleanup_files(input_path, output_path)
        raise HTTPException(400, str(e))
    except HTTPException:
        cleanup_files(input_path, output_path)
        raise
    except Exception as e:
        cleanup_files(input_path, output_path)
        raise HTTPException(500, f"Organize failed: {str(e)}")

# Remove pages from PDF
@router.post('/remove-pages')
async def remove_pages(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    pages: str = Form(...)
):
    if not (file.filename or "").lower().endswith('.pdf'):
        raise HTTPException(400, "Only PDF files are accepted")
    await check_file_size(file)
    input_path = await save_upload(file)
    output_path = get_output_path('pdf')
    try:
        removed_count, _ = pdf_ops.remove_pages(input_path, output_path, pages)
        background_tasks.add_task(cleanup_files, input_path, output_path)
        fn = (file.filename or "").rsplit(".", 1)[0] + "_pages_removed.pdf" if "." in (file.filename or "") else "pages_removed.pdf"
        return FileResponse(path=output_path, media_type="application/pdf", filename=fn, headers={"X-Pages-Removed": str(removed_count)})
    except ValueError as e:
        cleanup_files(input_path, output_path)
        raise HTTPException(400, str(e))
    except HTTPException:
        cleanup_files(input_path, output_path)
        raise
    except Exception as e:
        cleanup_files(input_path, output_path)
        raise HTTPException(500, f"Remove pages failed: {str(e)}")

# Sign PDF with signature image
@router.post('/sign')
async def sign_pdf(
    background_tasks: BackgroundTasks,
    pdf_file: UploadFile = File(...),
    signature_file: UploadFile = File(...),
    page_number: int = Form(default=1),
    x: float = Form(...),
    y: float = Form(...),
    width: float = Form(default=0.25),
    height: float = Form(default=0.1),
    unit: str = Form(default='percent')
):
    if not (pdf_file.filename or "").lower().endswith('.pdf'):
        raise HTTPException(400, "pdf_file must be a PDF")
    sig_ext = (signature_file.filename or "").lower().split('.')[-1]
    if sig_ext not in ['png', 'jpg', 'jpeg']:
        raise HTTPException(400, "signature_file must be PNG, JPG, or JPEG")
    if unit not in ['percent', 'points']:
        raise HTTPException(400, "unit must be 'percent' or 'points'")
    if x < 0 or y < 0 or width <= 0 or height <= 0:
        raise HTTPException(400, "x, y, width, height must be positive numbers")
    await check_file_size(pdf_file)
    await check_file_size(signature_file)
    pdf_path = await save_upload(pdf_file)
    sig_path = await save_upload(signature_file)
    output_path = get_output_path('pdf')
    try:
        pdf_ops.sign_pdf(pdf_path, sig_path, output_path, page_number, x, y, width, height, unit)
        background_tasks.add_task(cleanup_files, pdf_path, sig_path, output_path)
        fn = (pdf_file.filename or "").rsplit(".", 1)[0] + "_signed.pdf" if "." in (pdf_file.filename or "") else "signed.pdf"
        return FileResponse(path=output_path, media_type="application/pdf", filename=fn)
    except ValueError as e:
        cleanup_files(pdf_path, sig_path, output_path)
        raise HTTPException(400, str(e))
    except HTTPException:
        cleanup_files(pdf_path, sig_path, output_path)
        raise
    except Exception as e:
        cleanup_files(pdf_path, sig_path, output_path)
        raise HTTPException(500, f"Sign failed: {str(e)}")

# OCR PDF - extract text from scanned documents
@router.post('/ocr')
async def ocr_pdf(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    languages: str = Form(default='en'),
    output_format: str = Form(default='text')
):
    lang_map = {'en': 'en', 'eng': 'en', 'hi': 'hi', 'hin': 'hi', 'te': 'te', 'tel': 'te', 'ta': 'ta', 'tam': 'ta', 'kn': 'kn', 'kan': 'kn', 'ml': 'ml', 'mal': 'ml', 'bn': 'bn', 'ben': 'bn'}
    lang_list = [l.strip() for l in languages.split(',')]
    easyocr_langs = []
    for lang in lang_list:
        if lang in lang_map:
            easyocr_langs.append(lang_map[lang])
        else:
            raise HTTPException(400, f"Invalid language: {lang}. Valid: en, hi, te, ta, kn, ml, bn")
    if output_format not in ['text', 'searchable_pdf']:
        raise HTTPException(400, "output_format must be 'text' or 'searchable_pdf'")
    if not (file.filename or "").lower().endswith('.pdf'):
        raise HTTPException(400, "Only PDF files are accepted")
    await check_file_size(file)
    input_path = await save_upload(file)
    import fitz
    doc = fitz.open(input_path)
    if len(doc) > settings.MAX_PDF_PAGES_OCR:
        doc.close()
        cleanup_files(input_path)
        raise HTTPException(400, f"OCR limited to {settings.MAX_PDF_PAGES_OCR} pages. Please split your PDF first using /split endpoint.")
    doc.close()
    output_path = get_output_path('txt') if output_format == 'text' else get_output_path('pdf')
    try:
        _, temp_images = ocr.run_ocr(input_path, output_path, output_format, easyocr_langs, get_output_path)
        background_tasks.add_task(cleanup_files, input_path, output_path, *temp_images)
        fn = ((file.filename or "output").rsplit(".", 1)[0] if "." in (file.filename or "") else (file.filename or "output")) + ('_ocr.txt' if output_format == 'text' else '_searchable.pdf')
        media_type = 'text/plain' if output_format == 'text' else 'application/pdf'
        return FileResponse(path=output_path, media_type=media_type, filename=fn)
    except HTTPException:
        cleanup_files(input_path, output_path)
        raise
    except Exception as e:
        cleanup_files(input_path, output_path)
        raise HTTPException(503 if "initialization" in str(e).lower() else 500, f"OCR failed: {str(e)}")

# Edit PDF - add text, shapes, highlights, redactions
@router.post('/edit')
async def edit_pdf(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    operations: str = Form(...)
):
    if not (file.filename or "").lower().endswith('.pdf'):
        raise HTTPException(400, "Only PDF files are accepted")
    try:
        ops = json.loads(operations)
    except json.JSONDecodeError:
        raise HTTPException(400, "operations must be valid JSON")
    if not isinstance(ops, list):
        raise HTTPException(400, "operations must be a JSON array")
    await check_file_size(file)
    input_path = await save_upload(file)
    output_path = get_output_path('pdf')
    try:
        pdf_ops.edit_pdf(input_path, output_path, ops)
        background_tasks.add_task(cleanup_files, input_path, output_path)
        fn = (file.filename or "").rsplit(".", 1)[0] + "_edited.pdf" if "." in (file.filename or "") else "edited.pdf"
        return FileResponse(path=output_path, media_type="application/pdf", filename=fn, headers={"X-Operations-Applied": str(len(ops))})
    except HTTPException:
        cleanup_files(input_path, output_path)
        raise
    except Exception as e:
        cleanup_files(input_path, output_path)
        raise HTTPException(500, f"Edit failed: {str(e)}")

# Compare two PDFs and highlight differences
@router.post('/compare')
async def compare_pdf(
    background_tasks: BackgroundTasks,
    file1: UploadFile = File(...),
    file2: UploadFile = File(...)
):
    if not (file1.filename or "").lower().endswith('.pdf'):
        raise HTTPException(400, "file1 must be a PDF")
    if not (file2.filename or "").lower().endswith('.pdf'):
        raise HTTPException(400, "file2 must be a PDF")
    await check_file_size(file1)
    await check_file_size(file2)
    path1 = await save_upload(file1)
    path2 = await save_upload(file2)
    output_path = get_output_path('pdf')
    try:
        pages_count, comparison_images = pdf_ops.compare_pdf(path1, path2, output_path, get_output_path)
        background_tasks.add_task(cleanup_files, path1, path2, output_path, *comparison_images)
        return FileResponse(path=output_path, media_type="application/pdf", filename="comparison_result.pdf", headers={"X-Pages-Compared": str(pages_count)})
    except HTTPException:
        cleanup_files(path1, path2, output_path)
        raise
    except Exception as e:
        cleanup_files(path1, path2, output_path)
        raise HTTPException(500, f"Compare failed: {str(e)}")

# Repair corrupted PDF
@router.post('/repair')
async def repair_pdf(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...)
):
    if not (file.filename or "").lower().endswith('.pdf'):
        raise HTTPException(400, "Only PDF files are accepted")
    await check_file_size(file)
    input_path = await save_upload(file)
    output_path = get_output_path('pdf')
    try:
        repaired_by, _ = pdf_ops.repair_pdf(input_path, output_path, settings.get_ghostscript_path())
        original_size = os.path.getsize(input_path)
        repaired_size = os.path.getsize(output_path)
        background_tasks.add_task(cleanup_files, input_path, output_path)
        fn = (file.filename or "").rsplit(".", 1)[0] + "_repaired.pdf" if "." in (file.filename or "") else "repaired.pdf"
        return FileResponse(
            path=output_path,
            media_type="application/pdf",
            filename=fn,
            headers={
                "X-Repaired-By": repaired_by or "unknown",
                "X-Original-Size-KB": str(original_size // 1024),
                "X-Repaired-Size-KB": str(repaired_size // 1024)
            }
        )
    except RuntimeError as e:
        cleanup_files(input_path, output_path)
        if "unavailable" in str(e).lower() or "not found" in str(e).lower():
            raise HTTPException(503, str(e))
        raise HTTPException(500, str(e))
    except HTTPException:
        cleanup_files(input_path, output_path)
        raise
    except Exception as e:
        cleanup_files(input_path, output_path)
        raise HTTPException(500, f"Repair failed: {str(e)}")

# Scan to PDF - convert phone photos to clean PDF
@router.post('/scan-to-pdf')
async def scan_to_pdf(
    background_tasks: BackgroundTasks,
    files: List[UploadFile] = File(...),
    enhance: bool = Form(default=True),
    page_size: str = Form(default='a4'),
    auto_rotate: bool = Form(default=True)
):
    if len(files) == 0:
        raise HTTPException(400, "No files uploaded")
    if len(files) > settings.MAX_FILES_SCAN:
        raise HTTPException(400, f"Maximum {settings.MAX_FILES_SCAN} images allowed")
    if page_size not in ['a4', 'letter']:
        raise HTTPException(400, "page_size must be 'a4' or 'letter'")
    allowed_exts = ['.jpg', '.jpeg', '.png', '.webp', '.bmp']
    input_paths = []
    for f in files:
        ext = '.' + (f.filename or "").lower().split('.')[-1]
        if ext not in allowed_exts:
            raise HTTPException(400, f"File {f.filename} must be JPG, PNG, WebP, or BMP")
        await check_file_size(f)
        input_paths.append(await save_upload(f))
    output_path = get_output_path('pdf')
    try:
        num_pages, temp_paths = pdf_ops.scan_to_pdf(input_paths, output_path, get_output_path, enhance=enhance)
        background_tasks.add_task(cleanup_files, output_path, *temp_paths)
        return FileResponse(path=output_path, media_type="application/pdf", filename="scanned_document.pdf", headers={"X-Pages": str(num_pages)})
    except HTTPException:
        cleanup_files(output_path, *input_paths)
        raise
    except Exception as e:
        cleanup_files(output_path, *input_paths)
        raise HTTPException(500, f"Scan to PDF failed: {str(e)}")

# PDF Reader - get metadata and thumbnails
@router.post('/read')
async def read_pdf(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    thumbnail_pages: int = Query(default=5)
):
    if not (file.filename or "").lower().endswith('.pdf'):
        raise HTTPException(400, "Only PDF files are accepted")
    await check_file_size(file)
    input_path = await save_upload(file)
    try:
        info = pdf_ops.read_pdf_meta(input_path, thumbnail_pages)
        info['filename'] = file.filename
        background_tasks.add_task(cleanup_files, input_path)
        return JSONResponse(content=info)
    except HTTPException:
        cleanup_files(input_path)
        raise
    except Exception as e:
        cleanup_files(input_path)
        raise HTTPException(500, f"Read PDF failed: {str(e)}")

# Status endpoint
@router.get('/status')
async def pdf_tools_status():
    """Get PDF Tools module status"""
    return JSONResponse(content={
        'status': 'ok',
        'module': 'pdf-tools',
        'endpoints': 19
    })
