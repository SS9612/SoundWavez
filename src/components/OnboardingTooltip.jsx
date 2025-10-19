import React, { useState, useEffect } from 'react'
import { useUIStore } from '../state/useUIStore'

export default function OnboardingTooltip() {
  const hasSeenOnboarding = useUIStore(s => s.hasSeenOnboarding)
  const dismissOnboarding = useUIStore(s => s.dismissOnboarding)
  const [step, setStep] = useState(0)
  const [position, setPosition] = useState({ top: 0, left: 0 })
  const [visible, setVisible] = useState(false)

  const steps = [
    {
      target: 'load-file-btn',
      title: 'Load Your Music',
      content: 'Click here to load an audio file (mp3, wav, m4a) or use the mic button for live input.',
      placement: 'bottom'
    },
    {
      target: 'mode-selector',
      title: 'Choose Your Style',
      content: 'Switch between Bars, Waveform, and Radial Particles visualization modes.',
      placement: 'bottom'
    },
    {
      target: 'controls-btn',
      title: 'Fine-Tune Settings',
      content: 'Open controls to adjust sensitivity, smoothing, colors, and more.',
      placement: 'bottom'
    },
    {
      target: 'preset-btn',
      title: 'Save Presets',
      content: 'Save your favorite settings as presets for quick access later.',
      placement: 'bottom'
    }
  ]

  useEffect(() => {
    if (hasSeenOnboarding) return

    const updatePosition = () => {
      const target = document.querySelector(`[data-tooltip-target="${steps[step].target}"]`)
      if (!target) {
        setVisible(false)
        return
      }

      const rect = target.getBoundingClientRect()
      const tooltipHeight = 200
      const tooltipWidth = 300
      const padding = 16

      let top, left

      switch (steps[step].placement) {
        case 'bottom':
          top = rect.bottom + padding
          left = rect.left + (rect.width / 2) - (tooltipWidth / 2)
          break
        case 'top':
          top = rect.top - tooltipHeight - padding
          left = rect.left + (rect.width / 2) - (tooltipWidth / 2)
          break
        case 'left':
          top = rect.top + (rect.height / 2) - (tooltipHeight / 2)
          left = rect.left - tooltipWidth - padding
          break
        case 'right':
          top = rect.top + (rect.height / 2) - (tooltipHeight / 2)
          left = rect.right + padding
          break
        default:
          top = rect.bottom + padding
          left = rect.left + (rect.width / 2) - (tooltipWidth / 2)
      }

      // Keep tooltip within viewport
      const viewportWidth = window.innerWidth
      const viewportHeight = window.innerHeight

      if (left < padding) left = padding
      if (left + tooltipWidth > viewportWidth - padding) {
        left = viewportWidth - tooltipWidth - padding
      }
      if (top < padding) top = padding
      if (top + tooltipHeight > viewportHeight - padding) {
        top = viewportHeight - tooltipHeight - padding
      }

      setPosition({ top, left })
      setVisible(true)
    }

    // Initial position
    updatePosition()

    // Update position on scroll/resize
    const handleUpdate = () => {
      if (visible) updatePosition()
    }

    window.addEventListener('scroll', handleUpdate, true)
    window.addEventListener('resize', handleUpdate)

    return () => {
      window.removeEventListener('scroll', handleUpdate, true)
      window.removeEventListener('resize', handleUpdate)
    }
  }, [step, hasSeenOnboarding, visible])

  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep(step + 1)
    } else {
      handleSkip()
    }
  }

  const handleSkip = () => {
    dismissOnboarding()
    setVisible(false)
  }

  const handlePrevious = () => {
    if (step > 0) {
      setStep(step - 1)
    }
  }

  if (hasSeenOnboarding || !visible) return null

  const currentStep = steps[step]

  return (
    <div className="fixed inset-0 z-40 pointer-events-none">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/20 pointer-events-auto" />
      
      {/* Tooltip */}
      <div
        className="absolute bg-zinc-800 border border-zinc-600 rounded-lg p-4 shadow-2xl pointer-events-auto"
        style={{
          top: position.top,
          left: position.left,
          width: '300px',
          zIndex: 50
        }}
      >
        {/* Progress dots */}
        <div className="flex gap-1 mb-3">
          {steps.map((_, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full ${
                index === step ? 'bg-blue-500' : 'bg-zinc-600'
              }`}
            />
          ))}
        </div>
        
        {/* Content */}
        <h3 className="text-lg font-semibold text-zinc-100 mb-2">
          {currentStep.title}
        </h3>
        <p className="text-zinc-300 text-sm mb-4">
          {currentStep.content}
        </p>
        
        {/* Actions */}
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            {step > 0 && (
              <button
                onClick={handlePrevious}
                className="px-3 py-1 text-sm text-zinc-400 hover:text-zinc-200"
              >
                Previous
              </button>
            )}
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={handleSkip}
              className="px-3 py-1 text-sm text-zinc-400 hover:text-zinc-200"
            >
              Skip
            </button>
            <button
              onClick={handleNext}
              className="px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-700 text-sm"
            >
              {step === steps.length - 1 ? 'Got it!' : 'Next'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
