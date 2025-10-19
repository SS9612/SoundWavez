/**
 * Waveform visualization mode
 * Draws oscillating waveform using time-domain data
 */
export function drawWaveform(ctx, waveform, w, h, { color, sensitivity }) {
  const mid = h / 2
  const amplitude = h * 0.4 * sensitivity
  
  ctx.beginPath()
  ctx.moveTo(0, mid)
  
  for (let i = 0; i < waveform.length; i++) {
    const x = (i / waveform.length) * w
    const v = (waveform[i] - 128) / 128 // Convert to -1 to 1 range
    const y = mid + (v * amplitude)
    
    if (i === 0) {
      ctx.moveTo(x, y)
    } else {
      ctx.lineTo(x, y)
    }
  }
  
  ctx.strokeStyle = color
  ctx.lineWidth = 2
  ctx.stroke()
}
