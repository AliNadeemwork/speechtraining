// Decides whether a Wav2Vec2 phoneme-recognition result counts as a correct
// attempt at a letter's phonic sound. Companion to lib/evaluate.js (which
// handles WORD-mode/Vosk results) — this one is TOLERANT substring matching
// against IPA phonemes, since Wav2Vec2's raw CTC output is noisy (especially
// for atypical/child speech) and will rarely equal the target exactly.
//
// Never surface a number/phoneme string to the child — evaluatePhoneme()
// only returns a boolean plus a coarse matchType for internal/debug use.

// Target phoneme(s) per letter, in the model's own IPA scheme (verified
// against onnx-community/wav2vec2-lv-60-espeak-cv-ft-ONNX's real vocab.json
// — see recognition.js/phonemeWorker.js). `primary` is the textbook sound;
// `tolerant` are confusable substitutions accepted as correct (e.g. the
// model uses 'ɡ' (script g, U+0261), not the plain typed 'g', for the hard-G
// sound — that alone would false-reject every correct G without a
// tolerant entry).
export const PHONEME_TARGETS = {
  A: { primary: 'æ', tolerant: ['a', 'ɐ', 'ʌ', 'ɑː', 'ɑ'] },
  B: { primary: 'b', tolerant: [] },
  C: { primary: 'k', tolerant: [] },
  D: { primary: 'd', tolerant: [] },
  E: { primary: 'ɛ', tolerant: ['e'] },
  F: { primary: 'f', tolerant: [] },
  G: { primary: 'ɡ', tolerant: ['g'] },
  H: { primary: 'h', tolerant: [] },
  I: { primary: 'ɪ', tolerant: ['i'] },
  J: { primary: 'dʒ', tolerant: ['ʒ', 'd'] },
  K: { primary: 'k', tolerant: [] },
  L: { primary: 'l', tolerant: [] },
  M: { primary: 'm', tolerant: [] },
  N: { primary: 'n', tolerant: [] },
  O: { primary: 'oʊ', tolerant: ['o', 'ɔ'] },
  P: { primary: 'p', tolerant: [] },
  Q: { primary: 'k', tolerant: ['w'] },
  R: { primary: 'ɹ', tolerant: ['r'] },
  S: { primary: 's', tolerant: [] },
  T: { primary: 't', tolerant: [] },
  U: { primary: 'ʌ', tolerant: ['ə', 'ʊ', 'u'] },
  V: { primary: 'v', tolerant: [] },
  W: { primary: 'w', tolerant: [] },
  // X is the only two-phoneme target — both must be present (order-
  // independent: CTC output ordering near a fast "ks" blend is unreliable).
  X: { sequence: ['k', 's'] },
  Y: { primary: 'j', tolerant: [] },
  Z: { primary: 'z', tolerant: [] },
}

function normalizeRaw(text) {
  return (text || '').trim()
}

/**
 * @param {string} phonemeString - raw IPA string from the phoneme engine,
 *   or '[unk]'/'[noattempt]'/'' for no usable attempt.
 * @param {{id:string}} targetItem - the alphabet item (item.id is the letter, A-Z).
 * @param {{acceptanceLevel:number}} settings - teacher-facing threshold, 0..1
 *   (reused from the word evaluator's scale: ~0.40 lenient .. ~0.85 strict).
 * @returns {{isCorrect: boolean, matchType: 'exact'|'phonetic'|'none'}}
 */
export function evaluatePhoneme(phonemeString, targetItem, settings) {
  const threshold = settings?.acceptanceLevel ?? 0.65
  const raw = normalizeRaw(phonemeString)

  // No attempt detected, out-of-model noise, or empty — always a hard fail.
  if (!raw || raw === '[unk]' || raw === 'unk' || raw === '[noattempt]' || raw === 'noattempt') {
    return { isCorrect: false, matchType: 'none' }
  }

  const target = PHONEME_TARGETS[targetItem.id]
  if (!target) return { isCorrect: false, matchType: 'none' }

  if (target.sequence) {
    const allPresent = target.sequence.every(p => raw.includes(p))
    return allPresent
      ? { isCorrect: true, matchType: 'exact' }
      : { isCorrect: false, matchType: 'none' }
  }

  if (raw.includes(target.primary)) {
    return { isCorrect: true, matchType: 'exact' }
  }

  // Tolerant variants only count at Balanced/Lenient acceptance levels —
  // at Strict (>=0.85) only the textbook phoneme itself passes.
  if (threshold < 0.85) {
    for (const alt of target.tolerant) {
      if (raw.includes(alt)) return { isCorrect: true, matchType: 'phonetic' }
    }
  }

  return { isCorrect: false, matchType: 'none' }
}
