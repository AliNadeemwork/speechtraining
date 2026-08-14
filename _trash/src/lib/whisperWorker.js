// Web Worker: loads Whisper (Xenova/whisper-tiny.en) via Transformers.js and
// transcribes 16kHz mono Float32 audio sent from recognition.js.
//
// Kept entirely inside this worker so no other file needs to import
// @huggingface/transformers or know about model names / devices.

import { pipeline, env } from '@huggingface/transformers'

// Let transformers.js manage its own model cache (IndexedDB/Cache Storage)
// so the ~75MB download only happens once across sessions.
env.allowLocalModels = false

// onnxruntime-web's default same-origin auto-resolution of its own WASM
// runtime (relative to import.meta.url) does not resolve correctly from
// inside a nested Vite-bundled Worker module — it silently hangs forever
// with no error instead of loading or failing. Serving the runtime files
// ourselves from /public also doesn't work: Vite's dev server refuses to
// serve /public files through a JS import (which is how onnxruntime-web
// loads its own .mjs glue file) — that only works for a production build.
// Pointing wasmPaths at the matching onnxruntime-web version on a CDN
// works identically in dev and prod and sidesteps both issues. The browser
// caches it normally after the first load, same as any other asset.
// NOTE: this version must match node_modules/onnxruntime-web's installed
// version (a transitive dep of @huggingface/transformers) or the JS glue
// and .wasm binary can drift out of sync after a dependency bump.
env.backends.onnx.wasm.wasmPaths =
  'https://cdn.jsdelivr.net/npm/onnxruntime-web@1.26.0-dev.20260416-b7804b056c/dist/'

// The multi-threaded WASM backend needs cross-origin-isolation headers
// (COOP/COEP, set in vite.config.js / vercel.json) to use SharedArrayBuffer.
// Force single-threaded WASM so behavior is identical with or without them.
env.backends.onnx.wasm.numThreads = 1

let transcriberPromise = null

function loadWasmPipeline() {
  return pipeline('automatic-speech-recognition', 'Xenova/whisper-tiny.en', {
    device: 'wasm',
    progress_callback: (p) => {
      self.postMessage({ type: 'progress', progress: p })
    },
  })
}

async function getTranscriber() {
  if (!transcriberPromise) {
    // Skip straight to WASM if the browser has no WebGPU at all — avoids
    // wasting time/bandwidth on a doomed fp32-weights download+session
    // attempt before falling back.
    if (typeof navigator === 'undefined' || !navigator.gpu) {
      transcriberPromise = loadWasmPipeline()
    } else {
      transcriberPromise = pipeline('automatic-speech-recognition', 'Xenova/whisper-tiny.en', {
        device: 'webgpu',
        progress_callback: (p) => {
          self.postMessage({ type: 'progress', progress: p })
        },
      }).catch(() => {
        // WebGPU unavailable/unsupported — fall back to WASM.
        transcriberPromise = null
        return loadWasmPipeline()
      })
    }
  }
  return transcriberPromise
}

self.onmessage = async (e) => {
  const { type } = e.data

  if (type === 'warmup') {
    try {
      await getTranscriber()
      self.postMessage({ type: 'ready' })
    } catch (err) {
      self.postMessage({ type: 'error', error: String(err?.message || err) })
    }
    return
  }

  if (type === 'transcribe') {
    const { audio, id } = e.data
    try {
      const transcriber = await getTranscriber()
      const result = await transcriber(audio, { language: 'english', task: 'transcribe' })
      const text = Array.isArray(result) ? (result[0]?.text || '') : (result?.text || '')
      self.postMessage({ type: 'result', id, text })
    } catch (err) {
      self.postMessage({ type: 'error', id, error: String(err?.message || err) })
    }
  }
}
