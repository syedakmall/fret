export type WoodKey = 'rosewood' | 'maple' | 'ebony'

export interface Wood {
  key: WoodKey
  label: string
  blurb: string
  /** Small gradient used for the picker swatch. */
  swatch: string
  /** Marker dot fill, tuned for contrast against the board. */
  inlay: string
  /** Board-appropriate colour for fret numbers printed under the neck. */
  scaleText: string
}

export const WOODS: Record<WoodKey, Wood> = {
  rosewood: {
    key: 'rosewood',
    label: 'Rosewood',
    blurb: 'Classic dark brown',
    swatch: 'linear-gradient(135deg, #4a3424 0%, #352317 100%)',
    inlay: '#ffffff',
    scaleText: '#c9a982',
  },
  maple: {
    key: 'maple',
    label: 'Maple',
    blurb: 'Bright blonde',
    swatch: 'linear-gradient(135deg, #ebd5b3 0%, #dcc29b 100%)',
    inlay: '#1a1a1a',
    scaleText: '#7a5a34',
  },
  ebony: {
    key: 'ebony',
    label: 'Ebony',
    blurb: 'Jet black',
    swatch: 'linear-gradient(135deg, #262626 0%, #121212 100%)',
    inlay: '#ffffff',
    scaleText: '#8b8f93',
  },
}

export const WOOD_KEYS = Object.keys(WOODS) as WoodKey[]

export function getWood(key: string | null | undefined): Wood {
  return WOODS[(key as WoodKey) ?? 'rosewood'] ?? WOODS.rosewood
}
