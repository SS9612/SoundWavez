import React from 'react'
import { useUIStore } from '../state/useUIStore'

export default function ControlsPanel() {
  const sensitivity = useUIStore(s => s.sensitivity)
  const smoothing = useUIStore(s => s.smoothing)
  const fftSize = useUIStore(s => s.fftSize)
  const barCount = useUIStore(s => s.barCount)
  const palette = useUIStore(s => s.palette)
  const set = useUIStore(s => s.set)

  const fftOptions = [
    { value: 256, label: '256' },
    { value: 512, label: '512' },
    { value: 1024, label: '1024' },
    { value: 2048, label: '2048' },
    { value: 4096, label: '4096' }
  ]

  const paletteOptions = [
    { value: 'Neon', label: 'Neon', color: '#7C4DFF' },
    { value: 'Fire', label: 'Fire', color: '#FF1744' },
    { value: 'Ocean', label: 'Ocean', color: '#0091EA' },
    { value: 'Sunset', label: 'Sunset', color: '#FF6E40' }
  ]

  return (
    <div className="bg-zinc-900/50 backdrop-blur-sm rounded-xl p-4 space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Sensitivity */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-zinc-300">
            Sensitivity: {sensitivity.toFixed(1)}
          </label>
          <input
            type="range"
            min="0.1"
            max="4.0"
            step="0.1"
            value={sensitivity}
            onChange={e => set({ sensitivity: +e.target.value })}
            className="w-full h-2 bg-zinc-700 rounded-lg appearance-none cursor-pointer slider"
          />
        </div>

        {/* Smoothing */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-zinc-300">
            Smoothing: {smoothing.toFixed(2)}
          </label>
          <input
            type="range"
            min="0"
            max="0.99"
            step="0.01"
            value={smoothing}
            onChange={e => set({ smoothing: +e.target.value })}
            className="w-full h-2 bg-zinc-700 rounded-lg appearance-none cursor-pointer slider"
          />
        </div>

        {/* FFT Size */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-zinc-300">
            FFT Size
          </label>
          <select
            value={fftSize}
            onChange={e => set({ fftSize: +e.target.value })}
            className="w-full px-3 py-2 bg-zinc-800 border border-zinc-600 rounded-lg text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {fftOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Bar Count */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-zinc-300">
            Bar Count: {barCount}
          </label>
          <input
            type="range"
            min="32"
            max="256"
            step="8"
            value={barCount}
            onChange={e => set({ barCount: +e.target.value })}
            className="w-full h-2 bg-zinc-700 rounded-lg appearance-none cursor-pointer slider"
          />
        </div>
      </div>

      {/* Color Palette */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-zinc-300">
          Color Palette
        </label>
        <div className="flex gap-2">
          {paletteOptions.map(option => (
            <button
              key={option.value}
              onClick={() => set({ palette: option.value })}
              className={`px-3 py-2 rounded-lg border-2 transition-all ${
                palette === option.value
                  ? 'border-white bg-white/10'
                  : 'border-zinc-600 hover:border-zinc-400'
              }`}
            >
              <div className="flex items-center gap-2">
                <div
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: option.color }}
                />
                <span className="text-sm text-zinc-300">{option.label}</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
