export const CATEGORY_IDS = ['pdf', 'image', 'id-cards', 'ai', 'convert', 'utilities'] as const
export type CategoryId = (typeof CATEGORY_IDS)[number]

export const CATEGORY_LABELS: Record<CategoryId, string> = {
  pdf: 'PDF Tools',
  image: 'Image Tools',
  'id-cards': 'ID Cards',
  ai: 'AI Tools',
  convert: 'Convert',
  utilities: 'Utilities',
}

/** PDF subcategories for filter chips */
export const PDF_SUBCATEGORIES = [
  { id: 'all', label: 'All' },
  { id: 'convert', label: 'Convert' },
  { id: 'merge-organize', label: 'Merge & organize' },
  { id: 'optimize', label: 'Optimize' },
  { id: 'security', label: 'Security' },
  { id: 'advanced', label: 'Advanced' },
  { id: 'scan-ocr', label: 'Scan & OCR' },
] as const

export type PdfSubcategoryId = (typeof PDF_SUBCATEGORIES)[number]['id']
