// Applause synthesized with the Web Audio API (filtered noise bursts),
// so the prototype ships with zero audio assets. Replace with a real
// applause recording later if the school prefers.

let ctx = null

function audioCtx() {
  if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)()
  if (ctx.state === 'suspended') ctx.resume()
  return ctx
}

function clapAt(time, ac, master) {
  const dur = 0.06 + Math.random() * 0.04
  const buffer = ac.createBuffer(1, ac.sampleRate * dur, ac.sampleRate)
  const data = buffer.getChannelData(0)
  for (let i = 0; i < data.length; i++) {
    data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / data.length, 2)
  }
  const src = ac.createBufferSource()
  src.buffer = buffer

  const bp = ac.createBiquadFilter()
  bp.type = 'bandpass'
  bp.frequency.value = 1500 + Math.random() * 2500
  bp.Q.value = 0.8

  const g = ac.createGain()
  g.gain.value = 0.25 + Math.random() * 0.3

  src.connect(bp).connect(g).connect(master)
  src.start(time)
}

export function playApplause(durationMs = 2200) {
  try {
    const ac = audioCtx()
    const master = ac.createGain()
    master.gain.value = 0.9
    master.connect(ac.destination)

    const start = ac.currentTime + 0.05
    const end = start + durationMs / 1000
    // Many overlapping claps at random offsets = crowd applause
    for (let t = start; t < end; t += 0.02 + Math.random() * 0.05) {
      for (let c = 0; c < 3; c++) clapAt(t + Math.random() * 0.02, ac, master)
    }
    // Fade out at the tail
    master.gain.setValueAtTime(0.9, end - 0.5)
    master.gain.linearRampToValueAtTime(0, end)
  } catch {
    // Audio failure should never break the lesson flow
  }
}

// Call once from a user gesture (Start button) to unlock audio on mobile.
export function unlockAudio() {
  try { audioCtx() } catch {}
}
