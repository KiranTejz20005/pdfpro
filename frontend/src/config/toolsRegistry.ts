import type { CategoryId } from './categories'

export interface ToolConfig {
  id: string
  title: string
  description: string
  category: CategoryId
  subcategory?: string
  keywords: string[]
  accept: string
  multiple: boolean
  apiEndpoint: string
  method: 'POST' | 'GET'
  primaryActionLabel: string
  outputFilename?: string
  /** For tools that return JSON instead of file (e.g. pdf-reader) */
  responseType?: 'blob' | 'json'
  /** Optional: name of options component to render */
  optionsKey?: string
  /** If set, tool is shown in these categories as well */
  categories?: CategoryId[]
}

export const TOOLS: ToolConfig[] = [
  // --- Convert (PDF converters) ---
  { id: 'pdf-to-word', title: 'PDF to Word', description: 'Convert PDF documents to editable Word files (.docx)', category: 'convert', keywords: ['pdf', 'word', 'docx', 'convert'], accept: '.pdf', multiple: false, apiEndpoint: '/api/convert/pdf-to-word', method: 'POST', primaryActionLabel: 'Convert to Word', outputFilename: 'converted.docx' },
  { id: 'pdf-to-ppt', title: 'PDF to PowerPoint', description: 'Convert PDF to PowerPoint presentation (.pptx)', category: 'convert', keywords: ['pdf', 'powerpoint', 'ppt', 'pptx', 'convert'], accept: '.pdf', multiple: false, apiEndpoint: '/api/convert/pdf-to-ppt', method: 'POST', primaryActionLabel: 'Convert to PPT', outputFilename: 'converted.pptx' },
  { id: 'pdf-to-excel', title: 'PDF to Excel', description: 'Extract tables from PDF into Excel spreadsheet (.xlsx)', category: 'convert', keywords: ['pdf', 'excel', 'xlsx', 'convert', 'table'], accept: '.pdf', multiple: false, apiEndpoint: '/api/convert/pdf-to-excel', method: 'POST', primaryActionLabel: 'Convert to Excel', outputFilename: 'converted.xlsx' },
  { id: 'pdf-to-jpg', title: 'PDF to JPG', description: 'Convert PDF pages to JPG images with quality options', category: 'convert', categories: ['image'], keywords: ['pdf', 'jpg', 'image', 'convert'], accept: '.pdf', multiple: false, apiEndpoint: '/api/convert/pdf-to-jpg', method: 'POST', primaryActionLabel: 'Convert to JPG' },
  { id: 'pdf-to-pdfa', title: 'PDF to PDF/A', description: 'Convert to PDF/A archival format for long-term archiving', category: 'convert', keywords: ['pdf', 'pdfa', 'archive', 'convert'], accept: '.pdf', multiple: false, apiEndpoint: '/api/convert/pdf-to-pdfa', method: 'POST', primaryActionLabel: 'Convert to PDF/A', outputFilename: 'converted.pdf' },
  { id: 'word-to-pdf', title: 'Word to PDF', description: 'Convert Word documents (.docx, .doc) to PDF format', category: 'convert', keywords: ['word', 'docx', 'pdf', 'convert'], accept: '.doc,.docx', multiple: false, apiEndpoint: '/api/convert/word-to-pdf', method: 'POST', primaryActionLabel: 'Convert to PDF', outputFilename: 'converted.pdf' },
  { id: 'excel-to-pdf', title: 'Excel to PDF', description: 'Convert Excel spreadsheets (.xlsx, .xls) to PDF', category: 'convert', keywords: ['excel', 'xlsx', 'pdf', 'convert'], accept: '.xls,.xlsx', multiple: false, apiEndpoint: '/api/convert/excel-to-pdf', method: 'POST', primaryActionLabel: 'Convert to PDF', outputFilename: 'converted.pdf' },
  { id: 'ppt-to-pdf', title: 'PowerPoint to PDF', description: 'Convert PowerPoint presentations (.pptx, .ppt) to PDF', category: 'convert', keywords: ['powerpoint', 'ppt', 'pptx', 'pdf', 'convert'], accept: '.ppt,.pptx', multiple: false, apiEndpoint: '/api/convert/ppt-to-pdf', method: 'POST', primaryActionLabel: 'Convert to PDF', outputFilename: 'converted.pdf' },
  { id: 'jpg-to-pdf', title: 'JPG to PDF', description: 'Convert an image to a PDF document', category: 'convert', categories: ['image'], keywords: ['jpg', 'image', 'pdf', 'convert'], accept: 'image/*', multiple: false, apiEndpoint: '/api/convert/image-to-pdf', method: 'POST', primaryActionLabel: 'Convert to PDF', outputFilename: 'converted.pdf' },
  { id: 'html-to-pdf', title: 'HTML to PDF', description: 'Convert HTML files or web URLs to PDF documents', category: 'convert', keywords: ['html', 'url', 'pdf', 'convert'], accept: '.html,.htm', multiple: false, apiEndpoint: '/api/convert/html-to-pdf', method: 'POST', primaryActionLabel: 'Convert to PDF', outputFilename: 'converted.pdf' },
  // --- PDF tools ---
  { id: 'merge-pdf', title: 'Merge PDF', description: 'Combine multiple PDF files into one document', category: 'pdf', subcategory: 'merge-organize', keywords: ['merge', 'combine', 'pdf'], accept: '.pdf', multiple: true, apiEndpoint: '/api/pdf/merge', method: 'POST', primaryActionLabel: 'Merge PDFs', outputFilename: 'merged.pdf' },
  { id: 'split-pdf', title: 'Split PDF', description: 'Split PDF into multiple files by page ranges', category: 'pdf', subcategory: 'merge-organize', keywords: ['split', 'pdf', 'pages'], accept: '.pdf', multiple: false, apiEndpoint: '/api/pdf/split', method: 'POST', primaryActionLabel: 'Split PDF', optionsKey: 'split-pdf' },
  { id: 'compress-pdf', title: 'Compress PDF', description: 'Reduce PDF file size with quality options', category: 'pdf', subcategory: 'optimize', keywords: ['compress', 'reduce', 'size', 'pdf'], accept: '.pdf', multiple: false, apiEndpoint: '/api/pdf/compress', method: 'POST', primaryActionLabel: 'Compress PDF', outputFilename: 'compressed.pdf', optionsKey: 'compress-pdf' },
  { id: 'watermark-pdf', title: 'Watermark PDF', description: 'Add text watermarks to PDF pages', category: 'pdf', subcategory: 'advanced', keywords: ['watermark', 'pdf', 'text'], accept: '.pdf', multiple: false, apiEndpoint: '/api/pdf/watermark', method: 'POST', primaryActionLabel: 'Add Watermark', outputFilename: 'watermarked.pdf', optionsKey: 'watermark-pdf' },
  { id: 'rotate-pdf', title: 'Rotate PDF', description: 'Rotate PDF pages by 90, 180, or 270 degrees', category: 'pdf', subcategory: 'advanced', keywords: ['rotate', 'pdf', 'pages'], accept: '.pdf', multiple: false, apiEndpoint: '/api/pdf/rotate', method: 'POST', primaryActionLabel: 'Rotate PDF', optionsKey: 'rotate-pdf' },
  { id: 'add-page-numbers', title: 'Add Page Numbers', description: 'Add page numbers to PDF with custom formatting', category: 'pdf', subcategory: 'advanced', keywords: ['page', 'numbers', 'pdf'], accept: '.pdf', multiple: false, apiEndpoint: '/api/pdf/add-page-numbers', method: 'POST', primaryActionLabel: 'Add Page Numbers', outputFilename: 'numbered.pdf', optionsKey: 'add-page-numbers' },
  { id: 'protect-pdf', title: 'Protect PDF', description: 'Add password protection to PDF files', category: 'pdf', subcategory: 'security', keywords: ['protect', 'password', 'pdf', 'encrypt'], accept: '.pdf', multiple: false, apiEndpoint: '/api/pdf/protect', method: 'POST', primaryActionLabel: 'Protect PDF', outputFilename: 'protected.pdf', optionsKey: 'protect-pdf' },
  { id: 'unlock-pdf', title: 'Unlock PDF', description: 'Remove password protection from PDF files', category: 'pdf', subcategory: 'security', keywords: ['unlock', 'password', 'pdf', 'remove'], accept: '.pdf', multiple: false, apiEndpoint: '/api/pdf/unlock', method: 'POST', primaryActionLabel: 'Unlock PDF', outputFilename: 'unlocked.pdf', optionsKey: 'unlock-pdf' },
  { id: 'crop-pdf', title: 'Crop PDF', description: 'Crop PDF pages to remove margins and borders', category: 'pdf', subcategory: 'advanced', keywords: ['crop', 'pdf', 'margins'], accept: '.pdf', multiple: false, apiEndpoint: '/api/pdf/crop', method: 'POST', primaryActionLabel: 'Crop PDF', outputFilename: 'cropped.pdf', optionsKey: 'crop-pdf' },
  { id: 'organize-pdf', title: 'Organize PDF', description: 'Reorder PDF pages in custom sequence', category: 'pdf', subcategory: 'merge-organize', keywords: ['organize', 'reorder', 'pdf', 'pages'], accept: '.pdf', multiple: false, apiEndpoint: '/api/pdf/organize', method: 'POST', primaryActionLabel: 'Organize PDF', outputFilename: 'organized.pdf', optionsKey: 'organize-pdf' },
  { id: 'remove-pages', title: 'Remove Pages', description: 'Delete specific pages from PDF documents', category: 'pdf', subcategory: 'merge-organize', keywords: ['remove', 'delete', 'pages', 'pdf'], accept: '.pdf', multiple: false, apiEndpoint: '/api/pdf/remove-pages', method: 'POST', primaryActionLabel: 'Remove Pages', outputFilename: 'removed.pdf', optionsKey: 'remove-pages' },
  { id: 'sign-pdf', title: 'Sign PDF', description: 'Add signature image to PDF documents. Upload PDF first, then signature image.', category: 'pdf', subcategory: 'security', keywords: ['sign', 'signature', 'pdf'], accept: '.pdf,image/*', multiple: true, apiEndpoint: '/api/pdf/sign', method: 'POST', primaryActionLabel: 'Sign PDF', outputFilename: 'signed.pdf', optionsKey: 'sign-pdf' },
  { id: 'ocr-pdf', title: 'OCR PDF', description: 'Extract text from scanned PDFs using OCR', category: 'pdf', categories: ['ai'], subcategory: 'scan-ocr', keywords: ['ocr', 'scan', 'text', 'pdf', 'ai'], accept: '.pdf', multiple: false, apiEndpoint: '/api/pdf/ocr', method: 'POST', primaryActionLabel: 'Run OCR', outputFilename: 'ocr.pdf' },
  { id: 'edit-pdf', title: 'Edit PDF', description: 'Add text and annotations to PDF pages', category: 'pdf', subcategory: 'advanced', keywords: ['edit', 'annotate', 'pdf', 'text'], accept: '.pdf', multiple: false, apiEndpoint: '/api/pdf/edit', method: 'POST', primaryActionLabel: 'Edit PDF', outputFilename: 'edited.pdf', optionsKey: 'edit-pdf' },
  { id: 'compare-pdf', title: 'Compare PDF', description: 'Compare two PDF files and highlight differences', category: 'pdf', categories: ['utilities'], subcategory: 'advanced', keywords: ['compare', 'diff', 'pdf'], accept: '.pdf', multiple: true, apiEndpoint: '/api/pdf/compare', method: 'POST', primaryActionLabel: 'Compare PDFs', outputFilename: 'comparison.pdf' },
  { id: 'repair-pdf', title: 'Repair PDF', description: 'Attempt to repair corrupted PDF files', category: 'pdf', categories: ['utilities'], subcategory: 'advanced', keywords: ['repair', 'corrupt', 'fix', 'pdf'], accept: '.pdf', multiple: false, apiEndpoint: '/api/pdf/repair', method: 'POST', primaryActionLabel: 'Repair PDF', outputFilename: 'repaired.pdf', responseType: 'blob' },
  { id: 'scan-to-pdf', title: 'Scan to PDF', description: 'Convert phone photos of documents to clean PDF', category: 'pdf', categories: ['image'], subcategory: 'scan-ocr', keywords: ['scan', 'photo', 'image', 'pdf'], accept: 'image/*', multiple: true, apiEndpoint: '/api/pdf/scan-to-pdf', method: 'POST', primaryActionLabel: 'Create PDF', outputFilename: 'scanned.pdf', optionsKey: 'scan-to-pdf' },
  { id: 'pdf-reader', title: 'PDF Reader', description: 'View PDF info, metadata, and page thumbnails', category: 'pdf', categories: ['utilities'], subcategory: 'advanced', keywords: ['read', 'view', 'metadata', 'pdf', 'thumbnails'], accept: '.pdf', multiple: false, apiEndpoint: '/api/pdf/read', method: 'POST', primaryActionLabel: 'Read PDF', responseType: 'json' },
  // --- Image (also in convert) ---
  // jpg-to-pdf, pdf-to-jpg, scan-to-pdf already listed above; they belong to image category too. We list by primary category; for category page we filter by category.
  // --- ID Cards ---
  { id: 'aadhar-cutter', title: 'Aadhar Card Cutter', description: 'Crop Aadhar card from UIDAI PDF for printing', category: 'id-cards', keywords: ['aadhar', 'uidai', 'crop', 'id', 'card'], accept: '.pdf', multiple: false, apiEndpoint: '/api/cards/aadhar-cut', method: 'POST', primaryActionLabel: 'Cut Aadhar', outputFilename: 'aadhar_print.pdf', optionsKey: 'aadhar-cutter' },
  { id: 'aadhar-advanced', title: 'Advanced Aadhar', description: 'QR detection + manual crop + border styles for Aadhar', category: 'id-cards', categories: ['ai'], keywords: ['aadhar', 'qr', 'advanced', 'id', 'card', 'ai'], accept: '.pdf', multiple: false, apiEndpoint: '/api/cards/aadhar-advanced', method: 'POST', primaryActionLabel: 'Process Aadhar', outputFilename: 'aadhar_print.pdf', optionsKey: 'aadhar-advanced' },
  { id: 'pan-cutter', title: 'PAN Card Cutter', description: 'Crop PAN card from Income Tax Department PDF', category: 'id-cards', keywords: ['pan', 'card', 'crop', 'id'], accept: '.pdf', multiple: false, apiEndpoint: '/api/cards/pan-cut', method: 'POST', primaryActionLabel: 'Cut PAN', outputFilename: 'pan_card_print.pdf', optionsKey: 'pan-cutter' },
  { id: 'voter-cutter', title: 'Voter ID Cutter', description: 'Crop eEPIC Voter ID card (front/back support)', category: 'id-cards', keywords: ['voter', 'epic', 'id', 'card', 'crop'], accept: '.pdf', multiple: false, apiEndpoint: '/api/cards/voter-cut', method: 'POST', primaryActionLabel: 'Cut Voter ID', outputFilename: 'voter_id_print.pdf', optionsKey: 'voter-cutter' },
  { id: 'jan-aadhar-cutter', title: 'JAN Aadhar Cutter', description: 'Crop JAN Aadhar card (Rajasthan government)', category: 'id-cards', keywords: ['jan', 'aadhar', 'rajasthan', 'id', 'card'], accept: '.pdf', multiple: false, apiEndpoint: '/api/cards/jan-aadhar-cut', method: 'POST', primaryActionLabel: 'Cut JAN Aadhar', outputFilename: 'jan_aadhar_print.pdf', optionsKey: 'jan-aadhar-cutter' },
  { id: 'ecard-cutter', title: 'eCard Cutter', description: 'Universal auto-detect cutter for any government ID card', category: 'id-cards', keywords: ['ecard', 'id', 'card', 'crop', 'auto'], accept: '.pdf', multiple: false, apiEndpoint: '/api/cards/ecard-cut', method: 'POST', primaryActionLabel: 'Cut Card', outputFilename: 'ecard_print.pdf' },
  { id: 'multi-id-cutter', title: 'Multi-ID Tool', description: 'Detect and crop ALL ID cards from any PDF at once', category: 'id-cards', keywords: ['multi', 'id', 'card', 'batch', 'crop'], accept: '.pdf', multiple: false, apiEndpoint: '/api/cards/multi-id-cut', method: 'POST', primaryActionLabel: 'Cut All Cards', outputFilename: 'multi_id_print.pdf' },
]

export function getToolsByCategory(categoryId: CategoryId): ToolConfig[] {
  return TOOLS.filter(
    (t) => t.category === categoryId || t.categories?.includes(categoryId)
  )
}

export function getToolById(id: string): ToolConfig | undefined {
  return TOOLS.find((t) => t.id === id)
}

export function searchTools(query: string): ToolConfig[] {
  const q = query.trim().toLowerCase()
  if (!q) return []
  return TOOLS.filter(
    (t) =>
      t.title.toLowerCase().includes(q) ||
      t.description.toLowerCase().includes(q) ||
      t.keywords.some((k) => k.toLowerCase().includes(q))
  )
}
