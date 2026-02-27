import os
from typing import List, Optional, Tuple

import fitz
import cv2
import numpy as np
from PIL import Image as PILImage, ImageDraw
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A4
from reportlab.lib.utils import ImageReader
from reportlab.lib.units import mm
from fastapi import APIRouter, File, UploadFile, HTTPException, BackgroundTasks, Form
from fastapi.responses import FileResponse

from services.cards import CARD_WIDTH_MM, CARD_HEIGHT_MM, mm_to_px, pdf_page_to_image, draw_cut_marks
from utils.file_utils import save_upload, get_output_path, cleanup_files, check_file_size

router = APIRouter()


# Aadhar Card Cutter
@router.post('/aadhar-cut')
async def aadhar_cutter(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    layout: str = Form(default='standard'),
    dpi: int = Form(default=300),
    cut_marks: bool = Form(default=True)
):
    input_path = None
    output_path = None
    temp_files = []
    
    try:
        # Validate
        if not file.filename.lower().endswith('.pdf'):
            raise HTTPException(400, "Only PDF files accepted")
        if layout not in ['standard', 'wallet', 'individual']:
            raise HTTPException(400, "layout must be: standard, wallet, or individual")
        if dpi not in [150, 200, 300]:
            raise HTTPException(400, "dpi must be: 150, 200, or 300")
        
        await check_file_size(file)
        input_path = await save_upload(file)
        
        # STEP 1 - Render PDF page to image
        img = pdf_page_to_image(input_path, page_num=0, dpi=dpi)
        img_w, img_h = img.size
        
        # STEP 2 - Auto detect card region using OpenCV
        img_cv = cv2.cvtColor(np.array(img), cv2.COLOR_RGB2BGR)
        gray = cv2.cvtColor(img_cv, cv2.COLOR_BGR2GRAY)
        blurred = cv2.GaussianBlur(gray, (5,5), 0)
        edges = cv2.Canny(blurred, 50, 150)
        kernel = np.ones((3,3), np.uint8)
        dilated = cv2.dilate(edges, kernel, iterations=2)
        contours, _ = cv2.findContours(dilated, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        contours = sorted(contours, key=cv2.contourArea, reverse=True)
        
        card_w_px = mm_to_px(CARD_WIDTH_MM, dpi)
        card_h_px = mm_to_px(CARD_HEIGHT_MM, dpi)
        expected_ratio = CARD_WIDTH_MM / CARD_HEIGHT_MM
        
        best_card = None
        for cnt in contours[:10]:
            x, y, w, h = cv2.boundingRect(cnt)
            if w < img_w * 0.3 or h < img_h * 0.15:
                continue
            ratio = w / h
            if abs(ratio - expected_ratio) < 0.3:
                best_card = (x, y, w, h)
                break
        
        # Fallback detection
        if best_card is None:
            x = int(img_w * 0.05)
            y = int(img_h * 0.05)
            w = int(img_w * 0.90)
            h = int(img_h * 0.45)
            best_card = (x, y, w, h)
        
        # STEP 3 - Crop the card
        x, y, w, h = best_card
        card_img = img.crop((x, y, x+w, y+h))
        card_img = card_img.resize((card_w_px, card_h_px), PILImage.LANCZOS)
        
        # STEP 4 - Create print layout
        if layout == 'individual':
            # Save as PNG
            output_path = get_output_path('png')
            card_img.save(output_path, dpi=(dpi, dpi))
            background_tasks.add_task(cleanup_files, input_path, output_path)
            return FileResponse(
                path=output_path,
                media_type="image/png",
                filename="aadhar_card.png",
                headers={"X-Layout": "individual", "X-DPI": str(dpi), "X-Cards-On-Page": "1"}
            )
        
        a4_w_px = mm_to_px(210, dpi)
        a4_h_px = mm_to_px(297, dpi)
        layout_img = PILImage.new('RGB', (a4_w_px, a4_h_px), 'white')
        draw = ImageDraw.Draw(layout_img)
        cards_count = 0
        
        if layout == 'wallet':
            # 4 cards in 2x2 grid
            margin_px = mm_to_px(10, dpi)
            gap_px = mm_to_px(5, dpi)
            positions = [
                (margin_px, margin_px),
                (margin_px + card_w_px + gap_px, margin_px),
                (margin_px, margin_px + card_h_px + gap_px),
                (margin_px + card_w_px + gap_px, margin_px + card_h_px + gap_px)
            ]
            for px, py in positions:
                layout_img.paste(card_img, (px, py))
                if cut_marks:
                    draw_cut_marks(draw, px, py, card_w_px, card_h_px)
            cards_count = 4
        
        elif layout == 'standard':
            # 2 cards centered
            cx = (a4_w_px - card_w_px) // 2
            gap_px = mm_to_px(10, dpi)
            top_y = mm_to_px(40, dpi)
            bottom_y = top_y + card_h_px + gap_px
            layout_img.paste(card_img, (cx, top_y))
            layout_img.paste(card_img, (cx, bottom_y))
            if cut_marks:
                draw_cut_marks(draw, cx, top_y, card_w_px, card_h_px)
                draw_cut_marks(draw, cx, bottom_y, card_w_px, card_h_px)
            cards_count = 2
        
        # STEP 5 - Save layout as PDF
        layout_img_path = get_output_path('png')
        layout_img.save(layout_img_path, dpi=(dpi, dpi))
        temp_files.append(layout_img_path)
        
        output_path = get_output_path('pdf')
        c = canvas.Canvas(output_path, pagesize=A4)
        c.drawImage(ImageReader(layout_img_path), 0, 0, width=210*mm, height=297*mm)
        c.save()
        
        background_tasks.add_task(cleanup_files, input_path, output_path, *temp_files)
        
        return FileResponse(
            path=output_path,
            media_type="application/pdf",
            filename="aadhar_print_layout.pdf",
            headers={
                "X-Layout": layout,
                "X-DPI": str(dpi),
                "X-Cards-On-Page": str(cards_count)
            }
        )
    
    except HTTPException:
        cleanup_files(input_path, output_path, *temp_files)
        raise
    except Exception as e:
        cleanup_files(input_path, output_path, *temp_files)
        raise HTTPException(500, f"Aadhar cut failed: {str(e)}")


# Advanced Aadhar Crop Tool
@router.post('/aadhar-advanced')
async def aadhar_advanced(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    dpi: int = Form(default=300),
    layout: str = Form(default='standard'),
    cut_marks: bool = Form(default=True),
    border_style: str = Form(default='none'),
    manual_x1: Optional[float] = Form(default=None),
    manual_y1: Optional[float] = Form(default=None),
    manual_x2: Optional[float] = Form(default=None),
    manual_y2: Optional[float] = Form(default=None)
):
    input_path = None
    output_path = None
    temp_files = []
    
    try:
        # Validate
        if not file.filename.lower().endswith('.pdf'):
            raise HTTPException(400, "Only PDF files accepted")
        if dpi not in [150, 200, 300, 600]:
            raise HTTPException(400, "dpi must be: 150, 200, 300, or 600")
        if layout not in ['standard', 'wallet', 'individual', 'custom-grid']:
            raise HTTPException(400, "layout must be: standard, wallet, individual, or custom-grid")
        if border_style not in ['none', 'thin', 'dashed']:
            raise HTTPException(400, "border_style must be: none, thin, or dashed")
        
        await check_file_size(file)
        input_path = await save_upload(file)
        
        img = pdf_page_to_image(input_path, dpi=dpi)
        img_w, img_h = img.size
        detection_method = 'contour'
        card_found = False
        
        # MODE A - Manual crop
        if all(v is not None for v in [manual_x1, manual_y1, manual_x2, manual_y2]):
            x1 = int(manual_x1 * img_w)
            y1 = int(manual_y1 * img_h)
            x2 = int(manual_x2 * img_w)
            y2 = int(manual_y2 * img_h)
            card_img = img.crop((x1, y1, x2, y2))
            detection_method = 'manual'
            card_found = True
        else:
            # MODE B - Auto detect using QR code
            img_cv = cv2.cvtColor(np.array(img), cv2.COLOR_RGB2BGR)
            qr_detector = cv2.QRCodeDetector()
            data, points, _ = qr_detector.detectAndDecode(img_cv)
            
            card_w_px = mm_to_px(CARD_WIDTH_MM, dpi)
            card_h_px = mm_to_px(CARD_HEIGHT_MM, dpi)
            
            if points is not None:
                # QR found - estimate card from QR position
                pts = points[0].astype(int)
                qr_x = min(pts[:,0])
                qr_y = min(pts[:,1])
                qr_x2 = max(pts[:,0])
                qr_y2 = max(pts[:,1])
                
                card_x = qr_x2 - card_w_px
                card_y = qr_y2 - card_h_px
                card_x = max(0, card_x)
                card_y = max(0, card_y)
                card_img = img.crop((card_x, card_y, card_x+card_w_px, card_y+card_h_px))
                detection_method = 'qr_code'
                card_found = True
            else:
                # Fallback to contour detection
                gray = cv2.cvtColor(img_cv, cv2.COLOR_BGR2GRAY)
                blurred = cv2.GaussianBlur(gray, (5,5), 0)
                edges = cv2.Canny(blurred, 50, 150)
                kernel = np.ones((3,3), np.uint8)
                dilated = cv2.dilate(edges, kernel, iterations=2)
                contours, _ = cv2.findContours(dilated, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
                contours = sorted(contours, key=cv2.contourArea, reverse=True)
                
                expected_ratio = CARD_WIDTH_MM / CARD_HEIGHT_MM
                best_card = None
                
                for cnt in contours[:10]:
                    x, y, w, h = cv2.boundingRect(cnt)
                    if w < img_w * 0.3 or h < img_h * 0.15:
                        continue
                    ratio = w / h
                    if abs(ratio - expected_ratio) < 0.3:
                        best_card = (x, y, w, h)
                        card_found = True
                        break
                
                if best_card is None:
                    x = int(img_w * 0.05)
                    y = int(img_h * 0.05)
                    w = int(img_w * 0.90)
                    h = int(img_h * 0.45)
                    best_card = (x, y, w, h)
                
                x, y, w, h = best_card
                card_img = img.crop((x, y, x+w, y+h))
        
        # Apply border
        if border_style == 'thin':
            draw = ImageDraw.Draw(card_img)
            draw.rectangle([0, 0, card_img.width-1, card_img.height-1], outline=(0,0,0), width=2)
        elif border_style == 'dashed':
            draw = ImageDraw.Draw(card_img)
            w, h = card_img.width, card_img.height
            dash_len = 10
            for i in range(0, w, dash_len*2):
                draw.line([(i, 0), (min(i+dash_len, w), 0)], fill=(0,0,0), width=2)
                draw.line([(i, h-1), (min(i+dash_len, w), h-1)], fill=(0,0,0), width=2)
            for i in range(0, h, dash_len*2):
                draw.line([(0, i), (0, min(i+dash_len, h))], fill=(0,0,0), width=2)
                draw.line([(w-1, i), (w-1, min(i+dash_len, h))], fill=(0,0,0), width=2)
        
        # Resize to standard size
        card_w_px = mm_to_px(CARD_WIDTH_MM, dpi)
        card_h_px = mm_to_px(CARD_HEIGHT_MM, dpi)
        card_img = card_img.resize((card_w_px, card_h_px), PILImage.LANCZOS)
        
        # Build print layout
        if layout == 'individual':
            output_path = get_output_path('png')
            card_img.save(output_path, dpi=(dpi, dpi))
            background_tasks.add_task(cleanup_files, input_path, output_path)
            return FileResponse(
                path=output_path,
                media_type="image/png",
                filename="aadhar_advanced.png",
                headers={
                    "X-Detection-Method": detection_method,
                    "X-Card-Found": str(card_found).lower(),
                    "X-Layout": "individual",
                    "X-DPI": str(dpi)
                }
            )
        
        a4_w_px = mm_to_px(210, dpi)
        a4_h_px = mm_to_px(297, dpi)
        layout_img = PILImage.new('RGB', (a4_w_px, a4_h_px), 'white')
        draw = ImageDraw.Draw(layout_img)
        cards_count = 0
        
        if layout == 'wallet' or layout == 'custom-grid':
            margin_px = mm_to_px(10, dpi)
            gap_px = mm_to_px(5, dpi)
            positions = [
                (margin_px, margin_px),
                (margin_px + card_w_px + gap_px, margin_px),
                (margin_px, margin_px + card_h_px + gap_px),
                (margin_px + card_w_px + gap_px, margin_px + card_h_px + gap_px)
            ]
            for px, py in positions:
                layout_img.paste(card_img, (px, py))
                if cut_marks:
                    draw_cut_marks(draw, px, py, card_w_px, card_h_px)
            cards_count = 4
        elif layout == 'standard':
            cx = (a4_w_px - card_w_px) // 2
            gap_px = mm_to_px(10, dpi)
            top_y = mm_to_px(40, dpi)
            bottom_y = top_y + card_h_px + gap_px
            layout_img.paste(card_img, (cx, top_y))
            layout_img.paste(card_img, (cx, bottom_y))
            if cut_marks:
                draw_cut_marks(draw, cx, top_y, card_w_px, card_h_px)
                draw_cut_marks(draw, cx, bottom_y, card_w_px, card_h_px)
            cards_count = 2
        
        layout_img_path = get_output_path('png')
        layout_img.save(layout_img_path, dpi=(dpi, dpi))
        temp_files.append(layout_img_path)
        
        output_path = get_output_path('pdf')
        c = canvas.Canvas(output_path, pagesize=A4)
        c.drawImage(ImageReader(layout_img_path), 0, 0, width=210*mm, height=297*mm)
        c.save()
        
        background_tasks.add_task(cleanup_files, input_path, output_path, *temp_files)
        
        return FileResponse(
            path=output_path,
            media_type="application/pdf",
            filename="aadhar_advanced_print.pdf",
            headers={
                "X-Detection-Method": detection_method,
                "X-Card-Found": str(card_found).lower(),
                "X-Layout": layout,
                "X-DPI": str(dpi),
                "X-Cards-On-Page": str(cards_count)
            }
        )
    
    except HTTPException:
        cleanup_files(input_path, output_path, *temp_files)
        raise
    except Exception as e:
        cleanup_files(input_path, output_path, *temp_files)
        raise HTTPException(500, f"Advanced Aadhar failed: {str(e)}")


# PAN Card Cutter
@router.post('/pan-cut')
async def pan_card_cutter(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    layout: str = Form(default='standard'),
    dpi: int = Form(default=300),
    cut_marks: bool = Form(default=True)
):
    input_path = None
    output_path = None
    temp_files = []
    
    try:
        # Validate
        if not file.filename.lower().endswith('.pdf'):
            raise HTTPException(400, "Only PDF files accepted")
        if layout not in ['standard', 'wallet', 'individual']:
            raise HTTPException(400, "layout must be: standard, wallet, or individual")
        if dpi not in [150, 200, 300]:
            raise HTTPException(400, "dpi must be: 150, 200, or 300")
        
        await check_file_size(file)
        input_path = await save_upload(file)
        
        # STEP 1 - Render page
        img = pdf_page_to_image(input_path, page_num=0, dpi=dpi)
        img_cv = cv2.cvtColor(np.array(img), cv2.COLOR_RGB2BGR)
        img_w, img_h = img.size
        
        # STEP 2 - Detect PAN card region
        # Strategy 1 - Contour with aspect ratio filter
        gray = cv2.cvtColor(img_cv, cv2.COLOR_BGR2GRAY)
        thresh = cv2.adaptiveThreshold(gray, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
                                       cv2.THRESH_BINARY_INV, 11, 2)
        contours, _ = cv2.findContours(thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        contours_sorted = sorted(contours, key=cv2.contourArea, reverse=True)
        expected_ratio = CARD_WIDTH_MM / CARD_HEIGHT_MM
        
        best_card = None
        for cnt in contours_sorted[:15]:
            x, y, w, h = cv2.boundingRect(cnt)
            if w < img_w * 0.25 or h < img_h * 0.1:
                continue
            ratio = w / h
            if abs(ratio - expected_ratio) < 0.4:
                best_card = (x, y, w, h)
                break
        
        # Strategy 2 - Position-based fallback
        if best_card is None:
            x = int(img_w * 0.08)
            y = int(img_h * 0.05)
            w = int(img_w * 0.84)
            h = int(img_h * 0.38)
            best_card = (x, y, w, h)
        
        # STEP 3 - Crop and resize
        x, y, w, h = best_card
        card_img = img.crop((x, y, x+w, y+h))
        card_w_px = mm_to_px(CARD_WIDTH_MM, dpi)
        card_h_px = mm_to_px(CARD_HEIGHT_MM, dpi)
        card_img = card_img.resize((card_w_px, card_h_px), PILImage.LANCZOS)
        
        # STEP 4 - Build print layout
        if layout == 'individual':
            output_path = get_output_path('png')
            card_img.save(output_path, dpi=(dpi, dpi))
            background_tasks.add_task(cleanup_files, input_path, output_path)
            return FileResponse(
                path=output_path,
                media_type="image/png",
                filename="pan_card.png",
                headers={"X-Layout": "individual", "X-DPI": str(dpi)}
            )
        
        a4_w_px = mm_to_px(210, dpi)
        a4_h_px = mm_to_px(297, dpi)
        layout_img = PILImage.new('RGB', (a4_w_px, a4_h_px), 'white')
        draw = ImageDraw.Draw(layout_img)
        cards_count = 0
        
        if layout == 'wallet':
            margin_px = mm_to_px(10, dpi)
            gap_px = mm_to_px(5, dpi)
            positions = [
                (margin_px, margin_px),
                (margin_px + card_w_px + gap_px, margin_px),
                (margin_px, margin_px + card_h_px + gap_px),
                (margin_px + card_w_px + gap_px, margin_px + card_h_px + gap_px)
            ]
            for px, py in positions:
                layout_img.paste(card_img, (px, py))
                if cut_marks:
                    draw_cut_marks(draw, px, py, card_w_px, card_h_px)
            cards_count = 4
        elif layout == 'standard':
            cx = (a4_w_px - card_w_px) // 2
            gap_px = mm_to_px(10, dpi)
            top_y = mm_to_px(40, dpi)
            bottom_y = top_y + card_h_px + gap_px
            layout_img.paste(card_img, (cx, top_y))
            layout_img.paste(card_img, (cx, bottom_y))
            if cut_marks:
                draw_cut_marks(draw, cx, top_y, card_w_px, card_h_px)
                draw_cut_marks(draw, cx, bottom_y, card_w_px, card_h_px)
            cards_count = 2
        
        layout_img_path = get_output_path('png')
        layout_img.save(layout_img_path, dpi=(dpi, dpi))
        temp_files.append(layout_img_path)
        
        output_path = get_output_path('pdf')
        c = canvas.Canvas(output_path, pagesize=A4)
        c.drawImage(ImageReader(layout_img_path), 0, 0, width=210*mm, height=297*mm)
        c.save()
        
        background_tasks.add_task(cleanup_files, input_path, output_path, *temp_files)
        
        return FileResponse(
            path=output_path,
            media_type="application/pdf",
            filename="pan_card_print.pdf",
            headers={"X-Layout": layout, "X-DPI": str(dpi), "X-Cards-On-Page": str(cards_count)}
        )
    
    except HTTPException:
        cleanup_files(input_path, output_path, *temp_files)
        raise
    except Exception as e:
        cleanup_files(input_path, output_path, *temp_files)
        raise HTTPException(500, f"PAN cut failed: {str(e)}")


# Helper function for voter ID card detection
def detect_card_from_image(img: PILImage.Image, dpi: int) -> PILImage.Image:
    """Detect and crop card from image using contour detection"""
    img_cv = cv2.cvtColor(np.array(img), cv2.COLOR_RGB2BGR)
    img_w, img_h = img.size
    
    gray = cv2.cvtColor(img_cv, cv2.COLOR_BGR2GRAY)
    blurred = cv2.GaussianBlur(gray, (5,5), 0)
    edges = cv2.Canny(blurred, 50, 150)
    kernel = np.ones((3,3), np.uint8)
    dilated = cv2.dilate(edges, kernel, iterations=2)
    contours, _ = cv2.findContours(dilated, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    contours = sorted(contours, key=cv2.contourArea, reverse=True)
    
    expected_ratio = CARD_WIDTH_MM / CARD_HEIGHT_MM
    best_card = None
    
    for cnt in contours[:10]:
        x, y, w, h = cv2.boundingRect(cnt)
        if w < img_w * 0.3 or h < img_h * 0.15:
            continue
        ratio = w / h
        if abs(ratio - expected_ratio) < 0.3:
            best_card = (x, y, w, h)
            break
    
    if best_card is None:
        x = int(img_w * 0.05)
        y = int(img_h * 0.05)
        w = int(img_w * 0.90)
        h = int(img_h * 0.45)
        best_card = (x, y, w, h)
    
    x, y, w, h = best_card
    card_img = img.crop((x, y, x+w, y+h))
    card_w_px = mm_to_px(CARD_WIDTH_MM, dpi)
    card_h_px = mm_to_px(CARD_HEIGHT_MM, dpi)
    card_img = card_img.resize((card_w_px, card_h_px), PILImage.LANCZOS)
    return card_img

# Voter ID (eEPIC) Cutter
@router.post('/voter-cut')
async def voter_id_cutter(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    layout: str = Form(default='standard'),
    dpi: int = Form(default=300),
    cut_marks: bool = Form(default=True),
    card_side: str = Form(default='both')
):
    input_path = None
    output_path = None
    temp_files = []
    
    try:
        # Validate
        if not file.filename.lower().endswith('.pdf'):
            raise HTTPException(400, "Only PDF files accepted")
        if layout not in ['standard', 'wallet', 'individual']:
            raise HTTPException(400, "layout must be: standard, wallet, or individual")
        if dpi not in [150, 200, 300]:
            raise HTTPException(400, "dpi must be: 150, 200, or 300")
        if card_side not in ['front', 'back', 'both']:
            raise HTTPException(400, "card_side must be: front, back, or both")
        
        await check_file_size(file)
        input_path = await save_upload(file)
        
        # STEP 1 - Detect number of pages
        doc = fitz.open(input_path)
        num_pages = len(doc)
        doc.close()
        
        # STEP 2 - Extract card images
        card_images = []
        
        if num_pages >= 2:
            # Front and back on separate pages
            if card_side in ['front', 'both']:
                front_img = pdf_page_to_image(input_path, page_num=0, dpi=dpi)
                front_card = detect_card_from_image(front_img, dpi)
                card_images.append(('front', front_card))
            if card_side in ['back', 'both']:
                back_img = pdf_page_to_image(input_path, page_num=1, dpi=dpi)
                back_card = detect_card_from_image(back_img, dpi)
                card_images.append(('back', back_card))
        else:
            # Both sides on one page (bi-fold)
            img = pdf_page_to_image(input_path, page_num=0, dpi=dpi)
            img_w, img_h = img.size
            front_card = img.crop((0, 0, img_w, img_h//2))
            back_card = img.crop((0, img_h//2, img_w, img_h))
            card_w_px = mm_to_px(CARD_WIDTH_MM, dpi)
            card_h_px = mm_to_px(CARD_HEIGHT_MM, dpi)
            front_card = front_card.resize((card_w_px, card_h_px), PILImage.LANCZOS)
            back_card = back_card.resize((card_w_px, card_h_px), PILImage.LANCZOS)
            if card_side in ['front', 'both']:
                card_images.append(('front', front_card))
            if card_side in ['back', 'both']:
                card_images.append(('back', back_card))
        
        if not card_images:
            raise HTTPException(400, "No cards extracted")
        
        # STEP 3 - Build print layout
        if layout == 'individual':
            # Save first card as PNG
            output_path = get_output_path('png')
            card_images[0][1].save(output_path, dpi=(dpi, dpi))
            background_tasks.add_task(cleanup_files, input_path, output_path)
            return FileResponse(
                path=output_path,
                media_type="image/png",
                filename=f"voter_id_{card_images[0][0]}.png",
                headers={"X-Pages-Detected": str(num_pages), "X-Layout": "individual"}
            )
        
        card_w_px = mm_to_px(CARD_WIDTH_MM, dpi)
        card_h_px = mm_to_px(CARD_HEIGHT_MM, dpi)
        a4_w_px = mm_to_px(210, dpi)
        a4_h_px = mm_to_px(297, dpi)
        layout_img = PILImage.new('RGB', (a4_w_px, a4_h_px), 'white')
        draw = ImageDraw.Draw(layout_img)
        cards_count = 0
        
        if layout == 'wallet':
            # Up to 4 cards (2 front + 2 back)
            margin_px = mm_to_px(10, dpi)
            gap_px = mm_to_px(5, dpi)
            positions = [
                (margin_px, margin_px),
                (margin_px + card_w_px + gap_px, margin_px),
                (margin_px, margin_px + card_h_px + gap_px),
                (margin_px + card_w_px + gap_px, margin_px + card_h_px + gap_px)
            ]
            for i, (side, card_img) in enumerate(card_images):
                if i < 4:
                    px, py = positions[i]
                    layout_img.paste(card_img, (px, py))
                    if cut_marks:
                        draw_cut_marks(draw, px, py, card_w_px, card_h_px)
                    cards_count += 1
        elif layout == 'standard':
            # Front on top, back below
            cx = (a4_w_px - card_w_px) // 2
            gap_px = mm_to_px(10, dpi)
            top_y = mm_to_px(40, dpi)
            for i, (side, card_img) in enumerate(card_images):
                if i == 0:
                    layout_img.paste(card_img, (cx, top_y))
                    if cut_marks:
                        draw_cut_marks(draw, cx, top_y, card_w_px, card_h_px)
                elif i == 1:
                    bottom_y = top_y + card_h_px + gap_px
                    layout_img.paste(card_img, (cx, bottom_y))
                    if cut_marks:
                        draw_cut_marks(draw, cx, bottom_y, card_w_px, card_h_px)
                cards_count += 1
        
        layout_img_path = get_output_path('png')
        layout_img.save(layout_img_path, dpi=(dpi, dpi))
        temp_files.append(layout_img_path)
        
        output_path = get_output_path('pdf')
        c = canvas.Canvas(output_path, pagesize=A4)
        c.drawImage(ImageReader(layout_img_path), 0, 0, width=210*mm, height=297*mm)
        c.save()
        
        background_tasks.add_task(cleanup_files, input_path, output_path, *temp_files)
        
        return FileResponse(
            path=output_path,
            media_type="application/pdf",
            filename="voter_id_print.pdf",
            headers={
                "X-Pages-Detected": str(num_pages),
                "X-Layout": layout,
                "X-DPI": str(dpi),
                "X-Cards-On-Page": str(cards_count)
            }
        )
    
    except HTTPException:
        cleanup_files(input_path, output_path, *temp_files)
        raise
    except Exception as e:
        cleanup_files(input_path, output_path, *temp_files)
        raise HTTPException(500, f"Voter ID cut failed: {str(e)}")


# JAN Aadhar Cutter
@router.post('/jan-aadhar-cut')
async def jan_aadhar_cutter(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    layout: str = Form(default='standard'),
    dpi: int = Form(default=300),
    cut_marks: bool = Form(default=True)
):
    input_path = None
    output_path = None
    temp_files = []
    
    try:
        # Validate
        if not file.filename.lower().endswith('.pdf'):
            raise HTTPException(400, "Only PDF files accepted")
        if layout not in ['standard', 'wallet', 'individual']:
            raise HTTPException(400, "layout must be: standard, wallet, or individual")
        if dpi not in [150, 200, 300]:
            raise HTTPException(400, "dpi must be: 150, 200, or 300")
        
        await check_file_size(file)
        input_path = await save_upload(file)
        
        # STEP 1 - Render page to image
        img = pdf_page_to_image(input_path, page_num=0, dpi=dpi)
        img_cv = cv2.cvtColor(np.array(img), cv2.COLOR_RGB2BGR)
        img_w, img_h = img.size
        
        # STEP 2 - Detect card using contour detection
        gray = cv2.cvtColor(img_cv, cv2.COLOR_BGR2GRAY)
        edges = cv2.Canny(gray, 30, 120)
        kernel = np.ones((5,5), np.uint8)
        dilated = cv2.dilate(edges, kernel, iterations=3)
        contours, _ = cv2.findContours(dilated, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        contours = sorted(contours, key=cv2.contourArea, reverse=True)
        
        expected_ratio = 1.5
        best_card = None
        
        for cnt in contours[:15]:
            x, y, w, h = cv2.boundingRect(cnt)
            if w < img_w * 0.3 or h < img_h * 0.15:
                continue
            ratio = w / h
            if abs(ratio - expected_ratio) < 0.4:
                best_card = (x, y, w, h)
                break
        
        # Fallback
        if best_card is None:
            x = int(img_w * 0.05)
            y = int(img_h * 0.05)
            w = int(img_w * 0.90)
            h = int(img_h * 0.45)
            best_card = (x, y, w, h)
        
        # STEP 3 - Crop and resize
        x, y, w, h = best_card
        card_img = img.crop((x, y, x+w, y+h))
        card_w_px = mm_to_px(CARD_WIDTH_MM, dpi)
        card_h_px = mm_to_px(CARD_HEIGHT_MM, dpi)
        card_img = card_img.resize((card_w_px, card_h_px), PILImage.LANCZOS)
        
        # STEP 4 - Build print layout
        if layout == 'individual':
            output_path = get_output_path('png')
            card_img.save(output_path, dpi=(dpi, dpi))
            background_tasks.add_task(cleanup_files, input_path, output_path)
            return FileResponse(
                path=output_path,
                media_type="image/png",
                filename="jan_aadhar_card.png",
                headers={"X-Layout": "individual", "X-DPI": str(dpi)}
            )
        
        a4_w_px = mm_to_px(210, dpi)
        a4_h_px = mm_to_px(297, dpi)
        layout_img = PILImage.new('RGB', (a4_w_px, a4_h_px), 'white')
        draw = ImageDraw.Draw(layout_img)
        cards_count = 0
        
        if layout == 'wallet':
            margin_px = mm_to_px(10, dpi)
            gap_px = mm_to_px(5, dpi)
            positions = [
                (margin_px, margin_px),
                (margin_px + card_w_px + gap_px, margin_px),
                (margin_px, margin_px + card_h_px + gap_px),
                (margin_px + card_w_px + gap_px, margin_px + card_h_px + gap_px)
            ]
            for px, py in positions:
                layout_img.paste(card_img, (px, py))
                if cut_marks:
                    draw_cut_marks(draw, px, py, card_w_px, card_h_px)
            cards_count = 4
        elif layout == 'standard':
            cx = (a4_w_px - card_w_px) // 2
            gap_px = mm_to_px(10, dpi)
            top_y = mm_to_px(40, dpi)
            bottom_y = top_y + card_h_px + gap_px
            layout_img.paste(card_img, (cx, top_y))
            layout_img.paste(card_img, (cx, bottom_y))
            if cut_marks:
                draw_cut_marks(draw, cx, top_y, card_w_px, card_h_px)
                draw_cut_marks(draw, cx, bottom_y, card_w_px, card_h_px)
            cards_count = 2
        
        layout_img_path = get_output_path('png')
        layout_img.save(layout_img_path, dpi=(dpi, dpi))
        temp_files.append(layout_img_path)
        
        output_path = get_output_path('pdf')
        c = canvas.Canvas(output_path, pagesize=A4)
        c.drawImage(ImageReader(layout_img_path), 0, 0, width=210*mm, height=297*mm)
        c.save()
        
        background_tasks.add_task(cleanup_files, input_path, output_path, *temp_files)
        
        return FileResponse(
            path=output_path,
            media_type="application/pdf",
            filename="jan_aadhar_print.pdf",
            headers={"X-Layout": layout, "X-DPI": str(dpi), "X-Cards-On-Page": str(cards_count)}
        )
    
    except HTTPException:
        cleanup_files(input_path, output_path, *temp_files)
        raise
    except Exception as e:
        cleanup_files(input_path, output_path, *temp_files)
        raise HTTPException(500, f"JAN Aadhar cut failed: {str(e)}")


# eCard Cutter (Universal)
@router.post('/ecard-cut')
async def ecard_cutter(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    layout: str = Form(default='standard'),
    dpi: int = Form(default=300),
    cut_marks: bool = Form(default=True),
    card_type: str = Form(default='auto')
):
    input_path = None
    output_path = None
    temp_files = []
    
    try:
        # Validate
        if not file.filename.lower().endswith('.pdf'):
            raise HTTPException(400, "Only PDF files accepted")
        if card_type not in ['auto', 'aadhar', 'pan', 'voter', 'jan_aadhar', 'driving_license', 'other']:
            raise HTTPException(400, "card_type must be: auto, aadhar, pan, voter, jan_aadhar, driving_license, or other")
        if layout not in ['standard', 'wallet', 'individual']:
            raise HTTPException(400, "layout must be: standard, wallet, or individual")
        if dpi not in [150, 200, 300]:
            raise HTTPException(400, "dpi must be: 150, 200, or 300")
        
        await check_file_size(file)
        input_path = await save_upload(file)
        
        # STEP 1 - Render PDF page
        img = pdf_page_to_image(input_path, page_num=0, dpi=dpi)
        
        # STEP 2 - Auto detect card type
        if card_type == 'auto':
            doc = fitz.open(input_path)
            page_text = doc[0].get_text().lower()
            doc.close()
            
            if 'unique identification' in page_text or 'uidai' in page_text or 'aadhaar' in page_text:
                detected_type = 'aadhar'
            elif 'income tax' in page_text or 'permanent account' in page_text:
                detected_type = 'pan'
            elif 'election commission' in page_text or 'epic' in page_text or 'voter' in page_text:
                detected_type = 'voter'
            elif 'jan aadhaar' in page_text or 'rajasthan' in page_text:
                detected_type = 'jan_aadhar'
            elif 'driving' in page_text or 'licence' in page_text:
                detected_type = 'driving_license'
            else:
                detected_type = 'other'
        else:
            detected_type = card_type
        
        # STEP 3 - Detect card region based on type
        img_cv = cv2.cvtColor(np.array(img), cv2.COLOR_RGB2BGR)
        img_w, img_h = img.size
        card_w_px = mm_to_px(CARD_WIDTH_MM, dpi)
        card_h_px = mm_to_px(CARD_HEIGHT_MM, dpi)
        
        if detected_type == 'aadhar':
            # Try QR code first
            qr_detector = cv2.QRCodeDetector()
            data, points, _ = qr_detector.detectAndDecode(img_cv)
            
            if points is not None:
                pts = points[0].astype(int)
                qr_x2 = max(pts[:,0])
                qr_y2 = max(pts[:,1])
                card_x = max(0, qr_x2 - card_w_px)
                card_y = max(0, qr_y2 - card_h_px)
                card_img = img.crop((card_x, card_y, card_x+card_w_px, card_y+card_h_px))
            else:
                card_img = detect_card_from_image(img, dpi)
        
        elif detected_type == 'pan':
            # Adaptive threshold
            gray = cv2.cvtColor(img_cv, cv2.COLOR_BGR2GRAY)
            thresh = cv2.adaptiveThreshold(gray, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
                                          cv2.THRESH_BINARY_INV, 11, 2)
            contours, _ = cv2.findContours(thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
            contours = sorted(contours, key=cv2.contourArea, reverse=True)
            expected_ratio = CARD_WIDTH_MM / CARD_HEIGHT_MM
            best_card = None
            
            for cnt in contours[:15]:
                x, y, w, h = cv2.boundingRect(cnt)
                if w < img_w * 0.25 or h < img_h * 0.1:
                    continue
                ratio = w / h
                if abs(ratio - expected_ratio) < 0.4:
                    best_card = (x, y, w, h)
                    break
            
            if best_card is None:
                x = int(img_w * 0.08)
                y = int(img_h * 0.05)
                w = int(img_w * 0.84)
                h = int(img_h * 0.38)
                best_card = (x, y, w, h)
            
            x, y, w, h = best_card
            card_img = img.crop((x, y, x+w, y+h))
            card_img = card_img.resize((card_w_px, card_h_px), PILImage.LANCZOS)
        
        elif detected_type == 'voter':
            # Check page count for bi-fold
            doc = fitz.open(input_path)
            num_pages = len(doc)
            doc.close()
            
            if num_pages == 1:
                # Bi-fold - use top half
                card_img = img.crop((0, 0, img_w, img_h//2))
                card_img = card_img.resize((card_w_px, card_h_px), PILImage.LANCZOS)
            else:
                card_img = detect_card_from_image(img, dpi)
        
        else:
            # Standard contour detection for jan_aadhar, driving_license, other
            card_img = detect_card_from_image(img, dpi)
        
        # STEP 4 - Build print layout
        if layout == 'individual':
            output_path = get_output_path('png')
            card_img.save(output_path, dpi=(dpi, dpi))
            background_tasks.add_task(cleanup_files, input_path, output_path)
            return FileResponse(
                path=output_path,
                media_type="image/png",
                filename="ecard.png",
                headers={
                    "X-Detected-Card-Type": detected_type,
                    "X-Layout": "individual",
                    "X-DPI": str(dpi)
                }
            )
        
        a4_w_px = mm_to_px(210, dpi)
        a4_h_px = mm_to_px(297, dpi)
        layout_img = PILImage.new('RGB', (a4_w_px, a4_h_px), 'white')
        draw = ImageDraw.Draw(layout_img)
        cards_count = 0
        
        if layout == 'wallet':
            margin_px = mm_to_px(10, dpi)
            gap_px = mm_to_px(5, dpi)
            positions = [
                (margin_px, margin_px),
                (margin_px + card_w_px + gap_px, margin_px),
                (margin_px, margin_px + card_h_px + gap_px),
                (margin_px + card_w_px + gap_px, margin_px + card_h_px + gap_px)
            ]
            for px, py in positions:
                layout_img.paste(card_img, (px, py))
                if cut_marks:
                    draw_cut_marks(draw, px, py, card_w_px, card_h_px)
            cards_count = 4
        elif layout == 'standard':
            cx = (a4_w_px - card_w_px) // 2
            gap_px = mm_to_px(10, dpi)
            top_y = mm_to_px(40, dpi)
            bottom_y = top_y + card_h_px + gap_px
            layout_img.paste(card_img, (cx, top_y))
            layout_img.paste(card_img, (cx, bottom_y))
            if cut_marks:
                draw_cut_marks(draw, cx, top_y, card_w_px, card_h_px)
                draw_cut_marks(draw, cx, bottom_y, card_w_px, card_h_px)
            cards_count = 2
        
        layout_img_path = get_output_path('png')
        layout_img.save(layout_img_path, dpi=(dpi, dpi))
        temp_files.append(layout_img_path)
        
        output_path = get_output_path('pdf')
        c = canvas.Canvas(output_path, pagesize=A4)
        c.drawImage(ImageReader(layout_img_path), 0, 0, width=210*mm, height=297*mm)
        c.save()
        
        background_tasks.add_task(cleanup_files, input_path, output_path, *temp_files)
        
        return FileResponse(
            path=output_path,
            media_type="application/pdf",
            filename="ecard_print.pdf",
            headers={
                "X-Detected-Card-Type": detected_type,
                "X-Layout": layout,
                "X-DPI": str(dpi),
                "X-Cards-On-Page": str(cards_count)
            }
        )
    
    except HTTPException:
        cleanup_files(input_path, output_path, *temp_files)
        raise
    except Exception as e:
        cleanup_files(input_path, output_path, *temp_files)
        raise HTTPException(500, f"eCard cut failed: {str(e)}")


# Multi-ID Crop Tool
@router.post('/multi-id-cut')
async def multi_id_cutter(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    dpi: int = Form(default=300),
    cut_marks: bool = Form(default=True),
    cards_per_page: int = Form(default=4)
):
    input_path = None
    output_path = None
    temp_files = []
    
    try:
        # Validate
        if not file.filename.lower().endswith('.pdf'):
            raise HTTPException(400, "Only PDF files accepted")
        if dpi not in [150, 200, 300]:
            raise HTTPException(400, "dpi must be: 150, 200, or 300")
        if cards_per_page not in [2, 4]:
            raise HTTPException(400, "cards_per_page must be: 2 or 4")
        
        await check_file_size(file)
        input_path = await save_upload(file)
        
        # STEP 1 - Process all PDF pages
        doc = fitz.open(input_path)
        total_pages = len(doc)
        doc.close()
        all_detected_cards = []
        
        for page_num in range(total_pages):
            img = pdf_page_to_image(input_path, page_num=page_num, dpi=dpi)
            
            # Detect card type from page text
            doc = fitz.open(input_path)
            page_text = doc[page_num].get_text().lower()
            doc.close()
            
            if 'unique identification' in page_text or 'uidai' in page_text or 'aadhaar' in page_text:
                card_type = 'aadhar'
            elif 'income tax' in page_text or 'permanent account' in page_text:
                card_type = 'pan'
            elif 'election commission' in page_text or 'epic' in page_text or 'voter' in page_text:
                card_type = 'voter'
            elif 'jan aadhaar' in page_text or 'rajasthan' in page_text:
                card_type = 'jan_aadhar'
            elif 'driving' in page_text or 'licence' in page_text:
                card_type = 'driving_license'
            else:
                card_type = 'other'
            
            # Detect card region
            card_img = detect_card_from_image(img, dpi)
            
            all_detected_cards.append({
                'page': page_num + 1,
                'type': card_type,
                'image': card_img
            })
        
        if not all_detected_cards:
            raise HTTPException(400, "No cards detected in PDF")
        
        # STEP 2 - Arrange all cards on A4 pages
        card_w_px = mm_to_px(CARD_WIDTH_MM, dpi)
        card_h_px = mm_to_px(CARD_HEIGHT_MM, dpi)
        a4_w_px = mm_to_px(210, dpi)
        a4_h_px = mm_to_px(297, dpi)
        margin = mm_to_px(10, dpi)
        gap = mm_to_px(5, dpi)
        
        # Split cards into chunks
        output_pages = []
        for i in range(0, len(all_detected_cards), cards_per_page):
            chunk = all_detected_cards[i:i+cards_per_page]
            layout_img = PILImage.new('RGB', (a4_w_px, a4_h_px), 'white')
            draw = ImageDraw.Draw(layout_img)
            
            if cards_per_page == 4:
                # 2x2 grid
                positions = [
                    (margin, margin),
                    (margin + card_w_px + gap, margin),
                    (margin, margin + card_h_px + gap),
                    (margin + card_w_px + gap, margin + card_h_px + gap)
                ]
                for idx, card_data in enumerate(chunk):
                    if idx < 4:
                        px, py = positions[idx]
                        layout_img.paste(card_data['image'], (px, py))
                        if cut_marks:
                            draw_cut_marks(draw, px, py, card_w_px, card_h_px)
                        # Add label
                        label_y = py + card_h_px + 5
                        draw.text((px, label_y), card_data['type'], fill=(0,0,0))
            
            elif cards_per_page == 2:
                # 1x2 vertical
                cx = (a4_w_px - card_w_px) // 2
                top_y = mm_to_px(40, dpi)
                positions = [
                    (cx, top_y),
                    (cx, top_y + card_h_px + gap)
                ]
                for idx, card_data in enumerate(chunk):
                    if idx < 2:
                        px, py = positions[idx]
                        layout_img.paste(card_data['image'], (px, py))
                        if cut_marks:
                            draw_cut_marks(draw, px, py, card_w_px, card_h_px)
                        # Add label
                        label_y = py + card_h_px + 5
                        draw.text((px, label_y), card_data['type'], fill=(0,0,0))
            
            output_pages.append(layout_img)
        
        # STEP 3 - Combine all layout pages into one PDF
        output_path = get_output_path('pdf')
        c = canvas.Canvas(output_path, pagesize=A4)
        
        for page_img in output_pages:
            page_img_path = get_output_path('png')
            page_img.save(page_img_path, dpi=(dpi, dpi))
            temp_files.append(page_img_path)
            c.drawImage(ImageReader(page_img_path), 0, 0, width=210*mm, height=297*mm)
            c.showPage()
        
        c.save()
        
        # Prepare cards summary
        import json
        cards_summary = json.dumps([{'page': c['page'], 'type': c['type']} for c in all_detected_cards])
        
        background_tasks.add_task(cleanup_files, input_path, output_path, *temp_files)
        
        return FileResponse(
            path=output_path,
            media_type="application/pdf",
            filename="all_ids_print.pdf",
            headers={
                "X-Total-Cards-Detected": str(len(all_detected_cards)),
                "X-Total-Print-Pages": str(len(output_pages)),
                "X-Cards-Summary": cards_summary
            }
        )
    
    except HTTPException:
        cleanup_files(input_path, output_path, *temp_files)
        raise
    except Exception as e:
        cleanup_files(input_path, output_path, *temp_files)
        raise HTTPException(500, f"Multi-ID cut failed: {str(e)}")
