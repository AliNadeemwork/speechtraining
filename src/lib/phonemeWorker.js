// Web Worker: phoneme recognition via Wav2Vec2 (facebook/wav2vec2-lv-60-espeak-cv-ft,
// ONNX build) run through Transformers.js. Kept entirely inside this worker
// so no other file needs to import @huggingface/transformers or know model
// names/devices — see src/lib/recognition.js for the adapter that owns this.
//
// MODEL LOADING NOTE (read before touching this file):
// This model's tokenizer_class is "Wav2Vec2PhonemeCTCTokenizer", which has
// ZERO implementation in Transformers.js (grep the installed package — no
// hits). The high-level pipeline('automatic-speech-recognition', ...) API
// requires AutoTokenizer, which in turn requires a tokenizer.json file this
// model repo does not ship (confirmed against the real HF repo, not just a
// mirror — every fork/mirror checked has the same gap or stub ONNX files).
// The ONNX weights themselves are real and load fine — verified by piping
// real audio through the actual model — so this is worked around by loading
// the feature extractor and CTC model DIRECTLY (AutoFeatureExtractor +
// AutoModelForCTC) and doing CTC greedy decoding by hand below, bypassing
// the tokenizer entirely. Do not "fix" this by switching to pipeline(); it
// will fail on the missing tokenizer.json again.

import { AutoModelForCTC, AutoFeatureExtractor, env } from '@huggingface/transformers'

// Same fix as the (now-retired) Whisper engine needed: onnxruntime-web's own
// same-origin WASM-asset auto-resolution breaks inside a nested Vite-bundled
// Worker module, and Vite's dev server refuses to serve /public files
// through a JS import. Pointing wasmPaths at the matching onnxruntime-web
// version on a CDN sidesteps both issues identically in dev and prod.
// NOTE: this version must match node_modules/onnxruntime-web's installed
// version (a transitive dep of @huggingface/transformers) or the JS glue
// and .wasm binary can drift out of sync after a dependency bump.
env.backends.onnx.wasm.wasmPaths =
  'https://cdn.jsdelivr.net/npm/onnxruntime-web@1.22.0-dev.20250409-89f8206ba4/dist/'
env.backends.onnx.wasm.numThreads = 1

const MODEL_ID = 'onnx-community/wav2vec2-lv-60-espeak-cv-ft-ONNX'

// id -> IPA phoneme token, index-aligned to the model's vocab.json (392
// entries; id 0 is the CTC blank/pad token). Embedded directly instead of
// fetched at runtime because AutoTokenizer (the thing that would normally
// load vocab.json for us) is exactly what we're bypassing — see note above.
const VOCAB = ["<pad>", "<s>", "</s>", "<unk>", "n", "s", "t", "ə", "l", "a", "i", "k", "d", "m", "ɛ", "ɾ", "e", "ɪ", "p", "o", "ɐ", "z", "ð", "f", "j", "v", "b", "ɹ", "ʁ", "ʊ", "iː", "r", "w", "ʌ", "u", "ɡ", "æ", "aɪ", "ʃ", "h", "ɔ", "ɑː", "ŋ", "ɚ", "eɪ", "β", "uː", "y", "ɑ̃", "oʊ", "ᵻ", "eː", "θ", "aʊ", "ts", "oː", "ɔ̃", "ɣ", "ɜ", "ɑ", "dʒ", "əl", "x", "ɜː", "ç", "ʒ", "tʃ", "ɔː", "ɑːɹ", "ɛ̃", "ʎ", "ɔːɹ", "ʋ", "aː", "ɕ", "œ", "ø", "oːɹ", "ɲ", "yː", "ʔ", "iə", "i5", "s.", "tɕ", "??", "nʲ", "ɛː", "œ̃", "ɭ", "ɔø", "ʑ", "tʲ", "ɨ", "ɛɹ", "ts.", "rʲ", "ɪɹ", "ɭʲ", "i.5", "ɔɪ", "q", "sʲ", "u5", "ʊɹ", "iɜ", "a5", "iɛ5", "øː", "ʕ", "ja", "əɜ", "th", "ɑ5", "oɪ", "dʲ", "ə5", "tɕh", "ts.h", "mʲ", "ɯ", "dʑ", "vʲ", "e̞", "tʃʲ", "ei5", "o5", "onɡ5", "ɑu5", "iɑ5", "ai5", "aɪɚ", "kh", "ə1", "ʐ", "i2", "ʉ", "ħ", "t[", "aɪə", "ʲ", "ju", "ə2", "u2", "oɜ", "pː", "iɛɜ", "ou5", "y5", "uɜ", "tː", "uo5", "d[", "uoɜ", "tsh", "ɑɜ", "ɵ", "i̪5", "uei5", "ɟ", "aɜ", "ɑɨ", "i.ɜ", "eʊ", "o2", "ɐ̃", "ä", "pʲ", "kʲ", "n̩", "ɒ", "ph", "ɑu2", "uɨ", "əɪ", "ɫ", "ɬ", "yɜ", "bʲ", "ɑ2", "s̪", "aiɜ", "χ", "ɐ̃ʊ̃", "1", "ə4", "yæɜ", "a2", "ɨː", "t̪", "iouɜ", "ũ", "onɡɜ", "aɨ", "iɛ2", "ɔɨ", "ɑuɜ", "o̞", "ei2", "iou2", "c", "kː", "y2", "ɖ", "oe", "dˤ", "yɛɜ", "əʊ", "S", "ɡʲ", "onɡ2", "u\"", "eiɜ", "ʈ", "ɯᵝ", "iou5", "dZ", "r̝̊", "i.2", "tS", "s^", "ʝ", "yə5", "iɑɜ", "uə5", "pf", "ɨu", "iɑ2", "ou2", "ər2", "fʲ", "ai2", "r̝", "uəɜ", "ɳ", "əɨ", "ua5", "uɪ", "ɽ", "bː", "yu5", "uo2", "yɛ5", "l̩", "ɻ", "ərɜ", "ʂ", "i̪2", "ouɜ", "uaɜ", "a.", "a.ː", "yæ5", "dː", "r̩", "ee", "ɪu", "ər5", "i̪ɜ", "æi", "u:", "i.ː", "t^", "o1", "ɪ^", "ai", "ueiɜ", "æː", "ɛɪ", "eə", "i.", "ɴ", "ie", "ua2", "ɑ1", "o4", "tʃː", "o:", "ɑ:", "u1", "N", "i̪1", "au", "yæ2", "u.", "qː", "yəɜ", "y:", "kʰ", "tʃʰ", "iʊ", "sx", "õ", "uo", "tʰ", "uai5", "bʰ", "u.ː", "uə2", "ʊə", "d^", "s̪ː", "yiɜ", "dʰ", "r.", "oe:", "i1", "ɟː", "yu2", "nʲʲ", "i̪4", "uei2", "tsʲ", "ɸ", "ĩ", "ɑ4", "t̪ː", "eɑ", "u4", "e:", "tsː", "ʈʰ", "ɡʰ", "ɯɯ", "dʒʲ", "ʂʲ", "X", "ɵː", "uaiɜ", "tɕʲ", "ã", "t^ː", "ẽː", "yɛ2", "cː", "i.1", "ɛʊ", "dˤdˤ", "dʒː", "i4", "ɡː", "yi", "ɕʲ", "ɟʰ", "pʰ", "dʑʲ", "yuɜ", "ua1", "ua4", "æiː", "ɐɐ", "ui", "iou1", "ʊː", "a1", "iou4", "cʰ", "iɛ1", "yə2", "ɖʰ", "ẽ", "ʒʲ", "ää", "ər4", "iːː", "ɪː", "iɑ1", "ər1", "œː", "øi", "ɪuː", "cʰcʰ", "əː1", "iː1", "ũ", "kʰː", "o̞o̞", "xʲ", "ou1", "iɛ4", "e̞e̞", "y1", "dzː", "dʲʲ", "dʰː", "ɯᵝɯᵝ", "lː", "uo1", "i.4", "i:", "yɛ5ʲ", "a4"]
const PAD_ID = 0 // CTC blank token

const SAMPLE_RATE = 16000

let loadPromise = null
let featureExtractor = null
let model = null

function loadViaDevice(device) {
  return Promise.all([
    AutoFeatureExtractor.from_pretrained(MODEL_ID),
    AutoModelForCTC.from_pretrained(MODEL_ID, {
      device,
      dtype: 'q8',
      progress_callback: (p) => self.postMessage({ type: 'progress', progress: p }),
    }),
  ])
}

async function ensureLoaded() {
  if (!loadPromise) {
    loadPromise = (async () => {
      const hasWebGPU = typeof navigator !== 'undefined' && !!navigator.gpu
      let result
      try {
        result = hasWebGPU ? await loadViaDevice('webgpu') : await loadViaDevice('wasm')
      } catch {
        result = await loadViaDevice('wasm')
      }
      ;[featureExtractor, model] = result
    })().catch((err) => { loadPromise = null; throw err })
  }
  return loadPromise
}

// Greedy CTC decode: argmax each timestep, collapse consecutive repeats,
// drop the blank token — the standard CTC decode rule (this is not a
// simplification we invented; it's how every CTC model's output is read).
function ctcDecode(logitsData, seqLen, vocabSize) {
  const ids = []
  for (let t = 0; t < seqLen; t++) {
    let best = 0
    let bestScore = -Infinity
    const base = t * vocabSize
    for (let v = 0; v < vocabSize; v++) {
      const score = logitsData[base + v]
      if (score > bestScore) { bestScore = score; best = v }
    }
    ids.push(best)
  }
  const collapsed = []
  let prev = -1
  for (const id of ids) {
    if (id !== prev && id !== PAD_ID) collapsed.push(id)
    prev = id
  }
  return collapsed.map(id => VOCAB[id] ?? '').join('')
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
      const inputs = await featureExtractor(audio, { sampling_rate: SAMPLE_RATE })
      const { logits } = await model(inputs)
      const [, seqLen, vocabSize] = logits.dims
      const phonemes = ctcDecode(logits.data, seqLen, vocabSize)
      self.postMessage({ type: 'result', id, phonemes })
    } catch (err) {
      self.postMessage({ type: 'error', id, error: String(err?.message || err) })
    }
  }
}
