import React, { useState, useRef } from 'react'
import { useUIStore } from '../state/useUIStore'
import { exportPreset, exportAllPresets, importPreset, importAllPresets } from '../utils/presetIO'

export default function PresetManager({ visible, onClose }) {
  const presets = useUIStore(s => s.presets)
  const currentPreset = useUIStore(s => s.currentPreset)
  const { 
    loadPreset, 
    deletePreset, 
    duplicatePreset, 
    renamePreset, 
    savePreset, 
    addPreset,
    addPresets
  } = useUIStore()
  
  const [editingId, setEditingId] = useState(null)
  const [newName, setNewName] = useState('')
  const [saveDialogOpen, setSaveDialogOpen] = useState(false)
  const [saveName, setSaveName] = useState('')
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState('')
  const fileInputRef = useRef(null)
  const batchFileInputRef = useRef(null)

  if (!visible) return null

  const factoryPresets = presets.filter(p => p.isFactory)
  const customPresets = presets.filter(p => !p.isFactory)

  const showMessage = (text, type = 'info') => {
    setMessage(text)
    setMessageType(type)
    setTimeout(() => setMessage(''), 3000)
  }

  const handleLoadPreset = (presetId) => {
    loadPreset(presetId)
    showMessage('Preset loaded', 'success')
  }

  const handleDeletePreset = (presetId) => {
    const preset = presets.find(p => p.id === presetId)
    if (preset && !preset.isFactory) {
      deletePreset(presetId)
      showMessage('Preset deleted', 'success')
    }
  }

  const handleDuplicatePreset = (presetId) => {
    const duplicated = duplicatePreset(presetId)
    if (duplicated) {
      showMessage('Preset duplicated', 'success')
    }
  }

  const handleStartRename = (preset) => {
    setEditingId(preset.id)
    setNewName(preset.name)
  }

  const handleRename = () => {
    if (newName.trim()) {
      renamePreset(editingId, newName.trim())
      setEditingId(null)
      setNewName('')
      showMessage('Preset renamed', 'success')
    }
  }

  const handleCancelRename = () => {
    setEditingId(null)
    setNewName('')
  }

  const handleSaveCurrent = () => {
    if (saveName.trim()) {
      const preset = savePreset(saveName.trim())
      if (preset) {
        setSaveDialogOpen(false)
        setSaveName('')
        showMessage('Preset saved', 'success')
      }
    }
  }

  const handleExportPreset = (preset) => {
    try {
      exportPreset(preset)
      showMessage('Preset exported', 'success')
    } catch (err) {
      showMessage('Export failed', 'error')
    }
  }

  const handleExportAll = () => {
    try {
      exportAllPresets(customPresets)
      showMessage('All presets exported', 'success')
    } catch (err) {
      showMessage('Export failed', 'error')
    }
  }

  const handleImportPreset = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      const result = await importPreset(file)
      if (result.success) {
        addPreset(result.preset)
        showMessage('Preset imported', 'success')
      } else {
        showMessage(`Import failed: ${result.error}`, 'error')
      }
    } catch (err) {
      showMessage('Import failed', 'error')
    }
    
    e.target.value = ''
  }

  const handleImportBatch = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      const result = await importAllPresets(file)
      if (result.success) {
        addPresets(result.presets)
        showMessage(`${result.presets.length} presets imported`, 'success')
        if (result.warnings) {
          console.warn('Import warnings:', result.warnings)
        }
      } else {
        showMessage(`Import failed: ${result.error}`, 'error')
      }
    } catch (err) {
      showMessage('Import failed', 'error')
    }
    
    e.target.value = ''
  }

  const PresetItem = ({ preset, isFactory = false }) => (
    <div className={`flex items-center gap-3 p-3 rounded-lg border ${
      currentPreset === preset.id 
        ? 'border-blue-500 bg-blue-500/10' 
        : 'border-zinc-600 hover:border-zinc-400'
    }`}>
      <button
        onClick={() => handleLoadPreset(preset.id)}
        className="flex-1 text-left"
      >
        <div className="font-medium text-zinc-100">{preset.name}</div>
        <div className="text-sm text-zinc-400">
          {preset.settings.mode} • {preset.settings.palette} • {preset.settings.sensitivity}x
        </div>
      </button>
      
      <div className="flex gap-1">
        {!isFactory && (
          <button
            onClick={() => handleStartRename(preset)}
            className="p-1 text-zinc-400 hover:text-zinc-200"
            title="Rename"
          >
            ✏️
          </button>
        )}
        
        <button
          onClick={() => handleDuplicatePreset(preset.id)}
          className="p-1 text-zinc-400 hover:text-zinc-200"
          title="Duplicate"
        >
          📋
        </button>
        
        <button
          onClick={() => handleExportPreset(preset)}
          className="p-1 text-zinc-400 hover:text-zinc-200"
          title="Export"
        >
          📤
        </button>
        
        {!isFactory && (
          <button
            onClick={() => handleDeletePreset(preset.id)}
            className="p-1 text-zinc-400 hover:text-red-400"
            title="Delete"
          >
            🗑️
          </button>
        )}
      </div>
    </div>
  )

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-zinc-900 rounded-xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-zinc-700">
          <h2 className="text-xl font-semibold">Preset Manager</h2>
          <button
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-zinc-200"
          >
            ✕
          </button>
        </div>
        
        <div className="p-4 space-y-4 overflow-y-auto max-h-[60vh]">
          {/* Message */}
          {message && (
            <div className={`p-3 rounded-lg ${
              messageType === 'success' ? 'bg-green-500/20 text-green-300' :
              messageType === 'error' ? 'bg-red-500/20 text-red-300' :
              'bg-blue-500/20 text-blue-300'
            }`}>
              {message}
            </div>
          )}
          
          {/* Actions */}
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setSaveDialogOpen(true)}
              className="px-3 py-2 bg-blue-600 rounded-lg hover:bg-blue-700 text-sm"
            >
              Save Current
            </button>
            <button
              onClick={handleExportAll}
              className="px-3 py-2 bg-zinc-700 rounded-lg hover:bg-zinc-600 text-sm"
            >
              Export All
            </button>
            <label className="px-3 py-2 bg-zinc-700 rounded-lg hover:bg-zinc-600 text-sm cursor-pointer">
              Import Single
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleImportPreset}
                className="hidden"
              />
            </label>
            <label className="px-3 py-2 bg-zinc-700 rounded-lg hover:bg-zinc-600 text-sm cursor-pointer">
              Import Batch
              <input
                ref={batchFileInputRef}
                type="file"
                accept=".json"
                onChange={handleImportBatch}
                className="hidden"
              />
            </label>
          </div>
          
          {/* Factory Presets */}
          <div>
            <h3 className="text-sm font-medium text-zinc-300 mb-2">Factory Presets</h3>
            <div className="space-y-2">
              {factoryPresets.map(preset => (
                <PresetItem key={preset.id} preset={preset} isFactory={true} />
              ))}
            </div>
          </div>
          
          {/* Custom Presets */}
          <div>
            <h3 className="text-sm font-medium text-zinc-300 mb-2">Custom Presets</h3>
            <div className="space-y-2">
              {customPresets.length === 0 ? (
                <div className="text-zinc-500 text-sm py-4 text-center">
                  No custom presets yet. Save your current settings to create one.
                </div>
              ) : (
                customPresets.map(preset => (
                  <PresetItem key={preset.id} preset={preset} isFactory={false} />
                ))
              )}
            </div>
          </div>
        </div>
        
        {/* Save Dialog */}
        {saveDialogOpen && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <div className="bg-zinc-800 rounded-lg p-4 w-80">
              <h3 className="text-lg font-semibold mb-3">Save Preset</h3>
              <input
                type="text"
                value={saveName}
                onChange={e => setSaveName(e.target.value)}
                placeholder="Preset name"
                className="w-full px-3 py-2 bg-zinc-700 border border-zinc-600 rounded-lg mb-4"
                autoFocus
                onKeyDown={e => {
                  if (e.key === 'Enter') handleSaveCurrent()
                  if (e.key === 'Escape') setSaveDialogOpen(false)
                }}
              />
              <div className="flex gap-2">
                <button
                  onClick={handleSaveCurrent}
                  disabled={!saveName.trim()}
                  className="px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  Save
                </button>
                <button
                  onClick={() => setSaveDialogOpen(false)}
                  className="px-4 py-2 bg-zinc-600 rounded-lg hover:bg-zinc-500"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* Rename Dialog */}
        {editingId && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <div className="bg-zinc-800 rounded-lg p-4 w-80">
              <h3 className="text-lg font-semibold mb-3">Rename Preset</h3>
              <input
                type="text"
                value={newName}
                onChange={e => setNewName(e.target.value)}
                className="w-full px-3 py-2 bg-zinc-700 border border-zinc-600 rounded-lg mb-4"
                autoFocus
                onKeyDown={e => {
                  if (e.key === 'Enter') handleRename()
                  if (e.key === 'Escape') handleCancelRename()
                }}
              />
              <div className="flex gap-2">
                <button
                  onClick={handleRename}
                  disabled={!newName.trim()}
                  className="px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  Rename
                </button>
                <button
                  onClick={handleCancelRename}
                  className="px-4 py-2 bg-zinc-600 rounded-lg hover:bg-zinc-500"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
