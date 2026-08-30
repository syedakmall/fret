import { WOOD_KEYS, type WoodKey } from './wood'

const STORAGE_KEY = 'fretwork:wood'
const listeners = new Set<() => void>()
let current: WoodKey | null = null

function read(): WoodKey {
  if (current === null) {
    let stored: string | null = null
    try {
      stored = window.localStorage.getItem(STORAGE_KEY)
    } catch {
      // Private browsing or blocked storage: fall back to the default
    }
    current = stored && (WOOD_KEYS as string[]).includes(stored) ? (stored as WoodKey) : 'rosewood'
  }
  return current
}

export function getWoodSnapshot(): WoodKey {
  return read()
}

export function getWoodServerSnapshot(): WoodKey {
  return 'rosewood'
}

export function subscribeWood(listener: () => void): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function writeWood(wood: WoodKey): void {
  current = wood
  try {
    window.localStorage.setItem(STORAGE_KEY, wood)
  } catch {
    // The choice still applies for this session
  }
  listeners.forEach((listener) => listener())
}

export function nextWood(): WoodKey {
  return WOOD_KEYS[(WOOD_KEYS.indexOf(read()) + 1) % WOOD_KEYS.length]
}
