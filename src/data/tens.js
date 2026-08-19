// Lesson content for the "Count by 10s" section — skip-counting 10, 20, 30
// ... 100, then 1000 as the final item (client-requested exactly this way:
// a "big number" finale right after 100, not a continuation of the by-10s
// pattern). Same shared item shape as numbers.js:
//   { id, display, spokenWord, variants[], helpText, mouthShape }
//
// A separate list from numbers.js (rather than extending its range) since
// this is a sparse skip-count (10, 20, 30...), not a contiguous range —
// Settings' Number Range slider works on contiguous id ranges and doesn't
// apply to this section (hasRange: false in data/sections.js).
export const TENS = [
  {
    id: 10, display: '10', spokenWord: 'ten', variants: ['tan', 'den', 'then', 'tin'],
    helpText: 'TODO(school): Tongue tip taps behind the top teeth for "t", mouth stays relaxed and slightly open for "en".',
    mouthShape: 'closed',
  },
  {
    id: 20, display: '20', spokenWord: 'twenty', variants: ['twendy', 'twenny'],
    helpText: 'TODO(school): Lips round briefly for "tw", tongue taps twice for "-enty".',
    mouthShape: 'round',
  },
  {
    id: 30, display: '30', spokenWord: 'thirty', variants: ['thirdy', 'firty'],
    helpText: 'TODO(school): Tongue tip pokes between the teeth for "th", then taps again for "-ty".',
    mouthShape: 'wide',
  },
  {
    id: 40, display: '40', spokenWord: 'forty', variants: ['fordy', 'fourty'],
    helpText: 'TODO(school): Lips round for "for", tongue taps for "-ty".',
    mouthShape: 'round',
  },
  {
    id: 50, display: '50', spokenWord: 'fifty', variants: ['fifdy', 'fivety'],
    helpText: 'TODO(school): Top teeth touch bottom lip for "f", tongue taps for "-ty".',
    mouthShape: 'closed',
  },
  {
    id: 60, display: '60', spokenWord: 'sixty', variants: ['sixdy', 'sicksty'],
    helpText: 'TODO(school): Teeth close for "s", tongue taps for "-ty".',
    mouthShape: 'wide',
  },
  {
    id: 70, display: '70', spokenWord: 'seventy', variants: ['sevendy', 'sebenty'],
    helpText: 'TODO(school): Smile wide for "s", bottom lip touches top teeth for "v", tongue taps for "-ty".',
    mouthShape: 'wide',
  },
  {
    id: 80, display: '80', spokenWord: 'eighty', variants: ['aydy', 'atety'],
    helpText: 'TODO(school): Mouth opens then narrows for "ay", tongue taps twice for "-ty".',
    mouthShape: 'open',
  },
  {
    id: 90, display: '90', spokenWord: 'ninety', variants: ['ninedy', 'ninty'],
    helpText: 'TODO(school): Tongue taps for "n", mouth opens wide for "eye", tongue taps for "-ty".',
    mouthShape: 'open',
  },
  {
    id: 100, display: '100', spokenWord: 'one hundred', variants: ['hundred', 'wonhundred'],
    helpText: 'TODO(school): Say "one", then lips relax and tongue taps for "hundred".',
    mouthShape: 'round',
  },
  {
    id: 1000, display: '1000', spokenWord: 'one thousand', variants: ['thousand', 'wonthousand'],
    helpText: 'TODO(school): Say "one", then lips round briefly for "th-ousand".',
    mouthShape: 'round',
  },
]
