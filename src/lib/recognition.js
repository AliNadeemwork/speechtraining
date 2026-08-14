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
//       capture has actually started. Auto-stops itself after ~2s or on
//       sustained silence.
//   stopListening(): Promise<string>
//     — stops capture (if not already auto-stopped) and resolves the
//       recognized word, or '[unk]' if nothing usable was recognized.
//
//   Also exported for lifecycle management (not part of the original spec's
//   4-function list, but required for the app's "don't listen until ready"
//   / cleanup-on-exit requirements):
//   isSupported(): boolean
//   isModelReady(): boolean
//   abortListening(): void — cancel an in-flight listen with no result.
//   terminate(): void — full teardown (worker, model, mic). Re-initializes
//     lazily on the next initModel() call.
// ---------------------------------------------------------------------

// ============================== Vosk engine ================================
// Small on-device English Vosk model, run via vosk-browser (which manages
// its own Web Worker internally — see node_modules/vosk-browser). Grammar-
// constrained decoding means the recognizer can only ever return one of the
// words we give it, or '[unk]' — this is what makes noise/silence safe
// instead of mapping onto a random real word.

import { createModel } from 'vosk-browser'

// TODO(production): self-hosting this ~40MB model file (instead of a
// third-party GitHub Pages URL) would make offline/CI environments more
// reliable — see README.
const MODEL_URL = 'https://ccoreilly.github.io/vosk-browser/models/vosk-model-small-en-us-0.15.tar.gz'

const SAMPLE_RATE = 16000
const AUTO_STOP_MS = 2000
const SILENCE_RMS_THRESHOLD = 0.01
const SILENCE_HOLD_MS = 600
const MIN_LISTEN_MS = 350 // don't let silence-detection stop it before the child has a chance to start

let model = null
let modelLoadPromise = null
let recognizer = null
let currentGrammarKey = null
let lastResultText = null

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

  recognizer?.remove()
  currentGrammarKey = grammarKey
  lastResultText = null
  recognizer = new model.KaldiRecognizer(SAMPLE_RATE, grammarKey)
  recognizer.on('result', (message) => {
    lastResultText = message?.result?.text ?? ''
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

  const audioCtx = new (window.AudioContext || window.webkitAudioContext)()
  const source = audioCtx.createMediaStreamSource(stream)
  const processor = audioCtx.createScriptProcessor(4096, 1, 1)

  lastResultText = null
  let stopped = false
  let silenceMs = 0
  let elapsedMs = 0
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
    try { recognizer.retrieveFinalResult() } catch {}
    // The 'result' event from retrieveFinalResult() arrives asynchronously
    // via the worker; give it a brief moment, then resolve with whatever
    // we have (falling back to '[unk]' if nothing usable came through).
    setTimeout(() => {
      busy = false
      session = null
      resolveFinal(lastResultText && lastResultText.trim() ? lastResultText.trim() : '[unk]')
    }, 250)
  }

  processor.onaudioprocess = (e) => {
    if (stopped) return
    const buf = e.inputBuffer.getChannelData(0)
    const chunkMs = (buf.length / audioCtx.sampleRate) * 1000
    elapsedMs += chunkMs
    silenceMs = computeRms(buf) < SILENCE_RMS_THRESHOLD ? silenceMs + chunkMs : 0

    try { recognizer.acceptWaveformFloat(buf, audioCtx.sampleRate) } catch {}

    if (elapsedMs >= AUTO_STOP_MS) finalize()
    else if (elapsedMs >= MIN_LISTEN_MS && silenceMs >= SILENCE_HOLD_MS) finalize()
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
  session.finalize()
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
