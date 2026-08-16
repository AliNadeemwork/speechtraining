// Registry of lesson sections. `mode` selects the recognition engine (see
// lib/recognition.js): 'word' items are { id, display, spokenWord,
// variants[], helpText, mouthShape } and check via Vosk grammar matching;
// 'phoneme' items are { id, display, phonicLabel, helpText, mouthShape } and
// check via the Wav2Vec2 phoneme engine — Vosk cannot judge an isolated
// sound. Adding a new section means adding one more entry here with its own
// data file — Lesson.jsx and the recognizer are both parameterized by
// section, not hardcoded to numbers.
import { NUMBERS } from './numbers'
import { ALPHABETS } from './alphabets'

export const SECTIONS = [
  {
    id: 'numbers',
    label: 'Numbers',
    subtitle: 'Numbers',
    items: NUMBERS,
    hasRange: true, // Settings > Number range applies to this section only
    mode: 'word',
  },
  {
    id: 'alphabets',
    label: 'Alphabets',
    subtitle: 'Alphabets',
    items: ALPHABETS,
    hasRange: false,
    mode: 'phoneme',
  },
]

export function getSection(id) {
  return SECTIONS.find(s => s.id === id) || null
}
