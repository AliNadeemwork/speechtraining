import React from 'react'

export function SpeakerIcon() {
  return (
    <svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor" aria-hidden="true">
      <path d="M4 9v6h4l5 5V4L8 9H4z" />
      <path d="M16.5 12a4.5 4.5 0 0 0-2.5-4v8a4.5 4.5 0 0 0 2.5-4z" />
      <path d="M14 4.5v1.6a6.5 6.5 0 0 1 0 11.8v1.6a8 8 0 0 0 0-15z" />
    </svg>
  )
}

export function MicIcon() {
  return (
    <svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor" aria-hidden="true">
      <path d="M12 14a3 3 0 0 0 3-3V6a3 3 0 1 0-6 0v5a3 3 0 0 0 3 3z" />
      <path d="M18 11a1 1 0 1 0-2 0 4 4 0 0 1-8 0 1 1 0 1 0-2 0 6 6 0 0 0 5 5.92V19H9a1 1 0 1 0 0 2h6a1 1 0 1 0 0-2h-2v-2.08A6 6 0 0 0 18 11z" />
    </svg>
  )
}

export function CameraOffIcon() {
  return (
    <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 3l18 18" />
      <path d="M21 16.5V8.5a1.5 1.5 0 0 0-1.5-1.5h-3l-1.5-2h-4l-.9 1.2" />
      <path d="M9.2 5H4.5A1.5 1.5 0 0 0 3 6.5v10A1.5 1.5 0 0 0 4.5 18h11" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  )
}

export function ExitXIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" aria-hidden="true">
      <path d="M5 5l14 14M19 5L5 19" />
    </svg>
  )
}

// Live front-camera preview, top-left of the lesson header.
// Falls back to a friendly placeholder if the camera is denied/unavailable —
// the lesson works fully without it.
export function Mirror({ videoRef, status }) {
  return (
    <div className="mirror">
      {status === 'ok' && (
        <video ref={videoRef} className="mirror-video" autoPlay muted playsInline />
      )}
      {status !== 'ok' && (
        <div className="mirror-placeholder" aria-hidden="true">
          <CameraOffIcon />
        </div>
      )}
      <span className="mirror-label">Mirror</span>
    </div>
  )
}
