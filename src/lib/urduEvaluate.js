// Decides whether a Whisper Urdu-transcription result counts as a correct
// attempt at an Urdu letter's name. Companion to lib/evaluate.js (Vosk/
// word) and lib/phonemeEvaluator.js (Wav2Vec2/phoneme) — this one handles
// Urdu-script text, which needs its own normalization (diacritic/letter-
// variant stripping) rather than the Latin-alphabet Levenshtein approach
// evaluate.js uses.
//
// Whisper has no grammar/[unk] mechanism (unlike Vosk) — there is no way to
// constrain its output, so empty/whitespace-only/very short garbage output
// is what stands in for "failed attempt" here.
//
// All Arabic-script literals below are written as \u escapes, not pasted
// glyphs — pasted RTL text can carry invisible bidi control characters that
// silently corrupt string/regex literals. Reference table for the escapes
// used: ء ء hamza, ؤ ئ yeh-hamza, ئ ؤ waw-hamza,
// ة ة teh-marbuta, ك ك Arabic kaf, ى ى alef-maksura,
// ک ک Urdu keheh, ہ ہ goal-heh, ۂ ھ do-chashmi-heh,
// ی ی Urdu yeh.

// Urdu combining diacritics (اعراب — short vowel marks, tanween, sukun,
// shadda, etc.) that Whisper's output may or may not include depending on
// how confidently it transcribed: U+064B-U+065F (standard Arabic/Urdu
// diacritics), U+0670 (superscript alef), U+06D6-U+06ED (Quranic
// annotation marks — unlikely from Whisper, stripped defensively since
// removing them is harmless either way).
const DIACRITICS_RE = /[ً-ٰٟۖ-ۭ]/g

// Letter-form normalization: collapse visually/phonetically interchangeable
// Urdu letter variants to one canonical form, so spelling variation between
// what a model outputs and what a curriculum-approved spokenTarget uses
// doesn't cause a false reject.
const LETTER_VARIANTS = [
  [/ؤ/g, 'ی'], // ئ (yeh with hamza above) -> ی (Urdu yeh)
  [/ى/g, 'ی'], // ى (alef maksura) -> ی (Urdu yeh)
  [/ي/g, 'ی'], // ي (Arabic yeh, U+064A — Whisper's Urdu output uses this
               // often since its tokenizer is Arabic-general, not Urdu-
               // specific) -> ی (Urdu yeh, U+06CC). Found via the mandatory
               // proof test: "میم" (meem) failed a visually-identical-
               // looking match purely because of this codepoint mismatch.
  [/ة/g, 'ہ'], // ة (teh marbuta, rare in Urdu text) -> ہ (goal heh)
  [/ك/g, 'ک'], // ك (Arabic kaf) -> ک (Urdu keheh)
]

// Whitespace + Arabic/Urdu punctuation (۔ U+06D4 full stop, ، U+060C comma,
// ؟ U+061F question mark) + common Latin punctuation Whisper sometimes
// emits around short utterances.
const PUNCT_WS_RE = /[\s۔،؟!.,]/g

function normalizeUrdu(text) {
  let t = (text || '').trim()
  t = t.replace(DIACRITICS_RE, '')
  for (const [pattern, replacement] of LETTER_VARIANTS) t = t.replace(pattern, replacement)
  t = t.replace(PUNCT_WS_RE, '')
  return t
}

function debugEnabled() {
  try { return localStorage.getItem('urduDebug') === '1' } catch { return false }
}

/**
 * @param {string} recognizedText - Whisper's raw Urdu-script transcription,
 *   or '' / '[noattempt]' for no usable attempt.
 * @param {{spokenTarget:string, variants:string[]}} targetItem
 * @param {object} settings - unused for now (kept for interface parity with
 *   evaluate()/evaluatePhoneme() — Urdu matching is contains-based, not
 *   threshold-based, since Levenshtein distance over Arabic-script glyphs
 *   doesn't correlate with perceptual similarity the way it does for Latin
 *   text; see spec).
 * @returns {{isCorrect: boolean, matchType: 'exact'|'contains'|'none'}}
 */
export function evaluateUrdu(recognizedText, targetItem, settings) {
  const raw = (recognizedText || '').trim()
  if (!raw || raw === '[unk]' || raw === '[noattempt]') {
    if (debugEnabled()) console.log('[urduEvaluate]', { recognizedText, decision: 'FAIL (empty/noattempt)' })
    return { isCorrect: false, matchType: 'none' }
  }

  const recognized = normalizeUrdu(raw)
  if (!recognized) {
    if (debugEnabled()) console.log('[urduEvaluate]', { recognizedText, decision: 'FAIL (nothing left after normalize)' })
    return { isCorrect: false, matchType: 'none' }
  }

  const target = normalizeUrdu(targetItem.spokenTarget)
  const candidates = [target, ...(targetItem.variants || []).map(normalizeUrdu)]

  for (const c of candidates) {
    if (!c) continue
    if (recognized === c) {
      if (debugEnabled()) console.log('[urduEvaluate]', { recognized, target, decision: 'PASS (exact)' })
      return { isCorrect: true, matchType: 'exact' }
    }
  }
  for (const c of candidates) {
    if (!c) continue
    if (recognized.includes(c) || c.includes(recognized)) {
      if (debugEnabled()) console.log('[urduEvaluate]', { recognized, target, decision: 'PASS (contains)' })
      return { isCorrect: true, matchType: 'contains' }
    }
  }

  if (debugEnabled()) console.log('[urduEvaluate]', { recognized, target, decision: 'FAIL' })
  return { isCorrect: false, matchType: 'none' }
}
