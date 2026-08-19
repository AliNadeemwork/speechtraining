// Text-to-speech via the browser's speechSynthesis.
// Speaks a word `times` times with a pause between repetitions.
// Returns a cancel function; resolves the onDone callback when finished
// or cancelled.

const voiceCache = {}

function pickVoice(lang) {
  if (voiceCache[lang] !== undefined) return voiceCache[lang]
  const voices = window.speechSynthesis?.getVoices?.() || []
  const base = lang.split('-')[0]
  // No installed voice for the requested language (e.g. no Urdu voice on
  // this device/browser — confirmed to be the common case right now) must
  // still fall back to SOME voice. Leaving u.voice unset while u.lang stays
  // set to an unsupported language is what was causing total silence on
  // Listen: several browsers (Chrome in particular) look up a voice for
  // that lang, find none, and silently refuse to speak at all instead of
  // using the default voice. Mispronounced audio beats no audio.
  const found =
    voices.find(v => v.lang === lang && /female|natural|google/i.test(v.name)) ||
    voices.find(v => v.lang === lang) ||
    voices.find(v => v.lang?.startsWith(base)) ||
    voices.find(v => v.default) ||
    voices[0] ||
    null
  voiceCache[lang] = found
  return found
}

// Voices load asynchronously on some browsers.
if (typeof window !== 'undefined' && window.speechSynthesis) {
  window.speechSynthesis.onvoiceschanged = () => {
    for (const key of Object.keys(voiceCache)) delete voiceCache[key]
  }
}

export function speakRepeated(word, times, { rate = 0.75, gapMs = 900, lang = 'en-US' } = {}, onDone) {
  const synth = window.speechSynthesis
  if (!synth) { onDone?.(); return () => {} }

  let cancelled = false
  let timer = null

  const speakOnce = (remaining) => {
    if (cancelled) return
    if (remaining <= 0) { onDone?.(); return }

    const u = new SpeechSynthesisUtterance(word)
    const v = pickVoice(lang)
    if (v) u.voice = v
    // Match the utterance's lang to whatever voice actually got picked —
    // if that's a fallback voice for a different language (see pickVoice),
    // keeping u.lang set to the ORIGINAL unsupported language is exactly
    // what causes some browsers to refuse to speak at all.
    u.lang = v?.lang || lang
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
