import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useUIStore = create(
  persist(
    (set) => ({
      // audio/visual settings
      mode: 'bars',                 // 'bars' | 'wave' | 'radial' | '3d'
      sensitivity: 1.0,             // 0.1..4
      smoothing: 0.8,               // 0..0.99
      fftSize: 1024,                // 32..32768 (power of two)
      barCount: 96,                 // 32..256 (visual only)
      palette: 'Neon',              // 'Neon' | 'Fire' | 'Ocean' | 'Sunset'
      showControls: false,          // controls panel visibility
      set: (patch) => set(patch),
    }),
    { name: 'soundwavez-settings' }
  )
)
