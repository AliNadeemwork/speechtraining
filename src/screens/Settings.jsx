import React from 'react'
import { NUMBERS } from '../data/numbers'
import { ACCEPTANCE_LEVELS } from '../lib/settings'

const LEVEL_OPTIONS = [
  { key: 'lenient', label: 'Very Lenient', value: ACCEPTANCE_LEVELS.lenient },
  { key: 'balanced', label: 'Balanced', value: ACCEPTANCE_LEVELS.balanced },
  { key: 'strict', label: 'Strict', value: ACCEPTANCE_LEVELS.strict },
]

export default function Settings({ settings, onChange, onBack }) {
  const set = (patch) => onChange({ ...settings, ...patch })

  const setRangeMin = (v) => {
    const min = Number(v)
    set({ rangeMin: min, rangeMax: Math.max(min, settings.rangeMax) })
  }
  const setRangeMax = (v) => {
    const max = Number(v)
    set({ rangeMax: max, rangeMin: Math.min(max, settings.rangeMin) })
  }

  return (
    <div className="screen settings-screen">
      <div className="topbar">
        <button className="icon-btn" onClick={onBack} aria-label="Back to home">←</button>
        <h2 className="settings-title">Settings</h2>
        <span style={{ width: 44 }} />
      </div>

      <div className="settings-body">
        <section className="setting-group">
          <h3>Acceptance level</h3>
          <p className="setting-hint">
            How closely the child's word must match before it is accepted.
            (Provisional defaults — to be tuned on real children.)
          </p>
          <div className="segmented">
            {LEVEL_OPTIONS.map(opt => (
              <button
                key={opt.key}
                className={settings.acceptanceLevel === opt.value ? 'seg active' : 'seg'}
                onClick={() => set({ acceptanceLevel: opt.value })}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </section>

        <section className="setting-group">
          <h3>Number range</h3>
          <p className="setting-hint">Which numbers are used in the Numbers lesson.</p>
          <div className="range-select-row">
            <label>
              From
              <select value={settings.rangeMin} onChange={(e) => setRangeMin(e.target.value)}>
                {NUMBERS.map(n => <option key={n.id} value={n.id}>{n.id}</option>)}
              </select>
            </label>
            <label>
              To
              <select value={settings.rangeMax} onChange={(e) => setRangeMax(e.target.value)}>
                {NUMBERS.map(n => <option key={n.id} value={n.id}>{n.id}</option>)}
              </select>
            </label>
          </div>
        </section>

        <section className="setting-group">
          <h3>Speaking speed</h3>
          <p className="setting-hint">How fast the app pronounces each item.</p>
          <input
            type="range" min="0.5" max="1" step="0.05"
            value={settings.speechRate}
            onChange={(e) => set({ speechRate: Number(e.target.value) })}
          />
          <div className="range-labels"><span>Slow</span><span>Normal</span></div>
        </section>

        <section className="setting-group">
          <h3>Repetitions</h3>
          <p className="setting-hint">Times each item is pronounced before the child speaks.</p>
          <div className="segmented">
            {[2, 3, 4].map(n => (
              <button
                key={n}
                className={settings.repetitions === n ? 'seg active' : 'seg'}
                onClick={() => set({ repetitions: n })}
              >
                {n}×
              </button>
            ))}
          </div>
        </section>

        <section className="setting-group">
          <h3>Auto-advance</h3>
          <p className="setting-hint">
            After a correct answer, move to the next item automatically. When
            off, the child/teacher taps Next to continue.
          </p>
          <div className="segmented">
            <button
              className={settings.autoAdvance ? 'seg active' : 'seg'}
              onClick={() => set({ autoAdvance: true })}
            >
              On
            </button>
            <button
              className={!settings.autoAdvance ? 'seg active' : 'seg'}
              onClick={() => set({ autoAdvance: false })}
            >
              Off
            </button>
          </div>
        </section>
      </div>
    </div>
  )
}
