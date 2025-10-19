/**
 * Preset schema with versioning and validation
 * Defines the structure for SoundWavez presets
 */

export const PRESET_VERSION = '1.0.0'

export const DEFAULT_PRESET = {
  version: PRESET_VERSION,
  name: 'Default',
  settings: {
    mode: 'bars',
    sensitivity: 1.0,
    smoothing: 0.8,
    fftSize: 1024,
    barCount: 96,
    palette: 'Neon',
    mirrorBars: false,
    particleCount: 96
  }
}

export const FACTORY_PRESETS = [
  {
    ...DEFAULT_PRESET,
    id: 'default',
    name: 'Default',
    isFactory: true
  },
  {
    version: PRESET_VERSION,
    id: 'intense',
    name: 'Intense',
    isFactory: true,
    settings: {
      mode: 'bars',
      sensitivity: 2.5,
      smoothing: 0.5,
      fftSize: 2048,
      barCount: 128,
      palette: 'Fire',
      mirrorBars: true,
      particleCount: 128
    }
  },
  {
    version: PRESET_VERSION,
    id: 'smooth',
    name: 'Smooth Wave',
    isFactory: true,
    settings: {
      mode: 'wave',
      sensitivity: 0.8,
      smoothing: 0.9,
      fftSize: 1024,
      barCount: 96,
      palette: 'Ocean',
      mirrorBars: false,
      particleCount: 96
    }
  },
  {
    version: PRESET_VERSION,
    id: 'cosmic',
    name: 'Cosmic',
    isFactory: true,
    settings: {
      mode: 'radial',
      sensitivity: 1.5,
      smoothing: 0.85,
      fftSize: 2048,
      barCount: 96,
      palette: 'Aurora',
      mirrorBars: false,
      particleCount: 120
    }
  }
]

/**
 * Validate a preset object
 * @param {Object} preset - The preset to validate
 * @returns {Object} - { valid: boolean, error?: string }
 */
export function validatePreset(preset) {
  if (!preset || typeof preset !== 'object') {
    return { valid: false, error: 'Invalid preset format' }
  }
  
  if (!preset.version) {
    return { valid: false, error: 'Missing version field' }
  }
  
  if (!preset.settings || typeof preset.settings !== 'object') {
    return { valid: false, error: 'Missing settings object' }
  }
  
  const required = ['mode', 'sensitivity', 'smoothing', 'fftSize', 'barCount', 'palette']
  for (const field of required) {
    if (!(field in preset.settings)) {
      return { valid: false, error: `Missing required field: ${field}` }
    }
  }
  
  // Validate field types and ranges
  const { settings } = preset
  if (typeof settings.sensitivity !== 'number' || settings.sensitivity < 0.1 || settings.sensitivity > 4) {
    return { valid: false, error: 'Sensitivity must be between 0.1 and 4' }
  }
  
  if (typeof settings.smoothing !== 'number' || settings.smoothing < 0 || settings.smoothing > 0.99) {
    return { valid: false, error: 'Smoothing must be between 0 and 0.99' }
  }
  
  if (!['bars', 'wave', 'radial'].includes(settings.mode)) {
    return { valid: false, error: 'Mode must be bars, wave, or radial' }
  }
  
  if (!['Neon', 'Sunset', 'Aurora', 'Fire', 'Ocean'].includes(settings.palette)) {
    return { valid: false, error: 'Invalid palette name' }
  }
  
  return { valid: true }
}

/**
 * Migrate a preset to the current version
 * @param {Object} preset - The preset to migrate
 * @returns {Object} - The migrated preset
 */
export function migratePreset(preset) {
  if (preset.version === PRESET_VERSION) return preset
  
  // Future: add migration logic for older versions
  // For now, just ensure all fields exist with defaults
  return {
    ...preset,
    version: PRESET_VERSION,
    settings: {
      ...DEFAULT_PRESET.settings,
      ...preset.settings
    }
  }
}

/**
 * Create a new preset from current settings
 * @param {Object} settings - Current settings object
 * @param {string} name - Preset name
 * @returns {Object} - New preset object
 */
export function createPreset(settings, name) {
  return {
    version: PRESET_VERSION,
    id: `custom-${Date.now()}`,
    name,
    isFactory: false,
    createdAt: Date.now(),
    settings: {
      mode: settings.mode,
      sensitivity: settings.sensitivity,
      smoothing: settings.smoothing,
      fftSize: settings.fftSize,
      barCount: settings.barCount,
      palette: settings.palette,
      mirrorBars: settings.mirrorBars,
      particleCount: settings.particleCount
    }
  }
}
