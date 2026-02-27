"""PDF and document conversion API (thin layer over services.conversion)."""
import os
from typing import List, Optional

from fastapi import APIRouter, File, UploadFile, HTTPException, BackgroundTasks, Query, Form
from fastapi.responses import FileResponse

from config import settings
from services import conversion
from utils.file_utils import save_upload, get_output_path, cleanup_files, check_file_size

router = APIRouter(tags=["Conversion"])


def _base_filename(file: UploadFile, new_ext: str) -> str:
    if "." in file.filename:
        return file.filename.rsplit(".", 1)[0] + new_ext
    return file.filename + new_ext


def _is_pdf(file: UploadFile) -> bool:
    return file.content_type == "application/pdf" or (file.filename or "").lower().endswith(".pdf")


@router.post("/pdf-to-word")
async def pdf_to_word(background_tasks: BackgroundTasks, file: UploadFile = File(...)):
    if not _is_pdf(file):
        raise HTTPException(400, "Only PDF files are accepted")
    await check_file_size(file)
    input_path = await save_upload(file)
    output_path = get_output_path("docx")
    try:
        conversion.pdf_to_word(input_path, output_path)
        background_tasks.add_task(cleanup_files, input_path, output_path)
        return FileResponse(
            path=output_path,
            media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            filename=_base_filename(file, ".docx"),
        )
    except HTTPException:
        cleanup_files(input_path, output_path)
        raise
    except Exception as e:
        cleanup_files(input_path, output_path)
        raise HTTPException(500, f"Conversion error: {str(e)}")


@router.post("/pdf-to-ppt")
async def pdf_to_ppt(background_tasks: BackgroundTasks, file: UploadFile = File(...)):
    if not _is_pdf(file):
        raise HTTPException(400, "Only PDF files are accepted")
    await check_file_size(file)
    input_path = await save_upload(file)
    output_path = get_output_path("pptx")
    try:
        _, temp_images = conversion.pdf_to_ppt(input_path, output_path, get_output_path)
        background_tasks.add_task(cleanup_files, input_path, output_path, *temp_images)
        return FileResponse(
            path=output_path,
            media_type="application/vnd.openxmlformats-officedocument.presentationml.presentation",
            filename=_base_filename(file, ".pptx"),
        )
    except HTTPException:
        cleanup_files(input_path, output_path)
        raise
    except Exception as e:
        cleanup_files(input_path, output_path)
        raise HTTPException(500, f"Conversion error: {str(e)}")


@router.post("/pdf-to-excel")
async def pdf_to_excel(background_tasks: BackgroundTasks, file: UploadFile = File(...)):
    if not _is_pdf(file):
        raise HTTPException(400, "Only PDF files are accepted")
    await check_file_size(file)
    input_path = await save_upload(file)
    output_path = get_output_path("xlsx")
    try:
        conversion.pdf_to_excel(input_path, output_path)
        background_tasks.add_task(cleanup_files, input_path, output_path)
        return FileResponse(
            path=output_path,
            media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            filename=_base_filename(file, ".xlsx"),
        )
    except ValueError as e:
        cleanup_files(input_path, output_path)
        raise HTTPException(400, str(e))
    except HTTPException:
        cleanup_files(input_path, output_path)
        raise
    except Exception as e:
        cleanup_files(input_path, output_path)
        raise HTTPException(500, f"Conversion error: {str(e)}")


@router.post("/pdf-to-jpg")
async def pdf_to_jpg(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    dpi: int = Query(default=150, description="Output DPI: 72, 150, or 300"),
):
    if dpi not in [72, 150, 300]:
        raise HTTPException(400, "DPI must be 72, 150, or 300")
    if not _is_pdf(file):
        raise HTTPException(400, "Only PDF files are accepted")
    await check_file_size(file)
    input_path = await save_upload(file)
    try:
        single_path, zip_path, temp_paths = conversion.pdf_to_jpg(input_path, dpi, get_output_path)
        if single_path:
            background_tasks.add_task(cleanup_files, input_path, single_path, *temp_paths)
            return FileResponse(
                path=single_path,
                media_type="image/jpeg",
                filename=_base_filename(file, ".jpg"),
            )
        if zip_path:
            background_tasks.add_task(cleanup_files, input_path, zip_path, *temp_paths)
            return FileResponse(
                path=zip_path,
                media_type="application/zip",
                filename=_base_filename(file, "_pages.zip"),
            )
        raise HTTPException(500, "Conversion produced no output")
    except HTTPException:
        cleanup_files(input_path)
        raise
    except Exception as e:
        cleanup_files(input_path)
        raise HTTPException(500, f"Conversion error: {str(e)}")


@router.post("/pdf-to-pdfa")
async def pdf_to_pdfa(background_tasks: BackgroundTasks, file: UploadFile = File(...)):
    if not _is_pdf(file):
        raise HTTPException(400, "Only PDF files are accepted")
    await check_file_size(file)
    input_path = await save_upload(file)
    output_path = get_output_path("pdf")
    gs_exe = settings.get_ghostscript_path()
    try:
        conversion.pdf_to_pdfa(input_path, output_path, gs_exe)
        background_tasks.add_task(cleanup_files, input_path, output_path)
        return FileResponse(
            path=output_path,
            media_type="application/pdf",
            filename=_base_filename(file, "_pdfa.pdf"),
        )
    except FileNotFoundError:
        cleanup_files(input_path, output_path)
        raise HTTPException(503, "Ghostscript not installed")
    except Exception as e:
        cleanup_files(input_path, output_path)
        if "timed out" in str(e).lower():
            raise HTTPException(504, "Conversion timed out")
        raise HTTPException(500, f"Conversion error: {str(e)}")


@router.post("/word-to-pdf")
async def word_to_pdf(background_tasks: BackgroundTasks, file: UploadFile = File(...)):
    ext = (file.filename or "").lower().split(".")[-1]
    if ext not in ["docx", "doc"]:
        raise HTTPException(400, "Accepted formats: docx, doc")
    await check_file_size(file)
    input_path = await save_upload(file)
    output_path = get_output_path("pdf")
    try:
        conversion.office_docx_to_pdf(input_path, output_path)
        background_tasks.add_task(cleanup_files, input_path, output_path)
        return FileResponse(path=output_path, media_type="application/pdf", filename=_base_filename(file, ".pdf"))
    except HTTPException:
        cleanup_files(input_path, output_path)
        raise
    except Exception as e:
        cleanup_files(input_path, output_path)
        raise HTTPException(500, f"Conversion error: {str(e)}")


@router.post("/excel-to-pdf")
async def excel_to_pdf(background_tasks: BackgroundTasks, file: UploadFile = File(...)):
    ext = (file.filename or "").lower().split(".")[-1]
    if ext not in ["xlsx", "xls"]:
        raise HTTPException(400, "Accepted formats: xlsx, xls")
    await check_file_size(file)
    input_path = await save_upload(file)
    output_path = get_output_path("pdf")
    try:
        conversion.office_xlsx_to_pdf(input_path, output_path)
        background_tasks.add_task(cleanup_files, input_path, output_path)
        return FileResponse(path=output_path, media_type="application/pdf", filename=_base_filename(file, ".pdf"))
    except HTTPException:
        cleanup_files(input_path, output_path)
        raise
    except Exception as e:
        cleanup_files(input_path, output_path)
        raise HTTPException(500, f"Conversion error: {str(e)}")


@router.post("/ppt-to-pdf")
async def ppt_to_pdf(background_tasks: BackgroundTasks, file: UploadFile = File(...)):
    ext = (file.filename or "").lower().split(".")[-1]
    if ext not in ["pptx", "ppt"]:
        raise HTTPException(400, "Accepted formats: pptx, ppt")
    await check_file_size(file)
    input_path = await save_upload(file)
    output_path = get_output_path("pdf")
    try:
        conversion.office_pptx_to_pdf(input_path, output_path)
        background_tasks.add_task(cleanup_files, input_path, output_path)
        return FileResponse(path=output_path, media_type="application/pdf", filename=_base_filename(file, ".pdf"))
    except HTTPException:
        cleanup_files(input_path, output_path)
        raise
    except Exception as e:
        cleanup_files(input_path, output_path)
        raise HTTPException(500, f"Conversion error: {str(e)}")


@router.post("/image-to-pdf")
async def image_to_pdf(background_tasks: BackgroundTasks, file: UploadFile = File(...)):
    allowed = ["image/jpeg", "image/png", "image/webp", "image/bmp", "image/tiff"]
    exts = [".jpg", ".jpeg", ".png", ".webp", ".bmp", ".tiff", ".tif"]
    fn = (file.filename or "").lower()
    if file.content_type not in allowed and not any(fn.endswith(e) for e in exts):
        raise HTTPException(400, "File must be a valid image format (JPG, PNG, WebP, BMP, TIFF)")
    await check_file_size(file)
    input_path = await save_upload(file)
    output_path = get_output_path("pdf")
    try:
        conversion.image_to_pdf(input_path, output_path)
        background_tasks.add_task(cleanup_files, input_path, output_path)
        return FileResponse(
            path=output_path,
            media_type="application/pdf",
            filename=_base_filename(file, ".pdf") if "." in fn else "converted.pdf",
        )
    except HTTPException:
        cleanup_files(input_path, output_path)
        raise
    except Exception as e:
        cleanup_files(input_path, output_path)
        raise HTTPException(500, f"Conversion error: {str(e)}")


@router.post("/html-to-pdf")
async def html_to_pdf(
    background_tasks: BackgroundTasks,
    file: Optional[UploadFile] = File(default=None),
    url: Optional[str] = Form(default=None),
):
    if file is None and url is None:
        raise HTTPException(400, "Provide either an HTML file or a URL")
    if file is not None and url is not None:
        raise HTTPException(400, "Provide either a file or a URL — not both")
    output_path = get_output_path("pdf")
    input_path = None
    try:
        if file is not None:
            if not (
                file.content_type == "text/html"
                or (file.filename or "").lower().endswith(".html")
                or (file.filename or "").lower().endswith(".htm")
            ):
                raise HTTPException(400, "File must be an HTML file (.html or .htm)")
            await check_file_size(file)
            input_path = await save_upload(file)
            conversion.html_to_pdf_file(input_path, output_path)
            output_filename = _base_filename(file, ".pdf") if "." in (file.filename or "") else "converted.pdf"
        else:
            if not (url.startswith("http://") or url.startswith("https://")):
                raise HTTPException(400, "URL must start with http:// or https://")
            if "localhost" in url.lower() or "127.0.0.1" in url or "192.168." in url:
                raise HTTPException(400, "Local URLs are not allowed")
            conversion.html_to_pdf_url(url, output_path)
            try:
                from urllib.parse import urlparse
                domain = urlparse(url).netloc.replace("www.", "")
                output_filename = f"{domain}.pdf" if domain else "webpage.pdf"
            except Exception:
                output_filename = "webpage.pdf"
        if not os.path.exists(output_path) or os.path.getsize(output_path) == 0:
            raise HTTPException(500, "Conversion produced empty file")
        background_tasks.add_task(cleanup_files, input_path, output_path)
        return FileResponse(path=output_path, media_type="application/pdf", filename=output_filename)
    except HTTPException:
        cleanup_files(input_path, output_path)
        raise
    except Exception as e:
        cleanup_files(input_path, output_path)
        raise HTTPException(500, f"Conversion error: {str(e)}")
