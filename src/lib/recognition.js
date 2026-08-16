// Speech recognition adapter — the ONLY file allowed to know how speech is
// actually recognized. No UI file may import an engine directly, only this
// adapter, and no UI file may import 'vosk-browser' or
// '@huggingface/transformers' — those only appear here and in
// phonemeWorker.js.
//
// ---------------------------------------------------------------------
// DUAL-ENGINE INTERFACE CONTRACT:
//   type RecognitionMode = 'word' | 'phoneme'
//   interface RecognitionConfig {
//     mode: RecognitionMode
//     target: string            // the expected word/phoneme (informational
//                                // for callers/evaluators; not used to bias
//                                // decoding — both engines decode freely)
//     allowedWords?: string[]   // 'word' mode only: the grammar list. The
//                                // adapter always appends '[unk]'.
//     language?: 'en'           // only 'en' is implemented for either mode
//   }
//
//   init(mode): Promise<void>
//     — loads the engine for this mode (singleton per mode; switching modes
//       loads the other engine but does not discard the first — both can
//       stay warm across Numbers <-> Alphabets navigation in the same tab).
//   listen(config): Promise<string>
//     — 'word' mode: builds/reuses the Vosk grammar from config.allowedWords
//       and returns the recognized word, or '[unk]' if Vosk heard speech it
//       couldn't match, or '[noattempt]' if no speech was ever detected.
//     — 'phoneme' mode: records ~1.8s of audio, runs the Wav2Vec2 CTC model,
//       and returns the raw IPA phoneme string Vosk— sorry, Wav2Vec2 —
//       decoded, or '[unk]'/'[noattempt]' with the same meaning as above.
//     Evaluation (is this recognized text "correct" for the current target)
//     happens OUTSIDE the adapter — see lib/evaluate.js (word) and
//     lib/phonemeEvaluator.js (phoneme) — the adapter only ever returns raw
//     recognized text, never a pass/fail judgement.
//   stop(): Promise<void>
//     — cancel whatever listen() is currently in flight, if any, with no
//       result (used for unmount/Exit cleanup).
//
//   Also exported for lifecycle/UI-gating (both modes):
//   isSupported(): boolean
//   isReady(mode): boolean — has init(mode) finished loading that engine?
//   terminate(): void — full teardown of BOTH engines (worker, model, mic).
// ---------------------------------------------------------------------

// ============================== WORD engine (Vosk) ==========================
// Small on-device English Vosk model, run via vosk-browser (which manages
// its own Web Worker internally — see node_modules/vosk-browser). Grammar-
// constrained decoding means the recognizer can only ever return one of the
// words we give it, or '[unk]' — this is what makes noise/silence safe
// instead of mapping onto a random real word, AS LONG AS it is actually
// given real speech audio to decode (see SILENCE GATING below).
// UNCHANGED from the pre-dual-engine version other than being wrapped in
// the new init/listen/stop shape instead of 4 separate top-level functions.

import { createModel } from 'vosk-browser'

// TODO(production): self-hosting this ~40MB model file (instead of a
// third-party GitHub Pages URL) would make offline/CI environments more
// reliable — see README.
const VOSK_MODEL_URL = 'https://ccoreilly.github.io/vosk-browser/models/vosk-model-small-en-us-0.15.tar.gz'

const VOSK_SAMPLE_RATE = 16000
const AUTO_STOP_MS = 2000        // hard upper bound on any single word-mode attempt
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

function computeRms(buf) {
  let sum = 0
  for (let i = 0; i < buf.length; i++) sum += buf[i] * buf[i]
  return Math.sqrt(sum / (buf.length || 1))
}

function createWordEngine() {
  let model = null
  let modelLoadPromise = null
  let recognizer = null
  let currentGrammarKey = null
  let lastResultText = null
  let lastPartialText = ''
  let session = null
  let busy = false

  async function init() {
    if (!modelLoadPromise) {
      modelLoadPromise = createModel(VOSK_MODEL_URL).then((m) => { model = m })
        .catch((err) => { modelLoadPromise = null; throw err })
    }
    return modelLoadPromise
  }

  function isReady() { return !!model }

  function setGrammar(allowedWords) {
    if (!model) throw new Error('init(\'word\') must resolve before listen()')
    const words = [...new Set((allowedWords || []).map(w => String(w).toLowerCase().trim()).filter(Boolean))]
    if (!words.includes('[unk]')) words.push('[unk]')
    const grammarKey = JSON.stringify(words)
    if (grammarKey === currentGrammarKey) return

    debugLog('setGrammar', grammarKey)
    recognizer?.remove()
    currentGrammarKey = grammarKey
    lastResultText = null
    lastPartialText = ''
    recognizer = new model.KaldiRecognizer(VOSK_SAMPLE_RATE, grammarKey)
    recognizer.on('result', (message) => {
      lastResultText = message?.result?.text ?? ''
      debugLog('raw result event', JSON.stringify(message?.result))
    })
    recognizer.on('partialresult', (message) => {
      lastPartialText = message?.result?.partial ?? ''
    })
  }

  async function record() {
    if (busy) throw new Error('busy')
    busy = true

    let stream
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        audio: { channelCount: 1, sampleRate: VOSK_SAMPLE_RATE, echoCancellation: true, noiseSuppression: true },
      })
    } catch (err) {
      busy = false
      const denied = err?.name === 'NotAllowedError' || err?.name === 'PermissionDeniedError'
      throw new Error(denied ? 'mic-denied' : 'start-failed')
    }
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
    let voicedMs = 0
    let silenceMs = 0
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

      const spokeSomething = hasSpokenOnce || lastPartialText.trim().length > 0
      if (!spokeSomething) {
        debugLog('finalize: no speech detected', { elapsedMs: Math.round(elapsedMs), peakRms })
        busy = false
        session = null
        resolveFinal('[noattempt]')
        return
      }

      try { recognizer.retrieveFinalResult() } catch {}
      setTimeout(() => {
        const text = lastResultText && lastResultText.trim() ? lastResultText.trim() : '[unk]'
        debugLog('finalize', {
          audioMs: Math.round(elapsedMs), peakRms, rawResultText: lastResultText,
          lastPartial: lastPartialText, resolved: text,
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
        elapsedMs >= MIN_LISTEN_MS && hasSpokenOnce &&
        lastPartialText.trim().length > 0 && silenceMs >= SILENCE_HOLD_MS
      ) {
        finalize()
      }
    }

    source.connect(processor)
    processor.connect(audioCtx.destination)

    session = { finalize, promise: finalPromise, abort: () => { stopped = true; teardownAudio(); busy = false; session = null } }
    return finalPromise
  }

  async function listen(config) {
    setGrammar(config.allowedWords || [])
    return record()
  }

  function stop() {
    session?.abort()
    return Promise.resolve()
  }

  function terminate() {
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

  return { init, listen, stop, isReady, terminate }
}

// ============================ PHONEME engine (Wav2Vec2) =====================
// See phonemeWorker.js for the full explanation of why this model needs the
// low-level (tokenizer-bypassing) loading path. This module only owns audio
// capture + the worker protocol; all model/decoding details stay in the
// worker.

const PHONEME_SAMPLE_RATE = 16000
const PHONEME_RECORD_MS = 1800    // 1.5-2.0s per spec
const PHONEME_SILENCE_RMS = 0.012 // same noise floor as the word engine

function debugEnabledPhoneme() {
  try { return localStorage.getItem('phonemeDebug') === '1' } catch { return false }
}
function debugLogPhoneme(...args) {
  if (debugEnabledPhoneme()) console.log('[phoneme]', ...args)
}

function downsampleTo16k(float32, fromRate) {
  if (fromRate === PHONEME_SAMPLE_RATE) return float32
  const ratio = fromRate / PHONEME_SAMPLE_RATE
  const outLength = Math.floor(float32.length / ratio)
  const out = new Float32Array(outLength)
  for (let i = 0; i < outLength; i++) {
    const srcIndex = i * ratio
    const i0 = Math.floor(srcIndex)
    const i1 = Math.min(i0 + 1, float32.length - 1)
    const frac = srcIndex - i0
    out[i] = float32[i0] * (1 - frac) + float32[i1] * frac
  }
  return out
}

function createPhonemeEngine() {
  let worker = null
  let readyPromise = null
  let ready = false
  let nextId = 1
  let busy = false
  let currentAbort = null

  function getWorker() {
    if (!worker) {
      worker = new Worker(new URL('./phonemeWorker.js', import.meta.url), { type: 'module' })
    }
    return worker
  }

  function init() {
    if (!readyPromise) {
      readyPromise = new Promise((resolve, reject) => {
        const w = getWorker()
        const handle = (e) => {
          const msg = e.data
          if (msg.type === 'progress') debugLogPhoneme('progress', msg.progress)
          else if (msg.type === 'ready') {
            w.removeEventListener('message', handle)
            ready = true
            resolve()
          } else if (msg.type === 'error' && !msg.id) {
            w.removeEventListener('message', handle)
            reject(new Error(msg.error))
          }
        }
        w.addEventListener('message', handle)
        w.postMessage({ type: 'warmup' })
      }).catch((err) => { readyPromise = null; throw err })
    }
    return readyPromise
  }

  function isReady() { return ready }

  function record() {
    return new Promise((resolve, reject) => {
      navigator.mediaDevices.getUserMedia({
        audio: { channelCount: 1, sampleRate: PHONEME_SAMPLE_RATE, echoCancellation: true, noiseSuppression: true },
      }).then((stream) => {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)()
        const source = audioCtx.createMediaStreamSource(stream)
        const processor = audioCtx.createScriptProcessor(4096, 1, 1)
        const chunks = []
        let peakRms = 0
        let stopped = false

        const teardown = () => {
          if (stopped) return
          stopped = true
          try { processor.disconnect() } catch {}
          try { source.disconnect() } catch {}
          try { stream.getTracks().forEach(t => t.stop()) } catch {}
          const rate = audioCtx.sampleRate
          audioCtx.close().catch(() => {})
          const total = chunks.reduce((n, c) => n + c.length, 0)
          const merged = new Float32Array(total)
          let offset = 0
          for (const c of chunks) { merged.set(c, offset); offset += c.length }
          resolve({ merged, rate, peakRms })
        }

        processor.onaudioprocess = (e) => {
          if (stopped) return
          const buf = new Float32Array(e.inputBuffer.getChannelData(0))
          chunks.push(buf)
          peakRms = Math.max(peakRms, computeRms(buf))
        }
        source.connect(processor)
        processor.connect(audioCtx.destination)

        currentAbort = () => { teardown(); resolve({ merged: new Float32Array(0), rate: audioCtx.sampleRate, peakRms: 0, aborted: true }) }
        setTimeout(teardown, PHONEME_RECORD_MS)
      }).catch((err) => {
        const denied = err?.name === 'NotAllowedError' || err?.name === 'PermissionDeniedError'
        reject(new Error(denied ? 'mic-denied' : 'start-failed'))
      })
    })
  }

  async function listen() {
    if (busy) throw new Error('busy')
    if (!ready) throw new Error('init(\'phoneme\') must resolve before listen()')
    busy = true
    try {
      const { merged, rate, peakRms, aborted } = await record()
      if (aborted) return '[noattempt]'

      debugLogPhoneme('recorded', { durationMs: Math.round(merged.length / rate * 1000), peakRms })
      if (peakRms < PHONEME_SILENCE_RMS) {
        debugLogPhoneme('no speech detected')
        return '[noattempt]'
      }

      const audio16k = downsampleTo16k(merged, rate)
      const id = nextId++
      const w = getWorker()
      const phonemes = await new Promise((resolve, reject) => {
        const handle = (e) => {
          const msg = e.data
          if (msg.id !== id) return
          w.removeEventListener('message', handle)
          if (msg.type === 'result') resolve(msg.phonemes)
          else if (msg.type === 'error') reject(new Error(msg.error))
        }
        w.addEventListener('message', handle)
        w.postMessage({ type: 'transcribe', id, audio: audio16k })
      })
      debugLogPhoneme('raw phoneme output', JSON.stringify(phonemes))
      return phonemes && phonemes.trim() ? phonemes.trim() : '[unk]'
    } finally {
      busy = false
    }
  }

  function stop() {
    currentAbort?.()
    return Promise.resolve()
  }

  function terminate() {
    worker?.terminate()
    worker = null
    readyPromise = null
    ready = false
    busy = false
    currentAbort = null
  }

  return { init, listen, stop, isReady, terminate }
}

// ================================ ADAPTER ====================================

const engines = {
  word: createWordEngine(),
  phoneme: createPhonemeEngine(),
}

export function isSupported() {
  return typeof window !== 'undefined' &&
    !!(navigator.mediaDevices?.getUserMedia) &&
    typeof Worker !== 'undefined'
}

export async function init(mode) {
  if (!engines[mode]) throw new Error(`Unknown recognition mode: ${mode}`)
  if (!isSupported()) throw new Error('unsupported')
  return engines[mode].init()
}

export function isReady(mode) {
  return !!engines[mode]?.isReady()
}

/**
 * @param {{mode:'word'|'phoneme', target?:string, allowedWords?:string[], language?:'en'}} config
 * @returns {Promise<string>} recognized word / phoneme string / '[unk]' / '[noattempt]'
 */
export async function listen(config) {
  const engine = engines[config.mode]
  if (!engine) throw new Error(`Unknown recognition mode: ${config.mode}`)
  return engine.listen(config)
}

export async function stop() {
  await Promise.all(Object.values(engines).map(e => e.stop()))
}

export function terminate() {
  Object.values(engines).forEach(e => e.terminate())
}

// ========================= future scoring engine ==========================
// A future pronunciation-scoring engine (returning a confidence/quality
// score instead of just accept/reject) would plug in here as another entry
// in `engines`, behind the same {init, listen, stop, isReady, terminate}
// shape. Not implemented; nothing installed for it.
// ===========================================================================
