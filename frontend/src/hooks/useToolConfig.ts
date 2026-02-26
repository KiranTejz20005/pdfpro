import { useParams } from 'react-router-dom'
import { getToolById } from '../config/toolsRegistry'

export function useToolConfig() {
  const { toolId } = useParams<{ toolId: string }>()
  const config = toolId ? getToolById(toolId) : undefined
  return { toolId: toolId ?? null, config }
}
