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

## Left in place — not flagged for cleanup

Everything else in `src/` and `public/` is imported and reachable from
`src/main.jsx` → `src/App.jsx`. Nothing else was ambiguous enough to list
as "unsure" — the two files above were the only ones with zero incoming
references after this session's rewrite.
