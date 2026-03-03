import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from config import settings
from routers import pdf_convert, pdf_tools, card_tools, image_tools

app = FastAPI(title="Cyber Cafe PDF & Image SaaS")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers first so /api takes precedence
app.include_router(pdf_convert.router, prefix="/api/convert")
app.include_router(pdf_tools.router, prefix="/api/pdf", tags=["PDF Tools"])
app.include_router(card_tools.router, prefix="/api/cards", tags=["ID Card Tools"])
app.include_router(image_tools.router, prefix="/api/image", tags=["Image Tools"])

@app.on_event("startup")
async def startup_event():
    settings.ensure_dirs()

@app.get("/api/health")
async def health():
    return {"status": "ok", "service": "pdf-converter"}

# Serve React frontend from frontend/dist when built (SPA catch-all)
_frontend_dist = os.path.join(os.path.dirname(__file__), "..", "frontend", "dist")
if os.path.isdir(_frontend_dist):
    app.mount("/", StaticFiles(directory=_frontend_dist, html=True), name="frontend")
else:
    @app.get("/")
    async def root():
        return {"message": "API is running", "docs": "/docs", "frontend": "Build frontend with: cd frontend && npm run build"}
