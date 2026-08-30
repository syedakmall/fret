'use client'

import { useMemo } from 'react'
import {
  DOUBLE_MARKERS,
  FRET_MARKERS,
  SCALES,
  getChordPitchClasses,
  getInterval,
  getIntervalName,
  getNoteAtFret,
  getPositions,
  getRootFret,
  getScaleDegree,
  getVoicing,
  noteIndex,
  type ChordQuality,
  type Note,
} from '@/lib/music'
import { getProgressionChordAt } from '@/lib/music/progressions'
import { fretMidi, getSynth } from '@/lib/audio/synth'
import type { WoodKey } from '@/lib/wood'
import type { DisplayMode, ProgressionViewMode, ViewMode } from '@/hooks/useFretboardApp'

export interface FretboardProps {
  mode: ViewMode
  rootNote: Note
  scale: string
  tuning: Note[]
  tuningKey: string
  wood: WoodKey
  displayMode: DisplayMode
  frets?: number
  position?: number | null
  leftHanded?: boolean
  showOnlyChordTones?: boolean
  chordQuality?: ChordQuality | null
  selectedProgression?: string | null
  progressionViewMode?: ProgressionViewMode
  showFingerings?: boolean
  /** "string:fret" keys to pulse, used by the practice player. */
  activeNotes?: Set<string>
  /** Practice mode drives its own audio, so notes there are not clickable. */
  silent?: boolean
}

const OPEN_COLUMN = 56

/** Fret widths taper toward the body, the way a real neck does. */
function fretWidths(count: number): number[] {
  return Array.from({ length: count }, (_, i) => Math.round(Math.max(30, 56 * Math.pow(0.976, i))))
}

/** Marker colours read against all three woods: dark root, sage third, sand fifth. */
function markerStyle(interval: number, dimmed: boolean): string {
  const fade = dimmed ? 'opacity-40 ' : ''
  if (interval === 0) return fade + 'bg-blue-600 text-white ring-2 ring-white'
  if (interval === 3 || interval === 4) return fade + 'bg-emerald-500 text-white ring-1 ring-white/80'
  if (interval === 7) return fade + 'bg-amber-500 text-white ring-1 ring-white/80'
  return fade + 'bg-surface text-slate-deep ring-1 ring-slate/20'
}

interface Cell {
  show: boolean
  label: string
  interval: number
  dimmed: boolean
  active: boolean
}

export default function Fretboard({
  mode,
  rootNote,
  scale,
  tuning,
  tuningKey,
  wood,
  displayMode,
  frets = 22,
  position = null,
  leftHanded = false,
  showOnlyChordTones = false,
  chordQuality = null,
  selectedProgression = null,
  progressionViewMode = 'chord',
  showFingerings = true,
  activeNotes,
  silent = false,
}: FretboardProps) {
  const formula = SCALES[scale] ?? SCALES.minorPentatonic
  const rootFret = getRootFret(rootNote, tuning)
  const positions = getPositions(scale)
  const widths = useMemo(() => fretWidths(frets), [frets])
  const offsets = useMemo(
    () => widths.reduce<number[]>((acc, width, i) => [...acc, (acc[i] ?? 0) + width], [0]),
    [widths]
  )
  const boardWidth = offsets[offsets.length - 1]
  const rowHeight = tuning.length > 6 ? 36 : 42
  const dotSize = Math.min(rowHeight - 6, 32)

  const progressionChord =
    mode === 'progressions' && selectedProgression && position !== null
      ? getProgressionChordAt(rootNote, scale, position, selectedProgression)
      : null

  // The chord, if any, whose shape the neck should draw
  const shownChord =
    mode === 'chords'
      ? { root: rootNote, quality: (chordQuality ?? 'major') as ChordQuality }
      : progressionChord && progressionViewMode === 'chord'
        ? { root: progressionChord.root, quality: progressionChord.quality }
        : null

  const voicing =
    shownChord && position !== null
      ? getVoicing(shownChord.root, shownChord.quality, position, tuning)
      : null

  // In the progression "scale" view the current chord's tones stay lit
  const highlightPitches =
    progressionChord && progressionViewMode === 'scale'
      ? getChordPitchClasses(progressionChord.root, progressionChord.quality)
      : null

  // Chord shapes colour their notes against the chord's own root
  const colourRoot = shownChord?.root ?? rootNote
  const chordPitches = shownChord ? getChordPitchClasses(shownChord.root, shownChord.quality) : null

  const isInPosition = (fret: number): boolean => {
    if (position === null || shownChord) return true
    const window = positions[position % positions.length]
    if (!window) return true
    for (const octave of [-12, 0, 12]) {
      const start = rootFret + window.start + octave
      const end = rootFret + window.end + octave
      if (fret >= Math.max(0, start) && fret <= end) return true
    }
    return false
  }

  function labelFor(note: Note): string {
    if (displayMode === 'intervals') return getIntervalName(colourRoot, note)
    if (displayMode === 'degrees') {
      const degree = getScaleDegree(note, rootNote, formula)
      return degree > 0 ? String(degree) : ''
    }
    return note
  }

  const cellFor = (stringIndex: number, fret: number): Cell => {
    const note = getNoteAtFret(tuning[stringIndex], fret)
    const interval = getInterval(colourRoot, note)
    const active = activeNotes?.has(`${stringIndex}:${fret}`) ?? false

    if (voicing) {
      const voiced = voicing.frets[stringIndex]
      const finger = voicing.fingers[stringIndex]
      return {
        show: voiced === fret,
        label: showFingerings && finger ? String(finger) : labelFor(note),
        interval,
        dimmed: false,
        active,
      }
    }

    // No shape chosen yet: light up every tone of the chord across the neck
    if (chordPitches) {
      return {
        show: chordPitches.has(noteIndex(note)),
        label: labelFor(note),
        interval,
        dimmed: false,
        active,
      }
    }

    const inScale = formula.includes(interval)
    if (!inScale) return { show: false, label: '', interval, dimmed: false, active }

    const isChordTone = interval === 0 || interval === 3 || interval === 4 || interval === 7
    if (showOnlyChordTones && !isChordTone) return { show: false, label: '', interval, dimmed: false, active }
    if (!isInPosition(fret)) return { show: false, label: '', interval, dimmed: false, active }

    return {
      show: true,
      label: labelFor(note),
      interval,
      dimmed: highlightPitches ? !highlightPitches.has(noteIndex(note)) : false,
      active,
    }
  }

  const playFret = (stringIndex: number, fret: number) => {
    if (silent) return
    const synth = getSynth()
    void synth.resume().then(() => synth.pluck(fretMidi(tuningKey, stringIndex, fret)))
  }

  const stringRows = tuning.map((_, i) => i).reverse() // highest string on top
  const mirror = leftHanded ? 'scaleX(-1)' : undefined
  const boardHeight = rowHeight * tuning.length

  return (
    <div className="relative">
      <div className="neck-scroll overflow-x-auto px-4 pb-3 sm:px-6">
        <div className="flex" style={{ minWidth: boardWidth + OPEN_COLUMN, transform: mirror }}>
          {/* Open strings */}
          <div className="sticky left-0 z-40 shrink-0 bg-raised pr-1" style={{ width: OPEN_COLUMN }}>
            <div
              className="flex h-6 items-end justify-center pb-1 text-[10px] font-medium uppercase tracking-[0.1em] text-muted"
              style={{ transform: mirror }}
            >
              open
            </div>
            {stringRows.map((stringIndex) => {
              const cell = cellFor(stringIndex, 0)
              const isMuted = voicing ? voicing.frets[stringIndex] === 'x' : false
              return (
                <div
                  key={stringIndex}
                  className="flex items-center justify-end gap-1.5"
                  style={{ height: rowHeight, transform: mirror }}
                >
                  <span className="font-mono text-[10px] text-muted">{tuning[stringIndex]}</span>
                  {isMuted ? (
                    <span
                      className="grid shrink-0 place-items-center text-xs text-muted"
                      style={{ width: dotSize - 6, height: dotSize - 6 }}
                      aria-label="muted string"
                    >
                      ×
                    </span>
                  ) : cell.show ? (
                    <button
                      type="button"
                      onClick={() => playFret(stringIndex, 0)}
                      aria-label={`${getNoteAtFret(tuning[stringIndex], 0)}, open string`}
                      className={`animate-pop grid shrink-0 place-items-center rounded-full text-[11px] font-semibold transition-transform hover:scale-110 ${markerStyle(
                        cell.interval,
                        cell.dimmed
                      )} ${cell.active ? 'ring-[4px] ring-orange-500 scale-125 z-40 shadow-md' : ''}`}
                      style={{ width: dotSize - 6, height: dotSize - 6 }}
                    >
                      {cell.label}
                    </button>
                  ) : (
                    <span
                      className="grid shrink-0 place-items-center"
                      style={{ width: dotSize - 6, height: dotSize - 6 }}
                    >
                      <span className="block h-1.5 w-1.5 rounded-full bg-sand" />
                    </span>
                  )}
                </div>
              )
            })}
          </div>

          {/* Neck */}
          <div className="relative">
            <div className="flex h-6 items-end pb-1">
              {widths.map((width, i) => (
                <div
                  key={i}
                  className="text-center font-mono text-[11px] font-medium text-muted select-none"
                  style={{ width, transform: mirror }}
                >
                  {FRET_MARKERS.includes(i + 1) ? i + 1 : ''}
                </div>
              ))}
            </div>

            <div
              className="board relative overflow-hidden rounded-r-lg"
              data-wood={wood}
              style={{ width: boardWidth, height: boardHeight }}
            >
              <div className="nut absolute inset-y-0 left-0 z-20 w-[6px]" />

              {widths.map((_, i) => (
                <div
                  key={`wire-${i}`}
                  className="fret-wire absolute inset-y-0 z-10 w-[2px]"
                  style={{ left: offsets[i + 1] - 1 }}
                />
              ))}

              {FRET_MARKERS.filter((fret) => fret <= frets).map((fret) => (
                <div
                  key={`inlay-${fret}`}
                  className="pointer-events-none absolute inset-y-0 z-0 flex flex-col items-center justify-center gap-7"
                  style={{ left: offsets[fret - 1], width: widths[fret - 1] }}
                >
                  {(DOUBLE_MARKERS.includes(fret) ? [0, 1] : [0]).map((dot) => (
                    <span
                      key={dot}
                      className="block rounded-full"
                      style={{
                        width: DOUBLE_MARKERS.includes(fret) ? 12 : 14,
                        height: DOUBLE_MARKERS.includes(fret) ? 12 : 14,
                        background: 'var(--inlay)',
                        opacity: 0.8,
                      }}
                    />
                  ))}
                </div>
              ))}

              {stringRows.map((stringIndex, row) => (
                <div
                  key={`string-${stringIndex}`}
                  className="gut-string pointer-events-none absolute left-0 right-0 z-10 rounded-full"
                  style={{
                    top: row * rowHeight + rowHeight / 2,
                    height: 1 + (stringIndex / Math.max(1, tuning.length - 1)) * 2.2,
                  }}
                />
              ))}

              {voicing?.barre !== undefined && (
                <div
                  className="pointer-events-none absolute z-20 rounded-full bg-black/30 ring-1 ring-white/30"
                  style={{
                    left: offsets[voicing.barre - 1] + widths[voicing.barre - 1] / 2 - 9,
                    width: 18,
                    top: 6,
                    height: boardHeight - 12,
                  }}
                />
              )}

              {stringRows.map((stringIndex, row) =>
                widths.map((width, i) => {
                  const fret = i + 1
                  const cell = cellFor(stringIndex, fret)
                  if (!cell.show) return null
                  const note = getNoteAtFret(tuning[stringIndex], fret)
                  return (
                    <button
                      key={`n-${stringIndex}-${fret}`}
                      type="button"
                      onClick={() => playFret(stringIndex, fret)}
                      aria-label={`${note}, string ${tuning.length - stringIndex}, fret ${fret}`}
                      className={`animate-pop absolute z-30 grid place-items-center rounded-full text-[11px] font-semibold shadow-sm transition-transform hover:scale-110 ${markerStyle(
                        cell.interval,
                        cell.dimmed
                      )} ${cell.active ? 'ring-[4px] ring-orange-500 scale-125 z-40 shadow-md' : ''}`}
                      style={{
                        left: offsets[i] + width / 2 - dotSize / 2,
                        top: row * rowHeight + rowHeight / 2 - dotSize / 2,
                        width: dotSize,
                        height: dotSize,
                        transform: mirror,
                      }}
                    >
                      {cell.label}
                    </button>
                  )
                })
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Scroll affordance */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-raised to-transparent"
      />
    </div>
  )
}
