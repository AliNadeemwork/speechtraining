import React from 'react'
import { SECTIONS } from '../data/sections'
import { ExitXIcon, BrandBlock } from '../components/ui'

export default function SectionSelect({ onSelect, onExit }) {
  return (
    <div className="screen section-select-screen">
      <header className="lesson-header section-select-header">
        <div />
        <BrandBlock subtitle="CHOOSE A LESSON" />
        <button className="exit-btn" onClick={onExit} aria-label="Back to home">
          <ExitXIcon />
          <span>Exit</span>
        </button>
      </header>

      <div className="section-select-body">
        {SECTIONS.filter(section => !section.hidden).map(section => (
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
