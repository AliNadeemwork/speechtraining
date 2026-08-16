# Cleanup report

Files moved here (not deleted) during the Alphabets + Vosk session. Each
preserves its original path under `_trash/`, so it can be restored with
`mv _trash/<path> <path>` if anything was wrong.

## Moved — confirmed unused

- **`src/lib/matching.js`** — the old Whisper-era word-matching logic
  (`isAccepted`, transcript-array based). Superseded by `src/lib/evaluate.js`,
  which implements the new `evaluate(recognizedWord, targetItem, settings)`
  contract for grammar-constrained Vosk results. Zero remaining imports
  anywhere in `src/` (verified via grep before moving).

- **`src/lib/whisperWorker.js`** — the on-device Whisper (Transformers.js)
  recognition worker from the previous engine. The engine has been swapped
  to Vosk (`src/lib/recognition.js`, using `vosk-browser`); `@huggingface/transformers`
  has been uninstalled from `package.json`. Zero remaining imports anywhere
  in `src/` (verified via grep before moving).

## Dual-engine session (Wav2Vec2 phoneme + Vosk word)

The "pure phonic sounds checked through Vosk" experiment (Alphabets
grammar-matching literal sounds like "ah"/"bah" as if they were words) and
the earlier real-word-substitution hack (Alphabets checking "spa"/"bub"/etc.
instead of the actual sound) both lived as INLINE DATA in
`src/data/alphabets.js` and matching logic in `src/screens/Lesson.jsx` —
never as separate files. Both have been superseded by direct in-place edits
(new phoneme-mode data shape, new `lib/phonemeEvaluator.js`, `lib/recognition.js`
rewritten as a dual-engine adapter) — visible in this commit's diff and git
history. There is no separate orphaned file to move into `_trash/` for this
round; nothing new added here.

## Left in place — not flagged for cleanup

Everything else in `src/` and `public/` is imported and reachable from
`src/main.jsx` → `src/App.jsx`. Nothing else was ambiguous enough to list
as "unsure" — the files listed above were the only ones with zero incoming
references after each session's rewrite.
