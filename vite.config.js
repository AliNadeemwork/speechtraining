import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Cross-origin isolation (COOP/COEP) is required for the Whisper speech
// engine's WASM backend (src/lib/whisperWorker.js) — without it,
// onnxruntime-web's threaded WASM module hangs indefinitely instead of
// erroring. See vercel.json for the same headers in production.
const crossOriginIsolationHeaders = {
  'Cross-Origin-Opener-Policy': 'same-origin',
  'Cross-Origin-Embedder-Policy': 'require-corp',
}

export default defineConfig({
  plugins: [react()],
  server: { headers: crossOriginIsolationHeaders },
  preview: { headers: crossOriginIsolationHeaders },
})
