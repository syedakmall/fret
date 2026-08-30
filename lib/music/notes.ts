export const NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'] as const
export type Note = (typeof NOTES)[number]

export const INTERVAL_NAMES: Record<number, string> = {
  0: 'R',
  1: 'b2',
  2: '2',
  3: 'b3',
  4: '3',
  5: '4',
  6: 'b5',
  7: '5',
  8: 'b6',
  9: '6',
  10: 'b7',
  11: '7',
}

export const FRET_MARKERS = [3, 5, 7, 9, 12, 15, 17, 19, 21, 24]
export const DOUBLE_MARKERS = [12, 24]

export function noteIndex(note: Note): number {
  return NOTES.indexOf(note)
}

export function getNoteAtFret(openNote: Note, fret: number): Note {
  return NOTES[(noteIndex(openNote) + fret) % 12]
}

/** Semitone distance from root up to note, 0-11. */
export function getInterval(rootNote: Note, note: Note): number {
  return (noteIndex(note) - noteIndex(rootNote) + 12) % 12
}

export function getIntervalName(rootNote: Note, note: Note): string {
  return INTERVAL_NAMES[getInterval(rootNote, note)] ?? ''
}

export function isNoteInScale(note: Note, rootNote: Note, formula: number[]): boolean {
  return formula.includes(getInterval(rootNote, note))
}

/** 1-based degree of a note within a scale formula, or 0 when it is not in the scale. */
export function getScaleDegree(note: Note, rootNote: Note, formula: number[]): number {
  return formula.indexOf(getInterval(rootNote, note)) + 1
}

/** Lowest fret on the lowest string where the root note sits (0-11). */
export function getRootFret(rootNote: Note, tuning: Note[]): number {
  return (noteIndex(rootNote) - noteIndex(tuning[0]) + 12) % 12
}

/** MIDI note number for an open string, given its position in a low-to-high tuning. */
export function transpose(note: Note, semitones: number): Note {
  return NOTES[(noteIndex(note) + (semitones % 12) + 12) % 12]
}
