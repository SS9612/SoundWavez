import React, { useEffect, useRef } from 'react'
import { getAnalyser, setAnalyserOptions } from '../audio/audioGraph'
import { useUIStore } from '../state/useUIStore'

const PALETTES = {
  Neon: '#7C4DFF',
  Fire: '#FF1744',
  Ocean: '#0091EA',
  Sunset: '#FF6E40'
}

export default function CanvasView() {
  const ref = useRef(null)
  const mode = useUIStore(s => s.mode)
  const sensitivity = useUIStore(s => s.sensitivity)
  const smoothing = useUIStore(s => s.smoothing)
  const fftSize = useUIStore(s => s.fftSize)
  const barCount = useUIStore(s => s.barCount)
  const palette = useUIStore(s => s.palette)

  useEffect(() => { setAnalyserOptions({ fftSize, smoothing }) }, [fftSize, smoothing])

  useEffect(() => {
    const canvas = ref.current
    const ctx = canvas.getContext('2d')

    let raf = 0
    let freq = null
    let lastFrame = performance.now()

    function resize() {
      const dpr = Math.min(2, window.devicePixelRatio || 1)
      const { clientWidth: w, clientHeight: h } = canvas
      canvas.width = Math.floor(w * dpr)
      canvas.height = Math.floor(h * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    const ro = new ResizeObserver(resize)
    ro.observe(canvas)
    resize()

    const draw = () => {
      raf = requestAnimationFrame(draw)
      
      // Performance monitoring
      const now = performance.now()
      const delta = now - lastFrame
      if (delta > 20) console.warn('Frame drop:', delta, 'ms') // >20ms = <50fps
      lastFrame = now
      
      const analyser = getAnalyser()
      if (!analyser) { 
        ctx.clearRect(0,0,canvas.width,canvas.height)
        // Show empty state message
        const w = canvas.clientWidth, h = canvas.clientHeight
        ctx.fillStyle = 'rgb(10,10,12)'
        ctx.fillRect(0,0,w,h)
        ctx.fillStyle = '#666'
        ctx.font = '16px system-ui'
        ctx.textAlign = 'center'
        ctx.fillText('Load a file or enable mic to start', w/2, h/2)
        return 
      }

      const n = analyser.frequencyBinCount
      if (!freq || freq.length !== n) freq = new Uint8Array(n)
      analyser.getByteFrequencyData(freq)

      const w = canvas.clientWidth, h = canvas.clientHeight
      ctx.clearRect(0,0,w,h)
      ctx.fillStyle = 'rgb(10,10,12)'
      ctx.fillRect(0,0,w,h)
      
      const color = PALETTES[palette] || PALETTES.Neon
      ctx.fillStyle = color

      if (mode === 'bars') {
        const bars = barCount
        const step = Math.floor(n / bars)
        const barW = (w / bars) * 0.8
        const gap = (w / bars) * 0.2
        const mid = h / 2
        
        for (let i=0;i<bars;i++){
          const v = freq[i*step] / 255
          const amp = Math.pow(v, 1 / Math.max(0.1, Math.min(4, sensitivity)))
          const barH = amp * (h * 0.9)
          const x = i * (barW + gap) + gap * 0.5
          
          // Add subtle glow effect
          ctx.shadowColor = color
          ctx.shadowBlur = 4
          ctx.fillRect(x, mid - barH/2, barW, barH)
          ctx.shadowBlur = 0
        }
      } else {
        // keep it simple for now
        ctx.fillText('Switch to "bars" mode for the demo', 16, 24)
      }
    }

    raf = requestAnimationFrame(draw)
    return () => { cancelAnimationFrame(raf); ro.disconnect() }
  }, [mode, sensitivity, barCount, palette])

  return (
    <div className="w-full h-[480px] rounded-xl overflow-hidden ring-1 ring-white/10 bg-black">
      <canvas ref={ref} className="w-full h-full block" />
    </div>
  )
}
