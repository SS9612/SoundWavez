/**
 * Radial particles visualization mode
 * Draws particles in a circular pattern radiating from center
 */
export function drawRadial(ctx, freq, w, h, { particleCount, sensitivity, gradient }) {
  const centerX = w / 2
  const centerY = h / 2
  const maxRadius = Math.min(w, h) * 0.4
  const step = Math.floor(freq.length / particleCount)
  
  // Set gradient fill
  ctx.fillStyle = gradient
  
  for (let i = 0; i < particleCount; i++) {
    const v = freq[i * step] / 255
    const amp = Math.pow(v, 1 / Math.max(0.1, Math.min(4, sensitivity)))
    
    // Calculate angle and radius
    const angle = (i / particleCount) * Math.PI * 2
    const radius = amp * maxRadius
    
    // Calculate particle position
    const x = centerX + Math.cos(angle) * radius
    const y = centerY + Math.sin(angle) * radius
    
    // Draw particle (small circle)
    const particleSize = Math.max(2, amp * 8)
    ctx.beginPath()
    ctx.arc(x, y, particleSize, 0, Math.PI * 2)
    ctx.fill()
  }
}
