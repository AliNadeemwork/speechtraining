// Teacher-facing settings, persisted in localStorage.

const KEY = 'vsta-settings-v1'

const DEFAULTS = {
  mode: 'light',      // 'strict' | 'light'
  speechRate: 0.75,   // TTS speed (0.5 slow – 1.0 normal)
  repetitions: 3,     // times the number is pronounced on Screen 1
}

export function loadSettings() {
  try {
    return { ...DEFAULTS, ...JSON.parse(localStorage.getItem(KEY) || '{}') }
  } catch {
    return { ...DEFAULTS }
  }
}

export function saveSettings(settings) {
  try { localStorage.setItem(KEY, JSON.stringify(settings)) } catch {}
}
