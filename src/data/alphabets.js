// Lesson content for the Alphabets section, A-Z.
// Shared item shape (see src/data/sections.js):
//   { id, display, spokenWord, ttsText, variants[], helpText, mouthShape }
//
// TODO(school): CONFIRM WITH THE SCHOOL — should this section teach the
// letter NAME ("bee" for B) or the phonic SOUND ("buh" for B)? Deaf/HoH
// literacy programs often teach sounds first. This build uses letter NAMES
// for now; switching to phonic sounds later only means editing the
// `ttsText`/`spokenWord`/`variants` values below — no other file changes.
//
// FIELD ROLES (do not merge these — they solve two different problems):
//   ttsText    — spoken by TTS (Listen / auto-pronounce) and shown as the
//                on-screen pronunciation label. MUST always be the
//                phonetically-correct spelling of the letter's name — never
//                trade pronunciation accuracy for recognition convenience.
//   spokenWord — the recognizer's grammar/matching target. For every letter
//                below it is the SAME string as ttsText (same real sound),
//                never a differently-pronounced substitute word — Vosk's
//                grammar only needs to recognize what the child was
//                actually asked to say.
//   variants   — homophones/near-misses ACCEPTED as correct, including (for
//                a few letters) the specific word Vosk's small model was
//                empirically observed to mis-transcribe the CORRECT
//                pronunciation as (verified with real TTS audio piped
//                through the actual recognizer — see commit message). This
//                keeps a correct answer from being marked wrong without
//                ever changing what's taught.
//
// KNOWN LIMITATIONS (flagged, not silently papered over): with the small
// Vosk model tested, correctly-pronounced E, G, H, and O did not reliably
// decode to any usable grammar word at all (no variant fix is possible for
// a recognition that comes back empty/unk). K's correct pronunciation is
// acoustically very close to A's for this model. These need verification
// with real children's voices on the target device — a synthetic TTS voice
// may behave differently than a live child. The existing 3-strike
// anti-frustration mechanism is the safety net if any of these turn out to
// still be unreliable in the classroom.
//
// `helpText` — TODO(school): placeholder articulation tips, same caveat as
// numbers.js — please have a speech therapist review these.
// `mouthShape` — keyword used by the Help mouth animation: 'open' | 'round' | 'wide' | 'closed'.
export const ALPHABETS = [
  { id: 'A', display: 'A', spokenWord: 'ay', ttsText: 'ay', variants: ['a', 'eh', 'eye'],
    helpText: 'TODO(school): Mouth opens wide and relaxed for the long "ay" sound, like in "day".',
    mouthShape: 'open' },
  { id: 'B', display: 'B', spokenWord: 'bee', ttsText: 'bee', variants: ['b', 'be'],
    helpText: 'TODO(school): Lips press together and pop open for "b", then spread into a smile for "ee".',
    mouthShape: 'wide' },
  { id: 'C', display: 'C', spokenWord: 'see', ttsText: 'see', variants: ['c', 'sea', 'cee'],
    helpText: 'TODO(school): Tongue tip rises behind the top teeth for "c/s", mouth spreads wide for "ee".',
    mouthShape: 'wide' },
  { id: 'D', display: 'D', spokenWord: 'dee', ttsText: 'dee', variants: ['d', 'de'],
    helpText: 'TODO(school): Tongue tip taps behind the top teeth for "d", then mouth spreads for "ee".',
    mouthShape: 'wide' },
  { id: 'E', display: 'E', spokenWord: 'ee', ttsText: 'ee', variants: ['e'],
    // KNOWN LIMITATION: correctly-pronounced "ee" decoded to no usable
    // grammar word in testing (too short/weak a signal for this model) —
    // verify on the real device before trusting this letter.
    helpText: 'TODO(school): Mouth spreads into a wide smile for the long "ee" sound.',
    mouthShape: 'wide' },
  { id: 'F', display: 'F', spokenWord: 'eff', ttsText: 'eff', variants: ['f', 'ef'],
    helpText: 'TODO(school): Top teeth touch the bottom lip and air hisses out for "f".',
    mouthShape: 'closed' },
  { id: 'G', display: 'G', spokenWord: 'jee', ttsText: 'jee', variants: ['g', 'gee'],
    // KNOWN LIMITATION: correctly-pronounced "jee" garbled in testing —
    // verify on the real device.
    helpText: 'TODO(school): Back of tongue touches the roof of the mouth for "j/g", then mouth spreads for "ee".',
    mouthShape: 'wide' },
  { id: 'H', display: 'H', spokenWord: 'aitch', ttsText: 'aitch', variants: ['h', 'haitch', 'aych'],
    // KNOWN LIMITATION: correctly-pronounced "aitch" decoded to no usable
    // grammar word across every spelling tried (aitch/aych/haitch/eitch) —
    // this looks like a hard limit of this small model for this sound.
    // Verify on the real device; may need a different Vosk model/language
    // pack if it's still unreliable with real children's voices.
    helpText: 'TODO(school): Mouth stays relaxed; a soft breath of air for "h" leads into "aitch".',
    mouthShape: 'closed' },
  { id: 'I', display: 'I', spokenWord: 'eye', ttsText: 'eye', variants: ['i', 'ai'],
    helpText: 'TODO(school): Mouth opens wide then narrows for the "eye" diphthong, like in "my".',
    mouthShape: 'open' },
  { id: 'J', display: 'J', spokenWord: 'jay', ttsText: 'jay', variants: ['j'],
    helpText: 'TODO(school): Tongue touches the roof of the mouth for "j", mouth opens for "ay".',
    mouthShape: 'open' },
  { id: 'K', display: 'K', spokenWord: 'kay', ttsText: 'kay', variants: ['k', 'hay', 'ay'],
    // KNOWN LIMITATION: correctly-pronounced "kay" tested acoustically very
    // close to "ay"/"hay" for this model (weak initial consonant) — the
    // extra variants above accept that specific confusion pattern so a
    // correct attempt isn't marked wrong; verify on the real device.
    helpText: 'TODO(school): Back of the tongue taps the soft palate for "k", mouth opens for "ay".',
    mouthShape: 'open' },
  { id: 'L', display: 'L', spokenWord: 'ell', ttsText: 'ell', variants: ['l', 'el'],
    helpText: 'TODO(school): Tongue tip touches behind the top teeth and stays there for "l".',
    mouthShape: 'closed' },
  { id: 'M', display: 'M', spokenWord: 'em', ttsText: 'em', variants: ['m', 'en'],
    // The extra 'en' variant accepts a specific tested confusion between
    // correctly-pronounced "em" and letter N's own target — see note above.
    helpText: 'TODO(school): Lips press gently together and hum for "m".',
    mouthShape: 'closed' },
  { id: 'N', display: 'N', spokenWord: 'en', ttsText: 'en', variants: ['n'],
    helpText: 'TODO(school): Tongue tip touches behind the top teeth and hums for "n".',
    mouthShape: 'closed' },
  { id: 'O', display: 'O', spokenWord: 'oh', ttsText: 'oh', variants: ['o'],
    // KNOWN LIMITATION: correctly-pronounced "oh" decoded to nothing in
    // testing (too short/weak a signal) — verify on the real device.
    helpText: 'TODO(school): Lips round into a small circle for the long "oh" sound.',
    mouthShape: 'round' },
  { id: 'P', display: 'P', spokenWord: 'pee', ttsText: 'pee', variants: ['p', 'pea'],
    helpText: 'TODO(school): Lips press together and pop open for "p", then spread into a smile for "ee".',
    mouthShape: 'wide' },
  { id: 'Q', display: 'Q', spokenWord: 'cue', ttsText: 'cue', variants: ['q', 'queue'],
    helpText: 'TODO(school): Lips round forward for the "you/oo" sound after the "k".',
    mouthShape: 'round' },
  { id: 'R', display: 'R', spokenWord: 'ar', ttsText: 'ar', variants: ['r', 'are'],
    // Verified: TTS audio of "ar" is transcribed by Vosk as "are" — the
    // 'are' variant is what makes this resolve correctly (this was the
    // literal "R recognized as A R" bug; also fixed by the whitespace-
    // collapsing normalize() change in evaluate.js).
    helpText: 'TODO(school): Mouth opens and the tongue curls slightly back for "ar".',
    mouthShape: 'open' },
  { id: 'S', display: 'S', spokenWord: 'ess', ttsText: 'ess', variants: ['s', 'es'],
    helpText: 'TODO(school): Teeth close together with a wide smile, air hisses out for "s".',
    mouthShape: 'closed' },
  { id: 'T', display: 'T', spokenWord: 'tee', ttsText: 'tee', variants: ['t', 'tea', 'see'],
    // The extra 'see' variant accepts a specific tested confusion between
    // correctly-pronounced "tee" and letter C's own target — see note above.
    helpText: 'TODO(school): Tongue tip taps behind the top teeth for "t", then mouth spreads for "ee".',
    mouthShape: 'wide' },
  { id: 'U', display: 'U', spokenWord: 'you', ttsText: 'you', variants: ['u', 'yu'],
    helpText: 'TODO(school): Lips round and push forward for the "you" sound.',
    mouthShape: 'round' },
  { id: 'V', display: 'V', spokenWord: 'vee', ttsText: 'vee', variants: ['v'],
    helpText: 'TODO(school): Top teeth touch the bottom lip and buzz for "v", then mouth spreads for "ee".',
    mouthShape: 'wide' },
  { id: 'W', display: 'W', spokenWord: 'double you', ttsText: 'double you', variants: ['w', 'double u', 'doubleyou'],
    helpText: 'TODO(school): Lips round tightly forward, like blowing a small kiss, for "double-u".',
    mouthShape: 'round' },
  { id: 'X', display: 'X', spokenWord: 'ex', ttsText: 'ex', variants: ['x', 'eks'],
    helpText: 'TODO(school): Mouth opens briefly then teeth close for the "ks" sound in "ex".',
    mouthShape: 'closed' },
  { id: 'Y', display: 'Y', spokenWord: 'why', ttsText: 'why', variants: ['y'],
    helpText: 'TODO(school): Lips round briefly then mouth opens wide for the "why" diphthong.',
    mouthShape: 'open' },
  { id: 'Z', display: 'Z', spokenWord: 'zee', ttsText: 'zee', variants: ['z', 'zed'],
    helpText: 'TODO(school): Teeth close together and buzz for "z", then mouth spreads for "ee".',
    mouthShape: 'wide' },
]
