import type { ToolOptionsState } from '../components/tools/ToolLayout'
import { useEffect, useRef } from 'react'

interface WatermarkPdfOptionsProps {
  options: ToolOptionsState
  setOptions: React.Dispatch<React.SetStateAction<ToolOptionsState>>
}

export default function WatermarkPdfOptions({ options, setOptions }: WatermarkPdfOptionsProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.fillStyle = '#FFFFFF'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.strokeStyle = '#E0E0E0'
    ctx.strokeRect(0, 0, canvas.width, canvas.height)

    const text = (options.text as string) || 'Watermark'
    const fontSize = (options.font_size as number) || 48
    const rotation = ((options.rotation as number) || 0) * Math.PI / 180
    const color = (options.color as string) || '808080'
    const opacity = (options.opacity as number) || 0.3
    const position = (options.position as string) || 'center'
    const tile = (options.tile as boolean) || false

    ctx.font = `${fontSize}px Arial`
    ctx.fillStyle = `#${color}`
    ctx.globalAlpha = opacity

    const textWidth = ctx.measureText(text).width

    if (tile) {
      const spacing = 150
      for (let y = 0; y < canvas.height + spacing; y += spacing) {
        for (let x = 0; x < canvas.width + spacing; x += spacing) {
          ctx.save()
          ctx.translate(x, y)
          ctx.rotate(rotation)
          ctx.fillText(text, 0, 0)
          ctx.restore()
        }
      }
    } else {
      let x = canvas.width / 2
      let y = canvas.height / 2

      if (position === 'top-left') { x = 50; y = 50 }
      else if (position === 'top-right') { x = canvas.width - 50; y = 50 }
      else if (position === 'bottom-left') { x = 50; y = canvas.height - 50 }
      else if (position === 'bottom-right') { x = canvas.width - 50; y = canvas.height - 50 }

      ctx.save()
      ctx.translate(x, y)
      ctx.rotate(-rotation)
      ctx.fillText(text, -textWidth / 2, fontSize / 3)
      ctx.restore()
    }
  }, [options])

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '250px 1fr', gap: 20, alignItems: 'start' }}>
      <div>
        <label style={{ display: 'block', marginBottom: 6, fontSize: '0.8rem', fontWeight: 600, color: 'var(--text)' }}>
          Live Preview
        </label>
        <canvas
          ref={canvasRef}
          width={400}
          height={280}
          style={{
            width: '100%',
            height: 'auto',
            border: '2px solid var(--border)',
            borderRadius: '6px',
            background: '#FFFFFF',
          }}
        />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div>
          <label style={{ display: 'block', marginBottom: 4, fontSize: '0.75rem', fontWeight: 500, color: 'var(--text)' }}>
            Watermark Text
          </label>
          <input
            type="text"
            value={(options.text as string) ?? ''}
            onChange={(e) => setOptions((prev) => ({ ...prev, text: e.target.value }))}
            placeholder="Enter watermark text"
            style={{
              width: '100%',
              padding: '7px 10px',
              border: '1px solid var(--border)',
              borderRadius: '6px',
              fontSize: '0.8rem',
              color: 'var(--text)',
              background: 'var(--card)',
            }}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          <div>
            <label style={{ display: 'block', marginBottom: 4, fontSize: '0.75rem', fontWeight: 500, color: 'var(--text)' }}>
              Font Size
            </label>
            <input
              type="number"
              value={(options.font_size as number) || 48}
              onChange={(e) => setOptions((prev) => ({ ...prev, font_size: parseInt(e.target.value) }))}
              min="12"
              max="200"
              style={{
                width: '100%',
                padding: '7px 10px',
                border: '1px solid var(--border)',
                borderRadius: '6px',
                fontSize: '0.8rem',
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: 4, fontSize: '0.75rem', fontWeight: 500, color: 'var(--text)' }}>
              Rotation
            </label>
            <select
              value={(options.rotation as number) || 0}
              onChange={(e) => setOptions((prev) => ({ ...prev, rotation: parseInt(e.target.value) }))}
              style={{
                width: '100%',
                padding: '7px 10px',
                border: '1px solid var(--border)',
                borderRadius: '6px',
                fontSize: '0.8rem',
                background: 'var(--card)',
              }}
            >
              <option value="0">0° (Horizontal)</option>
              <option value="90">90° (Vertical)</option>
              <option value="180">180° (Upside Down)</option>
              <option value="270">270° (Vertical Flip)</option>
            </select>
          </div>
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: 4, fontSize: '0.75rem', fontWeight: 500, color: 'var(--text)' }}>
            Color
          </label>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <input
              type="color"
              value={`#${(options.color as string) || '808080'}`}
              onChange={(e) => setOptions((prev) => ({ ...prev, color: e.target.value.replace('#', '') }))}
              style={{
                width: 40,
                height: 32,
                border: '1px solid var(--border)',
                borderRadius: '6px',
                cursor: 'pointer',
              }}
            />
            <input
              type="text"
              value={(options.color as string) || '808080'}
              onChange={(e) => setOptions((prev) => ({ ...prev, color: e.target.value.replace('#', '') }))}
              placeholder="808080"
              maxLength={6}
              style={{
                flex: 1,
                padding: '7px 10px',
                border: '1px solid var(--border)',
                borderRadius: '6px',
                fontSize: '0.75rem',
                fontFamily: 'monospace',
              }}
            />
          </div>
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: 4, fontSize: '0.75rem', fontWeight: 500, color: 'var(--text)' }}>
            Opacity
          </label>
          <input
            type="range"
            value={(options.opacity as number) || 0.3}
            onChange={(e) => setOptions((prev) => ({ ...prev, opacity: parseFloat(e.target.value) }))}
            min="0.1"
            max="1"
            step="0.1"
            style={{ width: '100%' }}
          />
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 2 }}>
            {Math.round(((options.opacity as number) || 0.3) * 100)}%
          </div>
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: 4, fontSize: '0.75rem', fontWeight: 500, color: 'var(--text)' }}>
            Position
          </label>
          <select
            value={(options.position as string) || 'center'}
            onChange={(e) => setOptions((prev) => ({ ...prev, position: e.target.value }))}
            style={{
              width: '100%',
              padding: '7px 10px',
              border: '1px solid var(--border)',
              borderRadius: '6px',
              fontSize: '0.8rem',
              background: 'var(--card)',
            }}
          >
            <option value="center">Center</option>
            <option value="top-left">Top Left</option>
            <option value="top-right">Top Right</option>
            <option value="bottom-left">Bottom Left</option>
            <option value="bottom-right">Bottom Right</option>
          </select>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <input
            type="checkbox"
            id="tile-watermark"
            checked={(options.tile as boolean) || false}
            onChange={(e) => setOptions((prev) => ({ ...prev, tile: e.target.checked }))}
            style={{ width: 16, height: 16, cursor: 'pointer' }}
          />
          <label htmlFor="tile-watermark" style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--text)', cursor: 'pointer' }}>
            Tile watermark across page
          </label>
        </div>
      </div>
    </div>
  )
}
