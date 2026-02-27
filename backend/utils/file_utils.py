"""File upload, output path, cleanup and size checks."""
import os
import shutil
import uuid
from typing import Optional
import aiofiles
from fastapi import UploadFile, HTTPException

# Lazy import to avoid circular dependency when config is loaded at startup
def _settings():
    from config import settings
    return settings


async def save_upload(file: UploadFile) -> str:
    """Save uploaded file to upload dir with UUID name; return full path."""
    settings = _settings()
    file_ext = os.path.splitext(file.filename)[1]
    unique_filename = f"{uuid.uuid4()}{file_ext}"
    file_path = os.path.join(settings.UPLOAD_DIR, unique_filename)
    async with aiofiles.open(file_path, "wb") as f:
        content = await file.read()
        await f.write(content)
    return file_path


def get_output_path(extension: str) -> str:
    """Return a UUID-named path in output dir with the given extension."""
    settings = _settings()
    if not extension.startswith("."):
        extension = f".{extension}"
    unique_filename = f"{uuid.uuid4()}{extension}"
    return os.path.join(settings.OUTPUT_DIR, unique_filename)


def cleanup_files(*paths) -> None:
    """Delete all given file/directory paths if they exist."""
    for path in paths:
        if path and os.path.exists(path):
            try:
                if os.path.isfile(path):
                    os.remove(path)
                elif os.path.isdir(path):
                    shutil.rmtree(path)
            except Exception:
                pass


async def check_file_size(file: UploadFile, max_mb: Optional[int] = None) -> None:
    """Raise HTTPException 413 if file is too large."""
    settings = _settings()
    limit = max_mb if max_mb is not None else settings.MAX_FILE_MB
    file.file.seek(0, 2)
    file_size = file.file.tell()
    file.file.seek(0)
    if file_size > limit * 1024 * 1024:
        raise HTTPException(
            status_code=413,
            detail=f"File too large. Maximum size is {limit}MB",
        )
