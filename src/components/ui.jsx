import React from 'react'

export function TopBar({ onBack, stars }) {
  return (
    <div className="topbar">
      <button className="icon-btn" onClick={onBack} aria-label="Back to home">←</button>
      <div className="star-counter" aria-label={`${stars} stars earned`}>
        <span className="star">★</span> {stars}
      </div>
    </div>
  )
}

// One dot per number (1-10); current is outlined, completed are green.
export function ProgressDots({ total, current }) {
  return (
    <div className="progress-dots" aria-label={`Number ${current + 1} of ${total}`}>
      {Array.from({ length: total }, (_, i) => (
        <span
          key={i}
          className={
            'dot' +
            (i < current ? ' dot-done' : '') +
            (i === current ? ' dot-current' : '')
          }
        />
      ))}
    </div>
  )
}

export function WordChip({ word, onSpeak, disabled }) {
  return (
    <button className="word-chip" onClick={onSpeak} disabled={disabled}>
      <span className="word-chip-text">{word}</span>
      <span className="speaker" aria-hidden="true">🔊</span>
    </button>
  )
}

export function MicButton({ state, onPress }) {
  // state: 'idle' | 'listening' | 'hidden'
  if (state === 'hidden') return null
  return (
    <button
      className={'mic-btn' + (state === 'listening' ? ' mic-listening' : '')}
      onClick={onPress}
      disabled={state === 'listening'}
      aria-label={state === 'listening' ? 'Listening…' : 'Tap to speak'}
    >
      <svg viewBox="0 0 24 24" width="34" height="34" fill="currentColor" aria-hidden="true">
        <path d="M12 14a3 3 0 0 0 3-3V6a3 3 0 1 0-6 0v5a3 3 0 0 0 3 3z" />
        <path d="M18 11a1 1 0 1 0-2 0 4 4 0 0 1-8 0 1 1 0 1 0-2 0 6 6 0 0 0 5 5.92V19H9a1 1 0 1 0 0 2h6a1 1 0 1 0 0-2h-2v-2.08A6 6 0 0 0 18 11z" />
      </svg>
    </button>
  )
}
