// Decides whether a recognized transcript counts as a correct pronunciation.
//
// `leniency` is a 0..1 slider (see Settings > Acceptance Leniency):
//   0.0            — Strict: accept only the exact word ("one") or its
//                    digit form ("1"). Homophones like "won" are rejected.
//   ~0.01 – 0.65   — Light: additionally accept listed variants and
//                    1-edit-distance matches, for atypical articulation.
//   > 0.65 (Very   — additionally accept 2-edit-distance matches and
//   Lenient)         substring/contains matches, for early learners.
//
// The old 'strict'/'light' modes map onto the two ends of this slider
// (strict = 0, light = 0.5) so any code still passing a mode string keeps
// working via `modeToLeniency`.

function normalize(text) {
  return (text || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .trim()
}

function tokens(text) {
  return normalize(text).split(/\s+/).filter(Boolean)
}

function editDistance(a, b) {
  const m = a.length, n = b.length
  if (Math.abs(m - n) > 2) return 3
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

export function modeToLeniency(mode) {
  return mode === 'strict' ? 0 : 0.5
}

/**
 * @param {string[]} transcripts - all alternatives returned by the recognizer
 * @param {{value:number, word:string, variants:string[]}} target
 * @param {number} leniency - 0 (Strict) .. 1 (Very Lenient)
 * @returns {boolean}
 */
export function isAccepted(transcripts, target, leniency = 0) {
  const digit = String(target.value)
  const word = target.word
  const editBudget = leniency > 0.65 ? 2 : leniency > 0 ? 1 : 0
  const allowVariants = leniency > 0
  const allowContains = leniency > 0.65

  for (const t of transcripts) {
    for (const tok of tokens(t)) {
      // Every leniency level: exact word or digit form ("one" or "1")
      if (tok === word || tok === digit) return true

      if (allowVariants && target.variants.includes(tok)) return true
      if (editBudget > 0 && editDistance(tok, word) <= editBudget) return true
      if (allowContains && tok.length >= 3 && (word.includes(tok) || tok.includes(word))) return true
    }
  }
  return false
}
