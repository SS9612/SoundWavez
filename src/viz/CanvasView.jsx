import React, { useEffect, useRef, useState } from 'react'
import { getAnalyser, setAnalyserOptions } from '../audio/audioGraph'
import { useUIStore } from '../state/useUIStore'
import { getGradient, clearGradientCache, getSolidColor } from '../utils/paletteManager'
import { drawBars } from './modes/BarsMode'
import { drawWaveform } from './modes/WaveformMode'
import { drawRadial } from './modes/RadialMode'
import EmptyState from '../components/EmptyState'

export default function CanvasView({ onPerformanceUpdate, onLoadFile, onEnableMic }) {
  const ref = useRef(null)
  const mode = useUIStore(s => s.mode)
  const sensitivity = useUIStore(s => s.sensitivity)
  const smoothing = useUIStore(s => s.smoothing)
  const fftSize = useUIStore(s => s.fftSize)
  const barCount = useUIStore(s => s.barCount)
  const palette = useUIStore(s => s.palette)
  const mirrorBars = useUIStore(s => s.mirrorBars)
  const particleCount = useUIStore(s => s.particleCount)
  const [hasAudio, setHasAudio] = useState(false)

  useEffect(() => { setAnalyserOptions({ fftSize, smoothing }) }, [fftSize, smoothing])

  useEffect(() => {
    const canvas = ref.current
    const ctx = canvas.getContext('2d')

    let raf = 0
    let freq = null
    let waveform = null
    let lastFrame = performance.now()
    
    // Performance tracking
    let frameCount = 0
    let lastFpsUpdate = performance.now()
    let currentFps = 60
    let droppedFrames = 0

    function resize() {
      const dpr = Math.min(2, window.devicePixelRatio || 1)
      const { clientWidth: w, clientHeight: h } = canvas
      canvas.width = Math.floor(w * dpr)
      canvas.height = Math.floor(h * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      
      // Clear gradient cache on resize
      clearGradientCache()
    }
    const ro = new ResizeObserver(resize)
    ro.observe(canvas)
    resize()

    const draw = () => {
      raf = requestAnimationFrame(draw)
      
      // Performance monitoring
      const now = performance.now()
      const delta = now - lastFrame
      frameCount++
      
      if (delta > 20) droppedFrames++ // >20ms = <50fps
      lastFrame = now
      
      // Update FPS every second
      if (now - lastFpsUpdate >= 1000) {
        currentFps = Math.round((frameCount * 1000) / (now - lastFpsUpdate))
        frameCount = 0
        lastFpsUpdate = now
        
        // Notify parent of performance update
        if (onPerformanceUpdate) {
          onPerformanceUpdate({ fps: currentFps, droppedFrames })
        }
      }
      
              const analyser = getAnalyser()
              if (!analyser) { 
                ctx.clearRect(0,0,canvas.width,canvas.height)
                setHasAudio(false)
                return 
              }
              
              setHasAudio(true)

      const w = canvas.clientWidth, h = canvas.clientHeight
      ctx.clearRect(0,0,w,h)
      ctx.fillStyle = 'rgb(10,10,12)'
      ctx.fillRect(0,0,w,h)
      
      // Get gradient or solid color based on mode
      const gradient = getGradient(ctx, palette, w, h)
      const solidColor = getSolidColor(palette)

      // Switch between visualization modes
      switch (mode) {
        case 'bars': {
          const n = analyser.frequencyBinCount
          if (!freq || freq.length !== n) freq = new Uint8Array(n)
          analyser.getByteFrequencyData(freq)
          
          ctx.fillStyle = solidColor
          drawBars(ctx, freq, w, h, { 
            barCount, 
            sensitivity, 
            color: solidColor, 
            mirror: mirrorBars 
          })
          break
        }
        
        case 'wave': {
          if (!waveform || waveform.length !== 1024) waveform = new Uint8Array(1024)
          analyser.getByteTimeDomainData(waveform)
          
          ctx.strokeStyle = solidColor
          drawWaveform(ctx, waveform, w, h, { 
            color: solidColor, 
            sensitivity 
          })
          break
        }
        
        case 'radial': {
          const n = analyser.frequencyBinCount
          if (!freq || freq.length !== n) freq = new Uint8Array(n)
          analyser.getByteFrequencyData(freq)
          
          ctx.fillStyle = gradient
          drawRadial(ctx, freq, w, h, { 
            particleCount, 
            sensitivity, 
            gradient 
          })
          break
        }
        
        default:
          ctx.fillStyle = '#666'
          ctx.font = '16px system-ui'
          ctx.textAlign = 'center'
          ctx.fillText('Unknown mode: ' + mode, w/2, h/2)
      }
    }

    raf = requestAnimationFrame(draw)
    return () => { cancelAnimationFrame(raf); ro.disconnect() }
  }, [mode, sensitivity, barCount, palette, mirrorBars, particleCount, onPerformanceUpdate])

  return (
    <div className="w-full h-[480px] md:h-[600px] rounded-xl overflow-hidden ring-1 ring-white/10 bg-black relative">
      <canvas ref={ref} className="w-full h-full block" />
      {!hasAudio && (
        <div className="absolute inset-0 flex items-center justify-center">
          <EmptyState onLoadFile={onLoadFile} onEnableMic={onEnableMic} />
        </div>
      )}
    </div>
  )
}
