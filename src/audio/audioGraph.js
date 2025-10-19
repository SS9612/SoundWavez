let ctx, analyser, gain, mediaSource, currentStream

export function ensureAudio() {
  if (!ctx) {
    const ACtx = window.AudioContext || window.webkitAudioContext
    ctx = new ACtx()
    analyser = ctx.createAnalyser()
    gain = ctx.createGain()
    analyser.connect(gain)
    gain.connect(ctx.destination)
  }
  return { ctx, analyser, gain }
}

export async function setAnalyserOptions({ fftSize=1024, smoothing=0.8 }={}) {
  ensureAudio()
  analyser.fftSize = Math.min(32768, Math.max(32, fftSize))
  analyser.smoothingTimeConstant = Math.max(0, Math.min(0.99, smoothing))
}

export async function loadFile(audioEl) {
  const { ctx } = ensureAudio()
  if (ctx.state === 'suspended') await ctx.resume()
  
  // Stop any existing mic stream
  if (currentStream) {
    currentStream.getTracks().forEach(t => t.stop())
    currentStream = null
  }
  
  if (mediaSource) try { mediaSource.disconnect() } catch {}
  mediaSource = ctx.createMediaElementSource(audioEl)
  mediaSource.connect(analyser)
}

export async function enableMic() {
  const { ctx } = ensureAudio()
  if (ctx.state === 'suspended') await ctx.resume()
  
  // Stop any existing stream first
  if (currentStream) {
    currentStream.getTracks().forEach(t => t.stop())
  }
  
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
  currentStream = stream
  
  if (mediaSource) try { mediaSource.disconnect() } catch {}
  mediaSource = ctx.createMediaStreamSource(stream)
  mediaSource.connect(analyser)
  return stream
}

export function stopMic() {
  if (currentStream) {
    currentStream.getTracks().forEach(t => t.stop())
    currentStream = null
  }
  if (mediaSource) {
    try { mediaSource.disconnect() } catch {}
    mediaSource = null
  }
}

export function getAnalyser() { ensureAudio(); return analyser }
