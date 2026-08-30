'use client'

import {
  getPositionName,
  getPositions,
  getRootFret,
  getVoicings,
  type ChordQuality,
  type Note,
} from '@/lib/music'
import { CHORD_PROGRESSIONS, getProgressionChordAt } from '@/lib/music/progressions'
import type { ViewMode } from '@/hooks/useFretboardApp'
import { IconButton } from './ui'

interface Option {
  index: number
  label: string
  sub: string
}

interface Props {
  mode: ViewMode
  rootNote: Note
  scale: string
  tuning: Note[]
  chordQuality: ChordQuality
  selectedProgression: string
  position: number | null
  onPositionChange: (position: number | null) => void
}

/** The one place a player moves along the neck: whole-neck, prev/next, or a direct pick. */
export function StepBar({
  mode,
  rootNote,
  scale,
  tuning,
  chordQuality,
  selectedProgression,
  position,
  onPositionChange,
}: Props) {
  let title = 'Position'
  let allLabel = 'Whole neck'
  let options: Option[] = []

  if (mode === 'chords') {
    title = 'Voicing'
    allLabel = 'All shapes'
    options = getVoicings(rootNote, chordQuality, tuning).map((voicing, index) => ({
      index,
      label: `${voicing.shape} shape`,
      sub: voicing.hasOpen ? 'open' : `fret ${voicing.baseFret}`,
    }))
  } else if (mode === 'progressions') {
    title = 'Chord'
    allLabel = ''
    const degrees = CHORD_PROGRESSIONS[selectedProgression]?.degreesMajor ?? []
    options = degrees.map((_, index) => {
      const chord = getProgressionChordAt(rootNote, scale, index, selectedProgression)
      return { index, label: chord?.name ?? '—', sub: `${index + 1}` }
    })
  } else {
    const rootFret = getRootFret(rootNote, tuning)
    options = getPositions(scale).map((window, index) => ({
      index,
      label: getPositionName(scale, index),
      sub: `${Math.max(0, rootFret + window.start)}–${rootFret + window.end}`,
    }))
  }

  const step = (delta: number) => {
    if (options.length === 0) return
    if (position === null) {
      onPositionChange(delta > 0 ? 0 : options.length - 1)
      return
    }
    onPositionChange((position + delta + options.length) % options.length)
  }

  const current = position === null ? null : options[position % Math.max(1, options.length)]

  return (
    <div className="rounded-xl border border-hairline bg-surface p-2">
      <div className="flex items-center justify-between gap-2 px-1">
        <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted">
          {title}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="min-w-24 text-right text-xs font-medium text-ink">
            {current ? `${current.label}` : allLabel || '—'}
          </span>
          <IconButton label={`Previous ${title.toLowerCase()}`} onClick={() => step(-1)}>
            ‹
          </IconButton>
          <IconButton label={`Next ${title.toLowerCase()}`} onClick={() => step(1)}>
            ›
          </IconButton>
        </span>
      </div>

      <div className="mt-2 flex flex-wrap gap-1.5">
        {allLabel && (
          <button
            type="button"
            aria-pressed={position === null}
            onClick={() => onPositionChange(null)}
            className={`rounded-none border-2 px-2.5 py-1.5 font-pixel text-lg transition-transform hover:-translate-y-0.5 active:translate-y-1 ${
              position === null
                ? 'border-black bg-[#ff3366] text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-none'
                : 'border-black bg-white text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-none'
            }`}
          >
            {allLabel}
          </button>
        )}
        {options.map((option) => {
          const selected = position === option.index
          return (
            <button
              key={option.index}
              type="button"
              aria-pressed={selected}
              onClick={() => onPositionChange(option.index)}
              title={`${option.label} · ${option.sub}`}
              className={`rounded-none border-2 px-2.5 py-1.5 font-pixel text-lg transition-transform hover:-translate-y-0.5 active:translate-y-1 ${
                selected
                  ? 'border-black bg-[#ff3366] text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-none'
                  : 'border-black bg-white text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-none'
              }`}
            >
              {option.label}
              <span className={`ml-1.5 font-pixel text-[14px] ${selected ? 'text-white/70' : 'text-black/70'}`}>
                {option.sub}
              </span>
            </button>
          )
        })}
        {options.length === 0 && (
          <span className="px-1 py-1 text-xs text-muted">No shapes for this tuning.</span>
        )}
      </div>
    </div>
  )
}
