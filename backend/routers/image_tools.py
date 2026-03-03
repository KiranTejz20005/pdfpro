import os
import uuid
import shutil
import zipfile
import json
import re
import base64
import io
import math
from pathlib import Path
from typing import List, Optional
import numpy as np
import cv2
from PIL import Image, ImageDraw, ImageFont, ImageFilter, ImageEnhance, ImageOps, ImageChops
from PIL.ExifTags import TAGS
import piexif
import pytesseract
import img2pdf

try:
    from pillow_heif import register_heif_opener
    register_heif_opener()
except ImportError:
    pass

from fastapi import APIRouter, File, UploadFile, HTTPException, BackgroundTasks, Query, Form
from fastapi.responses import FileResponse, JSONResponse
from utils.file_utils import save_upload, get_output_path, cleanup_files, check_file_size

router = APIRouter()

# Shared helper functions

def open_image(path: str) -> Image.Image:
    img = Image.open(path)
    if img.mode not in ('RGB', 'RGBA'):
        img = img.convert('RGB')
    return img

def save_image(img: Image.Image, fmt: str = 'JPEG', quality: int = 90) -> str:
    ext = 'jpg' if fmt.upper() in ('JPEG','JPG') else fmt.lower()
    out_path = get_output_path(ext)
    if fmt.upper() in ('JPEG','JPG') and img.mode == 'RGBA':
        img = img.convert('RGB')
    img.save(out_path, format=fmt.upper(), quality=quality)
    return out_path

def get_image_format(filename: str) -> str:
    ext = filename.lower().split('.')[-1]
    mapping = {'jpg':'JPEG','jpeg':'JPEG','png':'PNG','webp':'WEBP','bmp':'BMP','tiff':'TIFF','heic':'JPEG','heif':'JPEG'}
    return mapping.get(ext, 'JPEG')

# 1. Resize Image
@router.post("/resize")
async def resize_image(file: UploadFile = File(...), width: int = Form(...), height: int = Form(...), maintain_aspect: bool = Form(False), bg: BackgroundTasks = BackgroundTasks()):
    check_file_size(file)
    path = await save_upload(file)
    img = open_image(path)
    
    if maintain_aspect:
        img.thumbnail((width, height), Image.Resampling.LANCZOS)
    else:
        img = img.resize((width, height), Image.Resampling.LANCZOS)
    
    fmt = get_image_format(file.filename)
    out = save_image(img, fmt)
    bg.add_task(cleanup_files, [path, out])
    return FileResponse(out, media_type=f"image/{fmt.lower()}", filename=f"resized_{file.filename}")

# 2. Compress Image
@router.post("/compress")
async def compress_image(file: UploadFile = File(...), quality: int = Form(75), bg: BackgroundTasks = BackgroundTasks()):
    check_file_size(file)
    path = await save_upload(file)
    img = open_image(path)
    fmt = get_image_format(file.filename)
    out = save_image(img, fmt, quality)
    bg.add_task(cleanup_files, [path, out])
    return FileResponse(out, media_type=f"image/{fmt.lower()}", filename=f"compressed_{file.filename}")

# 3. Crop Image
@router.post("/crop")
async def crop_image(file: UploadFile = File(...), x: int = Form(...), y: int = Form(...), width: int = Form(...), height: int = Form(...), bg: BackgroundTasks = BackgroundTasks()):
    check_file_size(file)
    path = await save_upload(file)
    img = open_image(path)
    cropped = img.crop((x, y, x + width, y + height))
    fmt = get_image_format(file.filename)
    out = save_image(cropped, fmt)
    bg.add_task(cleanup_files, [path, out])
    return FileResponse(out, media_type=f"image/{fmt.lower()}", filename=f"cropped_{file.filename}")

# 4. Rotate Image
@router.post("/rotate")
async def rotate_image(file: UploadFile = File(...), angle: int = Form(...), bg: BackgroundTasks = BackgroundTasks()):
    check_file_size(file)
    path = await save_upload(file)
    img = open_image(path)
    rotated = img.rotate(angle, expand=True, fillcolor='white' if img.mode == 'RGB' else (255,255,255,0))
    fmt = get_image_format(file.filename)
    out = save_image(rotated, fmt)
    bg.add_task(cleanup_files, [path, out])
    return FileResponse(out, media_type=f"image/{fmt.lower()}", filename=f"rotated_{file.filename}")

# 5. Flip Image
@router.post("/flip")
async def flip_image(file: UploadFile = File(...), direction: str = Form(...), bg: BackgroundTasks = BackgroundTasks()):
    check_file_size(file)
    path = await save_upload(file)
    img = open_image(path)
    flipped = img.transpose(Image.FLIP_LEFT_RIGHT) if direction == 'horizontal' else img.transpose(Image.FLIP_TOP_BOTTOM)
    fmt = get_image_format(file.filename)
    out = save_image(flipped, fmt)
    bg.add_task(cleanup_files, [path, out])
    return FileResponse(out, media_type=f"image/{fmt.lower()}", filename=f"flipped_{file.filename}")

# 6. Convert Format
@router.post("/convert")
async def convert_format(file: UploadFile = File(...), format: str = Form(...), bg: BackgroundTasks = BackgroundTasks()):
    check_file_size(file)
    path = await save_upload(file)
    img = open_image(path)
    out = save_image(img, format.upper())
    bg.add_task(cleanup_files, [path, out])
    ext = format.lower() if format.lower() != 'jpeg' else 'jpg'
    return FileResponse(out, media_type=f"image/{ext}", filename=f"converted.{ext}")

# 7. Passport Photo (Standard sizes)
@router.post("/passport-photo")
async def passport_photo(file: UploadFile = File(...), size: str = Form('2x2'), dpi: int = Form(300), bg: BackgroundTasks = BackgroundTasks()):
    check_file_size(file)
    path = await save_upload(file)
    img = open_image(path)
    
    sizes = {'2x2':(600,600),'35x45':(413,531),'passport':(413,531),'visa':(600,600),'aadhaar':(600,600)}
    w, h = sizes.get(size, (600,600))
    img = img.resize((w, h), Image.Resampling.LANCZOS)
    
    out = save_image(img, 'JPEG', 95)
    bg.add_task(cleanup_files, [path, out])
    return FileResponse(out, media_type="image/jpeg", filename=f"passport_{size}.jpg")

# 8. Signature Resize
@router.post("/signature-resize")
async def signature_resize(file: UploadFile = File(...), width: int = Form(300), height: int = Form(100), bg: BackgroundTasks = BackgroundTasks()):
    check_file_size(file)
    path = await save_upload(file)
    img = open_image(path)
    img = img.resize((width, height), Image.Resampling.LANCZOS)
    out = save_image(img, 'PNG')
    bg.add_task(cleanup_files, [path, out])
    return FileResponse(out, media_type="image/png", filename="signature.png")

# 9. Remove Background
@router.post("/remove-background")
async def remove_background(file: UploadFile = File(...), bg: BackgroundTasks = BackgroundTasks()):
    check_file_size(file)
    try:
        from rembg import remove
    except ImportError:
        raise HTTPException(500, "rembg not installed")
    
    path = await save_upload(file)
    img = open_image(path)
    output = remove(img)
    out = save_image(output, 'PNG')
    bg.add_task(cleanup_files, [path, out])
    return FileResponse(out, media_type="image/png", filename="no_bg.png")

# 10. Add Watermark
@router.post("/watermark")
async def add_watermark(file: UploadFile = File(...), text: str = Form(...), position: str = Form('bottom-right'), opacity: int = Form(128), bg: BackgroundTasks = BackgroundTasks()):
    check_file_size(file)
    path = await save_upload(file)
    img = open_image(path).convert('RGBA')
    
    txt_layer = Image.new('RGBA', img.size, (255,255,255,0))
    draw = ImageDraw.Draw(txt_layer)
    font_size = int(img.width * 0.05)
    try:
        font = ImageFont.truetype("arial.ttf", font_size)
    except:
        font = ImageFont.load_default()
    
    bbox = draw.textbbox((0,0), text, font=font)
    tw, th = bbox[2]-bbox[0], bbox[3]-bbox[1]
    
    positions = {
        'top-left':(10,10),'top-right':(img.width-tw-10,10),
        'bottom-left':(10,img.height-th-10),'bottom-right':(img.width-tw-10,img.height-th-10),
        'center':((img.width-tw)//2,(img.height-th)//2)
    }
    xy = positions.get(position, positions['bottom-right'])
    draw.text(xy, text, fill=(255,255,255,opacity), font=font)
    
    watermarked = Image.alpha_composite(img, txt_layer)
    fmt = get_image_format(file.filename)
    out = save_image(watermarked, fmt)
    bg.add_task(cleanup_files, [path, out])
    return FileResponse(out, media_type=f"image/{fmt.lower()}", filename=f"watermarked_{file.filename}")

# 11. Blur Image
@router.post("/blur")
async def blur_image(file: UploadFile = File(...), radius: int = Form(5), bg: BackgroundTasks = BackgroundTasks()):
    check_file_size(file)
    path = await save_upload(file)
    img = open_image(path)
    blurred = img.filter(ImageFilter.GaussianBlur(radius))
    fmt = get_image_format(file.filename)
    out = save_image(blurred, fmt)
    bg.add_task(cleanup_files, [path, out])
    return FileResponse(out, media_type=f"image/{fmt.lower()}", filename=f"blurred_{file.filename}")

# 12. Grayscale
@router.post("/grayscale")
async def grayscale_image(file: UploadFile = File(...), bg: BackgroundTasks = BackgroundTasks()):
    check_file_size(file)
    path = await save_upload(file)
    img = open_image(path)
    gray = ImageOps.grayscale(img)
    fmt = get_image_format(file.filename)
    out = save_image(gray.convert('RGB'), fmt)
    bg.add_task(cleanup_files, [path, out])
    return FileResponse(out, media_type=f"image/{fmt.lower()}", filename=f"grayscale_{file.filename}")

# 13. Adjust Brightness
@router.post("/brightness")
async def adjust_brightness(file: UploadFile = File(...), factor: float = Form(1.5), bg: BackgroundTasks = BackgroundTasks()):
    check_file_size(file)
    path = await save_upload(file)
    img = open_image(path)
    enhancer = ImageEnhance.Brightness(img)
    enhanced = enhancer.enhance(factor)
    fmt = get_image_format(file.filename)
    out = save_image(enhanced, fmt)
    bg.add_task(cleanup_files, [path, out])
    return FileResponse(out, media_type=f"image/{fmt.lower()}", filename=f"brightness_{file.filename}")

# 14. Adjust Contrast
@router.post("/contrast")
async def adjust_contrast(file: UploadFile = File(...), factor: float = Form(1.5), bg: BackgroundTasks = BackgroundTasks()):
    check_file_size(file)
    path = await save_upload(file)
    img = open_image(path)
    enhancer = ImageEnhance.Contrast(img)
    enhanced = enhancer.enhance(factor)
    fmt = get_image_format(file.filename)
    out = save_image(enhanced, fmt)
    bg.add_task(cleanup_files, [path, out])
    return FileResponse(out, media_type=f"image/{fmt.lower()}", filename=f"contrast_{file.filename}")

# 15. Sharpen
@router.post("/sharpen")
async def sharpen_image(file: UploadFile = File(...), bg: BackgroundTasks = BackgroundTasks()):
    check_file_size(file)
    path = await save_upload(file)
    img = open_image(path)
    sharpened = img.filter(ImageFilter.SHARPEN)
    fmt = get_image_format(file.filename)
    out = save_image(sharpened, fmt)
    bg.add_task(cleanup_files, [path, out])
    return FileResponse(out, media_type=f"image/{fmt.lower()}", filename=f"sharpened_{file.filename}")

# 16. Sepia Effect
@router.post("/sepia")
async def sepia_effect(file: UploadFile = File(...), bg: BackgroundTasks = BackgroundTasks()):
    check_file_size(file)
    path = await save_upload(file)
    img = open_image(path).convert('RGB')
    pixels = np.array(img, dtype=np.float32)
    
    sepia_filter = np.array([[0.393, 0.769, 0.189],
                             [0.349, 0.686, 0.168],
                             [0.272, 0.534, 0.131]])
    sepia_img = pixels @ sepia_filter.T
    sepia_img = np.clip(sepia_img, 0, 255).astype(np.uint8)
    result = Image.fromarray(sepia_img)
    
    fmt = get_image_format(file.filename)
    out = save_image(result, fmt)
    bg.add_task(cleanup_files, [path, out])
    return FileResponse(out, media_type=f"image/{fmt.lower()}", filename=f"sepia_{file.filename}")

# 17. Edge Detection
@router.post("/edge-detect")
async def edge_detect(file: UploadFile = File(...), bg: BackgroundTasks = BackgroundTasks()):
    check_file_size(file)
    path = await save_upload(file)
    img = open_image(path)
    edges = img.filter(ImageFilter.FIND_EDGES)
    fmt = get_image_format(file.filename)
    out = save_image(edges, fmt)
    bg.add_task(cleanup_files, [path, out])
    return FileResponse(out, media_type=f"image/{fmt.lower()}", filename=f"edges_{file.filename}")

# 18. Get Metadata
@router.post("/metadata")
async def get_metadata(file: UploadFile = File(...), bg: BackgroundTasks = BackgroundTasks()):
    check_file_size(file)
    path = await save_upload(file)
    img = open_image(path)
    
    metadata = {
        'filename': file.filename,
        'format': img.format,
        'mode': img.mode,
        'size': img.size,
        'width': img.width,
        'height': img.height
    }
    
    if hasattr(img, '_getexif') and img._getexif():
        exif = {TAGS.get(k, k): v for k, v in img._getexif().items()}
        metadata['exif'] = exif
    
    bg.add_task(cleanup_files, [path])
    return JSONResponse(metadata)

# 19. Remove Metadata
@router.post("/remove-metadata")
async def remove_metadata(file: UploadFile = File(...), bg: BackgroundTasks = BackgroundTasks()):
    check_file_size(file)
    path = await save_upload(file)
    img = open_image(path)
    
    data = list(img.getdata())
    clean_img = Image.new(img.mode, img.size)
    clean_img.putdata(data)
    
    fmt = get_image_format(file.filename)
    out = save_image(clean_img, fmt)
    bg.add_task(cleanup_files, [path, out])
    return FileResponse(out, media_type=f"image/{fmt.lower()}", filename=f"clean_{file.filename}")

# 20. OCR Extract Text
@router.post("/ocr")
async def ocr_extract(file: UploadFile = File(...), lang: str = Form('eng'), bg: BackgroundTasks = BackgroundTasks()):
    check_file_size(file)
    path = await save_upload(file)
    img = open_image(path)
    text = pytesseract.image_to_string(img, lang=lang)
    bg.add_task(cleanup_files, [path])
    return JSONResponse({'text': text})

# 21. Merge Images (Vertical/Horizontal)
@router.post("/merge")
async def merge_images(files: List[UploadFile] = File(...), direction: str = Form('vertical'), bg: BackgroundTasks = BackgroundTasks()):
    if len(files) < 2:
        raise HTTPException(400, "Need at least 2 images")
    
    paths = []
    images = []
    for f in files:
        check_file_size(f)
        p = await save_upload(f)
        paths.append(p)
        images.append(open_image(p))
    
    if direction == 'vertical':
        total_width = max(img.width for img in images)
        total_height = sum(img.height for img in images)
        merged = Image.new('RGB', (total_width, total_height))
        y_offset = 0
        for img in images:
            merged.paste(img, (0, y_offset))
            y_offset += img.height
    else:
        total_width = sum(img.width for img in images)
        total_height = max(img.height for img in images)
        merged = Image.new('RGB', (total_width, total_height))
        x_offset = 0
        for img in images:
            merged.paste(img, (x_offset, 0))
            x_offset += img.width
    
    out = save_image(merged, 'JPEG')
    bg.add_task(cleanup_files, paths + [out])
    return FileResponse(out, media_type="image/jpeg", filename="merged.jpg")

# 22. Split Image (Grid)
@router.post("/split")
async def split_image(file: UploadFile = File(...), rows: int = Form(2), cols: int = Form(2), bg: BackgroundTasks = BackgroundTasks()):
    check_file_size(file)
    path = await save_upload(file)
    img = open_image(path)
    
    w, h = img.size
    tile_w, tile_h = w // cols, h // rows
    
    zip_path = get_output_path('zip')
    with zipfile.ZipFile(zip_path, 'w') as zf:
        for row in range(rows):
            for col in range(cols):
                x1, y1 = col * tile_w, row * tile_h
                x2, y2 = x1 + tile_w, y1 + tile_h
                tile = img.crop((x1, y1, x2, y2))
                tile_path = get_output_path('jpg')
                tile.save(tile_path, 'JPEG')
                zf.write(tile_path, f"tile_{row}_{col}.jpg")
                os.remove(tile_path)
    
    bg.add_task(cleanup_files, [path, zip_path])
    return FileResponse(zip_path, media_type="application/zip", filename="split_images.zip")

# 23. Adjust DPI
@router.post("/adjust-dpi")
async def adjust_dpi(file: UploadFile = File(...), dpi: int = Form(300), bg: BackgroundTasks = BackgroundTasks()):
    check_file_size(file)
    path = await save_upload(file)
    img = open_image(path)
    out = get_output_path('jpg')
    img.save(out, 'JPEG', dpi=(dpi, dpi))
    bg.add_task(cleanup_files, [path, out])
    return FileResponse(out, media_type="image/jpeg", filename=f"dpi_{dpi}.jpg")

# 24. Create GIF from Images
@router.post("/create-gif")
async def create_gif(files: List[UploadFile] = File(...), duration: int = Form(500), bg: BackgroundTasks = BackgroundTasks()):
    if len(files) < 2:
        raise HTTPException(400, "Need at least 2 images")
    
    paths = []
    images = []
    for f in files:
        check_file_size(f)
        p = await save_upload(f)
        paths.append(p)
        images.append(open_image(p).convert('RGB'))
    
    out = get_output_path('gif')
    images[0].save(out, save_all=True, append_images=images[1:], duration=duration, loop=0)
    bg.add_task(cleanup_files, paths + [out])
    return FileResponse(out, media_type="image/gif", filename="animation.gif")

# 25. Social Media Preset (Instagram, Facebook, Twitter)
@router.post("/social-preset")
async def social_preset(file: UploadFile = File(...), platform: str = Form(...), bg: BackgroundTasks = BackgroundTasks()):
    check_file_size(file)
    path = await save_upload(file)
    img = open_image(path)
    
    presets = {
        'instagram-post': (1080, 1080),
        'instagram-story': (1080, 1920),
        'facebook-post': (1200, 630),
        'twitter-post': (1200, 675),
        'linkedin-post': (1200, 627),
        'youtube-thumbnail': (1280, 720)
    }
    
    size = presets.get(platform, (1080, 1080))
    img.thumbnail(size, Image.Resampling.LANCZOS)
    
    canvas = Image.new('RGB', size, (255, 255, 255))
    x = (size[0] - img.width) // 2
    y = (size[1] - img.height) // 2
    canvas.paste(img, (x, y))
    
    out = save_image(canvas, 'JPEG', 95)
    bg.add_task(cleanup_files, [path, out])
    return FileResponse(out, media_type="image/jpeg", filename=f"{platform}.jpg")

# 26. Exam Photo Preset (JEE, NEET, UPSC)
@router.post("/exam-preset")
async def exam_preset(file: UploadFile = File(...), exam: str = Form('jee'), bg: BackgroundTasks = BackgroundTasks()):
    check_file_size(file)
    path = await save_upload(file)
    img = open_image(path)
    
    presets = {
        'jee': (354, 472),
        'neet': (354, 472),
        'upsc': (413, 531),
        'ssc': (354, 472),
        'gate': (354, 472)
    }
    
    size = presets.get(exam, (354, 472))
    img = img.resize(size, Image.Resampling.LANCZOS)
    out = save_image(img, 'JPEG', 95)
    bg.add_task(cleanup_files, [path, out])
    return FileResponse(out, media_type="image/jpeg", filename=f"{exam}_photo.jpg")

# 27. Color Picker (Get dominant colors)
@router.post("/color-picker")
async def color_picker(file: UploadFile = File(...), num_colors: int = Form(5), bg: BackgroundTasks = BackgroundTasks()):
    check_file_size(file)
    path = await save_upload(file)
    img = open_image(path).convert('RGB')
    img = img.resize((150, 150))
    
    pixels = np.array(img).reshape(-1, 3)
    from sklearn.cluster import KMeans
    kmeans = KMeans(n_clusters=num_colors, random_state=42, n_init=10)
    kmeans.fit(pixels)
    colors = kmeans.cluster_centers_.astype(int).tolist()
    hex_colors = ['#%02x%02x%02x' % tuple(c) for c in colors]
    
    bg.add_task(cleanup_files, [path])
    return JSONResponse({'colors': hex_colors})

# 28. Face Blur (Privacy)
@router.post("/face-blur")
async def face_blur(file: UploadFile = File(...), bg: BackgroundTasks = BackgroundTasks()):
    check_file_size(file)
    path = await save_upload(file)
    img_cv = cv2.imread(path)
    
    face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
    gray = cv2.cvtColor(img_cv, cv2.COLOR_BGR2GRAY)
    faces = face_cascade.detectMultiScale(gray, 1.3, 5)
    
    for (x, y, w, h) in faces:
        face_region = img_cv[y:y+h, x:x+w]
        blurred_face = cv2.GaussianBlur(face_region, (99, 99), 30)
        img_cv[y:y+h, x:x+w] = blurred_face
    
    out = get_output_path('jpg')
    cv2.imwrite(out, img_cv)
    bg.add_task(cleanup_files, [path, out])
    return FileResponse(out, media_type="image/jpeg", filename="face_blurred.jpg")

# 29. Image to PDF
@router.post("/image-to-pdf")
async def image_to_pdf(files: List[UploadFile] = File(...), bg: BackgroundTasks = BackgroundTasks()):
    if len(files) < 1:
        raise HTTPException(400, "Need at least 1 image")
    
    paths = []
    for f in files:
        check_file_size(f)
        p = await save_upload(f)
        paths.append(p)
    
    out = get_output_path('pdf')
    with open(out, 'wb') as f:
        f.write(img2pdf.convert(paths))
    
    bg.add_task(cleanup_files, paths + [out])
    return FileResponse(out, media_type="application/pdf", filename="images.pdf")
