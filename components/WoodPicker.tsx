'use client'

import { WOODS, WOOD_KEYS, type WoodKey } from '@/lib/wood'

export function WoodPicker({
  wood,
  onChange,
  compact = false,
}: {
  wood: WoodKey
  onChange: (wood: WoodKey) => void
  compact?: boolean
}) {
  return (
    <div role="radiogroup" aria-label="Fretboard wood" className="grid grid-cols-3 gap-2">
      {WOOD_KEYS.map((key) => {
        const option = WOODS[key]
        const selected = key === wood
        return (
          <button
            key={key}
            type="button"
            role="radio"
            aria-checked={selected}
            aria-label={option.label}
            title={option.blurb}
            onClick={() => onChange(key)}
            className={`group rounded-lg border p-1.5 text-left transition-all ${
              selected
                ? 'border-orange-500 bg-orange-50/50'
                : 'border-hairline bg-surface hover:border-slate/60'
            }`}
          >
            <span
              aria-hidden
              className={`block w-full rounded-md ring-1 ring-black/15 ${compact ? 'h-6' : 'h-9'}`}
              style={{ backgroundImage: option.swatch }}
            />
            <span
              className={`mt-1.5 block text-center text-[11px] font-medium ${
                selected ? 'text-orange-700' : 'text-muted'
              }`}
            >
              {option.label}
            </span>
          </button>
        )
      })}
    </div>
  )
}
