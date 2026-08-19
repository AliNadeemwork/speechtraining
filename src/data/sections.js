// Registry of lesson sections. `mode` selects the recognition engine (see
// lib/recognition.js): every section here uses 'word' mode — Vosk grammar
// matching, judged by lib/evaluate.js. Alphabets/Phonics used to run on a
// separate phoneme (Wav2Vec2) engine for isolated sounds, but that was only
// 6/26 reliable (see PHONICS_RESEARCH_BRIEF.md); teaching one key WORD per
// letter instead (data/alphabets.js) sidesteps the problem entirely by
// reusing the same reliable word engine as Numbers — proof table in
// data/alphabets.js's header comment (26/26 words, 0 collisions).
// Adding a new section means adding one more entry here with its own data
// file — Lesson.jsx and the recognizer are both parameterized by section,
// not hardcoded to numbers.
//
// `hidden: true` keeps a section out of the Section Select chooser (see
// screens/SectionSelect.jsx) without removing its code/data.
import { NUMBERS } from './numbers'
import { NUMBERS_100 } from './numbers100'
import { TENS } from './tens'
import { ALPHABETS } from './alphabets'

export const SECTIONS = [
  {
    id: 'numbers',
    label: 'Numbers 1-20',
    subtitle: 'Numbers',
    items: NUMBERS,
    hasRange: true, // Settings > Number range applies to this section only
    mode: 'word',
    numberStyle: 'solid',
  },
  {
    id: 'numbers100',
    label: 'Numbers 1-100',
    subtitle: 'Numbers',
    items: NUMBERS_100,
    hasRange: false,
    mode: 'word',
    numberStyle: 'solid',
  },
  {
    id: 'tens',
    label: 'Count by 10s',
    subtitle: 'Count by 10s',
    items: TENS,
    hasRange: false,
    mode: 'word',
    numberStyle: 'solid',
  },
  {
    id: 'alphabets',
    label: 'Phonics A-Z',
    subtitle: 'Phonics',
    items: ALPHABETS,
    hasRange: false,
    mode: 'word',
    numberStyle: 'outline',
  },
]

export function getSection(id) {
  return SECTIONS.find(s => s.id === id) || null
}
