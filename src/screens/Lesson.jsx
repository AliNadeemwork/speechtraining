import React, { useEffect, useRef, useState, useCallback } from 'react'
import { NUMBERS } from '../data/numbers'
import { speakRepeated, speakOnce } from '../lib/tts'
import { listenOnce } from '../lib/recognition'
import { isAccepted } from '../lib/matching'
import { playApplause } from '../lib/applause'
import { TopBar, ProgressDots, WordChip, MicButton } from '../components/ui'

// Per-number state machine:
// INTRO → READY → LISTENING → (SUCCESS | RETRY → READY)
// SUCCESS → Next → INTRO of next number; after 10 → home.

export default function Lesson({ settings, onExit }) {
  const [index, setIndex] = useState(0)
  const [phase, setPhase] = useState('INTRO')
  const [stars, setStars] = useState(0)

  const number = NUMBERS[index]
  const cancelRef = useRef(null)

  const cleanup = useCallback(() => {
    cancelRef.current?.()
    cancelRef.current = null
  }, [])

  // INTRO: pronounce the number `repetitions` times, then show the mic.
  useEffect(() => {
    if (phase !== 'INTRO') return
    const cancel = speakRepeated(
      number.word,
      settings.repetitions,
      { rate: settings.speechRate },
      () => setPhase('READY')
    )
    cancelRef.current = cancel
    return cancel
  }, [phase, index]) // eslint-disable-line react-hooks/exhaustive-deps

  // RETRY: vibrate + shake, then return to the mic automatically.
  useEffect(() => {
    if (phase !== 'RETRY') return
    if (navigator.vibrate) navigator.vibrate([120, 60, 120])
    const t = setTimeout(() => setPhase('READY'), 1600)
    return () => clearTimeout(t)
  }, [phase])

  // SUCCESS: applause.
  useEffect(() => {
    if (phase !== 'SUCCESS') return
    playApplause()
    setStars(s => s + 1)
  }, [phase])

  const startListening = () => {
    if (phase !== 'READY' && phase !== 'RETRY') return
    setPhase('LISTENING')
    cancelRef.current = listenOnce({
      onResult: (transcripts) => {
        cancelRef.current = null
        if (transcripts.length && isAccepted(transcripts, number, settings.mode)) {
          setPhase('SUCCESS')
        } else {
          setPhase('RETRY')
        }
      },
      onError: () => {
        cancelRef.current = null
        setPhase('RETRY')
      },
    })
  }

  const next = () => {
    cleanup()
    if (index + 1 >= NUMBERS.length) {
      onExit()
    } else {
      setIndex(i => i + 1)
      setPhase('INTRO')
    }
  }

  const exit = () => { cleanup(); onExit() }

  const replayWord = () => {
    if (phase === 'READY') speakOnce(number.word, { rate: settings.speechRate })
  }

  // ---------- SUCCESS SCREEN (4A) ----------
  if (phase === 'SUCCESS') {
    return (
      <div className="screen lesson-screen success-bg">
        <TopBar onBack={exit} stars={stars} />
        <div className="lesson-body">
          <div className="sunburst" aria-hidden="true" />
          <div className="big-number number-zoom">{number.value}</div>
          <div className="success-check" aria-hidden="true">✓</div>
          <p className="success-text">Excellent!</p>
          <div className="success-hands" aria-hidden="true">👏🎉👏</div>
          <button className="btn btn-primary btn-next" onClick={next}>
            {index + 1 >= NUMBERS.length ? 'Finish 🏠' : 'Next ➡'}
          </button>
        </div>
      </div>
    )
  }

  // ---------- INTRO / READY / LISTENING / RETRY ----------
  const shaking = phase === 'RETRY'

  return (
    <div className="screen lesson-screen">
      <TopBar onBack={exit} stars={stars} />
      <ProgressDots total={NUMBERS.length} current={index} />

      <div className="lesson-body">
        <div className={'big-number' + (shaking ? ' number-shake' : '')}>
          {number.value}
        </div>

        {phase === 'RETRY' && <p className="try-again">Try again!</p>}

        <WordChip
          word={number.word[0].toUpperCase() + number.word.slice(1)}
          onSpeak={replayWord}
          disabled={phase !== 'READY'}
        />

        <MicButton
          state={
            phase === 'INTRO' ? 'hidden'
            : phase === 'LISTENING' ? 'listening'
            : 'idle'
          }
          onPress={startListening}
        />

        {(phase === 'READY' || phase === 'RETRY') && (
          <p className="mic-hint">
            Tap the mic and say <span className="mic-word">"{number.word[0].toUpperCase() + number.word.slice(1)}"</span>
          </p>
        )}
        {phase === 'LISTENING' && <p className="mic-hint listening-hint">Listening…</p>}
        {phase === 'INTRO' && <p className="mic-hint intro-hint">Listen carefully 🔊</p>}
      </div>
    </div>
  )
}
