// Lesson content for the Urdu section — حروفِ تہجی (the Urdu alphabet),
// one letter at a time, same screen flow as English phonics. Checked via
// the Whisper engine (lib/whisperWorker.js), NOT Vosk — Vosk has no Urdu
// model. See lib/urduEvaluate.js for the matching logic and
// lib/recognition.js's `createUrduEngine()` for the engine itself.
//
// Shared item shape (see src/data/sections.js):
//   { id, display, spokenTarget, variants, ttsText, helpText, mouthShape }
//   id           — short romanized key (e.g. 'alif'), used as the React key
//                  and by the mandatory-test proof table.
//   display      — the big glyph shown on screen (e.g. 'ا').
//   spokenTarget — the letter's NAME in Urdu script (what the child is
//                  expected to say, e.g. 'الف' for Alif) — this is what
//                  lib/urduEvaluate.js normalizes and compares against.
//   variants     — alternate valid spellings/forms of the name (with/
//                  without a trailing ے, common alternate transliteration
//                  spellings written in Urdu script, etc.).
//   ttsText      — text spoken for Listen/auto-pronounce. Same as
//                  spokenTarget here (there's no separate "sound" concept
//                  for letter NAMES — see TODO below on names vs. sounds).
//
// TODO(school/client) — CONFIRM BEFORE THIS GOES TO A CLIENT-FACING BUILD:
//  1. Exact letter list & order. This uses the commonly-taught 39-letter
//     حروفِ تہجی (Alif..Bari Ye, including ں/ھ/ء as separate entries) — but
//     Urdu curricula vary (some textbooks teach 35, some 37, some merge/
//     split entries differently). Please confirm the school's exact list.
//  2. NAMES vs. SOUNDS. This first version teaches LETTER NAMES (child says
//     "الف" for ا, the same way English teaches "ay" for A) — analogous to
//     the ORIGINAL (rejected) English approach, not the final phonic-sound
//     English approach. If the school wants Urdu taught as SOUNDS instead
//     (child says the sound ا makes, not its name), that is a content
//     change here, not an engine change — tell me and I'll rebuild this
//     list the same way the English phonics list was rebuilt.
//  3. Urdu name spellings below follow common usage but were not reviewed
//     by a native Urdu-speaking educator — please have the school confirm
//     each spokenTarget string renders/reads correctly.
//  4. Listen audio: speechSynthesis 'ur-PK' has NO installed voice on any
//     browser/OS tested in this environment (checked macOS `say -v '?'` and
//     Chromium's speechSynthesis.getVoices() — zero Urdu/Hindi voices found
//     either way). lib/tts.js will silently produce NO sound for Listen
//     until either (a) the deployed device has an OS-level Urdu voice
//     installed, or (b) the school provides recorded audio per letter (the
//     same src/assets/mouth/<id>.mp4 pattern Help already supports could be
//     extended to audio-only clips). Flagging this clearly — do not assume
//     Listen works for Urdu until tested on a real target device/browser.
//
// MANDATORY WHISPER PROOF (real Urdu TTS audio — no local Urdu voice was
// available anywhere in this environment, so genuine Urdu audio for testing
// came from a public Google Translate TTS endpoint, test-fixture use only,
// NOT part of the shipped app — run through the REAL whisper-base model,
// correctly 16kHz-resampled, with repetition-loop mitigation):
//   RESULT: 5/39 letters (13%) pass under lib/urduEvaluate.js's real
//   matching logic. whisper-tiny was also tested head-to-head on the same
//   39 clips: 2/39 (5%) — base is meaningfully better but NEITHER is
//   reliable. Passing letters: jeem, dal, seen, sheen, hamza (verified via
//   the same normalize+contains+variants logic Lesson.jsx actually uses).
//   Most failures are short 2-4-character single-word utterances Whisper
//   mis-hears entirely (e.g. "کاف" heard as "آل") — the same class of
//   problem the English phonics phoneme engine hit (6/26): short isolated
//   utterances are hard for large seq2seq/CTC models generally, regardless
//   of language. HONEST VERDICT: this is NOT reliable enough for a client-
//   facing build as-is. Two engineering bugs were found and fixed along the
//   way (do not reintroduce): (1) a failed WebGPU pipeline() load corrupts
//   shared onnxruntime-web state and hangs a following WASM retry forever
//   — fixed by pre-checking navigator.gpu.requestAdapter() before ever
//   attempting device:'webgpu' (see whisperWorker.js); (2) Whisper's
//   decoder can loop indefinitely on short audio — fixed with
//   max_new_tokens/no_repeat_ngram_size generation limits. Given the
//   accuracy ceiling found here, consider: a larger model (whisper-small/
//   medium — untested, likely too slow/large for in-browser use), a
//   completely different approach (e.g. teaching Urdu via WORDS the way
//   English phonics ended up doing, not isolated letter names), or
//   accepting this section stays hidden/unlisted until a better approach
//   is found — same posture as English phonics took before its rebuild.
export const URDU_ALPHABET = [
  { id: 'alif', display: 'ا', spokenTarget: 'الف', variants: [],
    helpText: 'TODO(school): Mouth opens for the "alif" sound.', mouthShape: 'open' },
  { id: 'be', display: 'ب', spokenTarget: 'بے', variants: ['بے۔'],
    helpText: 'TODO(school): Lips press together for "be".', mouthShape: 'open' },
  { id: 'pe', display: 'پ', spokenTarget: 'پے', variants: [],
    helpText: 'TODO(school): Lips press together for "pe".', mouthShape: 'open' },
  { id: 'te', display: 'ت', spokenTarget: 'تے', variants: [],
    helpText: 'TODO(school): Tongue taps behind the teeth for "te".', mouthShape: 'open' },
  { id: 'tte', display: 'ٹ', spokenTarget: 'ٹے', variants: [],
    helpText: 'TODO(school): Tongue curls back for the retroflex "tte".', mouthShape: 'open' },
  { id: 'se', display: 'ث', spokenTarget: 'ثے', variants: [],
    helpText: 'TODO(school): Air hisses out for "se".', mouthShape: 'wide' },
  { id: 'jeem', display: 'ج', spokenTarget: 'جیم', variants: [],
    helpText: 'TODO(school): Tongue touches the roof of the mouth for "jeem".', mouthShape: 'open' },
  { id: 'che', display: 'چ', spokenTarget: 'چے', variants: [],
    helpText: 'TODO(school): Tongue touches the roof of the mouth for "che".', mouthShape: 'open' },
  { id: 'barihe', display: 'ح', spokenTarget: 'حے', variants: ['بڑی حے'],
    helpText: 'TODO(school): A breathy sound from the throat for "bari he".', mouthShape: 'open' },
  { id: 'khe', display: 'خ', spokenTarget: 'خے', variants: [],
    helpText: 'TODO(school): A rasp from the back of the throat for "khe".', mouthShape: 'open' },
  { id: 'dal', display: 'د', spokenTarget: 'دال', variants: [],
    helpText: 'TODO(school): Tongue taps behind the teeth for "dal".', mouthShape: 'open' },
  { id: 'ddal', display: 'ڈ', spokenTarget: 'ڈال', variants: [],
    helpText: 'TODO(school): Tongue curls back for the retroflex "ddal".', mouthShape: 'open' },
  { id: 'zal', display: 'ذ', spokenTarget: 'ذال', variants: [],
    helpText: 'TODO(school): Tongue between the teeth, buzzing, for "zal".', mouthShape: 'open' },
  { id: 're', display: 'ر', spokenTarget: 'رے', variants: [],
    helpText: 'TODO(school): Tongue taps once for "re".', mouthShape: 'open' },
  { id: 'rre', display: 'ڑ', spokenTarget: 'ڑے', variants: [],
    helpText: 'TODO(school): Tongue curls back for the retroflex "rre".', mouthShape: 'open' },
  { id: 'ze', display: 'ز', spokenTarget: 'زے', variants: [],
    helpText: 'TODO(school): Teeth close, buzzing, for "ze".', mouthShape: 'open' },
  { id: 'zhe', display: 'ژ', spokenTarget: 'ژے', variants: [],
    helpText: 'TODO(school): A soft "zh" sound, as in "measure".', mouthShape: 'open' },
  { id: 'seen', display: 'س', spokenTarget: 'سین', variants: [],
    helpText: 'TODO(school): Air hisses out for "seen".', mouthShape: 'wide' },
  { id: 'sheen', display: 'ش', spokenTarget: 'شین', variants: [],
    helpText: 'TODO(school): Air hisses out for "sheen".', mouthShape: 'wide' },
  { id: 'swad', display: 'ص', spokenTarget: 'صاد', variants: [],
    helpText: 'TODO(school): A heavier "s" sound for "swad".', mouthShape: 'wide' },
  { id: 'zwad', display: 'ض', spokenTarget: 'ضاد', variants: [],
    helpText: 'TODO(school): A heavier "z" sound for "zwad".', mouthShape: 'open' },
  { id: 'toe', display: 'ط', spokenTarget: 'طوے', variants: ['توے'],
    helpText: 'TODO(school): A heavier "t" sound for "toe".', mouthShape: 'round' },
  { id: 'zoe', display: 'ظ', spokenTarget: 'ظوے', variants: ['زوے'],
    helpText: 'TODO(school): A heavier "z" sound for "zoe".', mouthShape: 'round' },
  { id: 'ain', display: 'ع', spokenTarget: 'عین', variants: [],
    helpText: 'TODO(school): A throat sound with no English equivalent, for "ain".', mouthShape: 'open' },
  { id: 'ghain', display: 'غ', spokenTarget: 'غین', variants: [],
    helpText: 'TODO(school): A gargled sound from the throat for "ghain".', mouthShape: 'open' },
  { id: 'fe', display: 'ف', spokenTarget: 'فے', variants: [],
    helpText: 'TODO(school): Top teeth touch the bottom lip for "fe".', mouthShape: 'open' },
  { id: 'qaf', display: 'ق', spokenTarget: 'قاف', variants: [],
    helpText: 'TODO(school): A deep "k" sound from the back of the throat for "qaf".', mouthShape: 'open' },
  { id: 'kaf', display: 'ک', spokenTarget: 'کاف', variants: [],
    helpText: 'TODO(school): Back of the tongue taps the soft palate for "kaf".', mouthShape: 'open' },
  { id: 'gaf', display: 'گ', spokenTarget: 'گاف', variants: [],
    helpText: 'TODO(school): Back of the tongue taps the soft palate for "gaf".', mouthShape: 'open' },
  { id: 'lam', display: 'ل', spokenTarget: 'لام', variants: [],
    helpText: 'TODO(school): Tongue tip touches behind the teeth for "lam".', mouthShape: 'open' },
  { id: 'meem', display: 'م', spokenTarget: 'میم', variants: [],
    helpText: 'TODO(school): Lips press gently together for "meem".', mouthShape: 'open' },
  { id: 'noon', display: 'ن', spokenTarget: 'نون', variants: [],
    helpText: 'TODO(school): Tongue tip touches behind the teeth for "noon".', mouthShape: 'open' },
  { id: 'noonghunna', display: 'ں', spokenTarget: 'نون غنہ', variants: ['نونغنہ'],
    helpText: 'TODO(school): A nasal sound through the nose for "noon ghunna".', mouthShape: 'closed' },
  { id: 'wao', display: 'و', spokenTarget: 'واؤ', variants: [],
    helpText: 'TODO(school): Lips round for "wao".', mouthShape: 'round' },
  { id: 'chotihe', display: 'ہ', spokenTarget: 'ہے', variants: ['چھوٹی ہے'],
    helpText: 'TODO(school): A soft breath for "choti he".', mouthShape: 'open' },
  { id: 'dochashmihe', display: 'ھ', spokenTarget: 'دو چشمی ہے', variants: ['دوچشمی ہے'],
    helpText: 'TODO(school): A breathy "h" added after the previous sound, for "do chashmi he".', mouthShape: 'open' },
  { id: 'hamza', display: 'ء', spokenTarget: 'ہمزہ', variants: [],
    helpText: 'TODO(school): A quick stop in the breath for "hamza".', mouthShape: 'closed' },
  { id: 'ye', display: 'ی', spokenTarget: 'یے', variants: ['چھوٹی یے'],
    helpText: 'TODO(school): Tongue rises for "ye".', mouthShape: 'wide' },
  { id: 'bariye', display: 'ے', spokenTarget: 'بڑی یے', variants: [],
    helpText: 'TODO(school): Tongue rises for "bari ye".', mouthShape: 'wide' },
]
