import React, { useRef, useState, useEffect } from 'react'
import CanvasView from './viz/CanvasView'
import ControlsPanel from './components/ControlsPanel'
import PerformanceMonitor from './components/PerformanceMonitor'
import PresetManager from './components/PresetManager'
import OnboardingTooltip from './components/OnboardingTooltip'
import SettingsMenu from './components/SettingsMenu'
import { loadFile, enableMic, stopMic } from './audio/audioGraph'
import { useUIStore } from './state/useUIStore'

export default function App() {
  const audioRef = useRef(null)
  const [micOn, setMicOn] = useState(false)
  const [playing, setPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [currentFile, setCurrentFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [performance, setPerformance] = useState({ fps: 60, droppedFrames: 0 })
  const [showPresets, setShowPresets] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const set = useUIStore(s => s.set)
  const mode = useUIStore(s => s.mode)
  const showControls = useUIStore(s => s.showControls)
  const showPerformance = useUIStore(s => s.showPerformance)
  const hasSeenOnboarding = useUIStore(s => s.hasSeenOnboarding)

  // File format validation
  const validFormats = ['audio/mpeg', 'audio/wav', 'audio/mp4', 'audio/m4a', 'audio/ogg', 'audio/mp3']
  
  const onFile = async (e) => {
    const f = e.target.files?.[0]
    if (!f) return
    
    // Validate file format
    if (!validFormats.some(fmt => f.type.includes(fmt) || f.name.toLowerCase().endsWith(fmt.split('/')[1]))) {
      alert(`Format ${f.type} may not be supported. Try mp3, wav, or m4a.`)
      return
    }
    
    setLoading(true)
    try {
      // Stop mic if active
      if (micOn) {
        stopMic()
        setMicOn(false)
      }
      
      const url = URL.createObjectURL(f)
      const audio = audioRef.current
      audio.src = url
      setCurrentFile(f.name)
      await loadFile(audio)
      // Don't auto-play, let user control it
    } catch (err) {
      alert('Error loading file: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleLoadFile = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'audio/*'
    input.onchange = onFile
    input.click()
  }

  const onMic = async () => {
    if (micOn) {
      stopMic()
      setMicOn(false)
      setCurrentFile(null)
      return
    }
    try {
      // Stop any playing audio
      if (audioRef.current) {
        audioRef.current.pause()
        setPlaying(false)
      }
      
      await enableMic()
      setMicOn(true)
      setCurrentFile('Microphone')
    } catch (err) {
      alert('Microphone was blocked. Please allow access.')
    }
  }

  const handleEnableMic = () => {
    onMic()
  }

  const togglePlayPause = () => {
    const audio = audioRef.current
    if (!audio || !audio.src) return
    
    if (playing) {
      audio.pause()
    } else {
      audio.play().catch(() => {
        alert('Audio playback failed. Try clicking play again.')
      })
    }
  }

  const handlePerformanceUpdate = (perf) => {
    setPerformance(perf)
  }

  // Audio event listeners
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const handlePlay = () => setPlaying(true)
    const handlePause = () => setPlaying(false)
    const handleTimeUpdate = () => {
      if (audio.duration) {
        setProgress(audio.currentTime / audio.duration)
      }
    }
    const handleEnded = () => setPlaying(false)

    audio.addEventListener('play', handlePlay)
    audio.addEventListener('pause', handlePause)
    audio.addEventListener('timeupdate', handleTimeUpdate)
    audio.addEventListener('ended', handleEnded)

    return () => {
      audio.removeEventListener('play', handlePlay)
      audio.removeEventListener('pause', handlePause)
      audio.removeEventListener('timeupdate', handleTimeUpdate)
      audio.removeEventListener('ended', handleEnded)
    }
  }, [])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') return
      
      switch (e.code) {
        case 'Space':
          e.preventDefault()
          togglePlayPause()
          break
        case 'KeyM':
          e.preventDefault()
          onMic()
          break
        case 'KeyC':
          e.preventDefault()
          set({ showControls: !showControls })
          break
        case 'Digit1':
          e.preventDefault()
          set({ mode: 'bars' })
          break
        case 'Digit2':
          e.preventDefault()
          set({ mode: 'wave' })
          break
        case 'Digit3':
          e.preventDefault()
          set({ mode: 'radial' })
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [playing, micOn, showControls])

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="max-w-5xl mx-auto p-6 space-y-6">
        <header className="flex items-center gap-3">
          <h1 className="text-xl font-semibold">Music Visualizer</h1>
          
          {/* Current file info */}
          {currentFile && (
            <div className="text-sm text-zinc-400 truncate max-w-xs">
              {currentFile}
            </div>
          )}
          
          <div className="ml-auto flex gap-2">
            {/* Play/Pause button */}
            <button
              onClick={togglePlayPause}
              disabled={!currentFile || loading}
              className={`px-3 py-2 rounded-xl ring-1 transition-all ${
                playing 
                  ? 'ring-blue-400/40 bg-blue-400/10' 
                  : 'ring-white/10 hover:bg-white/5 disabled:opacity-50'
              }`}
            >
              {playing ? '⏸️' : '▶️'}
            </button>
            
                    {/* File input */}
                    <button
                      data-tooltip-target="load-file-btn"
                      onClick={handleLoadFile}
                      disabled={loading || micOn}
                      className="px-3 py-2 rounded-xl ring-1 ring-white/10 hover:bg-white/5 transition-all disabled:opacity-50"
                    >
                      {loading ? 'Loading...' : 'Load File'}
                    </button>
            
            {/* Mic button */}
            <button 
              onClick={onMic} 
              disabled={loading}
              className={`px-3 py-2 rounded-xl ring-1 transition-all ${
                micOn 
                  ? 'ring-emerald-400/40 bg-emerald-400/10' 
                  : 'ring-white/10 hover:bg-white/5'
              } disabled:opacity-50`}
            >
              {micOn ? '🎤 Mic On' : '🎤 Mic'}
            </button>
            
                    {/* Mode selector */}
                    <select
                      data-tooltip-target="mode-selector"
                      value={mode}
                      onChange={e => set({ mode: e.target.value })}
                      className="px-3 py-2 rounded-xl bg-zinc-900 ring-1 ring-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="bars">Bars</option>
                      <option value="wave">Waveform</option>
                      <option value="radial">Radial Particles</option>
                    </select>
            
                    {/* Preset button */}
                    <button
                      data-tooltip-target="preset-btn"
                      onClick={() => setShowPresets(true)}
                      className="px-3 py-2 rounded-xl ring-1 ring-white/10 hover:bg-white/5 transition-all"
                    >
                      📁 Presets
                    </button>
                    
                    {/* Controls toggle */}
                    <button
                      data-tooltip-target="controls-btn"
                      onClick={() => set({ showControls: !showControls })}
                      className={`px-3 py-2 rounded-xl ring-1 transition-all ${
                        showControls 
                          ? 'ring-purple-400/40 bg-purple-400/10' 
                          : 'ring-white/10 hover:bg-white/5'
                      }`}
                    >
                      ⚙️
                    </button>
                    
                    {/* Settings menu */}
                    <button
                      onClick={() => setShowSettings(true)}
                      className="px-3 py-2 rounded-xl ring-1 ring-white/10 hover:bg-white/5 transition-all"
                    >
                      ⋯
                    </button>
          </div>
        </header>

        {/* Progress bar */}
        {currentFile && !micOn && (
          <div className="w-full bg-zinc-800 rounded-full h-2">
            <div 
              className="bg-blue-500 h-2 rounded-full transition-all duration-100"
              style={{ width: `${progress * 100}%` }}
            />
          </div>
        )}

                <CanvasView 
                  onPerformanceUpdate={handlePerformanceUpdate}
                  onLoadFile={handleLoadFile}
                  onEnableMic={handleEnableMic}
                />

        {/* Controls Panel */}
        {showControls && (
          <div className="animate-in slide-in-from-top-2 duration-200">
            <ControlsPanel />
          </div>
        )}

        {/* Performance Monitor */}
        <PerformanceMonitor 
          fps={performance.fps}
          droppedFrames={performance.droppedFrames}
          visible={showPerformance}
        />

                {/* Keyboard shortcuts help */}
                <div className="text-xs text-zinc-500 text-center">
                  Shortcuts: Space = Play/Pause, M = Mic, C = Controls, 1/2/3 = Modes
                </div>

                <audio ref={audioRef} className="hidden" crossOrigin="anonymous" />
              </div>
            </div>
            
            {/* Modals */}
            <PresetManager 
              visible={showPresets} 
              onClose={() => setShowPresets(false)} 
            />
            
            <SettingsMenu 
              visible={showSettings} 
              onClose={() => setShowSettings(false)} 
            />
            
            {/* Onboarding */}
            <OnboardingTooltip />
          </div>
        )
      }
