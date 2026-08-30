'use client'

import { SCALE_NAMES, type Note } from '@/lib/music'

const PRESETS: { root: Note; scale: string; blurb: string }[] = [
  { root: 'A', scale: 'minorPentatonic', blurb: 'Where every rock solo starts' },
  { root: 'E', scale: 'blues', blurb: 'Gritty, vocal, bendable' },
  { root: 'C', scale: 'major', blurb: 'The reference point' },
  { root: 'G', scale: 'mixolydian', blurb: 'Dominant, bluesy major' },
  { root: 'D', scale: 'dorian', blurb: 'Minor with a bright 6th' },
  { root: 'F#', scale: 'harmonicMinor', blurb: 'Neoclassical tension' },
]

export function QuickScales({ onSelect }: { onSelect: (root: Note, scale: string) => void }) {
  return (
    <div className="grid gap-2 p-5 sm:grid-cols-2 xl:grid-cols-3">
      {PRESETS.map((preset) => (
        <button
          key={`${preset.root}-${preset.scale}`}
          type="button"
          onClick={() => onSelect(preset.root, preset.scale)}
          className="rounded-lg border border-hairline bg-surface px-4 py-3 text-left transition-colors hover:border-ink hover:bg-orange-600/5"
        >
          <span className="block text-sm font-medium text-ink">
            {preset.root} {SCALE_NAMES[preset.scale]}
          </span>
          <span className="mt-0.5 block text-xs text-muted">{preset.blurb}</span>
        </button>
      ))}
    </div>
  )
}
