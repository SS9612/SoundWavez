/**
 * Preset import/export functionality
 * Handles JSON file operations with validation
 */

import { validatePreset, migratePreset, PRESET_VERSION } from './presetSchema'

/**
 * Export a single preset as JSON file
 * @param {Object} preset - The preset to export
 */
export function exportPreset(preset) {
  const data = {
    ...preset,
    exportedAt: Date.now(),
    exportedBy: 'SoundWavez'
  }
  
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${preset.name.replace(/\s+/g, '-')}.soundwavez.json`
  link.click()
  URL.revokeObjectURL(url)
}

/**
 * Import a preset from JSON file
 * @param {File} file - The JSON file to import
 * @returns {Promise<Object>} - { success: boolean, preset?: Object, error?: string }
 */
export async function importPreset(file) {
  try {
    const text = await file.text()
    const data = JSON.parse(text)
    
    const validation = validatePreset(data)
    if (!validation.valid) {
      return { success: false, error: validation.error }
    }
    
    // Migrate if needed
    const preset = migratePreset(data)
    
    // Generate new ID for imported preset
    preset.id = `imported-${Date.now()}`
    preset.isFactory = false
    delete preset.exportedAt
    delete preset.exportedBy
    
    return { success: true, preset }
  } catch (err) {
    if (err instanceof SyntaxError) {
      return { success: false, error: 'Invalid JSON file' }
    }
    return { success: false, error: err.message }
  }
}

/**
 * Export all custom presets as a batch JSON file
 * @param {Array} presets - Array of all presets
 */
export function exportAllPresets(presets) {
  const customPresets = presets.filter(p => !p.isFactory)
  const data = {
    version: PRESET_VERSION,
    presets: customPresets,
    exportedAt: Date.now(),
    exportedBy: 'SoundWavez'
  }
  
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `soundwavez-presets-${Date.now()}.json`
  link.click()
  URL.revokeObjectURL(url)
}

/**
 * Import multiple presets from batch JSON file
 * @param {File} file - The batch JSON file to import
 * @returns {Promise<Object>} - { success: boolean, presets?: Array, error?: string }
 */
export async function importAllPresets(file) {
  try {
    const text = await file.text()
    const data = JSON.parse(text)
    
    if (!data.presets || !Array.isArray(data.presets)) {
      return { success: false, error: 'Invalid batch preset format' }
    }
    
    const importedPresets = []
    const errors = []
    
    for (let i = 0; i < data.presets.length; i++) {
      const preset = data.presets[i]
      const validation = validatePreset(preset)
      
      if (!validation.valid) {
        errors.push(`Preset ${i + 1}: ${validation.error}`)
        continue
      }
      
      const migratedPreset = migratePreset(preset)
      migratedPreset.id = `imported-${Date.now()}-${i}`
      migratedPreset.isFactory = false
      delete migratedPreset.exportedAt
      delete migratedPreset.exportedBy
      
      importedPresets.push(migratedPreset)
    }
    
    if (importedPresets.length === 0) {
      return { 
        success: false, 
        error: `No valid presets found. Errors: ${errors.join(', ')}` 
      }
    }
    
    return { 
      success: true, 
      presets: importedPresets,
      warnings: errors.length > 0 ? errors : undefined
    }
  } catch (err) {
    if (err instanceof SyntaxError) {
      return { success: false, error: 'Invalid JSON file' }
    }
    return { success: false, error: err.message }
  }
}
