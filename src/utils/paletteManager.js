/**
 * Gradient palette manager with caching
 * Provides gradient palettes and utility functions
 */

export const GRADIENT_PALETTES = {
  Neon: {
    colors: ['#7C4DFF', '#00E5FF', '#76FF03'],
    type: 'linear'
  },
  Sunset: {
    colors: ['#FF6E40', '#FF4081', '#7C4DFF'],
    type: 'linear'
  },
  Aurora: {
    colors: ['#00F5FF', '#7B42FF', '#FF006E'],
    type: 'radial'
  },
  Fire: {
    colors: ['#FF1744', '#FF6D00', '#FFEA00'],
    type: 'linear'
  },
  Ocean: {
    colors: ['#0091EA', '#00B8D4', '#00E676'],
    type: 'linear'
  }
}

// Cache gradients to avoid per-frame creation
const gradientCache = new Map()

/**
 * Get or create a gradient for the given palette and dimensions
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {string} palette - Palette name
 * @param {number} w - Canvas width
 * @param {number} h - Canvas height
 * @returns {CanvasGradient} Cached gradient
 */
export function getGradient(ctx, palette, w, h) {
  const key = `${palette}-${w}-${h}`
  if (gradientCache.has(key)) return gradientCache.get(key)
  
  const config = GRADIENT_PALETTES[palette]
  if (!config) {
    console.warn(`Unknown palette: ${palette}`)
    return getGradient(ctx, 'Neon', w, h)
  }
  
  let gradient
  
  if (config.type === 'linear') {
    gradient = ctx.createLinearGradient(0, 0, w, h)
  } else {
    // Radial gradient from center
    const centerX = w / 2
    const centerY = h / 2
    const maxRadius = Math.max(w, h) / 2
    gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, maxRadius)
  }
  
  // Add color stops
  config.colors.forEach((color, i) => {
    const stop = i / (config.colors.length - 1)
    gradient.addColorStop(stop, color)
  })
  
  gradientCache.set(key, gradient)
  return gradient
}

/**
 * Clear the gradient cache
 * Call this when canvas dimensions change
 */
export function clearGradientCache() {
  gradientCache.clear()
}

/**
 * Get a solid color fallback for simple modes
 * @param {string} palette - Palette name
 * @returns {string} First color from the palette
 */
export function getSolidColor(palette) {
  const config = GRADIENT_PALETTES[palette]
  return config ? config.colors[0] : '#7C4DFF'
}
