/**
 * Pure Web Audio API synthesized SFX engine for ClassLoop Gamified.
 * Zero external audio assets, zero latency, zero 404s, works across mobile & desktop.
 */

let audioCtx: AudioContext | null = null
let muted = false

// Initialize mute state from localStorage
try {
  muted = localStorage.getItem('classloop_sfx_muted') === 'true'
} catch {}

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    if (AudioContextClass) {
      audioCtx = new AudioContextClass()
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {})
  }
  return audioCtx
}

export function isSoundMuted(): boolean {
  return muted
}

export function toggleSoundMute(): boolean {
  muted = !muted
  try {
    localStorage.setItem('classloop_sfx_muted', String(muted))
  } catch {}
  return muted
}

export function setSoundMuted(state: boolean) {
  muted = state
  try {
    localStorage.setItem('classloop_sfx_muted', String(muted))
  } catch {}
}

/** Soft UI click */
export function playClickSound() {
  if (muted) return
  const ctx = getAudioContext()
  if (!ctx) return

  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.type = 'sine'
  osc.frequency.setValueAtTime(800, ctx.currentTime)
  osc.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.04)

  gain.gain.setValueAtTime(0.08, ctx.currentTime)
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04)

  osc.connect(gain)
  gain.connect(ctx.destination)

  osc.start()
  osc.stop(ctx.currentTime + 0.04)
}

/** High sparkling coin ping */
export function playCoinSound() {
  if (muted) return
  const ctx = getAudioContext()
  if (!ctx) return

  const now = ctx.currentTime
  const osc1 = ctx.createOscillator()
  const osc2 = ctx.createOscillator()
  const gain = ctx.createGain()

  osc1.type = 'sine'
  osc2.type = 'triangle'

  osc1.frequency.setValueAtTime(987.77, now) // B5
  osc1.frequency.setValueAtTime(1318.51, now + 0.08) // E6

  osc2.frequency.setValueAtTime(1975.53, now) // B6
  osc2.frequency.setValueAtTime(2637.02, now + 0.08) // E7

  gain.gain.setValueAtTime(0.12, now)
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28)

  osc1.connect(gain)
  osc2.connect(gain)
  gain.connect(ctx.destination)

  osc1.start(now)
  osc2.start(now)
  osc1.stop(now + 0.28)
  osc2.stop(now + 0.28)
}

/** Magical XP sparkle */
export function playXPSparkle() {
  if (muted) return
  const ctx = getAudioContext()
  if (!ctx) return

  const now = ctx.currentTime
  const notes = [523.25, 659.25, 783.99, 1046.5] // C5, E5, G5, C6
  notes.forEach((freq, idx) => {
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    const noteStart = now + idx * 0.05

    osc.type = 'sine'
    osc.frequency.setValueAtTime(freq, noteStart)

    gain.gain.setValueAtTime(0.08, noteStart)
    gain.gain.exponentialRampToValueAtTime(0.001, noteStart + 0.18)

    osc.connect(gain)
    gain.connect(ctx.destination)

    osc.start(noteStart)
    osc.stop(noteStart + 0.18)
  })
}

/** Triumphant level-up / victory chime */
export function playLevelUpSound() {
  if (muted) return
  const ctx = getAudioContext()
  if (!ctx) return

  const now = ctx.currentTime
  const notes = [440, 554.37, 659.25, 880, 1108.73] // A4, C#5, E5, A5, C#6
  notes.forEach((freq, idx) => {
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    const noteStart = now + idx * 0.08

    osc.type = 'triangle'
    osc.frequency.setValueAtTime(freq, noteStart)

    gain.gain.setValueAtTime(0.15, noteStart)
    gain.gain.exponentialRampToValueAtTime(0.001, noteStart + (idx === notes.length - 1 ? 0.6 : 0.25))

    osc.connect(gain)
    gain.connect(ctx.destination)

    osc.start(noteStart)
    osc.stop(noteStart + (idx === notes.length - 1 ? 0.6 : 0.25))
  })
}

/** Futuristic portal whoosh when entering or exiting buildings */
export function playPortalSound() {
  if (muted) return
  const ctx = getAudioContext()
  if (!ctx) return

  const now = ctx.currentTime
  const osc = ctx.createOscillator()
  const filter = ctx.createBiquadFilter()
  const gain = ctx.createGain()

  osc.type = 'sawtooth'
  osc.frequency.setValueAtTime(140, now)
  osc.frequency.exponentialRampToValueAtTime(480, now + 0.2)
  osc.frequency.exponentialRampToValueAtTime(120, now + 0.45)

  filter.type = 'lowpass'
  filter.frequency.setValueAtTime(400, now)
  filter.frequency.exponentialRampToValueAtTime(3200, now + 0.2)
  filter.frequency.exponentialRampToValueAtTime(200, now + 0.45)

  gain.gain.setValueAtTime(0.01, now)
  gain.gain.linearRampToValueAtTime(0.15, now + 0.15)
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45)

  osc.connect(filter)
  filter.connect(gain)
  gain.connect(ctx.destination)

  osc.start(now)
  osc.stop(now + 0.45)
}

/** Answer correct chime */
export function playCorrectSound() {
  if (muted) return
  const ctx = getAudioContext()
  if (!ctx) return

  const now = ctx.currentTime
  const notes = [659.25, 880] // E5, A5
  notes.forEach((freq, idx) => {
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    const start = now + idx * 0.07

    osc.type = 'sine'
    osc.frequency.setValueAtTime(freq, start)

    gain.gain.setValueAtTime(0.12, start)
    gain.gain.exponentialRampToValueAtTime(0.001, start + 0.22)

    osc.connect(gain)
    gain.connect(ctx.destination)

    osc.start(start)
    osc.stop(start + 0.22)
  })
}

/** Soft error buzz */
export function playWrongSound() {
  if (muted) return
  const ctx = getAudioContext()
  if (!ctx) return

  const now = ctx.currentTime
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()

  osc.type = 'sawtooth'
  osc.frequency.setValueAtTime(180, now)
  osc.frequency.linearRampToValueAtTime(130, now + 0.16)

  gain.gain.setValueAtTime(0.1, now)
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16)

  osc.connect(gain)
  gain.connect(ctx.destination)

  osc.start(now)
  osc.stop(now + 0.16)
}

/** Rapid streak hit with climbing harmonic pitch */
export function playStreakSound(streak: number) {
  if (muted) return
  const ctx = getAudioContext()
  if (!ctx) return

  const now = ctx.currentTime
  const baseFreq = 440 * Math.pow(1.08, Math.min(12, streak))
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()

  osc.type = streak >= 3 ? 'square' : 'triangle'
  osc.frequency.setValueAtTime(baseFreq, now)
  osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.5, now + 0.12)

  gain.gain.setValueAtTime(0.1, now)
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18)

  osc.connect(gain)
  gain.connect(ctx.destination)

  osc.start(now)
  osc.stop(now + 0.18)
}

/** Friendly retro NPC speech chirp */
export function playDialogBlip() {
  if (muted) return
  const ctx = getAudioContext()
  if (!ctx) return

  const now = ctx.currentTime
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()

  const pitch = 450 + Math.random() * 180
  osc.type = 'sine'
  osc.frequency.setValueAtTime(pitch, now)

  gain.gain.setValueAtTime(0.06, now)
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05)

  osc.connect(gain)
  gain.connect(ctx.destination)

  osc.start(now)
  osc.stop(now + 0.05)
}

let lastStepTime = 0
/** Subtle organic footstep (rate-limited) */
export function playFootstepSound() {
  if (muted) return
  const now = Date.now()
  if (now - lastStepTime < 320) return
  lastStepTime = now

  const ctx = getAudioContext()
  if (!ctx) return

  const cTime = ctx.currentTime
  const osc = ctx.createOscillator()
  const filter = ctx.createBiquadFilter()
  const gain = ctx.createGain()

  osc.type = 'triangle'
  osc.frequency.setValueAtTime(100 + Math.random() * 30, cTime)

  filter.type = 'lowpass'
  filter.frequency.setValueAtTime(280, cTime)

  gain.gain.setValueAtTime(0.03, cTime)
  gain.gain.exponentialRampToValueAtTime(0.001, cTime + 0.06)

  osc.connect(filter)
  filter.connect(gain)
  gain.connect(ctx.destination)

  osc.start(cTime)
  osc.stop(cTime + 0.06)
}
