// Lesson content for the "Numbers 1-100" section — the full contiguous
// range (unlike numbers.js's 1-20, which stays teacher-adjustable via
// Settings > Number range; this section is always the full 1-100, no range
// control — see hasRange:false in data/sections.js).
//
// Built programmatically (100 hand-written entries would be error-prone and
// near-duplicate) from the same word forms as numbers.js/tens.js. Compound
// numbers (21-99) use a two-word spokenWord (e.g. "twenty one") — Vosk
// grammar and lib/evaluate.js already handle multi-word targets correctly
// (whitespace-collapsing normalize()), the same mechanism already proven by
// "one hundred" in tens.js.
//
// `helpText`/`mouthShape` are generic placeholders for this section — TODO
// (school): a speech therapist replacing 100 individual clinical tips isn't
// practical; these are intentionally generic ("say each part clearly") and
// should be reviewed/prioritized for the most commonly mispronounced ones
// first if the school wants richer guidance here.
const ONES = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine']
const TEENS = ['ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen']
const TENS_WORDS = { 2: 'twenty', 3: 'thirty', 4: 'forty', 5: 'fifty', 6: 'sixty', 7: 'seventy', 8: 'eighty', 9: 'ninety' }

function wordFor(n) {
  if (n < 10) return ONES[n]
  if (n < 20) return TEENS[n - 10]
  if (n === 100) return 'one hundred'
  const tens = Math.floor(n / 10)
  const ones = n % 10
  return ones === 0 ? TENS_WORDS[tens] : `${TENS_WORDS[tens]} ${ONES[ones]}`
}

export const NUMBERS_100 = Array.from({ length: 100 }, (_, i) => {
  const id = i + 1
  const spokenWord = wordFor(id)
  return {
    id,
    display: String(id),
    spokenWord,
    variants: [],
    helpText: `TODO(school): Say each part of "${spokenWord}" clearly, one piece at a time.`,
    mouthShape: 'open',
  }
})
