# Vaila Speech Trainer — Prototype v0.1

Speech practice app for Vaila's School for Hearing Impaired.
Numbers 1–10 with pronunciation practice via the browser's speech recognition.

## Target platform (v0.1)

**Google Chrome on Android** phones/tablets. Speech recognition is not
available in iOS browsers (all iOS browsers use WebKit, which lacks
SpeechRecognition). The app detects this and shows a friendly message.
The recognition code is isolated in `src/lib/recognition.js` so it can be
swapped for a cloud speech-to-text API later without touching the app.

## Run locally

```bash
npm install
npm run dev
```

Open the printed URL. Note: speech recognition requires HTTPS in production;
`localhost` is exempt during development.

## Deploy

Push to GitHub, then import the repo in Vercel. Framework preset: **Vite**.
No environment variables needed.

## Structure

```
src/
  screens/     Home, Lesson (state machine), Settings
  components/  ui.jsx (TopBar, ProgressDots, WordChip, MicButton)
  lib/         tts.js, recognition.js, matching.js, applause.js, settings.js
  data/        numbers.js (1-10 + light-mode variants)
```

## Settings

- **Pronunciation checking**: Strict (exact word only) or Light (accepts
  close attempts like "won" for "one") — for children with atypical articulation.
- **Speaking speed** and **repetitions** of the auto-pronunciation.
