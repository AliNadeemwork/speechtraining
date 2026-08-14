// Decides whether a Vosk recognition result counts as a correct attempt.
//
// This is WORD-IDENTITY leniency (how close the recognized word is to the
// target word/its homophones), NOT phoneme-quality/pronunciation scoring.
// Never surface a number or percentage to the child — evaluate() only
// returns a boolean plus a coarse matchType for internal/debug use.

const DIGIT_WORDS = {
  '0': 'zero', '1': 'one', '2': 'two', '3': 'three', '4': 'four',
  '5': 'five', '6': 'six', '7': 'seven', '8': 'eight', '9': 'nine', '10': 'ten',
}

function normalize(text) {
  let t = (text || '').toLowerCase().trim().replace(/[^a-z0-9\s]/g, '')
  if (DIGIT_WORDS[t]) t = DIGIT_WORDS[t] // map a bare digit ("3") to its word form
  return t
}

function editDistance(a, b) {
  const m = a.length, n = b.length
  const dp = Array.from({ length: m + 1 }, (_, i) => [i, ...Array(n).fill(0)])
  for (let j = 0; j <= n; j++) dp[0][j] = j
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = a[i - 1] === b[j - 1]
        ? dp[i - 1][j - 1]
        : 1 + Math.min(dp[i - 1][j - 1], dp[i - 1][j], dp[i][j - 1])
    }
  }
  return dp[m][n]
}

// 1.0 = identical, 0.0 = completely different.
function similarity(a, b) {
  const maxLen = Math.max(a.length, b.length, 1)
  return 1 - editDistance(a, b) / maxLen
}

/**
 * @param {string} recognizedWord - Vosk's result text, or '[unk]'/'' for no attempt
 * @param {{spokenWord:string, display:string|number, variants:string[]}} targetItem
 * @param {{acceptanceLevel:number}} settings - teacher-facing threshold, 0..1
 * @returns {{isCorrect: boolean, matchType: 'exact'|'phonetic'|'none'}}
 */
export function evaluate(recognizedWord, targetItem, settings) {
  const threshold = settings?.acceptanceLevel ?? 0.65
  const recognized = normalize(recognizedWord)

  // No attempt detected, or out-of-grammar noise — always a fail.
  if (!recognized || recognized === 'unk') {
    return { isCorrect: false, matchType: 'none' }
  }

  const targetWord = normalize(targetItem.spokenWord)
  const targetDisplay = normalize(String(targetItem.display))

  if (recognized === targetWord || recognized === targetDisplay) {
    return { isCorrect: true, matchType: 'exact' }
  }

  const variantSet = (targetItem.variants || []).map(normalize)
  if (variantSet.includes(recognized)) {
    return { isCorrect: true, matchType: 'phonetic' }
  }

  // Leniency: how similar is the recognized word to the target, as a 0..1
  // ratio, compared against the teacher's acceptance threshold.
  if (similarity(recognized, targetWord) >= threshold) {
    return { isCorrect: true, matchType: 'phonetic' }
  }

  return { isCorrect: false, matchType: 'none' }
}
