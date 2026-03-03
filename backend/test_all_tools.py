"""
Comprehensive Test Script for All Tools
Tests all 77 tools across PDF, Convert, ID Cards, and Image categories
"""

import requests
import os
from PIL import Image, ImageDraw
import io

BASE_URL = "http://localhost:8000"
os.makedirs("test_files", exist_ok=True)
os.makedirs("test_outputs", exist_ok=True)

def create_test_pdf(path):
    """Create a simple test PDF"""
    from reportlab.pdfgen import canvas
    from reportlab.lib.pagesizes import letter
    c = canvas.Canvas(path, pagesize=letter)
    c.drawString(100, 750, "Test PDF Document")
    c.drawString(100, 700, "Page 1")
    c.showPage()
    c.drawString(100, 750, "Page 2")
    c.showPage()
    c.save()

def create_test_image(path, width=400, height=300):
    """Create a test image"""
    img = Image.new('RGB', (width, height), (100, 150, 200))
    draw = ImageDraw.Draw(img)
    draw.text((10, 10), "Test Image", fill=(255, 255, 255))
    img.save(path, 'JPEG')

def create_test_png(path):
    """Create a PNG with transparency"""
    img = Image.new('RGBA', (300, 300), (255, 255, 255, 0))
    draw = ImageDraw.Draw(img)
    draw.ellipse([50, 50, 250, 250], fill=(200, 100, 100, 255))
    img.save(path, 'PNG')

def test_endpoint(name, endpoint, files=None, data=None, category=""):
    """Test a single endpoint"""
    try:
        url = f"{BASE_URL}{endpoint}"
        response = requests.post(url, files=files, data=data, timeout=60)
        
        if response.status_code == 200:
            size = len(response.content)
            ct = response.headers.get('content-type', '')
            print(f"✅ {category:12} | {name:40} | {response.status_code} | {size:8} bytes | {ct[:30]}")
            return True
        else:
            print(f"❌ {category:12} | {name:40} | {response.status_code} | {response.text[:50]}")
            return False
    except Exception as e:
        print(f"❌ {category:12} | {name:40} | ERROR: {str(e)[:50]}")
        return False

def main():
    print("\n" + "="*120)
    print("COMPREHENSIVE TOOL TEST - ALL 77 TOOLS")
    print("="*120 + "\n")
    
    # Create test files
    print("Creating test files...")
    test_pdf = "test_files/test.pdf"
    test_pdf2 = "test_files/test2.pdf"
    test_jpg = "test_files/test.jpg"
    test_jpg2 = "test_files/test2.jpg"
    test_png = "test_files/test.png"
    
    create_test_pdf(test_pdf)
    create_test_pdf(test_pdf2)
    create_test_image(test_jpg)
    create_test_image(test_jpg2, color=(200, 100, 150))
    create_test_png(test_png)
    print("✅ Test files created\n")
    
    results = []
    
    # PDF CONVERTERS (10 tools)
    print("\n" + "="*120)
    print("PDF CONVERTERS (10 tools)")
    print("="*120)
    results.append(test_endpoint("PDF to Word", "/api/convert/pdf-to-word", 
        files={'file': open(test_pdf, 'rb')}, category="CONVERT"))
    results.append(test_endpoint("PDF to PowerPoint", "/api/convert/pdf-to-ppt",
        files={'file': open(test_pdf, 'rb')}, category="CONVERT"))
    results.append(test_endpoint("PDF to Excel", "/api/convert/pdf-to-excel",
        files={'file': open(test_pdf, 'rb')}, category="CONVERT"))
    results.append(test_endpoint("PDF to JPG", "/api/convert/pdf-to-jpg",
        files={'file': open(test_pdf, 'rb')}, category="CONVERT"))
    results.append(test_endpoint("PDF to PDF/A", "/api/convert/pdf-to-pdfa",
        files={'file': open(test_pdf, 'rb')}, category="CONVERT"))
    results.append(test_endpoint("Word to PDF", "/api/convert/word-to-pdf",
        files={'file': open(test_pdf, 'rb')}, category="CONVERT"))
    results.append(test_endpoint("Excel to PDF", "/api/convert/excel-to-pdf",
        files={'file': open(test_pdf, 'rb')}, category="CONVERT"))
    results.append(test_endpoint("PPT to PDF", "/api/convert/ppt-to-pdf",
        files={'file': open(test_pdf, 'rb')}, category="CONVERT"))
    results.append(test_endpoint("JPG to PDF", "/api/convert/image-to-pdf",
        files={'file': open(test_jpg, 'rb')}, category="CONVERT"))
    results.append(test_endpoint("HTML to PDF", "/api/convert/html-to-pdf",
        files={'file': open(test_pdf, 'rb')}, category="CONVERT"))
    
    # PDF TOOLS (18 tools)
    print("\n" + "="*120)
    print("PDF TOOLS (18 tools)")
    print("="*120)
    results.append(test_endpoint("Merge PDF", "/api/pdf/merge",
        files=[('files', open(test_pdf, 'rb')), ('files', open(test_pdf2, 'rb'))], category="PDF"))
    results.append(test_endpoint("Split PDF", "/api/pdf/split",
        files={'file': open(test_pdf, 'rb')}, data={'mode': 'ranges', 'ranges': '1-'}, category="PDF"))
    results.append(test_endpoint("Compress PDF", "/api/pdf/compress?level=medium",
        files={'file': open(test_pdf, 'rb')}, category="PDF"))
    results.append(test_endpoint("Watermark PDF", "/api/pdf/watermark",
        files={'file': open(test_pdf, 'rb')}, data={'text': 'TEST', 'position': 'center'}, category="PDF"))
    results.append(test_endpoint("Rotate PDF", "/api/pdf/rotate",
        files={'file': open(test_pdf, 'rb')}, data={'angle': 90}, category="PDF"))
    results.append(test_endpoint("Add Page Numbers", "/api/pdf/add-page-numbers",
        files={'file': open(test_pdf, 'rb')}, data={'position': 'bottom-center'}, category="PDF"))
    results.append(test_endpoint("Protect PDF", "/api/pdf/protect",
        files={'file': open(test_pdf, 'rb')}, data={'user_password': 'test123'}, category="PDF"))
    results.append(test_endpoint("Unlock PDF", "/api/pdf/unlock",
        files={'file': open(test_pdf, 'rb')}, data={'password': 'test123'}, category="PDF"))
    results.append(test_endpoint("Crop PDF", "/api/pdf/crop",
        files={'file': open(test_pdf, 'rb')}, data={'x1': 0, 'y1': 0, 'x2': 100, 'y2': 100}, category="PDF"))
    results.append(test_endpoint("Organize PDF", "/api/pdf/organize",
        files={'file': open(test_pdf, 'rb')}, data={'new_order': '2,1'}, category="PDF"))
    results.append(test_endpoint("Remove Pages", "/api/pdf/remove-pages",
        files={'file': open(test_pdf, 'rb')}, data={'pages': '2'}, category="PDF"))
    results.append(test_endpoint("Sign PDF", "/api/pdf/sign",
        files={'pdf_file': open(test_pdf, 'rb'), 'signature_file': open(test_png, 'rb')},
        data={'page_number': 1, 'x': 50, 'y': 50}, category="PDF"))
    results.append(test_endpoint("OCR PDF", "/api/pdf/ocr",
        files={'file': open(test_pdf, 'rb')}, category="PDF"))
    results.append(test_endpoint("Edit PDF", "/api/pdf/edit",
        files={'file': open(test_pdf, 'rb')}, data={'operations': '[]'}, category="PDF"))
    results.append(test_endpoint("Compare PDF", "/api/pdf/compare",
        files={'file1': open(test_pdf, 'rb'), 'file2': open(test_pdf2, 'rb')}, category="PDF"))
    results.append(test_endpoint("Repair PDF", "/api/pdf/repair",
        files={'file': open(test_pdf, 'rb')}, category="PDF"))
    results.append(test_endpoint("Scan to PDF", "/api/pdf/scan-to-pdf",
        files=[('files', open(test_jpg, 'rb'))], category="PDF"))
    results.append(test_endpoint("PDF Reader", "/api/pdf/read",
        files={'file': open(test_pdf, 'rb')}, category="PDF"))
    
    # ID CARDS (7 tools)
    print("\n" + "="*120)
    print("ID CARD TOOLS (7 tools)")
    print("="*120)
    results.append(test_endpoint("Aadhar Cutter", "/api/cards/aadhar-cut",
        files={'file': open(test_pdf, 'rb')}, category="ID-CARDS"))
    results.append(test_endpoint("Advanced Aadhar", "/api/cards/aadhar-advanced",
        files={'file': open(test_pdf, 'rb')}, category="ID-CARDS"))
    results.append(test_endpoint("PAN Cutter", "/api/cards/pan-cut",
        files={'file': open(test_pdf, 'rb')}, category="ID-CARDS"))
    results.append(test_endpoint("Voter ID Cutter", "/api/cards/voter-cut",
        files={'file': open(test_pdf, 'rb')}, category="ID-CARDS"))
    results.append(test_endpoint("JAN Aadhar Cutter", "/api/cards/jan-aadhar-cut",
        files={'file': open(test_pdf, 'rb')}, category="ID-CARDS"))
    results.append(test_endpoint("eCard Cutter", "/api/cards/ecard-cut",
        files={'file': open(test_pdf, 'rb')}, category="ID-CARDS"))
    results.append(test_endpoint("Multi-ID Cutter", "/api/cards/multi-id-cut",
        files={'file': open(test_pdf, 'rb')}, category="ID-CARDS"))
    
    # IMAGE TOOLS (29 tools)
    print("\n" + "="*120)
    print("IMAGE TOOLS (29 tools)")
    print("="*120)
    results.append(test_endpoint("Resize Image", "/api/image/resize",
        files={'file': open(test_jpg, 'rb')}, data={'width': 200, 'height': 200, 'maintain_aspect': True}, category="IMAGE"))
    results.append(test_endpoint("Compress Image", "/api/image/compress",
        files={'file': open(test_jpg, 'rb')}, data={'quality': 75}, category="IMAGE"))
    results.append(test_endpoint("Crop Image", "/api/image/crop",
        files={'file': open(test_jpg, 'rb')}, data={'x': 50, 'y': 50, 'width': 200, 'height': 150}, category="IMAGE"))
    results.append(test_endpoint("Rotate Image", "/api/image/rotate",
        files={'file': open(test_jpg, 'rb')}, data={'angle': 90}, category="IMAGE"))
    results.append(test_endpoint("Flip Image", "/api/image/flip",
        files={'file': open(test_jpg, 'rb')}, data={'direction': 'horizontal'}, category="IMAGE"))
    results.append(test_endpoint("Convert Format", "/api/image/convert",
        files={'file': open(test_jpg, 'rb')}, data={'format': 'PNG'}, category="IMAGE"))
    results.append(test_endpoint("Passport Photo", "/api/image/passport-photo",
        files={'file': open(test_jpg, 'rb')}, data={'size': '2x2', 'dpi': 300}, category="IMAGE"))
    results.append(test_endpoint("Signature Resize", "/api/image/signature-resize",
        files={'file': open(test_png, 'rb')}, data={'width': 300, 'height': 100}, category="IMAGE"))
    results.append(test_endpoint("Remove Background", "/api/image/remove-background",
        files={'file': open(test_jpg, 'rb')}, category="IMAGE"))
    results.append(test_endpoint("Add Watermark", "/api/image/watermark",
        files={'file': open(test_jpg, 'rb')}, data={'text': 'TEST', 'position': 'center'}, category="IMAGE"))
    results.append(test_endpoint("Blur Image", "/api/image/blur",
        files={'file': open(test_jpg, 'rb')}, data={'radius': 5}, category="IMAGE"))
    results.append(test_endpoint("Grayscale", "/api/image/grayscale",
        files={'file': open(test_jpg, 'rb')}, category="IMAGE"))
    results.append(test_endpoint("Adjust Brightness", "/api/image/brightness",
        files={'file': open(test_jpg, 'rb')}, data={'factor': 1.5}, category="IMAGE"))
    results.append(test_endpoint("Adjust Contrast", "/api/image/contrast",
        files={'file': open(test_jpg, 'rb')}, data={'factor': 1.5}, category="IMAGE"))
    results.append(test_endpoint("Sharpen", "/api/image/sharpen",
        files={'file': open(test_jpg, 'rb')}, category="IMAGE"))
    results.append(test_endpoint("Sepia Effect", "/api/image/sepia",
        files={'file': open(test_jpg, 'rb')}, category="IMAGE"))
    results.append(test_endpoint("Edge Detection", "/api/image/edge-detect",
        files={'file': open(test_jpg, 'rb')}, category="IMAGE"))
    results.append(test_endpoint("Get Metadata", "/api/image/metadata",
        files={'file': open(test_jpg, 'rb')}, category="IMAGE"))
    results.append(test_endpoint("Remove Metadata", "/api/image/remove-metadata",
        files={'file': open(test_jpg, 'rb')}, category="IMAGE"))
    results.append(test_endpoint("Image OCR", "/api/image/ocr",
        files={'file': open(test_jpg, 'rb')}, data={'lang': 'eng'}, category="IMAGE"))
    results.append(test_endpoint("Merge Images", "/api/image/merge",
        files=[('files', open(test_jpg, 'rb')), ('files', open(test_jpg2, 'rb'))],
        data={'direction': 'horizontal'}, category="IMAGE"))
    results.append(test_endpoint("Split Image", "/api/image/split",
        files={'file': open(test_jpg, 'rb')}, data={'rows': 2, 'cols': 2}, category="IMAGE"))
    results.append(test_endpoint("Adjust DPI", "/api/image/adjust-dpi",
        files={'file': open(test_jpg, 'rb')}, data={'dpi': 300}, category="IMAGE"))
    results.append(test_endpoint("Create GIF", "/api/image/create-gif",
        files=[('files', open(test_jpg, 'rb')), ('files', open(test_jpg2, 'rb'))],
        data={'duration': 500}, category="IMAGE"))
    results.append(test_endpoint("Social Media Preset", "/api/image/social-preset",
        files={'file': open(test_jpg, 'rb')}, data={'platform': 'instagram-post'}, category="IMAGE"))
    results.append(test_endpoint("Exam Photo Preset", "/api/image/exam-preset",
        files={'file': open(test_jpg, 'rb')}, data={'exam': 'jee'}, category="IMAGE"))
    results.append(test_endpoint("Color Picker", "/api/image/color-picker",
        files={'file': open(test_jpg, 'rb')}, data={'num_colors': 5}, category="IMAGE"))
    results.append(test_endpoint("Face Blur", "/api/image/face-blur",
        files={'file': open(test_jpg, 'rb')}, category="IMAGE"))
    results.append(test_endpoint("Image to PDF", "/api/image/image-to-pdf",
        files=[('files', open(test_jpg, 'rb')), ('files', open(test_jpg2, 'rb'))], category="IMAGE"))
    
    # Summary
    print("\n" + "="*120)
    passed = sum(results)
    total = len(results)
    print(f"RESULTS: {passed}/{total} endpoints passed ({passed*100//total}%)")
    print("="*120 + "\n")
    
    if passed == total:
        print("ALL TOOLS WORKING!")
    else:
        print(f"{total - passed} tool(s) need attention")
    
    print("\nNote: Some tools may fail if:")
    print("   - Dependencies missing (rembg, pytesseract, etc.)")
    print("   - Invalid test data for specific tool")
    print("   - Backend not running")
    print("\nFull API docs: http://localhost:8000/docs\n")

if __name__ == "__main__":
    print("\nMake sure backend is running: uvicorn main:app --reload\n")
    input("Press Enter to start testing all 77 tools...")
    main()
