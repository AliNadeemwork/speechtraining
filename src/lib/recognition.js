// Speech recognition wrapper around the Web Speech API.
//
// This is intentionally the ONLY module that touches the browser
// recognition API. When iOS support is needed, replace the internals
// with a cloud speech-to-text call — the rest of the app won't change.

const SR = typeof window !== 'undefined'
  ? (window.SpeechRecognition || window.webkitSpeechRecognition)
  : null

export function isRecognitionSupported() {
  return !!SR
}

/**
 * Listen once and return all alternative transcripts.
 * @param {object} opts
 * @param {(transcripts: string[]) => void} opts.onResult
 * @param {(error: string) => void} opts.onError
 * @returns {() => void} stop function
 */
export function listenOnce({ onResult, onError }) {
  if (!SR) { onError?.('unsupported'); return () => {} }

  const rec = new SR()
  rec.lang = 'en-US'
  rec.interimResults = false
  rec.maxAlternatives = 5
  rec.continuous = false

  let finished = false
  // Safety net: some Android builds never fire onend after silence.
  const watchdog = setTimeout(() => {
    if (!finished) { finished = true; try { rec.stop() } catch {} ; onResult?.([]) }
  }, 8000)

  rec.onresult = (e) => {
    if (finished) return
    finished = true
    clearTimeout(watchdog)
    const alts = []
    const result = e.results[e.results.length - 1]
    for (let i = 0; i < result.length; i++) alts.push(result[i].transcript)
    onResult?.(alts)
  }

  rec.onerror = (e) => {
    if (finished) return
    finished = true
    clearTimeout(watchdog)
    if (e.error === 'no-speech' || e.error === 'aborted') onResult?.([])
    else onError?.(e.error)
  }

  rec.onend = () => {
    if (finished) return
    finished = true
    clearTimeout(watchdog)
    onResult?.([])
  }

  try { rec.start() } catch {
    finished = true
    clearTimeout(watchdog)
    onError?.('start-failed')
  }

  return () => {
    if (finished) return
    finished = true
    clearTimeout(watchdog)
    try { rec.abort() } catch {}
  }
}
