import type { ToolOptionsState } from '../components/tools/ToolLayout'
import CompressPdfOptions from './CompressPdfOptions'
import SplitPdfOptions from './SplitPdfOptions'
import ProtectPdfOptions from './ProtectPdfOptions'
import UnlockPdfOptions from './UnlockPdfOptions'
import IdCardLayoutOptions from './IdCardLayoutOptions'
import WatermarkPdfOptions from './WatermarkPdfOptions'
import RotatePdfOptions from './RotatePdfOptions'
import OcrPdfOptions from './OcrPdfOptions'

interface OptionsSlotProps {
  options: ToolOptionsState
  setOptions: React.Dispatch<React.SetStateAction<ToolOptionsState>>
}

const ID_CARD_TOOLS = [
  'aadhar-cutter', 'aadhar-advanced', 'pan-cutter', 'voter-cutter',
  'jan-aadhar-cutter', 'ecard-cutter', 'multi-id-cutter',
]

export function renderToolOptions(
  toolId: string,
  options: ToolOptionsState,
  setOptions: React.Dispatch<React.SetStateAction<ToolOptionsState>>
): React.ReactNode {
  const props: OptionsSlotProps = { options, setOptions }
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
