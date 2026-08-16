// Teacher-facing settings, persisted in localStorage.

const KEY = 'vsta-settings-v3'
const OLD_KEY_V2 = 'vsta-settings-v2'
const OLD_KEY_V1 = 'vsta-settings-v1'

// Acceptance level: teacher-facing name for the word-identity similarity
// threshold evaluate() checks a recognized word against (see
// lib/evaluate.js). These three values are PROVISIONAL defaults — they
// have not been tuned against real children's speech yet and should be
// revisited once there's usage data from the pilot classrooms.
export const ACCEPTANCE_LEVELS = {
  lenient: 0.40,
  balanced: 0.65,
  strict: 0.85,
}

const DEFAULTS = {
  acceptanceLevel: ACCEPTANCE_LEVELS.balanced, // see ACCEPTANCE_LEVELS above
  speechRate: 0.75,      // TTS speed (0.5 slow – 1.0 normal)
  repetitions: 3,        // times each item is pronounced on lesson start
  rangeMin: 1,            // active number range (Numbers section only)
  rangeMax: 20,
  autoAdvance: true,      // auto move to next item after a correct answer
}

export function loadSettings() {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) || 'null')
    if (raw) return { ...DEFAULTS, ...raw }

    // Migrate v2 settings (0..1 leniency slider) onto the new 3-tier scale.
    const v2 = JSON.parse(localStorage.getItem(OLD_KEY_V2) || 'null')
    if (v2) {
      const acceptanceLevel =
        v2.leniency <= 0.05 ? ACCEPTANCE_LEVELS.strict :
        v2.leniency > 0.65 ? ACCEPTANCE_LEVELS.lenient :
        ACCEPTANCE_LEVELS.balanced
      return { ...DEFAULTS, ...v2, acceptanceLevel }
    }

    // Migrate v1 settings (strict/light mode only).
    const v1 = JSON.parse(localStorage.getItem(OLD_KEY_V1) || 'null')
    if (v1) {
      return {
        ...DEFAULTS,
        ...v1,
        acceptanceLevel: v1.mode === 'strict' ? ACCEPTANCE_LEVELS.strict : ACCEPTANCE_LEVELS.lenient,
      }
    }
    return { ...DEFAULTS }
  } catch {
    return { ...DEFAULTS }
  }
}

export function saveSettings(settings) {
  try { localStorage.setItem(KEY, JSON.stringify(settings)) } catch {}
}
