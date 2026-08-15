// Lesson content for the Alphabets section, A-Z.
// Teaches PURE PHONIC SOUNDS — the on-screen label, the TTS speech, and the
// recognizer's grammar/matching target are ALL the same literal phonic
// spelling from the school's source table. No real-word substitutions are
// used to force a pass — see the commit message for the full 26-letter,
// 3-voice recognizability test and its honest pass/fail results. Some
// letters are known to fail recognition as pure phonic sounds; they are
// NOT silently patched around here.
//
// Shared item shape (see src/data/sections.js):
//   { id, display, phonicLabel, spokenWord, variants[], helpText, mouthShape }
//   display     — the capital letter shown on screen (e.g. "B").
//   phonicLabel — the phonic sound label shown under it AND spoken by TTS
//                 (Listen / auto-pronounce) — exactly the source table.
//   spokenWord  — the recognizer's grammar/matching target. Equal to
//                 phonicLabel.toLowerCase() — no substitution.
//   variants    — the bare letter as a fallback only; no other word
//                 substitutions (per explicit instruction not to mask
//                 failures with wider acceptance).
//
// `helpText` — TODO(school): placeholder articulation tips for the SOUND —
// please have a speech therapist review these.
// `mouthShape` — keyword used by the Help mouth animation: 'open' | 'round' | 'wide' | 'closed'.
export const ALPHABETS = [
  { id: 'A', display: 'A', phonicLabel: 'Ah', spokenWord: 'ah', variants: ['a'],
    helpText: 'TODO(school): Mouth opens wide and relaxed for the "ah" sound.',
    mouthShape: 'open' },
  { id: 'B', display: 'B', phonicLabel: 'Bah', spokenWord: 'bah', variants: ['b'],
    helpText: 'TODO(school): Lips press together and pop open for the "bah" sound.',
    mouthShape: 'open' },
  { id: 'C', display: 'C', phonicLabel: 'Cah', spokenWord: 'cah', variants: ['c'],
    helpText: 'TODO(school): Back of the tongue taps the soft palate for the "cah" sound.',
    mouthShape: 'open' },
  { id: 'D', display: 'D', phonicLabel: 'Dah', spokenWord: 'dah', variants: ['d'],
    helpText: 'TODO(school): Tongue tip taps behind the top teeth for the "dah" sound.',
    mouthShape: 'open' },
  { id: 'E', display: 'E', phonicLabel: 'Eh', spokenWord: 'eh', variants: ['e'],
    helpText: 'TODO(school): Mouth opens slightly for the short "eh" sound.',
    mouthShape: 'open' },
  { id: 'F', display: 'F', phonicLabel: 'Fah', spokenWord: 'fah', variants: ['f'],
    helpText: 'TODO(school): Top teeth touch the bottom lip for the "fah" sound.',
    mouthShape: 'open' },
  { id: 'G', display: 'G', phonicLabel: 'Gah', spokenWord: 'gah', variants: ['g'],
    helpText: 'TODO(school): Back of the tongue taps the soft palate for the "gah" sound.',
    mouthShape: 'open' },
  { id: 'H', display: 'H', phonicLabel: 'Hah', spokenWord: 'hah', variants: ['h'],
    helpText: 'TODO(school): A soft breath of air for the "hah" sound.',
    mouthShape: 'open' },
  { id: 'I', display: 'I', phonicLabel: 'Ih', spokenWord: 'ih', variants: ['i'],
    helpText: 'TODO(school): Mouth opens slightly wide for the short "ih" sound.',
    mouthShape: 'wide' },
  { id: 'J', display: 'J', phonicLabel: 'Jah', spokenWord: 'jah', variants: ['j'],
    helpText: 'TODO(school): Tongue touches the roof of the mouth for the "jah" sound.',
    mouthShape: 'open' },
  { id: 'K', display: 'K', phonicLabel: 'Kah', spokenWord: 'kah', variants: ['k'],
    helpText: 'TODO(school): Back of the tongue taps the soft palate for the "kah" sound.',
    mouthShape: 'open' },
  { id: 'L', display: 'L', phonicLabel: 'Lah', spokenWord: 'lah', variants: ['l'],
    helpText: 'TODO(school): Tongue tip touches behind the top teeth for the "lah" sound.',
    mouthShape: 'open' },
  { id: 'M', display: 'M', phonicLabel: 'Mah', spokenWord: 'mah', variants: ['m'],
    helpText: 'TODO(school): Lips press gently together for the "mah" sound.',
    mouthShape: 'open' },
  { id: 'N', display: 'N', phonicLabel: 'Nah', spokenWord: 'nah', variants: ['n'],
    helpText: 'TODO(school): Tongue tip touches behind the top teeth for the "nah" sound.',
    mouthShape: 'open' },
  { id: 'O', display: 'O', phonicLabel: 'Oh', spokenWord: 'oh', variants: ['o'],
    helpText: 'TODO(school): Lips round into a small circle for the "oh" sound.',
    mouthShape: 'round' },
  { id: 'P', display: 'P', phonicLabel: 'Pah', spokenWord: 'pah', variants: ['p'],
    helpText: 'TODO(school): Lips press together and pop open for the "pah" sound.',
    mouthShape: 'open' },
  { id: 'Q', display: 'Q', phonicLabel: 'Kwah', spokenWord: 'kwah', variants: ['q'],
    helpText: 'TODO(school): Lips round forward right after the "k" for the "kwah" sound.',
    mouthShape: 'round' },
  { id: 'R', display: 'R', phonicLabel: 'Rah', spokenWord: 'rah', variants: ['r'],
    helpText: 'TODO(school): Tongue curls slightly back for the "rah" sound.',
    mouthShape: 'open' },
  { id: 'S', display: 'S', phonicLabel: 'Sah', spokenWord: 'sah', variants: ['s'],
    helpText: 'TODO(school): Teeth close together, air hisses out for the "sah" sound.',
    mouthShape: 'open' },
  { id: 'T', display: 'T', phonicLabel: 'Tah', spokenWord: 'tah', variants: ['t'],
    helpText: 'TODO(school): Tongue tip taps behind the top teeth for the "tah" sound.',
    mouthShape: 'open' },
  { id: 'U', display: 'U', phonicLabel: 'Uh', spokenWord: 'uh', variants: ['u'],
    helpText: 'TODO(school): Mouth opens slightly for the short "uh" sound.',
    mouthShape: 'open' },
  { id: 'V', display: 'V', phonicLabel: 'Vah', spokenWord: 'vah', variants: ['v'],
    helpText: 'TODO(school): Top teeth touch the bottom lip and buzz for the "vah" sound.',
    mouthShape: 'open' },
  { id: 'W', display: 'W', phonicLabel: 'Wah', spokenWord: 'wah', variants: ['w'],
    helpText: 'TODO(school): Lips round tightly then release for the "wah" sound.',
    mouthShape: 'round' },
  { id: 'X', display: 'X', phonicLabel: 'Ks', spokenWord: 'ks', variants: ['x'],
    helpText: 'TODO(school): Teeth close together for the quick "ks" sound.',
    mouthShape: 'closed' },
  { id: 'Y', display: 'Y', phonicLabel: 'Yah', spokenWord: 'yah', variants: ['y'],
    helpText: 'TODO(school): Tongue rises then releases for the "yah" sound.',
    mouthShape: 'open' },
  { id: 'Z', display: 'Z', phonicLabel: 'Zah', spokenWord: 'zah', variants: ['z'],
    helpText: 'TODO(school): Teeth close together and buzz for the "zah" sound.',
    mouthShape: 'open' },
]
