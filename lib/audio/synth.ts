import { noteIndex, type Note } from '@/lib/music/notes'
import { TUNING_CONFIGS } from '@/lib/music/tunings'

/** MIDI numbers for each open string of a tuning, low to high. */
export function openStringMidis(tuningKey: string): number[] {
  const config = TUNING_CONFIGS[tuningKey] ?? TUNING_CONFIGS.standard
  const midis: number[] = [config.lowestMidi]
  for (let i = 1; i < config.notes.length; i++) {
    const step = (noteIndex(config.notes[i]) - noteIndex(config.notes[i - 1]) + 12) % 12
    midis.push(midis[i - 1] + (step === 0 ? 12 : step))
  }
  return midis
}

export function fretMidi(tuningKey: string, stringIndex: number, fret: number): number {
  return openStringMidis(tuningKey)[stringIndex] + fret
}

export function midiToFrequency(midi: number): number {
  return 440 * Math.pow(2, (midi - 69) / 12)
}

export function noteToMidi(note: Note, octave: number): number {
  return noteIndex(note) + (octave + 1) * 12
}

/**
 * A small plucked-string voice: two detuned saws through a decaying lowpass,
 * which is enough to hear voice leading without shipping samples.
 */
export class Synth {
  private ctx: AudioContext | null = null
  private master: GainNode | null = null

  private ensure(): AudioContext | null {
    if (typeof window === 'undefined') return null
    if (!this.ctx) {
      const Ctor =
        window.AudioContext ??
        (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
      if (!Ctor) return null
      this.ctx = new Ctor()
      this.master = this.ctx.createGain()
      this.master.gain.value = 0.28
      this.master.connect(this.ctx.destination)
    }
    return this.ctx
  }

  async resume(): Promise<void> {
    const ctx = this.ensure()
    if (ctx && ctx.state === 'suspended') await ctx.resume()
  }

  get currentTime(): number {
    return this.ensure()?.currentTime ?? 0
  }

  pluck(midi: number, when = 0, duration = 0.9, gain = 1): void {
    const ctx = this.ensure()
    if (!ctx || !this.master) return
    const t = when > 0 ? when : ctx.currentTime
    const frequency = midiToFrequency(midi)

    const amp = ctx.createGain()
    amp.gain.setValueAtTime(0.0001, t)
    amp.gain.exponentialRampToValueAtTime(0.5 * gain, t + 0.008)
    amp.gain.exponentialRampToValueAtTime(0.0001, t + duration)

    const filter = ctx.createBiquadFilter()
    filter.type = 'lowpass'
    filter.frequency.setValueAtTime(Math.min(9000, frequency * 9), t)
    filter.frequency.exponentialRampToValueAtTime(Math.max(220, frequency * 2), t + duration)
    filter.Q.value = 1.2

    for (const detune of [-6, 6]) {
      const osc = ctx.createOscillator()
      osc.type = 'sawtooth'
      osc.frequency.value = frequency
      osc.detune.value = detune
      osc.connect(filter)
      osc.start(t)
      osc.stop(t + duration + 0.05)
    }

    filter.connect(amp)
    amp.connect(this.master)
  }

  /** Strum a set of MIDI notes low to high with a short spread. */
  strum(midis: number[], when = 0, spread = 0.028, duration = 1.4): void {
    const ctx = this.ensure()
    if (!ctx) return
    const t = when > 0 ? when : ctx.currentTime
    midis.forEach((midi, i) => this.pluck(midi, t + i * spread, duration, 0.8))
  }

  click(when = 0, accent = false): void {
    const ctx = this.ensure()
    if (!ctx || !this.master) return
    const t = when > 0 ? when : ctx.currentTime
    const osc = ctx.createOscillator()
    const amp = ctx.createGain()
    osc.type = 'square'
    osc.frequency.value = accent ? 1600 : 1000
    amp.gain.setValueAtTime(accent ? 0.22 : 0.12, t)
    amp.gain.exponentialRampToValueAtTime(0.0001, t + 0.05)
    osc.connect(amp)
    amp.connect(this.master)
    osc.start(t)
    osc.stop(t + 0.06)
  }

  stopAll(): void {
    if (this.ctx) {
      void this.ctx.close()
      this.ctx = null
      this.master = null
    }
  }
}

let shared: Synth | null = null

export function getSynth(): Synth {
  if (!shared) shared = new Synth()
  return shared
}
