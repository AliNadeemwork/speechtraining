import React, { useEffect, useState } from 'react'

// If the school drops a real teacher recording at
// src/assets/mouth/<number>.mp4 (e.g. src/assets/mouth/3.mp4), it plays
// muted+looping INSTEAD of the CSS mouth animation below. This is a static
// build-time glob (Vite), so adding a new file requires a rebuild/redeploy —
// no file is required for the CSS animation fallback to work.
const mouthVideos = import.meta.glob('/src/assets/mouth/*.mp4', { eager: true, query: '?url', import: 'default' })

function mouthVideoFor(id) {
  const match = Object.keys(mouthVideos).find((path) => path.endsWith(`/${id}.mp4`))
  return match ? mouthVideos[match] : null
}

// Simple code-drawn mouth shape hint (open / round / wide / closed), looping
// via CSS. Not photoreal — just enough to hint at the shape of the mouth.
export function MouthAnimation({ shape }) {
  return (
    <div className={`mouth-anim mouth-${shape}`} aria-hidden="true">
      <div className="mouth-shape">
        <div className="mouth-teeth-top" />
        <div className="mouth-inner" />
        <div className="mouth-teeth-bottom" />
      </div>
    </div>
  )
}

export function HelpModal({ item, onClose }) {
  const [videoError, setVideoError] = useState(false)
  const videoSrc = !videoError ? mouthVideoFor(item.id) : null

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div className="help-backdrop" onClick={onClose}>
      <div className="help-card" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-label={`Help for ${item.spokenWord}`}>
        <button className="help-close" onClick={onClose} aria-label="Close help">×</button>
        <h3 className="help-title">How to say "{item.spokenWord}"</h3>

        {videoSrc ? (
          <video
            className="help-mouth-video"
            src={videoSrc}
            autoPlay
            muted
            loop
            playsInline
            onError={() => setVideoError(true)}
          />
        ) : (
          <MouthAnimation shape={item.mouthShape} />
        )}

        <p className="help-text">{item.helpText}</p>
      </div>
    </div>
  )
}
