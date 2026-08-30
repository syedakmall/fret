'use client'

import { useCallback, useRef, useState } from 'react'

/** Screen-reader announcements, re-fired even when the text repeats. */
export function useAnnouncements() {
  const [announcement, setAnnouncement] = useState('')
  const counter = useRef(0)

  const announce = useCallback((message: string) => {
    counter.current += 1
    // A zero-width suffix makes a repeated message a new string for the live region
    setAnnouncement(message + '​'.repeat(counter.current % 2))
  }, [])

  return { announcement, announce }
}
