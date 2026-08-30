import { NOTES, getInterval, getNoteAtFret, noteIndex, type Note } from './notes'
import { SCALES } from './scales'
import { STANDARD_TUNING } from './tunings'

export type ChordQuality =
  | 'major' | 'minor' | 'dim' | 'aug' | 'sus2' | 'sus4'
  | 'maj7' | 'm7' | 'dom7' | 'm7b5' | 'dim7' | 'maj6' | 'm6'

export const CHORD_INTERVALS: Record<ChordQuality, number[]> = {
  major: [0, 4, 7],
  minor: [0, 3, 7],
  dim: [0, 3, 6],
  aug: [0, 4, 8],
  sus2: [0, 2, 7],
  sus4: [0, 5, 7],
  maj7: [0, 4, 7, 11],
  m7: [0, 3, 7, 10],
  dom7: [0, 4, 7, 10],
  m7b5: [0, 3, 6, 10],
  dim7: [0, 3, 6, 9],
  maj6: [0, 4, 7, 9],
  m6: [0, 3, 7, 9],
}

export const CHORD_QUALITY_LABELS: Record<ChordQuality, string> = {
  major: 'Major',
  minor: 'Minor',
  dim: 'Diminished',
  aug: 'Augmented',
  sus2: 'Sus2',
  sus4: 'Sus4',
  maj7: 'Major 7th',
  m7: 'Minor 7th',
  dom7: 'Dominant 7th',
  m7b5: 'Half Diminished',
  dim7: 'Diminished 7th',
  maj6: 'Major 6th',
  m6: 'Minor 6th',
}

export const CHORD_SUFFIXES: Record<ChordQuality, string> = {
  major: '',
  minor: 'm',
  dim: '°',
  aug: '+',
  sus2: 'sus2',
  sus4: 'sus4',
  maj7: 'maj7',
  m7: 'm7',
  dom7: '7',
  m7b5: 'm7b5',
  dim7: '°7',
  maj6: '6',
  m6: 'm6',
}

export const CHORD_QUALITIES = Object.keys(CHORD_INTERVALS) as ChordQuality[]

export interface ChordVoicing {
  /** Fret per string, low to high. 'x' means muted. */
  frets: (number | 'x')[]
  /** Fretting-hand finger per string, low to high. null for open or muted. */
  fingers: (number | null)[]
  baseFret: number
  /** True when the shape rings any open string. */
  hasOpen: boolean
  barre?: number
  shape: string
  rootString: number
  rootFret: number
}

/** Major or minor character of a scale, taken from its third. */
export function getChordQuality(scale: string): 'major' | 'minor' {
  const formula = SCALES[scale] ?? SCALES.minorPentatonic
  if (formula.includes(3)) return 'minor'
  if (formula.includes(4)) return 'major'
  return 'major'
}

export function getChordIntervals(quality: ChordQuality): number[] {
  return CHORD_INTERVALS[quality] ?? CHORD_INTERVALS.major
}

export function getChordName(root: Note, quality: ChordQuality): string {
  return `${root}${CHORD_SUFFIXES[quality]}`
}

/** Pitch classes (0-11) sounded by a chord. */
export function getChordPitchClasses(root: Note, quality: ChordQuality): Set<number> {
  const rootIdx = noteIndex(root)
  return new Set(getChordIntervals(quality).map((i) => (rootIdx + i) % 12))
}

export function isChordTone(note: Note, root: Note, quality: ChordQuality): boolean {
  return getChordIntervals(quality).includes(getInterval(root, note))
}

const CAGED_BY_ROOT_STRING = ['E', 'A', 'D', 'G', 'C']

function shapeName(rootString: number, tuning: Note[]): string {
  const isStandardSix =
    tuning.length === 6 && tuning.every((n, i) => n === STANDARD_TUNING[i])
  if (isStandardSix && rootString < CAGED_BY_ROOT_STRING.length) {
    return CAGED_BY_ROOT_STRING[rootString]
  }
  // Strings are numbered high-to-low by players, so invert the low-to-high index
  return `${tuning.length - rootString}th-string`
}

const MAX_BASE_FRET = 15
const SPAN = 3

/**
 * Build playable root-position voicings across the neck for any tuning.
 * For each base fret we take a four-fret window, mute the strings below the
 * lowest available root, then let every higher string take the lowest chord
 * tone it can reach.
 */
export function generateVoicings(
  root: Note,
  quality: ChordQuality,
  tuning: Note[] = STANDARD_TUNING
): ChordVoicing[] {
  const pitches = getChordPitchClasses(root, quality)
  const rootPitch = noteIndex(root)
  const wanted = Math.min(3, pitches.size)
  const seen = new Set<string>()
  const voicings: ChordVoicing[] = []

  for (let baseFret = 0; baseFret <= MAX_BASE_FRET; baseFret++) {
    const allowOpen = baseFret <= 2
    const candidates = (stringIdx: number): number[] => {
      const open = tuning[stringIdx]
      const frets: number[] = []
      if (allowOpen && pitches.has(noteIndex(getNoteAtFret(open, 0)))) frets.push(0)
      for (let f = Math.max(baseFret, 1); f <= baseFret + SPAN; f++) {
        if (pitches.has(noteIndex(getNoteAtFret(open, f)))) frets.push(f)
      }
      return frets
    }

    // The lowest string that can sound the root anchors the voicing
    let rootString = -1
    let rootFret = -1
    for (let s = 0; s < tuning.length && rootString < 0; s++) {
      for (const f of candidates(s)) {
        if (noteIndex(getNoteAtFret(tuning[s], f)) === rootPitch) {
          rootString = s
          rootFret = f
          break
        }
      }
    }
    if (rootString < 0) continue

    const frets: (number | 'x')[] = tuning.map((_, s) => {
      if (s < rootString) return 'x'
      if (s === rootString) return rootFret
      const options = candidates(s)
      return options.length > 0 ? options[0] : 'x'
    })

    const sounding = frets.filter((f): f is number => f !== 'x')
    if (sounding.length < 3) continue
    // A muted string between two sounding ones is not realistically playable
    const lastSounding = frets.reduce<number>((last, f, i) => (f === 'x' ? last : i), -1)
    if (frets.slice(rootString, lastSounding).includes('x')) continue
    const covered = new Set(
      frets.map((f, s) => (f === 'x' ? -1 : noteIndex(getNoteAtFret(tuning[s], f)))).filter((p) => p >= 0)
    )
    if (covered.size < wanted) continue

    const signature = frets.join(',')
    if (seen.has(signature)) continue
    seen.add(signature)

    const fretted = sounding.filter((f) => f > 0)
    const lowestFretted = fretted.length > 0 ? Math.min(...fretted) : 0
    const fingers = frets.map((f) => {
      if (f === 'x' || f === 0) return null
      return Math.min(4, Math.max(1, f - lowestFretted + 1))
    })
    const barreCount = fretted.filter((f) => f === lowestFretted).length

    voicings.push({
      frets,
      fingers,
      baseFret: lowestFretted,
      hasOpen: sounding.some((f) => f === 0),
      barre: barreCount >= 2 && lowestFretted > 0 ? lowestFretted : undefined,
      shape: shapeName(rootString, tuning),
      rootString,
      rootFret,
    })
  }

  // One shape per fret position keeps the picker readable
  const byShapeAndFret = new Map<string, ChordVoicing>()
  for (const voicing of voicings) {
    const key = `${voicing.shape}:${voicing.baseFret}`
    if (!byShapeAndFret.has(key)) byShapeAndFret.set(key, voicing)
  }
  return [...byShapeAndFret.values()].sort((a, b) => a.baseFret - b.baseFret)
}

const voicingCache = new Map<string, ChordVoicing[]>()

export function getVoicings(
  root: Note,
  quality: ChordQuality,
  tuning: Note[] = STANDARD_TUNING
): ChordVoicing[] {
  const key = `${root}|${quality}|${tuning.join('')}`
  const cached = voicingCache.get(key)
  if (cached) return cached
  const built = generateVoicings(root, quality, tuning)
  voicingCache.set(key, built)
  return built
}

export function getVoicingCount(
  root: Note,
  quality: ChordQuality,
  tuning: Note[] = STANDARD_TUNING
): number {
  return getVoicings(root, quality, tuning).length
}

export function getVoicing(
  root: Note,
  quality: ChordQuality,
  index: number,
  tuning: Note[] = STANDARD_TUNING
): ChordVoicing | null {
  const voicings = getVoicings(root, quality, tuning)
  if (voicings.length === 0) return null
  return voicings[((index % voicings.length) + voicings.length) % voicings.length]
}

export function getChordNameForVoicing(
  root: Note,
  quality: ChordQuality,
  index: number | null,
  tuning: Note[] = STANDARD_TUNING
): string {
  const name = getChordName(root, quality)
  if (index === null) return name
  const voicing = getVoicing(root, quality, index, tuning)
  return voicing ? `${name} (${voicing.shape} shape)` : name
}

/** Notes of a chord, spelled from the root upward. */
export function getChordNotes(root: Note, quality: ChordQuality): Note[] {
  const rootIdx = noteIndex(root)
  return getChordIntervals(quality).map((i) => NOTES[(rootIdx + i) % 12])
}
