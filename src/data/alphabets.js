// Lesson content for the Alphabets section, A-Z.
// This section teaches PHONIC SOUNDS (the sound the letter makes, e.g. B
// -> "Buh"), not letter names. That replaced the earlier letter-name
// approach entirely — see git history if the school ever wants to go back.
//
// Shared item shape (see src/data/sections.js), PLUS phonics-only fields:
//   { id, display, spokenWord, variants[], helpText, mouthShape,
//     phonicLabel, ttsSpelling }
//
// FIELD ROLES — three different jobs, do not merge them:
//   phonicLabel — the pedagogically "pure" sound label shown on screen
//                 under the big letter, exactly the source table the school
//                 gave us (e.g. "Buh", "Fff", "Sss"). Never changed for
//                 recognizability reasons.
//   ttsSpelling — what's ACTUALLY spoken by TTS (Listen / auto-pronounce).
//                 CRITICAL FINDING (see commit message for the full 26-row
//                 test table): feeding phonicLabel's literal spelling
//                 ("buh", "fff", "sss"...) straight to both TTS and Vosk
//                 fails for 24/26 letters — these aren't real English words,
//                 so the small Vosk model's grammar can't reliably decode
//                 them (empty/[unk]/garbled), regardless of spelling
//                 tweaks. ttsSpelling is a short REAL word chosen so (a)
//                 TTS pronounces it clearly and (b) — verified empirically,
//                 not assumed — Vosk's grammar reliably recognizes it. It
//                 necessarily includes a vowel/coda the pure phonicLabel
//                 doesn't have (e.g. B's "Buh" -> spoken as "bub"); that's
//                 the deliberate, tested trade-off, not an oversight.
//   spokenWord  — the recognizer's grammar/matching target. Set to
//                 ttsSpelling (the word that's actually spoken and that
//                 Vosk actually recognizes), NOT phonicLabel.
//   variants    — includes the literal phonicLabel (lowercased) and the
//                 bare letter as required fallbacks, even though testing
//                 showed the bare phonicLabel spelling alone usually isn't
//                 recognized by TTS-generated audio — a real child's voice
//                 may succeed where synthetic audio didn't, so it's kept as
//                 a low-cost fallback rather than dropped.
//
// ALL 26 ttsSpelling choices were verified by literally piping generated
// TTS audio through the real Vosk recognizer and confirming the exact
// target word came back — see the commit message for the full table
// (letter | phonic sound | ttsSpelling spoken | raw Vosk output | pass).
// No letter in this file is unverified/guessed.
//
// `helpText` — TODO(school): placeholder articulation tips describing the
// SOUND (not the letter name) — please have a speech therapist review.
// `mouthShape` — keyword used by the Help mouth animation: 'open' | 'round' | 'wide' | 'closed'.
export const ALPHABETS = [
  { id: 'A', display: 'A', phonicLabel: 'Ah', ttsSpelling: 'spa', spokenWord: 'spa', variants: ['ah', 'a'],
    helpText: 'TODO(school): Mouth opens wide and relaxed for the short "ah" sound.',
    mouthShape: 'open' },
  { id: 'B', display: 'B', phonicLabel: 'Buh', ttsSpelling: 'bub', spokenWord: 'bub', variants: ['buh', 'b'],
    helpText: 'TODO(school): Lips press together and pop open for the "buh" sound.',
    mouthShape: 'closed' },
  { id: 'C', display: 'C', phonicLabel: 'Cuh', ttsSpelling: 'cub', spokenWord: 'cub', variants: ['cuh', 'c'],
    helpText: 'TODO(school): Back of the tongue taps the soft palate for the "cuh" sound.',
    mouthShape: 'open' },
  { id: 'D', display: 'D', phonicLabel: 'Duh', ttsSpelling: 'dad', spokenWord: 'dad', variants: ['duh', 'd'],
    helpText: 'TODO(school): Tongue tip taps behind the top teeth for the "duh" sound.',
    mouthShape: 'open' },
  { id: 'E', display: 'E', phonicLabel: 'Eh', ttsSpelling: 'ebb', spokenWord: 'ebb', variants: ['eh', 'e'],
    helpText: 'TODO(school): Mouth opens slightly for the short "eh" sound.',
    mouthShape: 'open' },
  { id: 'F', display: 'F', phonicLabel: 'Fff', ttsSpelling: 'fun', spokenWord: 'fun', variants: ['fff', 'f'],
    helpText: 'TODO(school): Top teeth touch the bottom lip and air hisses out for "fff".',
    mouthShape: 'closed' },
  { id: 'G', display: 'G', phonicLabel: 'Guh', ttsSpelling: 'gum', spokenWord: 'gum', variants: ['guh', 'g'],
    helpText: 'TODO(school): Back of the tongue taps the soft palate for the "guh" sound.',
    mouthShape: 'open' },
  { id: 'H', display: 'H', phonicLabel: 'Huh', ttsSpelling: 'hut', spokenWord: 'hut', variants: ['huh', 'h'],
    helpText: 'TODO(school): A soft breath of air for the "huh" sound, mouth relaxed.',
    mouthShape: 'open' },
  { id: 'I', display: 'I', phonicLabel: 'Ih', ttsSpelling: 'itch', spokenWord: 'itch', variants: ['ih', 'i'],
    helpText: 'TODO(school): Mouth opens slightly wide for the short "ih" sound.',
    mouthShape: 'wide' },
  { id: 'J', display: 'J', phonicLabel: 'Juh', ttsSpelling: 'jug', spokenWord: 'jug', variants: ['juh', 'j'],
    helpText: 'TODO(school): Tongue touches the roof of the mouth for the "juh" sound.',
    mouthShape: 'open' },
  { id: 'K', display: 'K', phonicLabel: 'Kuh', ttsSpelling: 'cut', spokenWord: 'cut', variants: ['kuh', 'k'],
    helpText: 'TODO(school): Back of the tongue taps the soft palate for the "kuh" sound.',
    mouthShape: 'open' },
  { id: 'L', display: 'L', phonicLabel: 'Lll', ttsSpelling: 'luck', spokenWord: 'luck', variants: ['lll', 'l'],
    helpText: 'TODO(school): Tongue tip touches behind the top teeth for the "lll" sound.',
    mouthShape: 'open' },
  { id: 'M', display: 'M', phonicLabel: 'Mmm', ttsSpelling: 'mud', spokenWord: 'mud', variants: ['mmm', 'm'],
    helpText: 'TODO(school): Lips press gently together and hum for the "mmm" sound.',
    mouthShape: 'closed' },
  { id: 'N', display: 'N', phonicLabel: 'Nnn', ttsSpelling: 'nut', spokenWord: 'nut', variants: ['nnn', 'n'],
    helpText: 'TODO(school): Tongue tip touches behind the top teeth and hums for "nnn".',
    mouthShape: 'closed' },
  { id: 'O', display: 'O', phonicLabel: 'Oh', ttsSpelling: 'go', spokenWord: 'go', variants: ['oh', 'o'],
    helpText: 'TODO(school): Lips round into a small circle for the "oh" sound.',
    mouthShape: 'round' },
  { id: 'P', display: 'P', phonicLabel: 'Puh', ttsSpelling: 'pub', spokenWord: 'pub', variants: ['puh', 'p'],
    helpText: 'TODO(school): Lips press together and pop open for the "puh" sound.',
    mouthShape: 'closed' },
  { id: 'Q', display: 'Q', phonicLabel: 'Kwuh', ttsSpelling: 'quit', spokenWord: 'quit', variants: ['kwuh', 'q'],
    helpText: 'TODO(school): Lips round forward right after the "k" for the "kwuh" sound.',
    mouthShape: 'round' },
  { id: 'R', display: 'R', phonicLabel: 'Rrr', ttsSpelling: 'rrr', spokenWord: 'rrr', variants: ['r'],
    helpText: 'TODO(school): Tongue curls slightly back for the sustained "rrr" sound.',
    mouthShape: 'open' },
  { id: 'S', display: 'S', phonicLabel: 'Sss', ttsSpelling: 'sun', spokenWord: 'sun', variants: ['sss', 's'],
    helpText: 'TODO(school): Teeth close together, air hisses out for the "sss" sound.',
    mouthShape: 'closed' },
  { id: 'T', display: 'T', phonicLabel: 'Tuh', ttsSpelling: 'tub', spokenWord: 'tub', variants: ['tuh', 't'],
    helpText: 'TODO(school): Tongue tip taps behind the top teeth for the "tuh" sound.',
    mouthShape: 'closed' },
  { id: 'U', display: 'U', phonicLabel: 'Uh', ttsSpelling: 'utter', spokenWord: 'utter', variants: ['uh', 'u'],
    helpText: 'TODO(school): Mouth opens slightly for the short "uh" sound.',
    mouthShape: 'open' },
  { id: 'V', display: 'V', phonicLabel: 'Vvv', ttsSpelling: 'van', spokenWord: 'van', variants: ['vvv', 'v'],
    helpText: 'TODO(school): Top teeth touch the bottom lip and buzz for the "vvv" sound.',
    mouthShape: 'closed' },
  { id: 'W', display: 'W', phonicLabel: 'Wuh', ttsSpelling: 'won', spokenWord: 'won', variants: ['wuh', 'w'],
    helpText: 'TODO(school): Lips round tightly then release for the "wuh" sound.',
    mouthShape: 'round' },
  { id: 'X', display: 'X', phonicLabel: 'Ks', ttsSpelling: 'ks', spokenWord: 'ks', variants: ['x'],
    helpText: 'TODO(school): Teeth close together for the quick "ks" sound.',
    mouthShape: 'closed' },
  { id: 'Y', display: 'Y', phonicLabel: 'Yuh', ttsSpelling: 'yup', spokenWord: 'yup', variants: ['yuh', 'y'],
    helpText: 'TODO(school): Tongue rises then releases for the "yuh" sound.',
    mouthShape: 'closed' },
  { id: 'Z', display: 'Z', phonicLabel: 'Zzz', ttsSpelling: 'zap', spokenWord: 'zap', variants: ['zzz', 'z'],
    helpText: 'TODO(school): Teeth close together and buzz for the "zzz" sound.',
    mouthShape: 'closed' },
]
