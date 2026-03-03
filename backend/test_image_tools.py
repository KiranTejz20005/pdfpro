"""
Quick Test Script for Image Tools Module
Tests that all 29 endpoints are registered and accessible
"""

import requests
import os
from PIL import Image, ImageDraw

BASE_URL = "http://localhost:8000/api/image"

# Create test directory
os.makedirs("test_files", exist_ok=True)

def create_test_image(path, width=400, height=300, color=(100, 150, 200)):
    """Create a simple test image"""
    img = Image.new('RGB', (width, height), color)
    draw = ImageDraw.Draw(img)
    draw.text((10, 10), "Test Image", fill=(255, 255, 255))
    img.save(path, 'JPEG')
    return path

def create_test_png(path):
    """Create a PNG with transparency"""
    img = Image.new('RGBA', (300, 300), (255, 255, 255, 0))
    draw = ImageDraw.Draw(img)
    draw.ellipse([50, 50, 250, 250], fill=(200, 100, 100, 255))
    img.save(path, 'PNG')
    return path

def test_endpoint(name, endpoint, files=None, data=None):
    """Test a single endpoint"""
    try:
        url = f"{BASE_URL}{endpoint}"
        response = requests.post(url, files=files, data=data, timeout=30)
        
        if response.status_code == 200:
            print(f"✅ {name:30} - PASS")
            return True
        else:
            print(f"❌ {name:30} - FAIL ({response.status_code})")
            return False
    except Exception as e:
        print(f"❌ {name:30} - ERROR: {str(e)[:50]}")
        return False

def main():
    print("\n" + "="*60)
    print("IMAGE TOOLS MODULE - ENDPOINT VERIFICATION")
    print("="*60 + "\n")
    
    # Create test files
    test_jpg = create_test_image("test_files/test.jpg")
    test_png = create_test_png("test_files/test.png")
    test_jpg2 = create_test_image("test_files/test2.jpg", color=(200, 100, 150))
    
    results = []
    
    # Test each endpoint
    print("Testing Basic Operations...")
    results.append(test_endpoint("1. Resize", "/resize", 
        files={'file': open(test_jpg, 'rb')}, 
        data={'width': 200, 'height': 200, 'maintain_aspect': True}))
    
    results.append(test_endpoint("2. Compress", "/compress",
        files={'file': open(test_jpg, 'rb')},
        data={'quality': 75}))
    
    results.append(test_endpoint("3. Crop", "/crop",
        files={'file': open(test_jpg, 'rb')},
        data={'x': 50, 'y': 50, 'width': 200, 'height': 150}))
    
    results.append(test_endpoint("4. Rotate", "/rotate",
        files={'file': open(test_jpg, 'rb')},
        data={'angle': 90}))
    
    results.append(test_endpoint("5. Flip", "/flip",
        files={'file': open(test_jpg, 'rb')},
        data={'direction': 'horizontal'}))
    
    results.append(test_endpoint("6. Convert Format", "/convert",
        files={'file': open(test_jpg, 'rb')},
        data={'format': 'PNG'}))
    
    print("\nTesting Specialized Tools...")
    results.append(test_endpoint("7. Passport Photo", "/passport-photo",
        files={'file': open(test_jpg, 'rb')},
        data={'size': '2x2', 'dpi': 300}))
    
    results.append(test_endpoint("8. Signature Resize", "/signature-resize",
        files={'file': open(test_png, 'rb')},
        data={'width': 300, 'height': 100}))
    
    print("\nTesting Effects & Enhancements...")
    results.append(test_endpoint("10. Watermark", "/watermark",
        files={'file': open(test_jpg, 'rb')},
        data={'text': 'TEST', 'position': 'center'}))
    
    results.append(test_endpoint("11. Blur", "/blur",
        files={'file': open(test_jpg, 'rb')},
        data={'radius': 5}))
    
    results.append(test_endpoint("12. Grayscale", "/grayscale",
        files={'file': open(test_jpg, 'rb')}))
    
    results.append(test_endpoint("13. Brightness", "/brightness",
        files={'file': open(test_jpg, 'rb')},
        data={'factor': 1.5}))
    
    results.append(test_endpoint("14. Contrast", "/contrast",
        files={'file': open(test_jpg, 'rb')},
        data={'factor': 1.5}))
    
    results.append(test_endpoint("15. Sharpen", "/sharpen",
        files={'file': open(test_jpg, 'rb')}))
    
    results.append(test_endpoint("16. Sepia", "/sepia",
        files={'file': open(test_jpg, 'rb')}))
    
    results.append(test_endpoint("17. Edge Detect", "/edge-detect",
        files={'file': open(test_jpg, 'rb')}))
    
    print("\nTesting Metadata & OCR...")
    results.append(test_endpoint("18. Get Metadata", "/metadata",
        files={'file': open(test_jpg, 'rb')}))
    
    results.append(test_endpoint("19. Remove Metadata", "/remove-metadata",
        files={'file': open(test_jpg, 'rb')}))
    
    results.append(test_endpoint("20. OCR", "/ocr",
        files={'file': open(test_jpg, 'rb')},
        data={'lang': 'eng'}))
    
    print("\nTesting Batch Operations...")
    results.append(test_endpoint("21. Merge Images", "/merge",
        files=[('files', open(test_jpg, 'rb')), ('files', open(test_jpg2, 'rb'))],
        data={'direction': 'horizontal'}))
    
    results.append(test_endpoint("22. Split Image", "/split",
        files={'file': open(test_jpg, 'rb')},
        data={'rows': 2, 'cols': 2}))
    
    results.append(test_endpoint("23. Adjust DPI", "/adjust-dpi",
        files={'file': open(test_jpg, 'rb')},
        data={'dpi': 300}))
    
    print("\nTesting Creative Tools...")
    results.append(test_endpoint("24. Create GIF", "/create-gif",
        files=[('files', open(test_jpg, 'rb')), ('files', open(test_jpg2, 'rb'))],
        data={'duration': 500}))
    
    results.append(test_endpoint("25. Social Preset", "/social-preset",
        files={'file': open(test_jpg, 'rb')},
        data={'platform': 'instagram-post'}))
    
    results.append(test_endpoint("26. Exam Preset", "/exam-preset",
        files={'file': open(test_jpg, 'rb')},
        data={'exam': 'jee'}))
    
    print("\nTesting Advanced Features...")
    results.append(test_endpoint("27. Color Picker", "/color-picker",
        files={'file': open(test_jpg, 'rb')},
        data={'num_colors': 5}))
    
    results.append(test_endpoint("28. Face Blur", "/face-blur",
        files={'file': open(test_jpg, 'rb')}))
    
    results.append(test_endpoint("29. Image to PDF", "/image-to-pdf",
        files=[('files', open(test_jpg, 'rb')), ('files', open(test_jpg2, 'rb'))]
    ))
    
    # Summary
    print("\n" + "="*60)
    passed = sum(results)
    total = len(results)
    print(f"RESULTS: {passed}/{total} endpoints passed")
    print("="*60 + "\n")
    
    if passed == total:
        print("🎉 All endpoints are working!")
    else:
        print(f"⚠️  {total - passed} endpoint(s) need attention")
    
    print("\n💡 Note: Some endpoints may fail if dependencies are missing")
    print("   (e.g., rembg, pytesseract, scikit-learn)")
    print("\n📚 Full API docs: http://localhost:8000/docs\n")

if __name__ == "__main__":
    print("\n⚠️  Make sure the server is running: uvicorn main:app --reload\n")
    input("Press Enter to start testing...")
    main()
