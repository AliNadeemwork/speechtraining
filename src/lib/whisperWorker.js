// Web Worker: Urdu speech recognition via Whisper, run through Transformers.js.
// Kept entirely inside this worker so no other file needs to import
// @huggingface/transformers or know the model id/device — see
// src/lib/recognition.js for the adapter that owns this (mirrors the
// phonemeWorker.js pattern already established for the phonics engine).
//
// Whisper (unlike the Wav2Vec2-phoneme model) ships a real tokenizer, so the
// high-level pipeline() API works directly — no low-level bypass needed.

import { pipeline, env } from '@huggingface/transformers'

// Same onnxruntime-web WASM-asset fix phonemeWorker.js needs: the auto-
// resolution breaks inside a nested Vite-bundled Worker module. NOTE: this
// version must match node_modules/onnxruntime-web's installed version (a
// transitive dep of @huggingface/transformers) or the JS glue and .wasm
// binary can drift out of sync after a dependency bump.
env.backends.onnx.wasm.wasmPaths =
  'https://cdn.jsdelivr.net/npm/onnxruntime-web@1.22.0-dev.20250409-89f8206ba4/dist/'
env.backends.onnx.wasm.numThreads = 1
env.allowLocalModels = false

// Single constant to swap models — see PHONICS_RESEARCH_BRIEF-style proof
// table in data/urdu.js's header comment for why whisper-base was picked
// over whisper-tiny (tiny is faster/smaller but noticeably less accurate on
// short single-word Urdu utterances; swap this one line to try tiny).
const MODEL_ID = 'Xenova/whisper-base'
// const MODEL_ID = 'Xenova/whisper-tiny' // faster/smaller fallback — tested notably less accurate on Urdu, see recognition test notes in data/urdu.js

const SAMPLE_RATE = 16000

let loadPromise = null
let transcriber = null

function loadViaDevice(device) {
  return pipeline('automatic-speech-recognition', MODEL_ID, {
    device,
    progress_callback: (p) => self.postMessage({ type: 'progress', progress: p }),
  })
}

// A FAILED webgpu pipeline() load (e.g. navigator.gpu exists as a stub API
// surface but requestAdapter() finds no real adapter — confirmed to happen
// in headless/CI Chromium, and plausibly on some real low-end devices too)
// leaves onnxruntime-web's shared WASM module state corrupted: a following
// device:'wasm' retry in the SAME worker then hangs forever at session
// creation instead of completing or erroring (reproduced directly — wasm
// alone loads in ~17s and transcribes in ~1.5s, every time; webgpu-then-
// wasm-fallback hangs indefinitely, every time). So: cheaply pre-check for
// a real adapter with requestAdapter() BEFORE ever calling pipeline() with
// device:'webgpu' — never let a doomed webgpu pipeline() call happen.
async function hasRealWebGPUAdapter() {
  try {
    if (typeof navigator === 'undefined' || !navigator.gpu?.requestAdapter) return false
    const adapter = await navigator.gpu.requestAdapter()
    return !!adapter
  } catch {
    return false
  }
}

async function ensureLoaded() {
  if (!loadPromise) {
    loadPromise = (async () => {
      const canUseWebGPU = await hasRealWebGPUAdapter()
      transcriber = canUseWebGPU ? await loadViaDevice('webgpu') : await loadViaDevice('wasm')
    })().catch((err) => { loadPromise = null; throw err })
  }
  return loadPromise
}

self.onmessage = async (e) => {
  const { type } = e.data

  if (type === 'warmup') {
    try {
      await ensureLoaded()
      self.postMessage({ type: 'ready' })
    } catch (err) {
      self.postMessage({ type: 'error', error: String(err?.message || err) })
    }
    return
  }

  if (type === 'transcribe') {
    const { audio, id } = e.data
    try {
      await ensureLoaded()
      const result = await transcriber(audio, {
        language: 'urdu',
        task: 'transcribe',
        sampling_rate: SAMPLE_RATE,
        // Whisper's decoder can get stuck in a repetition loop on very
        // short/ambiguous audio (a single letter name, <1s) — reproduced
        // directly (e.g. "ارسی ارسی ارسی..." repeated ~100+ times). These
        // are the standard mitigations: cap generation length (a letter
        // name needs a handful of tokens, not up to Whisper's 448-token
        // default) and forbid repeating any 2-gram.
        max_new_tokens: 32,
        no_repeat_ngram_size: 2,
      })
      self.postMessage({ type: 'result', id, text: result?.text ?? '' })
    } catch (err) {
      self.postMessage({ type: 'error', id, error: String(err?.message || err) })
    }
  }
}
