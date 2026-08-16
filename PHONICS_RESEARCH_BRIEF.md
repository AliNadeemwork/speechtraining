# Phonics recognition for deaf/HoH children — architecture research brief

## Context

Web app (Vite + React, no backend) for a school for hearing-impaired
children. Two lesson sections: **Numbers** (works well, not in question)
and **Alphabets**, which is meant to teach either letter *names* or letter
*phonic sounds* and check the child's spoken attempt against a target.
Everything runs **client-side in the browser** — no server, on-device
speech recognition only (privacy/offline requirement for a school
deployment). Target device: tablets/laptops in a classroom, not
necessarily high-end hardware.

We have tried **four different architectures** for the Alphabets section.
All were tested with *real audio piped through the real recognizer* (not
simulated), because earlier claims of "it works" turned out to be false
when actually tested. None has produced a reliable result across all 26
letters. Looking for a better architecture recommendation.

---

## Attempt 1: Letter NAMES via Vosk (word-grammar matching)

**Idea**: teach the letter's *name* (A→"ay", B→"bee", C→"see", ...),
recognized via [Vosk](https://alphacephei.com/vosk/) small English model
(`vosk-model-small-en-us-0.15`, ~40MB) running in-browser via
[vosk-browser](https://github.com/ccoreilly/vosk-browser). Vosk supports
**grammar-constrained decoding**: give it a fixed word list + `[unk]`, and
it can only output one of those words (or `[unk]`) — this is what makes
random noise safe (it can't hallucinate an unrelated real word).

**Problems found (all via real TTS audio → real Vosk pipeline testing)**:

1. **TTS/display mismatch bug**: the on-screen pronunciation label and the
   audio didn't always match due to a code bug (separate issue, fixed).
2. **"R" recognized as "A R"** (two tokens): grammar entry `"ar"` isn't a
   word Vosk's lexicon has cleanly — the decoder appears to fall back to
   spelling constituent letters when a grammar word isn't well-supported by
   the model's lexicon/pronunciation dictionary, producing multi-token
   output for what should be one word. Root-caused to two compounding bugs:
   (a) our own evaluator wasn't collapsing whitespace before comparing, so
   a multi-token Vosk result could never equal a single-token target, and
   (b) TTS-synthesized "ar" is acoustically ambiguous with the word "are"
   in this model.
3. **A mispronounced by TTS**: the macOS voice's "ay" was empirically
   indistinguishable from "eye" (letter I's own sound) to this Vosk model —
   confirmed by feeding "ay" audio through the recognizer and getting back
   "eye".
4. Several other letters (E, M, N, T) had similar cross-letter acoustic
   confusion (E.g. correctly-pronounced "em" (M) was heard as "en" (N)).
5. Real bug (unrelated to phonics specifically): **stopListening() was
   force-cutting off the recognizer at ~0ms of actual audio**, before the
   child could speak, causing "accept-anything, instantly" behavior. Fixed
   by making the listen call await the recognizer's own natural
   stop-on-silence timing instead of forcing an immediate stop.

**After fixing what could be fixed** (adding accepted-variant lists,
whitespace collapsing, swapping 2-3 individually-broken letter names for
better-recognized alternatives like L→"ell", W→"double you"): the letter-
NAME approach reached a **reasonably good pass rate** (most letters
reliable; a few — historically K colliding with A, H unrecognizable at
all — remained flagged as known-unreliable). This was the most successful
of the four attempts, but it teaches letter *names*, not phonic *sounds*,
which the school later said they actually want instead.

---

## Attempt 2: Phonic sounds, but disguised as real words (via Vosk)

**Idea**: since Vosk can only reliably recognize real English dictionary
words (it's a general-purpose ASR model with a fixed lexicon, not built
for isolated invented syllables), pick a short **real word** that starts
with the target phonic sound and use that as the actual TTS/recognition
target — e.g., B→"bub", O→"go", F→"fun" — while still *displaying* the
pure phonic label ("Buh") on screen.

**Result**: 26/26 letters passed reliably (verified via TTS audio → real
Vosk pipeline, 3 rounds of substitution tuning). Technically the most
*reliable* result of all four attempts.

**Why we rejected it**: this teaches/checks the wrong sound. The child
hears "fun" (which has a vowel + consonant coda the pure "f" sound doesn't
have) instead of the isolated /f/ phonic sound. Explicitly ruled out by
the school/product owner as not meeting the pedagogical goal — a real
"buh"/"cuh"/"fuh" sound must be what's spoken and checked, not a proxy
word.

---

## Attempt 3: Pure phonic sounds via Vosk (no substitution)

**Idea**: same Vosk engine, but force the actual target to be the literal
phonic spelling ("ah", "buh", "cuh", "duh", ...) with no real-word
disguise, accepting whatever pass rate results.

**Result** (tested twice, with 2 different phonic-spelling tables and 3
different TTS voices per letter, all against the real Vosk pipeline):
**best case ~9/26 reliable**, worse in a later stricter test (~6/26 under
a tightened definition of "reliable"). Most letters returned empty output,
`[unk]`, or garbled multi-token results (e.g. "jee" → `"[unk] see"`).

**Root cause**: these are not real dictionary words. Vosk's grammar-
constrained decoder needs each grammar word to be resolvable through the
model's lexicon (word → phoneme sequence mapping) to build a valid
decoding path; invented single-syllable non-words like "buh" or "fff"
either aren't in the lexicon at all, or decode very unreliably because the
acoustic model was never trained to expect them as *complete utterances*
(Vosk's training data is continuous natural speech/words, not isolated
consonant+schwa fragments).

**Kathy (one of the 3 TTS voices) returned empty for almost every letter**
regardless of target — suggesting voice/prosody variance may matter as
much as spelling choice, which real child speech would presumably differ
from again in unpredictable ways.

---

## Attempt 4: Wav2Vec2 phoneme-CTC model (dual-engine: Vosk for words, Wav2Vec2 for phonemes)

**Idea**: switch to a model actually designed to output phonemes rather
than words — [Wav2Vec2](https://arxiv.org/abs/2006.11477) fine-tuned with
CTC loss on an IPA phoneme vocabulary
(`facebook/wav2vec2-lv-60-espeak-cv-ft`, an ONNX port at
`onnx-community/wav2vec2-lv-60-espeak-cv-ft-ONNX`), run client-side via
[🤗 Transformers.js](https://huggingface.co/docs/transformers.js) v3. This
model outputs a free (unconstrained) sequence of IPA phoneme symbols for
whatever audio it hears — no fixed word list needed, so in principle it
*can* judge an isolated sound, which Vosk fundamentally cannot.

**Problem A — model loading**: the specified model's `tokenizer_class` is
`Wav2Vec2PhonemeCTCTokenizer`, which has **zero implementation in
Transformers.js** (verified: grepped the installed package source, no
match). The high-level `pipeline()` API requires `AutoTokenizer`, which in
turn requires a `tokenizer.json` file this model repo doesn't ship.
Checked 3 alternative/mirror repos on Hugging Face — all had the same
missing-tokenizer.json gap, or shipped `<1KB` Git-LFS pointer stubs
instead of real `.onnx` weight files (i.e. someone tried to fix it and
also failed to actually upload working weights).

**Fix for Problem A**: bypass `AutoTokenizer`/`pipeline()` entirely — load
the model directly via the lower-level `AutoFeatureExtractor` +
`AutoModelForCTC` API (these only need `preprocessor_config.json` and
`config.json`+the real `.onnx` weights, not a tokenizer at all), get raw
logits `[batch, time, vocab]`, and do CTC greedy decoding by hand
(argmax per timestep → collapse consecutive repeats → drop the blank/pad
token → map remaining ids to IPA strings via the model's own
`vocab.json`, embedded in our code). This worked — verified the model
loads and produces correctly-shaped output.

**Problem B — recognition quality is poor**: with the model actually
working end-to-end, we ran the *same* proof methodology as attempts 1 and
3 (real TTS audio, 3 voices, 26 letters, piped through the real model).
**Result: 6/26 reliably correct** (M, Q, R, S, W, Y). 20 letters failed.

Observed failure pattern: the model's raw output is **dominated by
Chinese-tonal-language phone tokens** (e.g. `ɑ5`, `a5` — the "5" suffix is
a tone marker from this model's Mandarin training data) for nearly every
English input, even though the underlying model architecture and vocab
are correct and the audio pipeline is verified working. This looks like a
combination of:
- the model being **multilingual** (its vocab includes ~390 phone/tone
  symbols across many languages) and defaulting to whatever symbols have
  highest prior probability when given short, ambiguous, isolated audio;
- **q8 quantization** (~303MB) possibly degrading fine acoustic
  discrimination further versus the full fp32 model (~1.18GB, not
  practical to ship in a browser);
- **very short (1.5-2s), isolated, non-word audio** being a genuinely
  hard input for a CTC model trained mostly on continuous speech —
  the model likely has little training signal for "a single stop
  consonant + schwa and nothing else";
- **TTS-synthesized test audio** (macOS voices) — real children's voices
  might behave completely differently (better or worse); this hasn't been
  tested with real speech yet because we don't have a device/child in the
  loop during development.

---

## What's technically confirmed vs. what's still unknown

**Confirmed (measured directly)**:
- Model download size for the Wav2Vec2 phoneme model at q8: ~303MB.
  Larger quantizations (fp32 ~1.18GB) exist but weren't tested for quality.
  Smaller ones exist too (q4 ~230MB) but weren't tried.
- Per-utterance inference: ~719ms average on WASM (CPU), well within a 2s
  budget. WebGPU was implemented (device preference) but not verified in
  the proof-table run (that used WASM directly to keep the test harness
  simple).
- Vosk's grammar decoder needs real lexicon words; Wav2Vec2-phoneme's CTC
  decoder is free-form but noisy on short isolated non-word audio.
- Both engines were tested with **synthetic TTS audio only** (3 macOS
  system voices). Neither has been validated against real human/child
  speech.

**Not yet known / worth researching**:
- Is there a **better phoneme-CTC model** — ideally English-only (not
  multilingual) — that would have less tonal-language interference and a
  vocab better matched to English phonics? (e.g. an
  ARPABET/CMU-phone-set model instead of IPA/espeak-based, or a model
  specifically fine-tuned on isolated phoneme/sound classification rather
  than continuous transcription)
- Would a **classification-style model** (fixed 26-44 output classes, one
  per target phonic sound, trained/fine-tuned specifically for this task)
  outperform a general free-decoding CTC transcription model for this
  narrow "judge one isolated sound" use case?
- Is on-device WASM/WebGPU inference the right constraint at all, or
  should isolated-phoneme judgment go through a **lightweight cloud API**
  (accepting the privacy/offline trade-off) where a much larger, better
  model could run?
- Are there existing **kids'-speech-specific** acoustic models (child
  voices differ significantly in pitch/formants from adult voices used to
  train most public ASR models) that would generalize better here?
- Would **forced alignment** (aligning known-target phoneme sequence
  against the audio and scoring confidence) work better than free
  CTC decoding + substring matching, given we already know what letter is
  being tested (i.e. this isn't truly open-vocabulary recognition, so a
  simpler binary "does this audio match this specific expected phoneme"
  classifier might outperform a general-purpose transcriber)?
- Would testing against **real child speech samples** (even a handful,
  recorded once) change these numbers meaningfully in either direction
  compared to synthetic TTS audio?

## Current shipped state (for reference)

Repo: dual-engine adapter (`src/lib/recognition.js`) with `init(mode)` /
`listen(config)` / `stop()`, `mode: 'word' | 'phoneme'`. Numbers section
still uses Vosk/word-grammar matching (works well, unaffected by any of
this). Alphabets section currently uses the Wav2Vec2 phoneme engine
(Attempt 4) with the known 6/26 reliability — shipped as-is with the
proof table documented, not silently presented as solved. 3-strike
"Good effort, moving on" auto-skip remains the anti-frustration backstop
regardless of which attempt's recognition quality is in play.
