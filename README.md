# Vaila Speech Trainer

Speech practice app for Vaila's School for Hearing Impaired.
Numbers 1–10 with pronunciation practice via on-device Whisper speech recognition.

## Run locally

```bash
npm install
npm run dev
```

Open the printed URL. The first Speak attempt downloads the Whisper model
(~75MB) once; after that it works fully offline. Camera/microphone access
requires HTTPS in production; `localhost` is exempt during development.

## Deploy

Push to GitHub, then import the repo in Vercel. Framework preset: **Vite**.
No environment variables needed.

## Structure

```
src/
  screens/     Home, Lesson (state machine), Settings
  components/  ui.jsx (Mirror, icons), Help.jsx (Help modal + mouth animation)
  lib/         tts.js, recognition.js, whisperWorker.js, matching.js, applause.js, settings.js
  data/        numbers.js (1-10 + variants, help text, mouth shape)
  assets/mouth/ optional <number>.mp4 teacher recordings (see Help.jsx)
```

## Settings

- **Acceptance leniency**: Strict (exact word only) to Very Lenient — how
  closely a child's word must match before it's accepted.
- **Number range**: which numbers (within 1–10) are used in the lesson.
- **Speaking speed** and **repetitions** of the auto-pronunciation.
- **Auto-advance**: move on automatically after a correct answer, or wait for Next.

## Swapping the speech engine

`src/lib/recognition.js` is the ONLY file allowed to know how speech is
recognized. It defines an engine interface contract (see the comment block
at the top of the file) and exposes `isRecognitionSupported`, `preloadEngine`,
`listenOnce`, `abortRecognition`, `terminateEngine` — no other file may
change when the engine changes.

To add a new engine: write a `createXEngine()` factory implementing the
interface (`isSupported`, `preload`, `listen`, `abort`, `terminate`), then
change the single `const ACTIVE_ENGINE = ...` line near the bottom of the
file. The current engine is on-device Whisper (`whisperWorker.js`, the only
other file that imports `@huggingface/transformers`). A future pronunciation
scoring engine has a commented placeholder slot in the same spot.
