import { getNoteAtFret, noteIndex, type Note } from './notes'
import { getChordIntervals, getChordPitchClasses, type ChordQuality } from './chords'

export interface StringSet {
  strings: number[]
  label: string
}

/** Adjacent three-string groups, labelled the way players count strings. */
export function getStringSets(stringCount: number): StringSet[] {
  const sets: StringSet[] = []
  for (let low = 0; low + 2 < stringCount; low++) {
    const strings = [low, low + 1, low + 2]
    sets.push({
      strings,
      label: strings
        .map((s) => stringCount - s)
        .join('-'),
    })
  }
  return sets
}

export interface TriadShape {
  /** [stringIndex, fret] pairs, low to high. */
  notes: [number, number][]
  lowestFret: number
  /** 0 = root position, 1 = first inversion, 2 = second inversion. */
  inversion: number
}

const MAX_SPAN = 4

/** Close-voiced triads walking up one string set. */
export function getTriadShapes(
  root: Note,
  quality: ChordQuality,
  tuning: Note[],
  strings: number[],
  maxFret = 15
): TriadShape[] {
  const pitches = getChordPitchClasses(root, quality)
  const intervals = getChordIntervals(quality)
  const rootPitch = noteIndex(root)
  const shapes: TriadShape[] = []
  const seen = new Set<string>()

  for (let start = 0; start <= maxFret; start++) {
    const notes: [number, number][] = []
    let ok = true
    let previous = start
    for (const stringIndex of strings) {
      let found = -1
      for (let fret = previous; fret <= previous + MAX_SPAN && fret <= maxFret + MAX_SPAN; fret++) {
        if (pitches.has(noteIndex(getNoteAtFret(tuning[stringIndex], fret)))) {
          found = fret
          break
        }
      }
      if (found < 0) {
        ok = false
        break
      }
      notes.push([stringIndex, found])
      previous = Math.max(start, found - 1)
    }
    if (!ok || notes.length !== strings.length) continue
    const frets = notes.map(([, fret]) => fret)
    if (Math.max(...frets) - Math.min(...frets) > MAX_SPAN) continue

    const signature = notes.map(([s, f]) => `${s}:${f}`).join(',')
    if (seen.has(signature)) continue
    seen.add(signature)

    const bassPitch = noteIndex(getNoteAtFret(tuning[notes[0][0]], notes[0][1]))
    const bassInterval = (bassPitch - rootPitch + 12) % 12
    const inversion = Math.max(0, intervals.indexOf(bassInterval))
    shapes.push({ notes, lowestFret: Math.min(...frets), inversion })
  }

  return shapes.sort((a, b) => a.lowestFret - b.lowestFret)
}

export const INVERSION_NAMES = ['Root position', '1st inversion', '2nd inversion']
