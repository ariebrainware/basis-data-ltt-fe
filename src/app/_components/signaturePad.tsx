import React, {
  useRef,
  useState,
  useEffect,
  forwardRef,
  useImperativeHandle,
} from 'react'

export interface SignaturePadRef {
  clear: () => void
}

interface SignaturePadProps {
  onChange: (dataUrl: string) => void
  onClear?: () => void
}

export const SignaturePad = forwardRef<SignaturePadRef, SignaturePadProps>(
  ({ onChange, onClear }, ref) => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null)
    const [isDrawing, setIsDrawing] = useState(false)
    const [isEmpty, setIsEmpty] = useState(true)

    // Setup canvas line style context
    const getCanvasContext = () => {
      const canvas = canvasRef.current
      if (!canvas) return null
      const ctx = canvas.getContext('2d')
      return ctx
    }

    // Draw start
    const startDrawing = (e: React.PointerEvent<HTMLCanvasElement>) => {
      e.preventDefault()
      const canvas = canvasRef.current
      if (!canvas) return
      const ctx = getCanvasContext()
      if (!ctx) return

      // Set target capturing for touch/stylus inputs to prevent missing up/leave events
      canvas.setPointerCapture(e.pointerId)

      const rect = canvas.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top

      ctx.beginPath()
      ctx.moveTo(x, y)
      setIsDrawing(true)
      setIsEmpty(false)
    }

    // Draw move
    const draw = (e: React.PointerEvent<HTMLCanvasElement>) => {
      if (!isDrawing) return
      e.preventDefault()
      const canvas = canvasRef.current
      if (!canvas) return
      const ctx = getCanvasContext()
      if (!ctx) return

      const rect = canvas.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top

      ctx.lineTo(x, y)
      ctx.stroke()
    }

    // Draw stop
    const stopDrawing = (e: React.PointerEvent<HTMLCanvasElement>) => {
      if (!isDrawing) return
      setIsDrawing(false)
      const canvas = canvasRef.current
      if (canvas) {
        // Release captured pointer
        try {
          canvas.releasePointerCapture(e.pointerId)
        } catch (err) {
          // ignore if already released
        }
        onChange(canvas.toDataURL('image/png'))
      }
    }

    // Clear canvas
    const handleClear = () => {
      const canvas = canvasRef.current
      if (!canvas) return
      const ctx = canvas.getContext('2d')
      if (!ctx) return

      // Clear scaled coordinates correctly
      ctx.save()
      ctx.setTransform(1, 0, 0, 1, 0, 0)
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.restore()

      setIsEmpty(true)
      onChange('')
      if (onClear) onClear()
    }

    // Expose clear function to parent components via ref
    useImperativeHandle(ref, () => ({
      clear: handleClear,
    }))

    // Match canvas resolution to device pixel ratio for crystal clear rendering on iPad/Retina screens
    useEffect(() => {
      const canvas = canvasRef.current
      if (canvas) {
        const rect = canvas.getBoundingClientRect()
        const dpr = window.devicePixelRatio || 1

        // Scale internal backing store width/height by DPR
        canvas.width = (rect.width || 400) * dpr
        canvas.height = (rect.height || 220) * dpr

        const ctx = canvas.getContext('2d')
        if (ctx) {
          // Scale context drawing matching backing store scaling
          ctx.scale(dpr, dpr)
          ctx.lineWidth = 3
          ctx.lineCap = 'round'
          ctx.lineJoin = 'round'
          ctx.strokeStyle = '#0f172a' // slate-900
        }
      }
    }, [])

    return (
      <div className="w-full">
        <label className="text-slate-600 dark:text-slate-300 mb-1 block text-sm font-medium">
          Tanda Tangan Pasien
        </label>
        <div className="border-slate-200 dark:border-slate-800 dark:bg-slate-900/50 relative overflow-hidden rounded-lg border bg-white/50 backdrop-blur-sm">
          <canvas
            aria-label="Tanda Tangan Pasien"
            ref={canvasRef}
            onPointerDown={startDrawing}
            onPointerMove={draw}
            onPointerUp={stopDrawing}
            onPointerLeave={stopDrawing}
            onPointerCancel={stopDrawing}
            className="bg-slate-50 dark:bg-slate-950 block h-[220px] w-full cursor-crosshair touch-none"
            style={{ touchAction: 'none' }}
          />
          {isEmpty && (
            <div className="text-slate-400 pointer-events-none absolute inset-0 flex items-center justify-center text-sm italic">
              Gunakan mouse, sentuhan, atau Apple Pencil untuk tanda tangan di
              sini
            </div>
          )}
        </div>
        <div className="mt-2 flex justify-end">
          <button
            type="button"
            onClick={handleClear}
            className="dark:bg-red-950/20 dark:hover:bg-red-950/40 rounded border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-600 transition hover:bg-red-100 hover:text-red-700 dark:border-red-900/50 dark:text-red-400"
          >
            Hapus Tanda Tangan
          </button>
        </div>
      </div>
    )
  }
)

SignaturePad.displayName = 'SignaturePad'
