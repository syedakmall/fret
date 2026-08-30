'use client'

import { useEffect } from 'react'

interface Shortcuts {
  onPreviousPosition?: () => void
  onNextPosition?: () => void
  onToggleDisplayMode?: () => void
  onToggleChordsMode?: () => void
  onCycleWood?: () => void
  onTogglePlay?: () => void
}

const EDITABLE = new Set(['INPUT', 'TEXTAREA', 'SELECT'])

export function useKeyboardShortcuts(handlers: Shortcuts) {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null
      if (target && (EDITABLE.has(target.tagName) || target.isContentEditable)) return
      if (event.metaKey || event.ctrlKey || event.altKey) return

      switch (event.key) {
        case '[':
          handlers.onPreviousPosition?.()
          break
        case ']':
          handlers.onNextPosition?.()
          break
        case 'd':
        case 'D':
          handlers.onToggleDisplayMode?.()
          break
        case 'c':
        case 'C':
          handlers.onToggleChordsMode?.()
          break
        case 'w':
        case 'W':
          handlers.onCycleWood?.()
          break
        case ' ':
          if (handlers.onTogglePlay) {
            event.preventDefault()
            handlers.onTogglePlay()
          }
          break
        default:
          return
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [handlers])
}
