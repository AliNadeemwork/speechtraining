// Lesson content for the Alphabets section, A-Z. This section checks PHONIC
// SOUNDS via the phoneme engine (Wav2Vec2 CTC, see lib/recognition.js +
// lib/phonemeWorker.js) — not via Vosk word-grammar matching, which cannot
// judge an isolated sound at all. The target phoneme per letter lives in
// lib/phonemeEvaluator.js (keyed by `id`), not here.
//
// Shared item shape (see src/data/sections.js):
//   { id, display, phonicLabel, helpText, mouthShape }
//   id          — the capital letter (A-Z); also the key into
//                 phonemeEvaluator.js's PHONEME_TARGETS.
//   display     — shown big on screen (same as id for this section).
//   phonicLabel — the phonic sound label shown under it AND spoken by TTS
//                 (Listen / auto-pronounce) — exactly the school's source
//                 table (e.g. "Buh" for B). No real-word substitution.
//
// TODO(school/design): the spec calls for a key-word PICTURE next to the
// letter (e.g. a small "ball" image for B). No picture assets exist in this
// repo yet, so the lesson currently shows only the big letter — add
// src/assets/alphabet-pics/<letter>.png (or similar) and wire it into
// Lesson.jsx when art is available; nothing else needs to change for that.
//
// `helpText` — TODO(school): placeholder articulation tips for the SOUND —
// please have a speech therapist review these.
// `mouthShape` — keyword used by the Help mouth animation: 'open' | 'round' | 'wide' | 'closed'.
export const ALPHABETS = [
  { id: 'A', display: 'A', phonicLabel: 'Ah',
    helpText: 'TODO(school): Mouth opens wide and relaxed for the "ah" sound.',
    mouthShape: 'open' },
  { id: 'B', display: 'B', phonicLabel: 'Buh',
    helpText: 'TODO(school): Lips press together and pop open for the "buh" sound.',
    mouthShape: 'open' },
  { id: 'C', display: 'C', phonicLabel: 'Cuh',
    helpText: 'TODO(school): Back of the tongue taps the soft palate for the "cuh" sound.',
    mouthShape: 'open' },
  { id: 'D', display: 'D', phonicLabel: 'Duh',
    helpText: 'TODO(school): Tongue tip taps behind the top teeth for the "duh" sound.',
    mouthShape: 'open' },
  { id: 'E', display: 'E', phonicLabel: 'Eh',
    helpText: 'TODO(school): Mouth opens slightly for the short "eh" sound.',
    mouthShape: 'open' },
  { id: 'F', display: 'F', phonicLabel: 'Fuh',
    helpText: 'TODO(school): Top teeth touch the bottom lip for the "fuh" sound.',
    mouthShape: 'open' },
  { id: 'G', display: 'G', phonicLabel: 'Guh',
    helpText: 'TODO(school): Back of the tongue taps the soft palate for the "guh" sound.',
    mouthShape: 'open' },
  { id: 'H', display: 'H', phonicLabel: 'Huh',
    helpText: 'TODO(school): A soft breath of air for the "huh" sound.',
    mouthShape: 'open' },
  { id: 'I', display: 'I', phonicLabel: 'Ih',
    helpText: 'TODO(school): Mouth opens slightly wide for the short "ih" sound.',
    mouthShape: 'wide' },
  { id: 'J', display: 'J', phonicLabel: 'Juh',
    helpText: 'TODO(school): Tongue touches the roof of the mouth for the "juh" sound.',
    mouthShape: 'open' },
  { id: 'K', display: 'K', phonicLabel: 'Kuh',
    helpText: 'TODO(school): Back of the tongue taps the soft palate for the "kuh" sound.',
    mouthShape: 'open' },
  { id: 'L', display: 'L', phonicLabel: 'Luh',
    helpText: 'TODO(school): Tongue tip touches behind the top teeth for the "luh" sound.',
    mouthShape: 'open' },
  { id: 'M', display: 'M', phonicLabel: 'Muh',
    helpText: 'TODO(school): Lips press gently together for the "muh" sound.',
    mouthShape: 'open' },
  { id: 'N', display: 'N', phonicLabel: 'Nuh',
    helpText: 'TODO(school): Tongue tip touches behind the top teeth for the "nuh" sound.',
    mouthShape: 'open' },
  { id: 'O', display: 'O', phonicLabel: 'Oh',
    helpText: 'TODO(school): Lips round into a small circle for the "oh" sound.',
    mouthShape: 'round' },
  { id: 'P', display: 'P', phonicLabel: 'Puh',
    helpText: 'TODO(school): Lips press together and pop open for the "puh" sound.',
    mouthShape: 'open' },
  { id: 'Q', display: 'Q', phonicLabel: 'Kwuh',
    helpText: 'TODO(school): Lips round forward right after the "k" for the "kwuh" sound.',
    mouthShape: 'round' },
  { id: 'R', display: 'R', phonicLabel: 'Ruh',
    helpText: 'TODO(school): Tongue curls slightly back for the "ruh" sound.',
    mouthShape: 'open' },
  { id: 'S', display: 'S', phonicLabel: 'Suh',
    helpText: 'TODO(school): Teeth close together, air hisses out for the "suh" sound.',
    mouthShape: 'open' },
  { id: 'T', display: 'T', phonicLabel: 'Tuh',
    helpText: 'TODO(school): Tongue tip taps behind the top teeth for the "tuh" sound.',
    mouthShape: 'open' },
  { id: 'U', display: 'U', phonicLabel: 'Uh',
    helpText: 'TODO(school): Mouth opens slightly for the short "uh" sound.',
    mouthShape: 'open' },
  { id: 'V', display: 'V', phonicLabel: 'Vuh',
    helpText: 'TODO(school): Top teeth touch the bottom lip and buzz for the "vuh" sound.',
    mouthShape: 'open' },
  { id: 'W', display: 'W', phonicLabel: 'Wuh',
    helpText: 'TODO(school): Lips round tightly then release for the "wuh" sound.',
    mouthShape: 'round' },
  { id: 'X', display: 'X', phonicLabel: 'Ks',
    helpText: 'TODO(school): Teeth close together for the quick "ks" sound.',
    mouthShape: 'closed' },
  { id: 'Y', display: 'Y', phonicLabel: 'Yuh',
    helpText: 'TODO(school): Tongue rises then releases for the "yuh" sound.',
    mouthShape: 'open' },
  { id: 'Z', display: 'Z', phonicLabel: 'Zuh',
    helpText: 'TODO(school): Teeth close together and buzz for the "zuh" sound.',
    mouthShape: 'open' },
]
