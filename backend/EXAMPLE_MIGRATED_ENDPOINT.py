# Example: Migrated Merge PDF Endpoint
# This shows the complete pattern for converting synchronous endpoints to job-based

from typing import List
from fastapi import APIRouter, File, UploadFile, HTTPException
from fastapi.responses import JSONResponse

from config import settings
from utils.file_utils import save_upload, get_output_path, check_file_size
from job_manager import generate_job_id, create_job
from tasks.pdf_tasks import merge_pdf_task
from tasks.cleanup_tasks import schedule_cleanup

router = APIRouter()

@router.post('/merge')
async def merge_pdf(files: List[UploadFile] = File(...)):
    """
    Merge multiple PDF files into one (Job-based version)
    
    Returns:
        {"job_id": "uuid-string"}
    
    Frontend should then poll: GET /api/jobs/status/{job_id}
    """
    # Validation (same as before)
    if len(files) < 2:
        raise HTTPException(400, "Minimum 2 PDF files required for merging")
    if len(files) > settings.MAX_FILES_MERGE:
        raise HTTPException(400, f"Maximum {settings.MAX_FILES_MERGE} PDF files allowed")
    
    for f in files:
        if not (f.filename or "").lower().endswith('.pdf'):
            raise HTTPException(400, f"File {f.filename} is not a PDF")
        await check_file_size(f)
    
    # Save uploaded files
    input_paths = []
    for f in files:
        input_paths.append(await save_upload(f))
    
    # Check for encrypted PDFs (same validation as before)
    import fitz
    for i, path in enumerate(input_paths):
        doc = fitz.open(path)
        if doc.is_encrypted:
            doc.close()
            # Cleanup uploaded files
            from utils.file_utils import cleanup_files
            cleanup_files(*input_paths)
            raise HTTPException(400, f"File {files[i].filename} is password protected")
        doc.close()
    
    # Prepare output path
    output_path = get_output_path('pdf')
    
    # Create job in Redis
    job_id = generate_job_id()
    create_job(job_id, 'merge_pdf')
    
    # Queue Celery task (NON-BLOCKING - returns immediately)
    merge_pdf_task.delay(job_id, input_paths, output_path)
    
    # Schedule cleanup for 10 minutes after completion
    schedule_cleanup(job_id, output_path, *input_paths)
    
    # Return job_id immediately
    return JSONResponse(content={"job_id": job_id}, status_code=202)


# OLD SYNCHRONOUS VERSION (for reference - DO NOT USE):
"""
@router.post('/merge')
async def merge_pdf_old(
    background_tasks: BackgroundTasks,
    files: List[UploadFile] = File(...)
):
    # ... validation ...
    input_paths = [await save_upload(f) for f in files]
    output_path = get_output_path('pdf')
    
    # BLOCKING CALL - freezes server during processing
    page_count, _ = pdf_ops.merge_pdf(input_paths, output_path)
    
    background_tasks.add_task(cleanup_files, output_path, *input_paths)
    return FileResponse(
        path=output_path,
        media_type="application/pdf",
        filename="merged.pdf",
        headers={"X-Page-Count": str(page_count)}
    )
"""
