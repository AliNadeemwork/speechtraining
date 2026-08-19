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
    u.onerror = (e) => {
      if (cancelled) return
      if (e?.error && e.error !== 'interrupted' && e.error !== 'canceled') {
        console.warn('[tts] speech error:', e.error)
      }
      timer = setTimeout(() => speakOnce(remaining - 1), gapMs)
    }
    // Chrome has a known bug where speak() can silently no-op (or fire an
    // immediate "interrupted" error) if the synth was left in a paused
    // state by a previous call — resume() first works around it.
    synth.resume()
    synth.speak(u)
  }

  // Safari/Chrome sometimes need a cancel() to clear a stuck queue. Calling
  // speak() synchronously right after cancel() is a well-known cause of
  // Chrome silently killing the new utterance with an "interrupted" error
  // instead of ever producing sound — a short delay avoids the race.
  synth.cancel()
  timer = setTimeout(() => speakOnce(times), 80)

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
