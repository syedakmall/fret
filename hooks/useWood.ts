'use client'

import { useCallback, useSyncExternalStore } from 'react'
import {
  getWoodServerSnapshot,
  getWoodSnapshot,
  nextWood,
  subscribeWood,
  writeWood,
} from '@/lib/wood-store'
import type { WoodKey } from '@/lib/wood'

/** Fretboard timber choice, shared across pages and remembered per browser. */
export function useWood() {
  const wood = useSyncExternalStore(subscribeWood, getWoodSnapshot, getWoodServerSnapshot)

  const setWood = useCallback((next: WoodKey) => writeWood(next), [])
  const cycleWood = useCallback(() => writeWood(nextWood()), [])

  return { wood, setWood, cycleWood }
}
