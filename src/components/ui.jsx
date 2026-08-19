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

export function LightbulbIcon() {
  return (
    <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M9 18h6M10 21h4" />
      <path d="M12 3a6 6 0 0 0-3.5 10.9c.6.44.9 1.15.9 1.9V16h5.2v-.2c0-.75.3-1.46.9-1.9A6 6 0 0 0 12 3z" />
    </svg>
  )
}

// Circular "ear" badge used in the brand header, matching the approved
// mockup's simple line-art icon (not the fuller school crest in logo.png,
// which stays on the Home screen only).
export function EarBadge() {
  return (
    <svg viewBox="0 0 64 64" width="46" height="46" aria-hidden="true">
      <circle cx="32" cy="32" r="29" fill="none" stroke="currentColor" strokeWidth="3" />
      <path
        d="M28 20c6 0 11 5 11 11 0 5-3 7-3 11a5 5 0 0 1-10 0"
        fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"
      />
      <path d="M28 24c3.5 0 6 3 6 6.5S32 36 29.5 36" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
    </svg>
  )
}

// Shared brand block: ear badge, "VSCI&HI" pill, title, red section label,
// gold-star tagline. `subtitle` is the red uppercase line (e.g. "PHONICS",
// "NUMBERS"); omit it on screens with no active section (plain chooser).
export function BrandBlock({ subtitle }) {
  return (
    <div className="lesson-brand">
      <div className="ear-badge"><EarBadge /></div>
      <div className="vsci-badge">VSCI&amp;HI</div>
      <p className="vsci-caption">For Children with Hearing Aid &amp; Cochlear Implant</p>
      <h1 className="brand-title">VAILA'S Speech Trainer</h1>
      {subtitle && <p className="brand-subtitle">{subtitle}</p>}
      <p className="tagline-row">
        <span className="tagline-star" aria-hidden="true">★</span>
        Inclusive Learning for Every Child
        <span className="tagline-star" aria-hidden="true">★</span>
      </p>
    </div>
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
