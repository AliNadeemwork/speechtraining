import React from 'react'
import logo from '../assets/logo.png'
import { SECTIONS } from '../data/sections'
import { ExitXIcon } from '../components/ui'

export default function SectionSelect({ onSelect, onExit }) {
  return (
    <div className="screen section-select-screen">
      <header className="lesson-header section-select-header">
        <div />
        <div className="lesson-brand">
          <div className="brand-divider" />
          <img className="brand-logo" src={logo} alt="VAILA'S School logo" />
          <h1 className="brand-title">VAILA'S Speech Trainer</h1>
          <p className="brand-subtitle">Choose a lesson</p>
          <div className="brand-divider" />
        </div>
        <button className="exit-btn" onClick={onExit} aria-label="Back to home">
          <ExitXIcon />
          <span>Exit</span>
        </button>
      </header>

      <div className="section-select-body">
        {SECTIONS.map(section => (
          <button
            key={section.id}
            className="section-card"
            onClick={() => onSelect(section.id)}
          >
            {section.label}
          </button>
        ))}
      </div>

      <footer className="lesson-footer">© VAILA'S School for Hearing Impaired Students</footer>
    </div>
  )
}
