// Speech recognition adapter — the ONLY file allowed to know how speech is
// actually recognized. Swapping engines means rewriting the functions below
// behind the same exported interface; no other file may import
// 'vosk-browser' or reference model URLs/grammar mechanics.
//
// ---------------------------------------------------------------------
// INTERFACE CONTRACT:
//   initModel(language: 'en'): Promise<void>
//     — loads the recognition model once (singleton). Resolves when ready.
//       Safe to call multiple times; only the first call does real work.
//   setGrammar(allowedWords: string[]): void
//     — (re)builds the recognizer restricted to these words. Callers must
//       ALWAYS pass the section's full spokenWord list; '[unk]' is appended
//       automatically. Must be called after initModel() resolves.
//   startListening(): Promise<void>
//     — begins capturing mic audio into the recognizer. Resolves once
//       capture has actually started. Auto-stops itself after ~2s, or
//       earlier once real speech has been heard and then trails off into
//       silence (see SILENCE GATING below).
//   stopListening(): Promise<string>
//     — stops capture (if not already auto-stopped) and resolves the
//       recognized word; '[unk]' if Vosk heard speech but couldn't match a
//       grammar word; '[noattempt]' if no real speech was ever detected
//       (silence/mic issue) — callers must treat this differently from
//       '[unk]' (see PART 3 below).
//
//   Also exported for lifecycle management (not part of the original spec's
//   4-function list, but required for the app's "don't listen until ready"
//   / cleanup-on-exit requirements):
//   isSupported(): boolean
//   isModelReady(): boolean
//   abortListening(): void — cancel an in-flight listen with no result.
//   terminate(): void — full teardown (worker, model, mic). Re-initializes
//     lazily on the next initModel() call.
//
// SILENCE GATING (fixes a false-accept/premature-stop bug):
//   Silence-triggered auto-stop is NOT allowed to fire until real speech has
//   actually been heard (sustained energy above the noise floor, confirmed
//   by a non-empty Vosk partial result) — otherwise it was firing on the
//   silence BEFORE the child even started talking, at ~600ms, handing Vosk
//   a near-empty buffer. A grammar-constrained recognizer given almost no
//   signal does not reliably answer '[unk]' — it can decode SOME grammar
//   word from noise, which is what made this look like "accepts anything".
//   A hard MIN_LISTEN_MS also blocks any stop (silence or otherwise) in the
//   first stretch of the attempt, and the 2s cap remains the upper bound
//   regardless. If NO speech is ever detected for the whole attempt, the
//   result is '[noattempt]', not whatever Vosk guessed from noise.
//
// DEBUG LOGGING: set `localStorage.voskDebug = '1'` in the browser console
// to log grammar, raw Vosk result, audio duration, peak energy, and the
// PASS/FAIL decision (also logged by evaluate.js) for each attempt.
// ---------------------------------------------------------------------

// ============================== Vosk engine ================================
// Small on-device English Vosk model, run via vosk-browser (which manages
// its own Web Worker internally — see node_modules/vosk-browser). Grammar-
// constrained decoding means the recognizer can only ever return one of the
// words we give it, or '[unk]' — this is what makes noise/silence safe
// instead of mapping onto a random real word, AS LONG AS it is actually
// given real speech audio to decode (see SILENCE GATING above).

import { createModel } from 'vosk-browser'

// TODO(production): self-hosting this ~40MB model file (instead of a
// third-party GitHub Pages URL) would make offline/CI environments more
// reliable — see README.
const MODEL_URL = 'https://ccoreilly.github.io/vosk-browser/models/vosk-model-small-en-us-0.15.tar.gz'

const SAMPLE_RATE = 16000
const AUTO_STOP_MS = 2000        // hard upper bound on any single attempt
const MIN_LISTEN_MS = 700        // ignore any stop condition before this, so the child has time to start
const NOISE_FLOOR_RMS = 0.012    // below this = silence/background noise, not speech
const VOICE_HOLD_MS = 120        // sustained energy above the floor before we trust it as "speech started"
const SILENCE_HOLD_MS = 600      // silence after speech has been heard before we call it done
const FINAL_RESULT_WAIT_MS = 300 // grace period for the async 'result' event after retrieveFinalResult()

function debugEnabled() {
  try { return localStorage.getItem('voskDebug') === '1' } catch { return false }
}
function debugLog(...args) {
  if (debugEnabled()) console.log('[vosk]', ...args)
}

let model = null
let modelLoadPromise = null
let recognizer = null
let currentGrammarKey = null
let lastResultText = null
let lastPartialText = ''

let session = null // in-flight listen() session, see startListening/stopListening
let busy = false

export function isSupported() {
  return typeof window !== 'undefined' &&
    !!(navigator.mediaDevices?.getUserMedia) &&
    typeof Worker !== 'undefined'
}

export function isModelReady() {
  return !!model
}

export async function initModel(language = 'en') {
  if (language !== 'en') throw new Error(`Unsupported language: ${language}`)
  if (!isSupported()) throw new Error('unsupported')
  if (!modelLoadPromise) {
    modelLoadPromise = createModel(MODEL_URL).then((m) => { model = m })
      .catch((err) => { modelLoadPromise = null; throw err })
  }
  return modelLoadPromise
}

export function setGrammar(allowedWords) {
  if (!model) throw new Error('initModel must resolve before setGrammar')

  const words = [...new Set((allowedWords || []).map(w => String(w).toLowerCase().trim()).filter(Boolean))]
  if (!words.includes('[unk]')) words.push('[unk]')
  const grammarKey = JSON.stringify(words)
  if (grammarKey === currentGrammarKey) return // already listening for this exact word set

  debugLog('setGrammar', grammarKey)

  recognizer?.remove()
  currentGrammarKey = grammarKey
  lastResultText = null
  lastPartialText = ''
  recognizer = new model.KaldiRecognizer(SAMPLE_RATE, grammarKey)
  recognizer.on('result', (message) => {
    lastResultText = message?.result?.text ?? ''
    debugLog('raw result event', JSON.stringify(message?.result))
  })
  recognizer.on('partialresult', (message) => {
    lastPartialText = message?.result?.partial ?? ''
  })
}

function computeRms(buf) {
  let sum = 0
  for (let i = 0; i < buf.length; i++) sum += buf[i] * buf[i]
  return Math.sqrt(sum / (buf.length || 1))
}

export async function startListening() {
  if (!model || !recognizer) throw new Error('call initModel + setGrammar before startListening')
  if (busy) throw new Error('busy')
  busy = true

  let stream
  try {
    stream = await navigator.mediaDevices.getUserMedia({
      audio: { channelCount: 1, sampleRate: SAMPLE_RATE, echoCancellation: true, noiseSuppression: true },
    })
  } catch (err) {
    busy = false
    const denied = err?.name === 'NotAllowedError' || err?.name === 'PermissionDeniedError'
    throw new Error(denied ? 'mic-denied' : 'start-failed')
  }
  // Stream must actually be live before we start feeding/timing audio —
  // getUserMedia only resolves once it is, but guard against a dead/muted
  // track slipping through instead of silently starting/stopping instantly.
  if (!stream.getAudioTracks().some(t => t.readyState === 'live')) {
    stream.getTracks().forEach(t => t.stop())
    busy = false
    throw new Error('start-failed')
  }

  const audioCtx = new (window.AudioContext || window.webkitAudioContext)()
  const source = audioCtx.createMediaStreamSource(stream)
  const processor = audioCtx.createScriptProcessor(4096, 1, 1)

  lastResultText = null
  lastPartialText = ''
  let stopped = false
  let elapsedMs = 0
  let voicedMs = 0        // consecutive time above the noise floor, right now
  let silenceMs = 0       // consecutive time below the noise floor, since speech started
  let hasSpokenOnce = false
  let peakRms = 0
  let resolveFinal
  const finalPromise = new Promise((resolve) => { resolveFinal = resolve })

  const teardownAudio = () => {
    try { processor.disconnect() } catch {}
    try { source.disconnect() } catch {}
    try { stream.getTracks().forEach(t => t.stop()) } catch {}
    try { audioCtx.close() } catch {}
  }

  const finalize = () => {
    if (stopped) return
    stopped = true
    teardownAudio()

    // No real speech ever detected (no sustained energy above the noise
    // floor AND no non-empty partial from Vosk) — don't trust whatever the
    // grammar decoder guessed from near-silence. This is the guard for
    // "audio not reaching the recognizer" / a dead mic / a child who never
    // spoke: it must be a neutral no-attempt, not a pass or a real fail.
    const spokeSomething = hasSpokenOnce || lastPartialText.trim().length > 0
    if (!spokeSomething) {
      debugLog('finalize: no speech detected', { elapsedMs: Math.round(elapsedMs), peakRms })
      busy = false
      session = null
      resolveFinal('[noattempt]')
      return
    }

    try { recognizer.retrieveFinalResult() } catch {}
    // The 'result' event from retrieveFinalResult() arrives asynchronously
    // via the worker; give it a brief moment, then resolve with whatever we
    // have (falling back to '[unk]' if nothing usable came through).
    setTimeout(() => {
      const text = lastResultText && lastResultText.trim() ? lastResultText.trim() : '[unk]'
      debugLog('finalize', {
        audioMs: Math.round(elapsedMs),
        peakRms,
        rawResultText: lastResultText,
        lastPartial: lastPartialText,
        resolved: text,
      })
      busy = false
      session = null
      resolveFinal(text)
    }, FINAL_RESULT_WAIT_MS)
  }

  processor.onaudioprocess = (e) => {
    if (stopped) return
    const buf = e.inputBuffer.getChannelData(0)
    const chunkMs = (buf.length / audioCtx.sampleRate) * 1000
    elapsedMs += chunkMs

    const rms = computeRms(buf)
    peakRms = Math.max(peakRms, rms)

    if (rms >= NOISE_FLOOR_RMS) {
      voicedMs += chunkMs
      silenceMs = 0
      if (voicedMs >= VOICE_HOLD_MS) hasSpokenOnce = true
    } else {
      voicedMs = 0
      if (hasSpokenOnce) silenceMs += chunkMs
    }

    try { recognizer.acceptWaveformFloat(buf, audioCtx.sampleRate) } catch {}

    if (elapsedMs >= AUTO_STOP_MS) {
      finalize()
    } else if (
      elapsedMs >= MIN_LISTEN_MS &&
      hasSpokenOnce &&
      lastPartialText.trim().length > 0 &&
      silenceMs >= SILENCE_HOLD_MS
    ) {
      // Only allow silence to end the attempt AFTER we've actually heard
      // the child start speaking (sustained voice energy) and Vosk has
      // produced a non-empty partial for it — never on leading silence.
      finalize()
    }
  }

  source.connect(processor)
  processor.connect(audioCtx.destination)

  session = { finalize, promise: finalPromise, abort: () => { stopped = true; teardownAudio(); busy = false; session = null } }
}

export async function stopListening() {
  if (!session) {
    // Nothing in flight (already auto-stopped, or never started) — return
    // whatever the last known result was.
    return lastResultText && lastResultText.trim() ? lastResultText.trim() : '[unk]'
  }
  // IMPORTANT: do NOT force-finalize here. The app calls this immediately
  // after startListening() resolves (which happens as soon as the mic is
  // live, not after any listening time) — forcing an immediate stop was
  // the actual instant-false-accept bug: it cut off capture at ~0ms of
  // real audio, every single time, regardless of the silence-gating logic
  // above. Just await the attempt's own natural completion (MIN_LISTEN_MS
  // / silence-after-speech / the 2s cap, all handled inside
  // startListening()'s onaudioprocess loop).
  return session.promise
}

export function abortListening() {
  session?.abort()
}

export function terminate() {
  session?.abort()
  recognizer?.remove()
  recognizer = null
  currentGrammarKey = null
  lastResultText = null
  lastPartialText = ''
  model?.terminate()
  model = null
  modelLoadPromise = null
  busy = false
}

// ========================= future scoring engine ==========================
// A future pronunciation-scoring engine (returning a confidence/quality
// score instead of just accept/reject) would plug in here behind the same
// interface, e.g. by extending stopListening()'s resolved value. Not
// implemented; nothing installed for it.
// ===========================================================================
