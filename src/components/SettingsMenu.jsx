import React, { useState, useRef, useEffect } from 'react'
import { useUIStore } from '../state/useUIStore'
import { exportAllPresets } from '../utils/presetIO'

export default function SettingsMenu({ visible, onClose }) {
  const { resetToDefaults, resetOnboarding, presets } = useUIStore()
  const [showConfirmReset, setShowConfirmReset] = useState(false)
  const menuRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        onClose()
      }
    }

    if (visible) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [visible, onClose])

  if (!visible) return null

  const handleResetToDefaults = () => {
    resetToDefaults()
    setShowConfirmReset(false)
    onClose()
  }

  const handleResetOnboarding = () => {
    resetOnboarding()
    onClose()
  }

  const handleExportAll = () => {
    const customPresets = presets.filter(p => !p.isFactory)
    if (customPresets.length === 0) {
      alert('No custom presets to export')
      return
    }
    exportAllPresets(customPresets)
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50">
      <div
        ref={menuRef}
        className="bg-zinc-900 rounded-xl border border-zinc-700 w-80 max-w-[90vw]"
      >
        <div className="p-4 border-b border-zinc-700">
          <h2 className="text-lg font-semibold text-zinc-100">Settings</h2>
        </div>
        
        <div className="p-4 space-y-3">
          <button
            onClick={() => setShowConfirmReset(true)}
            className="w-full text-left px-3 py-2 text-zinc-300 hover:bg-zinc-800 rounded-lg transition-colors"
          >
            Reset to Defaults
          </button>
          
          <button
            onClick={handleResetOnboarding}
            className="w-full text-left px-3 py-2 text-zinc-300 hover:bg-zinc-800 rounded-lg transition-colors"
          >
            Reset Onboarding Tips
          </button>
          
          <button
            onClick={handleExportAll}
            className="w-full text-left px-3 py-2 text-zinc-300 hover:bg-zinc-800 rounded-lg transition-colors"
          >
            Export All Presets
          </button>
          
          <div className="pt-2 border-t border-zinc-700">
            <div className="text-xs text-zinc-500 space-y-1">
              <div>SoundWavez v1.0.0</div>
              <div>Built with React + Vite</div>
            </div>
          </div>
        </div>
        
        <div className="p-4 border-t border-zinc-700">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-zinc-700 rounded-lg hover:bg-zinc-600 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
      
      {/* Confirm Reset Dialog */}
      {showConfirmReset && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
          <div className="bg-zinc-800 rounded-lg p-4 w-80">
            <h3 className="text-lg font-semibold mb-3 text-zinc-100">
              Reset to Defaults
            </h3>
            <p className="text-zinc-300 mb-4">
              This will reset all settings to their default values. This action cannot be undone.
            </p>
            <div className="flex gap-2">
              <button
                onClick={handleResetToDefaults}
                className="px-4 py-2 bg-red-600 rounded-lg hover:bg-red-700"
              >
                Reset
              </button>
              <button
                onClick={() => setShowConfirmReset(false)}
                className="px-4 py-2 bg-zinc-600 rounded-lg hover:bg-zinc-500"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
