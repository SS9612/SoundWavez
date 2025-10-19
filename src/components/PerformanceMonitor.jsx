import React from 'react'

/**
 * Performance monitor component
 * Shows real-time FPS and dropped frame count
 */
export default function PerformanceMonitor({ fps, droppedFrames, visible }) {
  if (!visible) return null
  
  const fpsColor = fps >= 50 ? 'text-green-400' : fps >= 30 ? 'text-yellow-400' : 'text-red-400'
  
  return (
    <div className="fixed bottom-4 right-4 bg-black/80 backdrop-blur-sm rounded-lg p-3 text-xs font-mono z-50">
      <div className={`${fpsColor} font-bold`}>{fps} FPS</div>
      <div className="text-zinc-400">Drops: {droppedFrames}</div>
    </div>
  )
}
