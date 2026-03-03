# Image Tools API - Frontend Integration Guide

## Base URL
```
http://localhost:8000/api/image
```

## Quick Reference - All 29 Endpoints

### 1. Basic Operations

#### Resize Image
```javascript
POST /api/image/resize
FormData: {
  file: File,
  width: number,
  height: number,
  maintain_aspect: boolean
}
Returns: Image file
```

#### Compress Image
```javascript
POST /api/image/compress
FormData: {
  file: File,
  quality: number (1-100)
}
Returns: Image file
```

#### Crop Image
```javascript
POST /api/image/crop
FormData: {
  file: File,
  x: number,
  y: number,
  width: number,
  height: number
}
Returns: Image file
```

#### Rotate Image
```javascript
POST /api/image/rotate
FormData: {
  file: File,
  angle: number (degrees)
}
Returns: Image file
```

#### Flip Image
```javascript
POST /api/image/flip
FormData: {
  file: File,
  direction: 'horizontal' | 'vertical'
}
Returns: Image file
```

#### Convert Format
```javascript
POST /api/image/convert
FormData: {
  file: File,
  format: 'JPEG' | 'PNG' | 'WEBP' | 'BMP'
}
Returns: Image file
```

### 2. Specialized Tools

#### Passport Photo
```javascript
POST /api/image/passport-photo
FormData: {
  file: File,
  size: '2x2' | '35x45' | 'passport' | 'visa' | 'aadhaar',
  dpi: number (default: 300)
}
Returns: Image file
```

#### Signature Resize
```javascript
POST /api/image/signature-resize
FormData: {
  file: File,
  width: number (default: 300),
  height: number (default: 100)
}
Returns: PNG file
```

#### Remove Background
```javascript
POST /api/image/remove-background
FormData: {
  file: File
}
Returns: PNG file with transparent background
Note: First call may be slow (downloads AI model)
```

### 3. Effects & Enhancements

#### Add Watermark
```javascript
POST /api/image/watermark
FormData: {
  file: File,
  text: string,
  position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center',
  opacity: number (0-255, default: 128)
}
Returns: Image file
```

#### Blur
```javascript
POST /api/image/blur
FormData: {
  file: File,
  radius: number (default: 5)
}
Returns: Image file
```

#### Grayscale
```javascript
POST /api/image/grayscale
FormData: {
  file: File
}
Returns: Image file
```

#### Adjust Brightness
```javascript
POST /api/image/brightness
FormData: {
  file: File,
  factor: number (0.5-2.0, default: 1.5)
}
Returns: Image file
```

#### Adjust Contrast
```javascript
POST /api/image/contrast
FormData: {
  file: File,
  factor: number (0.5-2.0, default: 1.5)
}
Returns: Image file
```

#### Sharpen
```javascript
POST /api/image/sharpen
FormData: {
  file: File
}
Returns: Image file
```

#### Sepia Effect
```javascript
POST /api/image/sepia
FormData: {
  file: File
}
Returns: Image file
```

#### Edge Detection
```javascript
POST /api/image/edge-detect
FormData: {
  file: File
}
Returns: Image file
```

### 4. Metadata & OCR

#### Get Metadata
```javascript
POST /api/image/metadata
FormData: {
  file: File
}
Returns: JSON {
  filename, format, mode, size, width, height, exif
}
```

#### Remove Metadata
```javascript
POST /api/image/remove-metadata
FormData: {
  file: File
}
Returns: Clean image file
```

#### OCR (Extract Text)
```javascript
POST /api/image/ocr
FormData: {
  file: File,
  lang: string (default: 'eng')
}
Returns: JSON { text: string }
```

### 5. Batch Operations

#### Merge Images
```javascript
POST /api/image/merge
FormData: {
  files: File[] (multiple),
  direction: 'vertical' | 'horizontal'
}
Returns: Merged image file
```

#### Split Image
```javascript
POST /api/image/split
FormData: {
  file: File,
  rows: number,
  cols: number
}
Returns: ZIP file with image tiles
```

#### Adjust DPI
```javascript
POST /api/image/adjust-dpi
FormData: {
  file: File,
  dpi: number (default: 300)
}
Returns: Image file
```

### 6. Creative Tools

#### Create GIF
```javascript
POST /api/image/create-gif
FormData: {
  files: File[] (multiple, 2+),
  duration: number (milliseconds, default: 500)
}
Returns: GIF file
```

#### Social Media Preset
```javascript
POST /api/image/social-preset
FormData: {
  file: File,
  platform: 'instagram-post' | 'instagram-story' | 'facebook-post' | 
           'twitter-post' | 'linkedin-post' | 'youtube-thumbnail'
}
Returns: Resized image file
```

#### Exam Photo Preset
```javascript
POST /api/image/exam-preset
FormData: {
  file: File,
  exam: 'jee' | 'neet' | 'upsc' | 'ssc' | 'gate'
}
Returns: Resized image file
```

### 7. Advanced Features

#### Color Picker
```javascript
POST /api/image/color-picker
FormData: {
  file: File,
  num_colors: number (default: 5)
}
Returns: JSON { colors: ['#RRGGBB', ...] }
```

#### Face Blur
```javascript
POST /api/image/face-blur
FormData: {
  file: File
}
Returns: Image with blurred faces
```

#### Image to PDF
```javascript
POST /api/image/image-to-pdf
FormData: {
  files: File[] (multiple, 1+)
}
Returns: PDF file
```

---

## Example React/TypeScript Usage

```typescript
// Example: Resize Image
const resizeImage = async (file: File, width: number, height: number) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('width', width.toString());
  formData.append('height', height.toString());
  formData.append('maintain_aspect', 'true');
  
  const response = await fetch('http://localhost:8000/api/image/resize', {
    method: 'POST',
    body: formData
  });
  
  if (response.ok) {
    const blob = await response.blob();
    return URL.createObjectURL(blob);
  }
  throw new Error('Resize failed');
};

// Example: Get Metadata (JSON response)
const getMetadata = async (file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await fetch('http://localhost:8000/api/image/metadata', {
    method: 'POST',
    body: formData
  });
  
  if (response.ok) {
    return await response.json();
  }
  throw new Error('Metadata extraction failed');
};

// Example: Merge Multiple Images
const mergeImages = async (files: File[], direction: 'horizontal' | 'vertical') => {
  const formData = new FormData();
  files.forEach(file => formData.append('files', file));
  formData.append('direction', direction);
  
  const response = await fetch('http://localhost:8000/api/image/merge', {
    method: 'POST',
    body: formData
  });
  
  if (response.ok) {
    const blob = await response.blob();
    return URL.createObjectURL(blob);
  }
  throw new Error('Merge failed');
};
```

---

## Response Types

- **Image endpoints**: Return image file (FileResponse)
- **JSON endpoints**: Return JSON data (metadata, OCR, color picker)
- **ZIP endpoints**: Return ZIP file (split images)
- **PDF endpoints**: Return PDF file

---

## Error Handling

All endpoints return standard HTTP status codes:
- `200` - Success
- `400` - Bad request (invalid parameters)
- `413` - File too large (>50MB)
- `500` - Server error

---

## Notes for Frontend

1. **File Size Limit**: 50MB per file
2. **Supported Formats**: JPG, PNG, WEBP, BMP, TIFF, HEIC
3. **Background Removal**: First call may take 10-15 seconds (model download)
4. **Multiple Files**: Use `files` (plural) for endpoints that accept multiple images
5. **Single File**: Use `file` (singular) for single image endpoints

---

## Testing

Test all endpoints at: **http://localhost:8000/docs**

Interactive Swagger UI with:
- Try it out functionality
- Request/response examples
- Parameter descriptions
