// Registry of lesson sections. Each section's items share one shape:
//   { id, display, spokenWord, variants[], helpText, mouthShape }
// Adding a new section (e.g. "Colors") means adding one more entry here
// with its own data file — Lesson.jsx and the recognizer are both
// parameterized by section, not hardcoded to numbers.
import { NUMBERS } from './numbers'
import { ALPHABETS } from './alphabets'

export const SECTIONS = [
  {
    id: 'numbers',
    label: 'Numbers',
    subtitle: 'Numbers',
    items: NUMBERS,
    hasRange: true, // Settings > Number range applies to this section only
  },
  {
    id: 'alphabets',
    label: 'Alphabets',
    subtitle: 'Alphabets',
    items: ALPHABETS,
    hasRange: false,
  },
]

export function getSection(id) {
  return SECTIONS.find(s => s.id === id) || null
}
