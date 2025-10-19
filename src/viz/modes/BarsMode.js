/**
 * Bars visualization mode
 * Draws frequency bars with optional mirror effect
 */
export function drawBars(ctx, freq, w, h, { barCount, sensitivity, color, mirror = false }) {
  const bars = barCount
  const step = Math.floor(freq.length / bars)
  const barW = (w / bars) * 0.8
  const gap = (w / bars) * 0.2
  const mid = h / 2
  
  // Set shadow properties once for all bars
  ctx.shadowColor = color
  ctx.shadowBlur = 4
  
  for (let i = 0; i < bars; i++) {
    const v = freq[i * step] / 255
    const amp = Math.pow(v, 1 / Math.max(0.1, Math.min(4, sensitivity)))
    const barH = amp * (h * 0.9)
    const x = i * (barW + gap) + gap * 0.5
    
    if (mirror) {
      // Draw mirrored bars from both top and bottom
      const halfHeight = barH / 2
      ctx.fillRect(x, mid - halfHeight, barW, halfHeight)
      ctx.fillRect(x, mid, barW, halfHeight)
    } else {
      // Draw single bar from center
      ctx.fillRect(x, mid - barH/2, barW, barH)
    }
  }
  
  // Reset shadow
  ctx.shadowBlur = 0
}
