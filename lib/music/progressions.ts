import { NOTES, noteIndex, type Note } from './notes'
import { SCALES } from './scales'
import { getChordName, getChordQuality, type ChordQuality } from './chords'

export interface ChordProgression {
  name: string
  degreesMajor: number[]
  degreesMinor: number[]
  description: string
}

export const CHORD_PROGRESSIONS: Record<string, ChordProgression> = {
  '1-4-5': {
    name: 'I-IV-V',
    degreesMajor: [1, 4, 5],
    degreesMinor: [1, 4, 5],
    description: 'Classic rock and blues',
  },
  '1-5-6-4': {
    name: 'I-V-vi-IV',
    degreesMajor: [1, 5, 6, 4],
    degreesMinor: [1, 5, 6, 4],
    description: 'The pop progression',
  },
  '6-4-1-5': {
    name: 'vi-IV-I-V',
    degreesMajor: [6, 4, 1, 5],
    degreesMinor: [6, 4, 1, 5],
    description: 'Wistful, cinematic',
  },
  '2-5-1': {
    name: 'ii-V-I',
    degreesMajor: [2, 5, 1],
    degreesMinor: [2, 5, 1],
    description: 'Jazz turnaround',
  },
  '1-6-4-5': {
    name: 'I-vi-IV-V',
    degreesMajor: [1, 6, 4, 5],
    degreesMinor: [1, 6, 4, 5],
    description: '50s doo-wop',
  },
  '1-4-1-5': {
    name: 'I-IV-I-V',
    degreesMajor: [1, 4, 1, 5],
    degreesMinor: [1, 4, 1, 5],
    description: 'Simple blues',
  },
  '1-b7-4-1': {
    name: 'I-bVII-IV-I',
    degreesMajor: [1, 7, 4, 1],
    degreesMinor: [1, 7, 4, 1],
    description: 'Modal rock vamp',
  },
}

export const PROGRESSION_KEYS = Object.keys(CHORD_PROGRESSIONS)

/** A seven-note parent scale to borrow harmony from when the scale has fewer notes. */
function harmonicParent(scale: string): number[] {
  const formula = SCALES[scale] ?? SCALES.major
  if (formula.length >= 7) return formula
  return getChordQuality(scale) === 'minor' ? SCALES.minor : SCALES.major
}

/** Diatonic triad quality built on a scale degree by stacking scale thirds. */
export function getDegreeQuality(scale: string, degree: number): ChordQuality {
  const formula = harmonicParent(scale)
  const len = formula.length
  const i = (degree - 1 + len) % len
  const at = (step: number) => {
    const raw = formula[(i + step) % len]
    const wraps = Math.floor((i + step) / len)
    return raw + wraps * 12
  }
  const root = at(0)
  const third = at(2) - root
  const fifth = at(4) - root
  if (third === 4 && fifth === 8) return 'aug'
  if (third === 4) return 'major'
  if (third === 3 && fifth === 6) return 'dim'
  if (third === 3) return 'minor'
  return 'major'
}

export function getChordRootForDegree(rootNote: Note, scale: string, degree: number): Note {
  const formula = harmonicParent(scale)
  const index = (degree - 1 + formula.length) % formula.length
  return NOTES[(noteIndex(rootNote) + formula[index]) % 12]
}

export function getProgressionDegrees(scale: string, progressionKey: string): number[] {
  const progression = CHORD_PROGRESSIONS[progressionKey]
  if (!progression) return []
  return getChordQuality(scale) === 'minor' ? progression.degreesMinor : progression.degreesMajor
}

export interface ProgressionChord {
  root: Note
  quality: ChordQuality
  degree: number
  name: string
}

/** The chord at a step of a progression; the step wraps around the progression. */
export function getProgressionChordAt(
  rootNote: Note,
  scale: string,
  step: number,
  progressionKey: string
): ProgressionChord | null {
  const degrees = getProgressionDegrees(scale, progressionKey)
  if (degrees.length === 0) return null
  const degree = degrees[((step % degrees.length) + degrees.length) % degrees.length]
  const root = getChordRootForDegree(rootNote, scale, degree)
  const quality = getDegreeQuality(scale, degree)
  return { root, quality, degree, name: getChordName(root, quality) }
}

export function getProgressionChordName(
  rootNote: Note,
  scale: string,
  step: number,
  progressionKey: string
): string {
  return getProgressionChordAt(rootNote, scale, step, progressionKey)?.name ?? ''
}

/** Roman-numeral label for a progression, cased by each chord's quality. */
export function getProgressionLabel(scale: string, progressionKey: string): string {
  const numerals = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII']
  return getProgressionDegrees(scale, progressionKey)
    .map((degree) => {
      const quality = getDegreeQuality(scale, degree)
      const numeral = numerals[(degree - 1) % 7]
      if (quality === 'minor') return numeral.toLowerCase()
      if (quality === 'dim') return `${numeral.toLowerCase()}°`
      return numeral
    })
    .join('-')
}
