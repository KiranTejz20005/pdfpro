import { useState, useRef, useEffect } from 'react'
import type { ToolOptionsState } from '../components/tools/ToolLayout'

interface CropImageOptionsProps {
  options: ToolOptionsState
  setOptions: (options: ToolOptionsState) => void
  files?: File[]
}

export default function CropImageOptions({ options, setOptions, files }: CropImageOptionsProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [startPos, setStartPos] = useState({ x: 0, y: 0 })
  const [cropArea, setCropArea] = useState({ x: 0, y: 0, width: 100, height: 100 })
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const imgRef = useRef<HTMLImageElement>(null)

  useEffect(() => {
    if (files && files[0]) {
      const url = URL.createObjectURL(files[0])
      setImageUrl(url)
      return () => URL.revokeObjectURL(url)
    }
  }, [files])

  useEffect(() => {
    if (imageUrl && imgRef.current) {
      const img = imgRef.current
      img.onload = () => {
        setImageDimensions({ width: img.naturalWidth, height: img.naturalHeight })
        setCropArea({ x: 0, y: 0, width: Math.min(500, img.naturalWidth), height: Math.min(500, img.naturalHeight) })
      }
    }
  }, [imageUrl])

  useEffect(() => {
    setOptions({ x: cropArea.x, y: cropArea.y, width: cropArea.width, height: cropArea.height })
  }, [cropArea, setOptions])

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    const scaleX = imageDimensions.width / rect.width
    const scaleY = imageDimensions.height / rect.height
    const x = (e.clientX - rect.left) * scaleX
    const y = (e.clientY - rect.top) * scaleY
    setStartPos({ x, y })
    setIsDragging(true)
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging) return
    const canvas = canvasRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    const scaleX = imageDimensions.width / rect.width
    const scaleY = imageDimensions.height / rect.height
    const x = (e.clientX - rect.left) * scaleX
    const y = (e.clientY - rect.top) * scaleY
    
    const newX = Math.min(startPos.x, x)
    const newY = Math.min(startPos.y, y)
    const newWidth = Math.abs(x - startPos.x)
    const newHeight = Math.abs(y - startPos.y)
    
    setCropArea({ x: Math.round(newX), y: Math.round(newY), width: Math.round(newWidth), height: Math.round(newHeight) })
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  useEffect(() => {
    const canvas = canvasRef.current
    const img = imgRef.current
    if (!canvas || !img || !imageUrl) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const displayWidth = 600
    const displayHeight = (imageDimensions.height / imageDimensions.width) * displayWidth
    canvas.width = displayWidth
    canvas.height = displayHeight

    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.drawImage(img, 0, 0, displayWidth, displayHeight)

    const scaleX = displayWidth / imageDimensions.width
    const scaleY = displayHeight / imageDimensions.height

    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    ctx.clearRect(cropArea.x * scaleX, cropArea.y * scaleY, cropArea.width * scaleX, cropArea.height * scaleY)
    ctx.drawImage(img, cropArea.x, cropArea.y, cropArea.width, cropArea.height, cropArea.x * scaleX, cropArea.y * scaleY, cropArea.width * scaleX, cropArea.height * scaleY)

    ctx.strokeStyle = '#4CAF50'
    ctx.lineWidth = 2
    ctx.strokeRect(cropArea.x * scaleX, cropArea.y * scaleY, cropArea.width * scaleX, cropArea.height * scaleY)
  }, [imageUrl, imageDimensions, cropArea])

  if (!imageUrl) {
    return <div style={{ padding: 16, color: '#6B7280', fontSize: '0.9rem' }}>Upload an image to start cropping</div>
  }

  return (
    <div style={{ padding: '16px 0' }}>
      <img ref={imgRef} src={imageUrl} style={{ display: 'none' }} alt="" />
      <div style={{ marginBottom: 16 }}>
        <label style={{ display: 'block', marginBottom: 8, fontSize: '0.9rem', fontWeight: 500, color: '#1A1A1A' }}>
          Drag on image to select crop area
        </label>
        <canvas
          ref={canvasRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          style={{ border: '1px solid #E5E7EB', borderRadius: 8, cursor: 'crosshair', maxWidth: '100%', display: 'block' }}
        />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div>
          <label style={{ display: 'block', marginBottom: 6, fontSize: '0.85rem', color: '#6B7280' }}>X: {cropArea.x}px</label>
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: 6, fontSize: '0.85rem', color: '#6B7280' }}>Y: {cropArea.y}px</label>
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: 6, fontSize: '0.85rem', color: '#6B7280' }}>Width: {cropArea.width}px</label>
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: 6, fontSize: '0.85rem', color: '#6B7280' }}>Height: {cropArea.height}px</label>
        </div>
      </div>
    </div>
  )
}
