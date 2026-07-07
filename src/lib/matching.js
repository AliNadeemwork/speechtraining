// Decides whether a recognized transcript counts as a correct pronunciation.
//
// Modes:
//   strict — accept only the exact word ("one") or its digit form ("1").
//            Homophones like "won"/"wan" are rejected.
//   light  — additionally accept listed variants and 1-edit-distance matches,
//            for children with atypical articulation.

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
  if (Math.abs(m - n) > 1) return 2
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

/**
 * @param {string[]} transcripts - all alternatives returned by the recognizer
 * @param {{value:number, word:string, variants:string[]}} target
 * @param {'strict'|'light'} mode
 * @returns {boolean}
 */
export function isAccepted(transcripts, target, mode) {
  const digit = String(target.value)
  const word = target.word

  for (const t of transcripts) {
    for (const tok of tokens(t)) {
      // Both modes: exact word or digit form ("one" or "1")
      if (tok === word || tok === digit) return true

      if (mode === 'light') {
        if (target.variants.includes(tok)) return true
        if (editDistance(tok, word) <= 1) return true
      }
    }
  }
  return false
}
