// Text-to-speech via the browser's speechSynthesis.
// Speaks a word `times` times with a pause between repetitions.
// Returns a cancel function; resolves the onDone callback when finished
// or cancelled.

let voiceCache = null

function pickVoice() {
  if (voiceCache) return voiceCache
  const voices = window.speechSynthesis?.getVoices?.() || []
  voiceCache =
    voices.find(v => v.lang === 'en-US' && /female|natural|google/i.test(v.name)) ||
    voices.find(v => v.lang === 'en-US') ||
    voices.find(v => v.lang?.startsWith('en')) ||
    null
  return voiceCache
}

// Voices load asynchronously on some browsers.
if (typeof window !== 'undefined' && window.speechSynthesis) {
  window.speechSynthesis.onvoiceschanged = () => { voiceCache = null; pickVoice() }
}

export function speakRepeated(word, times, { rate = 0.75, gapMs = 900 } = {}, onDone) {
  const synth = window.speechSynthesis
  if (!synth) { onDone?.(); return () => {} }

  let cancelled = false
  let timer = null

  const speakOnce = (remaining) => {
    if (cancelled) return
    if (remaining <= 0) { onDone?.(); return }

    const u = new SpeechSynthesisUtterance(word)
    const v = pickVoice()
    if (v) u.voice = v
    u.lang = 'en-US'
    u.rate = rate
    u.pitch = 1.05
    u.onend = () => {
      if (cancelled) return
      timer = setTimeout(() => speakOnce(remaining - 1), gapMs)
    }
    u.onerror = () => {
      if (cancelled) return
      timer = setTimeout(() => speakOnce(remaining - 1), gapMs)
    }
    synth.speak(u)
  }

  // Safari/Chrome sometimes need a cancel() to clear a stuck queue.
  synth.cancel()
  speakOnce(times)

  return () => {
    cancelled = true
    clearTimeout(timer)
    synth.cancel()
    onDone?.()
  }
}

export function speakOnce(word, opts = {}) {
  return speakRepeated(word, 1, opts)
}
