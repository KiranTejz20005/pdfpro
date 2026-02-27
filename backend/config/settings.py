"""Centralized settings from environment with sensible defaults."""
import os
from pathlib import Path

# Base directory (backend folder)
BASE_DIR = Path(__file__).resolve().parent.parent


def _str_env(key: str, default: str) -> str:
    return os.environ.get(key, default).strip() or default


def _int_env(key: str, default: int) -> int:
    try:
        return int(os.environ.get(key, str(default)))
    except ValueError:
        return default


class Settings:
    """Application settings. Override via environment variables."""

    # Directories (relative to BASE_DIR or absolute)
    UPLOAD_DIR: str = _str_env("UPLOAD_DIR", str(BASE_DIR / "uploads"))
    OUTPUT_DIR: str = _str_env("OUTPUT_DIR", str(BASE_DIR / "outputs"))
    STATIC_DIR: str = _str_env("STATIC_DIR", str(BASE_DIR / "static"))

    # File limits
    MAX_FILE_MB: int = _int_env("MAX_FILE_MB", 50)
    MAX_PDF_PAGES_OCR: int = _int_env("MAX_PDF_PAGES_OCR", 20)
    MAX_FILES_MERGE: int = _int_env("MAX_FILES_MERGE", 20)
    MAX_FILES_SCAN: int = _int_env("MAX_FILES_SCAN", 20)

    # Ghostscript (optional). Empty = try system PATH and Windows defaults.
    GHOSTSCRIPT_PATH: str = _str_env("GHOSTSCRIPT_PATH", "")

    def get_ghostscript_path(self) -> str:
        """Return Ghostscript executable path (env, Windows defaults, or 'gs')."""
        if self.GHOSTSCRIPT_PATH:
            return self.GHOSTSCRIPT_PATH
        if os.name == "nt":
            import glob
            for pattern in [
                r"C:\Program Files\gs\gs*\bin\gswin64c.exe",
                r"C:\Program Files (x86)\gs\gs*\bin\gswin32c.exe",
            ]:
                matches = glob.glob(pattern)
                if matches:
                    return matches[0]
        return "gs"

    def ensure_dirs(self) -> None:
        """Create upload, output, and static directories if they do not exist."""
        for d in (self.UPLOAD_DIR, self.OUTPUT_DIR, self.STATIC_DIR):
            Path(d).mkdir(parents=True, exist_ok=True)


settings = Settings()
