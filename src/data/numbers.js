// Lesson content for Prototype v0.1: numbers 1-10.
// `word` is the canonical pronunciation target.
// `variants` are near-pronunciations accepted ONLY in Light mode.
// Strict mode accepts only the exact word (or its digit form, since
// speech recognizers often transcribe "one" as "1").
export const NUMBERS = [
  { value: 1,  word: 'one',   variants: ['won', 'wan', 'un', 'juan'] },
  { value: 2,  word: 'two',   variants: ['to', 'too', 'tu', 'do'] },
  { value: 3,  word: 'three', variants: ['tree', 'free', 'thee', 'twee'] },
  { value: 4,  word: 'four',  variants: ['for', 'fore', 'foor', 'pour'] },
  { value: 5,  word: 'five',  variants: ['fife', 'hive', 'fibe'] },
  { value: 6,  word: 'six',   variants: ['sicks', 'sick', 'seeks', 'sits'] },
  { value: 7,  word: 'seven', variants: ['sven', 'saven', 'sevan', 'devon'] },
  { value: 8,  word: 'eight', variants: ['ate', 'eat', 'aid', 'hate'] },
  { value: 9,  word: 'nine',  variants: ['nein', 'nain', 'line', 'mine'] },
  { value: 10, word: 'ten',   variants: ['tan', 'den', 'then', 'tin'] },
]
