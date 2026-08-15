import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react'
import logo from '../assets/logo.png'
import { getSection } from '../data/sections'
import { speakRepeated, speakOnce } from '../lib/tts'
import { initModel, setGrammar, startListening, stopListening, abortListening, isSupported } from '../lib/recognition'
import { evaluate } from '../lib/evaluate'
import { playApplause } from '../lib/applause'
import { Mirror, SpeakerIcon, MicIcon, ExitXIcon } from '../components/ui'
import { HelpModal } from '../components/Help'

const MAX_STRIKES = 3

// Per-item state machine:
// INTRO (auto-pronounce) → READY → LISTENING →
//   SUCCESS (correct)
//   | RETRY → READY (wrong, < 3 strikes)
//   | GOOD_EFFORT (an [unk] attempt, or the 3rd consecutive fail) → auto-advance
// SUCCESS → auto-advance (or wait for Next if auto-advance is off) → INTRO
// of next item in the section; after the last one → back to Section Select.

export default function Lesson({ sectionId, settings, onExit }) {
  const section = useMemo(() => getSection(sectionId), [sectionId])

  const activeItems = useMemo(() => {
    if (!section) return []
    return section.hasRange
      ? section.items.filter(i => i.id >= settings.rangeMin && i.id <= settings.rangeMax)
      : section.items
  }, [section, settings.rangeMin, settings.rangeMax])

  const [index, setIndex] = useState(0)
  const [phase, setPhase] = useState('INTRO')
  const [helpOpen, setHelpOpen] = useState(false)
  const [mirrorStatus, setMirrorStatus] = useState('pending') // 'pending' | 'ok' | 'unavailable'
  const [modelReady, setModelReady] = useState(false)
  const [micError, setMicError] = useState(null)
  const [noAttempt, setNoAttempt] = useState(false)

  // Section/range misconfiguration guard — never render with no items.
  useEffect(() => {
    if (!section || activeItems.length === 0) onExit()
  }, [section, activeItems.length, onExit])

  const item = activeItems[Math.min(index, Math.max(activeItems.length - 1, 0))]
  // Alphabet items carry a dedicated ttsText (the phonetically-correct
  // spelling to speak/display, which can differ from the raw display
  // letter). Numbers items have no ttsText, so this falls back to
  // spokenWord — same value they already used, unchanged behavior.
  const pronunciationText = item?.ttsText || item?.spokenWord
  const cancelSpeechRef = useRef(null)
  const videoRef = useRef(null)
  const streamRef = useRef(null)
  const busyRef = useRef(false) // guards double-taps across Listen/Speak
  const strikesRef = useRef(0)

  const cleanupSpeech = useCallback(() => {
    cancelSpeechRef.current?.()
    cancelSpeechRef.current = null
  }, [])

  // Camera mirror — lesson works fully even if this fails/denied.
  useEffect(() => {
    let cancelled = false
    navigator.mediaDevices?.getUserMedia?.({ video: { facingMode: 'user' } })
      .then((stream) => {
        if (cancelled) { stream.getTracks().forEach(t => t.stop()); return }
        streamRef.current = stream
        // The <video> element only mounts once mirrorStatus flips to 'ok'
        // (see the Mirror component), so videoRef.current is still null
        // right here — wiring it up happens in the effect below, after the
        // element has actually mounted.
        setMirrorStatus('ok')
      })
      .catch((err) => {
        // Surfaced so the actual reason (denied / no camera / in use by
        // another app) is visible in DevTools instead of silently failing.
        console.warn('[Mirror] camera getUserMedia failed:', err?.name, err?.message)
        if (!cancelled) setMirrorStatus('unavailable')
      })
    return () => {
      cancelled = true
      streamRef.current?.getTracks().forEach(t => t.stop())
      streamRef.current = null
    }
  }, [])

  // Attach the already-live stream once the <video> element actually
  // exists (it only mounts after mirrorStatus becomes 'ok').
  useEffect(() => {
    if (mirrorStatus === 'ok' && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current
    }
  }, [mirrorStatus])

  // Vosk model load (once) + grammar for this section's word list.
  // Speak stays disabled until this resolves — never listen before ready.
  useEffect(() => {
    if (!section) return
    let cancelled = false
    if (!isSupported()) { setModelReady(false); return }
    initModel('en')
      .then(() => {
        if (cancelled) return
        setGrammar(section.items.map(i => i.spokenWord))
        setModelReady(true)
      })
      .catch(() => { if (!cancelled) setModelReady(false) })
    return () => { cancelled = true }
  }, [section])

  // Stop mic/camera/speech on unmount AND on Exit (Exit calls onExit, which
  // unmounts this screen). The Vosk model itself is kept loaded across
  // section switches within the session — reloading ~40MB every time the
  // child moves between Numbers and Alphabets would be a bad trade for a
  // cleanup guarantee that abortListening() already satisfies (it tears
  // down the mic stream and in-flight recognition immediately).
  useEffect(() => {
    return () => {
      cleanupSpeech()
      window.speechSynthesis?.cancel()
      abortListening()
      streamRef.current?.getTracks().forEach(t => t.stop())
    }
  }, [cleanupSpeech])

  // INTRO: pronounce the item `repetitions` times, then show the buttons.
  useEffect(() => {
    if (phase !== 'INTRO' || !item) return
    strikesRef.current = 0
    setNoAttempt(false)
    const cancel = speakRepeated(
      pronunciationText,
      settings.repetitions,
      { rate: settings.speechRate },
      () => setPhase('READY')
    )
    cancelSpeechRef.current = cancel
    return cancel
  }, [phase, index]) // eslint-disable-line react-hooks/exhaustive-deps

  // RETRY: vibrate + shake, then return to ready.
  useEffect(() => {
    if (phase !== 'RETRY') return
    if (navigator.vibrate) navigator.vibrate([120, 60, 120])
    const t = setTimeout(() => setPhase('READY'), 1600)
    return () => clearTimeout(t)
  }, [phase])

  // SUCCESS: celebration, then auto-advance unless disabled in settings.
  useEffect(() => {
    if (phase !== 'SUCCESS') return
    playApplause()
    if (settings.autoAdvance) {
      const t = setTimeout(() => goNext(), 1800)
      return () => clearTimeout(t)
    }
  }, [phase]) // eslint-disable-line react-hooks/exhaustive-deps

  // GOOD_EFFORT: the real anti-stuck mechanism — an [unk] attempt or the
  // 3rd consecutive fail always advances, so a child can never get stuck.
  useEffect(() => {
    if (phase !== 'GOOD_EFFORT') return
    const t = setTimeout(() => goNext(), 1800)
    return () => clearTimeout(t)
  }, [phase]) // eslint-disable-line react-hooks/exhaustive-deps

  const goNext = useCallback(() => {
    cleanupSpeech()
    if (index + 1 >= activeItems.length) {
      onExit()
    } else {
      setIndex(i => i + 1)
      setPhase('INTRO')
    }
  }, [index, activeItems.length, onExit, cleanupSpeech])

  const exit = () => {
    if (!window.confirm('Exit this lesson and choose another?')) return
    cleanupSpeech()
    abortListening()
    onExit()
  }

  const handleListen = () => {
    if (busyRef.current) return
    if (phase !== 'READY' && phase !== 'RETRY') return
    speakOnce(pronunciationText, { rate: settings.speechRate })
  }

  const handleSpeak = async () => {
    if (busyRef.current) return
    if (phase !== 'READY' && phase !== 'RETRY') return
    if (!modelReady) return
    busyRef.current = true
    setMicError(null)
    setNoAttempt(false)
    setPhase('LISTENING')

    try {
      await startListening()
      const word = await stopListening()
      busyRef.current = false

      // No speech was ever detected (silence/mic issue) — this is not a
      // failed attempt, just nothing to judge. Don't count it as a strike.
      if (word === '[noattempt]') {
        setNoAttempt(true)
        setPhase('READY')
        return
      }
      setNoAttempt(false)

      const { isCorrect } = evaluate(word, item, settings)
      if (isCorrect) {
        strikesRef.current = 0
        setPhase('SUCCESS')
        return
      }

      strikesRef.current += 1
      if (word === '[unk]' || strikesRef.current >= MAX_STRIKES) {
        setPhase('GOOD_EFFORT')
      } else {
        setPhase('RETRY')
      }
    } catch (err) {
      busyRef.current = false
      if (String(err?.message || err) === 'mic-denied') {
        setMicError('Microphone access was denied. Please allow the microphone and try again.')
        setPhase('READY')
      } else {
        setPhase('RETRY')
      }
    }
  }

  const isLast = index + 1 >= activeItems.length

  if (!item) return null

  return (
    <div className="screen lesson-screen">
      <header className="lesson-header">
        <Mirror videoRef={videoRef} status={mirrorStatus} />

        <div className="lesson-brand">
          <div className="brand-divider" />
          <img className="brand-logo" src={logo} alt="VAILA'S School logo" />
          <h1 className="brand-title">VAILA'S Speech Trainer</h1>
          <p className="brand-subtitle">{section.subtitle}</p>
          <div className="brand-divider" />
        </div>

        <button className="exit-btn" onClick={exit} aria-label="Exit lesson">
          <ExitXIcon />
          <span>Exit</span>
        </button>
      </header>

      <div className={'lesson-body' + (phase === 'SUCCESS' ? ' success-bg' : '')}>
        {phase === 'SUCCESS' && <div className="sunburst" aria-hidden="true" />}

        <div className={
          'big-display' +
          (phase === 'RETRY' ? ' number-shake' : '') +
          (phase === 'SUCCESS' ? ' number-zoom' : '')
        }>
          {item.display}
        </div>
        <p className="number-word">{pronunciationText[0].toUpperCase() + pronunciationText.slice(1)}</p>

        {phase === 'SUCCESS' && (
          <>
            <div className="success-check" aria-hidden="true">✓</div>
            <p className="success-text">Excellent!</p>
            <div className="success-hands" aria-hidden="true">👏🎉👏</div>
          </>
        )}

        {phase === 'GOOD_EFFORT' && (
          <>
            <div className="success-check good-effort-check" aria-hidden="true">🙂</div>
            <p className="good-effort-text">Good effort!</p>
          </>
        )}

        {phase === 'RETRY' && <p className="try-again">Try again!</p>}
        {phase === 'READY' && noAttempt && <p className="try-again">I didn't hear you, try again!</p>}
        {phase === 'LISTENING' && <p className="mic-hint listening-hint">Listening…</p>}
        {phase === 'INTRO' && <p className="mic-hint intro-hint">Listen carefully 🔊</p>}
        {!modelReady && phase !== 'INTRO' && phase !== 'SUCCESS' && phase !== 'GOOD_EFFORT' && (
          <p className="mic-hint intro-hint">Getting ready…</p>
        )}
        {micError && <p className="mic-error">{micError}</p>}

        {phase !== 'SUCCESS' && phase !== 'GOOD_EFFORT' && (
          <div className="action-row">
            <button
              className="btn btn-listen"
              onClick={handleListen}
              disabled={phase === 'LISTENING' || phase === 'INTRO'}
            >
              <SpeakerIcon /><span>Listen</span>
            </button>
            <button
              className={'btn btn-speak' + (phase === 'LISTENING' ? ' btn-speak-active' : '')}
              onClick={handleSpeak}
              disabled={phase === 'LISTENING' || phase === 'INTRO' || !modelReady}
            >
              <MicIcon /><span>{phase === 'LISTENING' ? 'Listening…' : 'Speak'}</span>
            </button>
          </div>
        )}

        {phase === 'SUCCESS' && !settings.autoAdvance && (
          <button className="btn btn-primary btn-next" onClick={goNext}>
            {isLast ? 'Finish 🏁' : 'Next ➡'}
          </button>
        )}
      </div>

      {phase !== 'SUCCESS' && phase !== 'GOOD_EFFORT' && (
        <div className="bottom-row">
          <button className="btn btn-nav" onClick={goNext}>
            Next ➡
          </button>
          <button className="btn btn-help" onClick={() => setHelpOpen(true)}>
            Help
          </button>
        </div>
      )}

      <footer className="lesson-footer">© VAILA'S School for Hearing Impaired Students</footer>

      {helpOpen && <HelpModal item={item} onClose={() => setHelpOpen(false)} />}
    </div>
  )
}
