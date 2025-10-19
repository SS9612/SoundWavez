import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { FACTORY_PRESETS, DEFAULT_PRESET, createPreset } from '../utils/presetSchema'

export const useUIStore = create(
  persist(
    (set, get) => ({
      // audio/visual settings
      mode: 'bars',                 // 'bars' | 'wave' | 'radial'
      sensitivity: 1.0,             // 0.1..4
      smoothing: 0.8,               // 0..0.99
      fftSize: 1024,                // 32..32768 (power of two)
      barCount: 96,                 // 32..256 (visual only)
      palette: 'Neon',              // 'Neon' | 'Sunset' | 'Aurora' | 'Fire' | 'Ocean'
      mirrorBars: false,            // Mirror mode for bars
      showControls: false,          // controls panel visibility
      showPerformance: false,       // performance monitor visibility
      particleCount: 96,            // For radial mode (reuse barCount or separate)
      
      // Preset management
      presets: FACTORY_PRESETS,
      currentPreset: null,
      customPresetCount: 0,
      
      // Onboarding
      hasSeenOnboarding: false,
      
      // Actions
      set: (patch) => set(patch),
      
      savePreset: (name) => {
        const state = get()
        const preset = createPreset(state, name || `Preset ${state.customPresetCount + 1}`)
        set({
          presets: [...state.presets, preset],
          customPresetCount: state.customPresetCount + 1,
          currentPreset: preset.id
        })
        return preset
      },
      
      loadPreset: (presetId) => {
        const state = get()
        const preset = state.presets.find(p => p.id === presetId)
        if (!preset) return
        
        set({
          ...preset.settings,
          currentPreset: presetId
        })
      },
      
      deletePreset: (presetId) => {
        const state = get()
        const preset = state.presets.find(p => p.id === presetId)
        if (!preset || preset.isFactory) return
        
        set({
          presets: state.presets.filter(p => p.id !== presetId),
          currentPreset: state.currentPreset === presetId ? null : state.currentPreset
        })
      },
      
      duplicatePreset: (presetId) => {
        const state = get()
        const preset = state.presets.find(p => p.id === presetId)
        if (!preset) return
        
        const duplicated = createPreset(preset.settings, `${preset.name} (Copy)`)
        set({
          presets: [...state.presets, duplicated],
          customPresetCount: state.customPresetCount + 1
        })
        return duplicated
      },
      
      renamePreset: (presetId, newName) => {
        const state = get()
        set({
          presets: state.presets.map(p =>
            p.id === presetId && !p.isFactory ? { ...p, name: newName } : p
          )
        })
      },
      
      addPreset: (preset) => {
        const state = get()
        set({
          presets: [...state.presets, preset],
          customPresetCount: state.customPresetCount + 1
        })
      },
      
      addPresets: (presets) => {
        const state = get()
        set({
          presets: [...state.presets, ...presets],
          customPresetCount: state.customPresetCount + presets.length
        })
      },
      
      resetToDefaults: () => {
        set({
          ...DEFAULT_PRESET.settings,
          currentPreset: 'default'
        })
      },
      
      dismissOnboarding: () => {
        set({ hasSeenOnboarding: true })
      },
      
      resetOnboarding: () => {
        set({ hasSeenOnboarding: false })
      },
      
      // Clear current preset when settings change manually
      clearCurrentPreset: () => {
        set({ currentPreset: null })
      }
    }),
    { name: 'soundwavez-settings' }
  )
)
