import React from 'react'

export default function EmptyState({ onLoadFile, onEnableMic }) {
  return (
    <div className="flex flex-col items-center justify-center h-full p-8 text-center">
      <div className="text-6xl mb-4">🎵</div>
      <h2 className="text-2xl font-semibold mb-2 text-zinc-100">No Audio Loaded</h2>
      <p className="text-zinc-400 mb-6 max-w-md">
        Load an audio file or enable your microphone to start visualizing sound.
      </p>
      <div className="flex gap-4">
        <button
          onClick={onLoadFile}
          className="px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Load Audio File
        </button>
        <button
          onClick={onEnableMic}
          className="px-4 py-2 bg-zinc-700 rounded-lg hover:bg-zinc-600 transition-colors"
        >
          Enable Microphone
        </button>
      </div>
      <div className="mt-8 text-sm text-zinc-500">
        Keyboard shortcuts: Space = Play/Pause, M = Mic, C = Controls
      </div>
    </div>
  )
}
