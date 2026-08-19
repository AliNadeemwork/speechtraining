// Lesson content for the Alphabets/Phonics section, A-Z. This section checks
// via the WORD engine (Vosk grammar matching, same as Numbers) — NOT the
// phoneme/Wav2Vec2 engine (see PHONICS_RESEARCH_BRIEF.md for why isolated
// phonic sounds were unreliable there: 6/26). Teaching one key WORD per
// letter that genuinely carries the letter's phonic sound sidesteps that
// problem entirely, because Vosk is good at whole words.
//
// Shared item shape (see src/data/sections.js):
//   { id, display, phonicLabel, spokenWord, variants, picture, helpText, mouthShape }
//   id          — the capital letter (A-Z).
//   display     — shown big (outline style) on screen (same as id).
//   phonicLabel — the phonic sound label shown/spoken before the word, e.g.
//                 "Ah" for A (TTS says "Ah... apple").
//   spokenWord  — the ONE key word for this letter (e.g. "apple"); this is
//                 what Vosk's grammar and lib/evaluate.js check against, and
//                 what's shown under the picture with its first letter
//                 emphasized.
//   variants    — accepted alternates. Always includes the "<sound> <word>"
//                 phrase form (e.g. "ah apple") so saying the sound + word
//                 together also passes — but saying the word ALONE is the
//                 primary, always-reliable path (see proof table below).
//   picture     — emoji placeholder for the one key-word picture card.
//                 TODO(school/design): swap for real flat-illustration art
//                 at src/assets/alphabet-pics/<letter>.png — nothing else
//                 needs to change when that art is ready.
//
// MANDATORY VOSK PROOF (real TTS audio, 3 voices — Samantha/Alex/Kathy — fed
// through the REAL vosk-model-small-en-us-0.15 with the full 52-entry
// production grammar; no word substituted just to force a pass):
//   WORD ALONE:      26/26 letters, 78/78 individual voice trials PASS,
//                     ZERO cross-letter collisions. ("cat" was the one
//                     genuine failure found — one voice misheard it as
//                     H's "hat" — replaced with "cow", which retested
//                     clean 3/3.)
//   SOUND+WORD PHRASE: 16/26 letters have at least one voice that fails to
//                     recognize the two-word phrase cleanly (Vosk tends to
//                     double a short word, e.g. "cow cow", "ball ball", or
//                     drop the phrase into noise, e.g. F/Q). Per spec this
//                     is ACCEPTABLE because the word alone always works —
//                     flagged here, not fixed, since fixing would mean
//                     changing the phonic-sound labels, which are the
//                     school's approved source table.
//   Unreliable-phrase letters (word alone still 3/3 for all of these):
//     B, C, F, G, H, J, K, O, Q, S, T, V, W, X, Y, Z
export const ALPHABETS = [
  { id: 'A', display: 'A', phonicLabel: 'Ah', spokenWord: 'apple', variants: ['ah apple', 'apples'], picture: '🍎',
    helpText: 'TODO(school): Mouth opens wide and relaxed for the "ah" sound.', mouthShape: 'open' },
  { id: 'B', display: 'B', phonicLabel: 'Buh', spokenWord: 'ball', variants: ['buh ball', 'bal'], picture: '⚽',
    helpText: 'TODO(school): Lips press together and pop open for the "buh" sound.', mouthShape: 'open' },
  { id: 'C', display: 'C', phonicLabel: 'Cuh', spokenWord: 'cow', variants: ['cuh cow', 'kow'], picture: '🐄',
    helpText: 'TODO(school): Back of the tongue taps the soft palate for the "cuh" sound.', mouthShape: 'open' },
  { id: 'D', display: 'D', phonicLabel: 'Duh', spokenWord: 'dog', variants: ['duh dog', 'dawg'], picture: '🐶',
    helpText: 'TODO(school): Tongue tip taps behind the top teeth for the "duh" sound.', mouthShape: 'open' },
  { id: 'E', display: 'E', phonicLabel: 'Eh', spokenWord: 'egg', variants: ['eh egg', 'eg'], picture: '🥚',
    helpText: 'TODO(school): Mouth opens slightly for the short "eh" sound.', mouthShape: 'open' },
  { id: 'F', display: 'F', phonicLabel: 'Fuh', spokenWord: 'fish', variants: ['fuh fish', 'phish'], picture: '🐟',
    helpText: 'TODO(school): Top teeth touch the bottom lip for the "fuh" sound.', mouthShape: 'open' },
  { id: 'G', display: 'G', phonicLabel: 'Guh', spokenWord: 'goat', variants: ['guh goat', 'goad'], picture: '🐐',
    helpText: 'TODO(school): Back of the tongue taps the soft palate for the "guh" sound.', mouthShape: 'open' },
  { id: 'H', display: 'H', phonicLabel: 'Huh', spokenWord: 'hat', variants: ['huh hat', 'hatt'], picture: '🎩',
    helpText: 'TODO(school): A soft breath of air for the "huh" sound.', mouthShape: 'open' },
  { id: 'I', display: 'I', phonicLabel: 'Ih', spokenWord: 'igloo', variants: ['ih igloo', 'iglu'], picture: '🧊',
    helpText: 'TODO(school): Mouth opens slightly wide for the short "ih" sound.', mouthShape: 'wide' },
  { id: 'J', display: 'J', phonicLabel: 'Juh', spokenWord: 'jam', variants: ['juh jam', 'jaam'], picture: '🍯',
    helpText: 'TODO(school): Tongue touches the roof of the mouth for the "juh" sound.', mouthShape: 'open' },
  { id: 'K', display: 'K', phonicLabel: 'Kuh', spokenWord: 'kite', variants: ['kuh kite', 'kyte'], picture: '🪁',
    helpText: 'TODO(school): Back of the tongue taps the soft palate for the "kuh" sound.', mouthShape: 'open' },
  { id: 'L', display: 'L', phonicLabel: 'Luh', spokenWord: 'lion', variants: ['luh lion', 'lyon'], picture: '🦁',
    helpText: 'TODO(school): Tongue tip touches behind the top teeth for the "luh" sound.', mouthShape: 'open' },
  { id: 'M', display: 'M', phonicLabel: 'Muh', spokenWord: 'moon', variants: ['muh moon', 'mune'], picture: '🌙',
    helpText: 'TODO(school): Lips press gently together for the "muh" sound.', mouthShape: 'open' },
  { id: 'N', display: 'N', phonicLabel: 'Nuh', spokenWord: 'nest', variants: ['nuh nest', 'ness'], picture: '🪺',
    helpText: 'TODO(school): Tongue tip touches behind the top teeth for the "nuh" sound.', mouthShape: 'open' },
  { id: 'O', display: 'O', phonicLabel: 'Oh', spokenWord: 'orange', variants: ['oh orange', 'ornj'], picture: '🍊',
    helpText: 'TODO(school): Lips round into a small circle for the "oh" sound.', mouthShape: 'round' },
  { id: 'P', display: 'P', phonicLabel: 'Puh', spokenWord: 'pencil', variants: ['puh pencil', 'pensil'], picture: '✏️',
    helpText: 'TODO(school): Lips press together and pop open for the "puh" sound.', mouthShape: 'open' },
  { id: 'Q', display: 'Q', phonicLabel: 'Kwuh', spokenWord: 'queen', variants: ['kwuh queen', 'kween'], picture: '👸',
    helpText: 'TODO(school): Lips round forward right after the "k" for the "kwuh" sound.', mouthShape: 'round' },
  { id: 'R', display: 'R', phonicLabel: 'Ruh', spokenWord: 'rabbit', variants: ['ruh rabbit', 'rabit'], picture: '🐰',
    helpText: 'TODO(school): Tongue curls slightly back for the "ruh" sound.', mouthShape: 'open' },
  { id: 'S', display: 'S', phonicLabel: 'Suh', spokenWord: 'sun', variants: ['suh sun', 'son'], picture: '☀️',
    helpText: 'TODO(school): Teeth close together, air hisses out for the "suh" sound.', mouthShape: 'open' },
  { id: 'T', display: 'T', phonicLabel: 'Tuh', spokenWord: 'tiger', variants: ['tuh tiger', 'tyger'], picture: '🐯',
    helpText: 'TODO(school): Tongue tip taps behind the top teeth for the "tuh" sound.', mouthShape: 'open' },
  { id: 'U', display: 'U', phonicLabel: 'Uh', spokenWord: 'umbrella', variants: ['uh umbrella', 'umbrela'], picture: '☂️',
    helpText: 'TODO(school): Mouth opens slightly for the short "uh" sound.', mouthShape: 'open' },
  { id: 'V', display: 'V', phonicLabel: 'Vuh', spokenWord: 'van', variants: ['vuh van', 'vann'], picture: '🚐',
    helpText: 'TODO(school): Top teeth touch the bottom lip and buzz for the "vuh" sound.', mouthShape: 'open' },
  { id: 'W', display: 'W', phonicLabel: 'Wuh', spokenWord: 'watch', variants: ['wuh watch', 'wach'], picture: '⌚',
    helpText: 'TODO(school): Lips round tightly then release for the "wuh" sound.', mouthShape: 'round' },
  { id: 'X', display: 'X', phonicLabel: 'Ks', spokenWord: 'box', variants: ['ks box', 'bocks'], picture: '📦',
    helpText: 'TODO(school): Teeth close together for the quick "ks" sound at the end.', mouthShape: 'closed' },
  { id: 'Y', display: 'Y', phonicLabel: 'Yuh', spokenWord: 'yellow', variants: ['yuh yellow', 'yello'], picture: '🟡',
    helpText: 'TODO(school): Tongue rises then releases for the "yuh" sound.', mouthShape: 'open' },
  { id: 'Z', display: 'Z', phonicLabel: 'Zuh', spokenWord: 'zebra', variants: ['zuh zebra', 'zebrah'], picture: '🦓',
    helpText: 'TODO(school): Teeth close together and buzz for the "zuh" sound.', mouthShape: 'open' },
]
