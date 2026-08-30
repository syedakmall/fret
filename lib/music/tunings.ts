import type { Note } from './notes'

export type InstrumentType = '4-string' | '6-string' | '7-string' | '8-string'

export interface TuningConfig {
  notes: Note[]
  name: string
  stringCount: number
  /** MIDI note number of the lowest string, used for playback pitch. */
  lowestMidi: number
}

export const STANDARD_TUNING: Note[] = ['E', 'A', 'D', 'G', 'B', 'E']

export const INSTRUMENT_NAMES: Record<InstrumentType, string> = {
  '4-string': '4-String Bass',
  '6-string': '6-String Guitar',
  '7-string': '7-String Guitar',
  '8-string': '8-String Guitar',
}

export const STRING_COUNTS = [4, 6, 7, 8]

// lowestMidi: E1 = 28, D1 = 26, C1 = 24, B0 = 23, A0 = 21, F#0 = 18, E2 = 40, D2 = 38, C2 = 36
export const TUNING_CONFIGS: Record<string, TuningConfig> = {
  bassStandard: { notes: ['E', 'A', 'D', 'G'], name: 'Bass Standard (E-A-D-G)', stringCount: 4, lowestMidi: 28 },
  bassDropD: { notes: ['D', 'A', 'D', 'G'], name: 'Bass Drop D (D-A-D-G)', stringCount: 4, lowestMidi: 26 },
  bassDStandard: { notes: ['D', 'G', 'C', 'F'], name: 'Bass D Standard (D-G-C-F)', stringCount: 4, lowestMidi: 26 },

  standard: { notes: ['E', 'A', 'D', 'G', 'B', 'E'], name: 'Standard (E-A-D-G-B-E)', stringCount: 6, lowestMidi: 40 },
  dropD: { notes: ['D', 'A', 'D', 'G', 'B', 'E'], name: 'Drop D (D-A-D-G-B-E)', stringCount: 6, lowestMidi: 38 },
  dStandard: { notes: ['D', 'G', 'C', 'F', 'A', 'D'], name: 'D Standard (D-G-C-F-A-D)', stringCount: 6, lowestMidi: 38 },
  dropC: { notes: ['C', 'G', 'C', 'F', 'A', 'D'], name: 'Drop C (C-G-C-F-A-D)', stringCount: 6, lowestMidi: 36 },
  openG: { notes: ['D', 'G', 'D', 'G', 'B', 'D'], name: 'Open G (D-G-D-G-B-D)', stringCount: 6, lowestMidi: 38 },
  openD: { notes: ['D', 'A', 'D', 'F#', 'A', 'D'], name: 'Open D (D-A-D-F#-A-D)', stringCount: 6, lowestMidi: 38 },

  standard7: { notes: ['B', 'E', 'A', 'D', 'G', 'B', 'E'], name: '7-String Standard (B-E-A-D-G-B-E)', stringCount: 7, lowestMidi: 35 },
  dropA7: { notes: ['A', 'E', 'A', 'D', 'G', 'B', 'E'], name: '7-String Drop A (A-E-A-D-G-B-E)', stringCount: 7, lowestMidi: 33 },
  aStandard7: { notes: ['A', 'D', 'G', 'C', 'F', 'A', 'D'], name: '7-String A Standard (A-D-G-C-F-A-D)', stringCount: 7, lowestMidi: 33 },

  standard8: { notes: ['F#', 'B', 'E', 'A', 'D', 'G', 'B', 'E'], name: '8-String Standard (F#-B-E-A-D-G-B-E)', stringCount: 8, lowestMidi: 30 },
  dropE8: { notes: ['E', 'B', 'E', 'A', 'D', 'G', 'B', 'E'], name: '8-String Drop E (E-B-E-A-D-G-B-E)', stringCount: 8, lowestMidi: 28 },
  eStandard8: { notes: ['E', 'A', 'D', 'G', 'C', 'F', 'A', 'D'], name: '8-String E Standard (E-A-D-G-C-F-A-D)', stringCount: 8, lowestMidi: 28 },
}

export const TUNINGS: Record<string, Note[]> = Object.fromEntries(
  Object.entries(TUNING_CONFIGS).map(([key, config]) => [key, config.notes])
)

export const TUNING_NAMES: Record<string, string> = Object.fromEntries(
  Object.entries(TUNING_CONFIGS).map(([key, config]) => [key, config.name])
)

export function getTuningsByStringCount(stringCount: number): [string, TuningConfig][] {
  return Object.entries(TUNING_CONFIGS).filter(([, config]) => config.stringCount === stringCount)
}

export function getDefaultTuning(stringCount: number): string {
  const defaults: Record<number, string> = {
    4: 'bassStandard',
    6: 'standard',
    7: 'standard7',
    8: 'standard8',
  }
  return defaults[stringCount] ?? 'standard'
}

export function getInstrumentName(stringCount: number): string {
  return INSTRUMENT_NAMES[`${stringCount}-string` as InstrumentType] ?? `${stringCount}-String`
}
