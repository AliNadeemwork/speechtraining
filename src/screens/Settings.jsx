import React from 'react'

export default function Settings({ settings, onChange, onBack }) {
  const set = (patch) => onChange({ ...settings, ...patch })

  return (
    <div className="screen settings-screen">
      <div className="topbar">
        <button className="icon-btn" onClick={onBack} aria-label="Back to home">←</button>
        <h2 className="settings-title">Settings</h2>
        <span style={{ width: 44 }} />
      </div>

      <div className="settings-body">
        <section className="setting-group">
          <h3>Pronunciation checking</h3>
          <p className="setting-hint">
            How closely the child's word must match before it is accepted.
          </p>
          <div className="segmented">
            <button
              className={settings.mode === 'light' ? 'seg active' : 'seg'}
              onClick={() => set({ mode: 'light' })}
            >
              Light
              <small>Accepts close attempts (e.g. "won" for one)</small>
            </button>
            <button
              className={settings.mode === 'strict' ? 'seg active' : 'seg'}
              onClick={() => set({ mode: 'strict' })}
            >
              Strict
              <small>Accepts only the exact word</small>
            </button>
          </div>
        </section>

        <section className="setting-group">
          <h3>Speaking speed</h3>
          <p className="setting-hint">How fast the app pronounces each number.</p>
          <input
            type="range" min="0.5" max="1" step="0.05"
            value={settings.speechRate}
            onChange={(e) => set({ speechRate: Number(e.target.value) })}
          />
          <div className="range-labels"><span>Slow</span><span>Normal</span></div>
        </section>

        <section className="setting-group">
          <h3>Repetitions</h3>
          <p className="setting-hint">Times each number is pronounced before the child speaks.</p>
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
      </div>
    </div>
  )
}
