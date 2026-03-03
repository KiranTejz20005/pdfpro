export type FieldType = 'number' | 'text' | 'select' | 'toggle' | 'slider'

export interface ToolField {
  name: string
  label: string
  type: FieldType
  defaultValue: string | number | boolean
  min?: number
  max?: number
  step?: number
  options?: Array<{ value: string; label: string }>
  placeholder?: string
}

export const TOOL_FIELDS: Record<string, ToolField[]> = {
  'resize-image': [
    { name: 'width', label: 'Width (px)', type: 'number', defaultValue: 800, min: 1, max: 10000 },
    { name: 'height', label: 'Height (px)', type: 'number', defaultValue: 600, min: 1, max: 10000 },
    { name: 'maintain_aspect', label: 'Maintain Aspect Ratio', type: 'toggle', defaultValue: true }
  ],
  'compress-image': [
    { name: 'quality', label: 'Quality', type: 'slider', defaultValue: 75, min: 1, max: 100 }
  ],
  'crop-image': [
    { name: 'x', label: 'X Position (px)', type: 'number', defaultValue: 0, min: 0 },
    { name: 'y', label: 'Y Position (px)', type: 'number', defaultValue: 0, min: 0 },
    { name: 'width', label: 'Width (px)', type: 'number', defaultValue: 100, min: 1 },
    { name: 'height', label: 'Height (px)', type: 'number', defaultValue: 100, min: 1 }
  ],
  'rotate-image': [
    { name: 'angle', label: 'Angle (degrees)', type: 'number', defaultValue: 90, min: -360, max: 360 }
  ],
  'flip-image': [
    { name: 'direction', label: 'Direction', type: 'select', defaultValue: 'horizontal', options: [
      { value: 'horizontal', label: 'Horizontal' },
      { value: 'vertical', label: 'Vertical' }
    ]}
  ],
  'convert-image': [
    { name: 'format', label: 'Output Format', type: 'select', defaultValue: 'PNG', options: [
      { value: 'JPEG', label: 'JPEG' },
      { value: 'PNG', label: 'PNG' },
      { value: 'WEBP', label: 'WEBP' },
      { value: 'BMP', label: 'BMP' }
    ]}
  ],
  'passport-photo': [
    { name: 'size', label: 'Photo Size', type: 'select', defaultValue: '2x2', options: [
      { value: '2x2', label: '2x2 inch' },
      { value: '35x45', label: '35x45mm (Passport)' },
      { value: 'passport', label: 'Passport' },
      { value: 'visa', label: 'Visa' },
      { value: 'aadhaar', label: 'Aadhaar' }
    ]},
    { name: 'dpi', label: 'DPI', type: 'number', defaultValue: 300, min: 72, max: 600 }
  ],
  'signature-resize': [
    { name: 'width', label: 'Width (px)', type: 'number', defaultValue: 300, min: 50, max: 1000 },
    { name: 'height', label: 'Height (px)', type: 'number', defaultValue: 100, min: 20, max: 500 }
  ],
  'watermark-image': [
    { name: 'text', label: 'Watermark Text', type: 'text', defaultValue: 'Watermark', placeholder: 'Enter text' },
    { name: 'position', label: 'Position', type: 'select', defaultValue: 'bottom-right', options: [
      { value: 'top-left', label: 'Top Left' },
      { value: 'top-right', label: 'Top Right' },
      { value: 'bottom-left', label: 'Bottom Left' },
      { value: 'bottom-right', label: 'Bottom Right' },
      { value: 'center', label: 'Center' }
    ]},
    { name: 'opacity', label: 'Opacity', type: 'slider', defaultValue: 128, min: 0, max: 255 }
  ],
  'blur-image': [
    { name: 'radius', label: 'Blur Radius', type: 'slider', defaultValue: 5, min: 1, max: 50 }
  ],
  'brightness-image': [
    { name: 'factor', label: 'Brightness Factor', type: 'slider', defaultValue: 1.5, min: 0.1, max: 3, step: 0.1 }
  ],
  'contrast-image': [
    { name: 'factor', label: 'Contrast Factor', type: 'slider', defaultValue: 1.5, min: 0.1, max: 3, step: 0.1 }
  ],
  'merge-images': [
    { name: 'direction', label: 'Direction', type: 'select', defaultValue: 'vertical', options: [
      { value: 'vertical', label: 'Vertical' },
      { value: 'horizontal', label: 'Horizontal' }
    ]}
  ],
  'split-image': [
    { name: 'rows', label: 'Rows', type: 'number', defaultValue: 2, min: 1, max: 10 },
    { name: 'cols', label: 'Columns', type: 'number', defaultValue: 2, min: 1, max: 10 }
  ],
  'adjust-dpi': [
    { name: 'dpi', label: 'DPI', type: 'number', defaultValue: 300, min: 72, max: 1200 }
  ],
  'create-gif': [
    { name: 'duration', label: 'Frame Duration (ms)', type: 'number', defaultValue: 500, min: 50, max: 5000 }
  ],
  'social-preset': [
    { name: 'platform', label: 'Platform', type: 'select', defaultValue: 'instagram-post', options: [
      { value: 'instagram-post', label: 'Instagram Post (1080x1080)' },
      { value: 'instagram-story', label: 'Instagram Story (1080x1920)' },
      { value: 'facebook-post', label: 'Facebook Post (1200x630)' },
      { value: 'twitter-post', label: 'Twitter Post (1200x675)' },
      { value: 'linkedin-post', label: 'LinkedIn Post (1200x627)' },
      { value: 'youtube-thumbnail', label: 'YouTube Thumbnail (1280x720)' }
    ]}
  ],
  'exam-preset': [
    { name: 'exam', label: 'Exam', type: 'select', defaultValue: 'jee', options: [
      { value: 'jee', label: 'JEE' },
      { value: 'neet', label: 'NEET' },
      { value: 'upsc', label: 'UPSC' },
      { value: 'ssc', label: 'SSC' },
      { value: 'gate', label: 'GATE' }
    ]}
  ],
  'color-picker': [
    { name: 'num_colors', label: 'Number of Colors', type: 'number', defaultValue: 5, min: 1, max: 20 }
  ],
  'image-ocr': [
    { name: 'lang', label: 'Language', type: 'select', defaultValue: 'eng', options: [
      { value: 'eng', label: 'English' },
      { value: 'hin', label: 'Hindi' },
      { value: 'spa', label: 'Spanish' },
      { value: 'fra', label: 'French' },
      { value: 'deu', label: 'German' }
    ]}
  ]
}
