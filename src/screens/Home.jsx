import React from 'react'
import logo from '../assets/logo.png'
import { isSupported } from '../lib/recognition'

export default function Home({ onStart, onSettings }) {
  const supported = isSupported()

  return (
    <div className="screen home-screen">
      <div className="home-card">
        <img className="home-logo" src={logo} alt="Vaila's School for Hearing Impaired" />
        <div className="home-ribbon">For Children with Hearing Aid &amp; Cochlear Implant</div>

        <p className="home-welcome">Welcome to</p>
        <h1 className="home-title">Vaila Speech Trainer</h1>
        <div className="home-star" aria-hidden="true">★</div>
        <p className="home-tagline">Let's learn and have fun together!</p>

        <button className="btn btn-primary" onClick={onStart}>
          <span className="btn-icon" aria-hidden="true">▶</span> START
        </button>
        <button className="btn btn-secondary" onClick={onSettings}>
          <span className="btn-icon" aria-hidden="true">⚙</span> SETTINGS
        </button>

        {!supported && (
          <p className="browser-warning">
            Speech listening is not supported in this browser. Please open
            this app in a recent version of <strong>Chrome, Safari, or Edge</strong>.
          </p>
        )}

        <p className="home-footer">© Vaila School</p>
      </div>
    </div>
  )
}
