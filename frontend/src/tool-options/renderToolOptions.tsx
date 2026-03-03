import type { ToolOptionsState } from '../components/tools/ToolLayout'
import CompressPdfOptions from './CompressPdfOptions'
import SplitPdfOptions from './SplitPdfOptions'
import ProtectPdfOptions from './ProtectPdfOptions'
import UnlockPdfOptions from './UnlockPdfOptions'
import IdCardLayoutOptions from './IdCardLayoutOptions'
import WatermarkPdfOptions from './WatermarkPdfOptions'
import RotatePdfOptions from './RotatePdfOptions'
import OcrPdfOptions from './OcrPdfOptions'
import DynamicToolOptions from './DynamicToolOptions'
import CropImageOptions from './CropImageOptions'
import { TOOL_FIELDS } from '../config/toolFields'

interface OptionsSlotProps {
  options: ToolOptionsState
  setOptions: React.Dispatch<React.SetStateAction<ToolOptionsState>>
  files?: File[]
}

const ID_CARD_TOOLS = [
  'aadhar-cutter', 'aadhar-advanced', 'pan-cutter', 'voter-cutter',
  'jan-aadhar-cutter', 'ecard-cutter', 'multi-id-cutter',
]

export function renderToolOptions(
  toolId: string,
  options: ToolOptionsState,
  setOptions: React.Dispatch<React.SetStateAction<ToolOptionsState>>,
  files?: File[]
): React.ReactNode {
  const props: OptionsSlotProps = { options, setOptions, files }
  
  // Special case for crop-image with interactive UI
  if (toolId === 'crop-image') {
    return <CropImageOptions {...props} />
  }
  
  // Check if tool has dynamic fields defined
  if (TOOL_FIELDS[toolId]) {
    return <DynamicToolOptions toolId={toolId} options={options} onChange={setOptions} />
  }
  
  // Fallback to hardcoded components
  switch (toolId) {
    case 'compress-pdf':
      return <CompressPdfOptions {...props} />
    case 'split-pdf':
      return <SplitPdfOptions {...props} />
    case 'protect-pdf':
      return <ProtectPdfOptions {...props} />
    case 'unlock-pdf':
      return <UnlockPdfOptions {...props} />
    case 'watermark-pdf':
      return <WatermarkPdfOptions {...props} />
    case 'rotate-pdf':
      return <RotatePdfOptions {...props} />
    case 'ocr-pdf':
      return <OcrPdfOptions {...props} />
    default:
      if (ID_CARD_TOOLS.includes(toolId)) return <IdCardLayoutOptions {...props} />
      return null
  }
}
