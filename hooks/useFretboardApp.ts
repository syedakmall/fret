'use client'

import { useCallback, useMemo, useState } from 'react'
import {
  CHORD_QUALITY_LABELS,
  NOTES,
  SCALES,
  SCALE_NAMES,
  STANDARD_TUNING,
  TUNINGS,
  getChordQuality,
  getDefaultTuning,
  getPositionCount,
  getVoicingCount,
  type ChordQuality,
  type Note,
} from '@/lib/music'
import { CHORD_PROGRESSIONS, PROGRESSION_KEYS } from '@/lib/music/progressions'
import { useAnnouncements } from './useAnnouncements'
import { useWood } from './useWood'

export type ViewMode = 'scale' | 'chords' | 'progressions'
export type DisplayMode = 'notes' | 'intervals' | 'degrees'
export type ProgressionViewMode = 'chord' | 'scale'

export const DISPLAY_MODES: DisplayMode[] = ['notes', 'intervals', 'degrees']
export const VIEW_MODES: ViewMode[] = ['scale', 'chords', 'progressions']

export const VIEW_MODE_LABELS: Record<ViewMode, string> = {
  scale: 'Scale',
  chords: 'Chords',
  progressions: 'Progressions',
}

export function useFretboardApp() {
  const { announcement, announce } = useAnnouncements()
  const { wood, setWood, cycleWood } = useWood()

  const [mode, setModeState] = useState<ViewMode>('scale')
  const [rootNote, setRootNote] = useState<Note>('A')
  const [scale, setScale] = useState('minorPentatonic')
  const [stringCount, setStringCount] = useState(6)
  const [tuning, setTuning] = useState('standard')
  const [displayMode, setDisplayMode] = useState<DisplayMode>('notes')
  const [position, setPosition] = useState<number | null>(null)
  const [leftHanded, setLeftHanded] = useState(false)

  const [showOnlyChordTones, setShowOnlyChordTones] = useState(false)
  const [selectedProgression, setSelectedProgression] = useState<string>(PROGRESSION_KEYS[1])
  const [showFingerings, setShowFingerings] = useState(true)
  const [progressionViewMode, setProgressionViewMode] = useState<ProgressionViewMode>('chord')
  // null follows the scale's own major/minor character
  const [chordQualityOverride, setChordQualityOverride] = useState<ChordQuality | null>(null)

  const chordQuality: ChordQuality = chordQualityOverride ?? getChordQuality(scale)
  const tuningNotes = TUNINGS[tuning] ?? STANDARD_TUNING

  /** Voicing indices are per chord, so re-clamp whenever the chord changes. */
  const clampVoicingIndex = useCallback((root: Note, quality: ChordQuality, tuningKey: string) => {
    setPosition((current) => {
      if (current === null) return current
      const count = getVoicingCount(root, quality, TUNINGS[tuningKey] ?? STANDARD_TUNING)
      return count > 0 ? Math.min(current, count - 1) : null
    })
  }, [])

  const setMode = useCallback(
    (next: ViewMode) => {
      setModeState(next)
      setShowOnlyChordTones(false)
      // Scale positions, voicings and progression steps are different indices
      setPosition(next === 'progressions' ? 0 : null)
      announce(`${VIEW_MODE_LABELS[next]} view`)
    },
    [announce]
  )

  const handleScaleChange = useCallback(
    (newScale: string) => {
      setScale(newScale)
      setPosition(mode === 'progressions' ? 0 : null)
      setChordQualityOverride(null)
      announce(`Scale changed to ${SCALE_NAMES[newScale]}`)
    },
    [announce, mode]
  )

  const handleRootChange = useCallback(
    (newRoot: Note) => {
      setRootNote(newRoot)
      if (mode === 'chords') clampVoicingIndex(newRoot, chordQuality, tuning)
      announce(`Key changed to ${newRoot}`)
    },
    [announce, mode, clampVoicingIndex, chordQuality, tuning]
  )

  const handlePositionChange = useCallback(
    (newPosition: number | null) => {
      setPosition(newPosition)
      announce(newPosition === null ? 'Showing the whole neck' : `Step ${newPosition + 1} selected`)
    },
    [announce]
  )

  const handleStringCountChange = useCallback(
    (count: number) => {
      const defaultTuning = getDefaultTuning(count)
      setStringCount(count)
      setTuning(defaultTuning)
      if (mode === 'chords') clampVoicingIndex(rootNote, chordQuality, defaultTuning)
      announce(`Switched to ${count} strings`)
    },
    [announce, mode, clampVoicingIndex, rootNote, chordQuality]
  )

  const handleTuningChange = useCallback(
    (newTuning: string) => {
      setTuning(newTuning)
      if (mode === 'chords') clampVoicingIndex(rootNote, chordQuality, newTuning)
    },
    [mode, clampVoicingIndex, rootNote, chordQuality]
  )

  const handleChordQualityChange = useCallback(
    (quality: ChordQuality) => {
      setChordQualityOverride(quality)
      clampVoicingIndex(rootNote, quality, tuning)
      announce(`Chord type changed to ${CHORD_QUALITY_LABELS[quality]}`)
    },
    [announce, clampVoicingIndex, rootNote, tuning]
  )

  const handleToggleDisplayMode = useCallback(() => {
    setDisplayMode((current) => {
      const next = DISPLAY_MODES[(DISPLAY_MODES.indexOf(current) + 1) % DISPLAY_MODES.length]
      announce(`Labels: ${next}`)
      return next
    })
  }, [announce])

  const cycleMode = useCallback(() => {
    setMode(VIEW_MODES[(VIEW_MODES.indexOf(mode) + 1) % VIEW_MODES.length])
  }, [mode, setMode])

  /** How many steps the stepper walks through in the current mode. */
  const stepCount = useMemo(() => {
    if (mode === 'chords') return getVoicingCount(rootNote, chordQuality, tuningNotes)
    if (mode === 'progressions') {
      return CHORD_PROGRESSIONS[selectedProgression]?.degreesMajor.length ?? 4
    }
    return getPositionCount(scale)
  }, [mode, selectedProgression, rootNote, chordQuality, tuningNotes, scale])

  const stepBy = useCallback(
    (delta: number) => {
      if (stepCount === 0) return
      setPosition((current) => {
        if (current === null) return delta > 0 ? 0 : stepCount - 1
        return (current + delta + stepCount) % stepCount
      })
    },
    [stepCount]
  )

  const handlePreviousPosition = useCallback(() => stepBy(-1), [stepBy])
  const handleNextPosition = useCallback(() => stepBy(1), [stepBy])

  const scaleFormula = SCALES[scale] ?? SCALES.minorPentatonic

  const scaleNotes = useMemo(
    () => scaleFormula.map((interval) => NOTES[(NOTES.indexOf(rootNote) + interval) % 12]),
    [rootNote, scaleFormula]
  )

  return {
    mode,
    rootNote,
    scale,
    stringCount,
    tuning,
    tuningNotes,
    displayMode,
    position,
    leftHanded,
    wood,
    showOnlyChordTones,
    selectedProgression,
    showFingerings,
    progressionViewMode,
    chordQuality,
    announcement,
    stepCount,

    setMode,
    cycleMode,
    handleScaleChange,
    handleRootChange,
    handlePositionChange,
    handleStringCountChange,
    handleTuningChange,
    handleChordQualityChange,
    handleToggleDisplayMode,
    handlePreviousPosition,
    handleNextPosition,
    setDisplayMode,
    setShowOnlyChordTones,
    setSelectedProgression,
    setShowFingerings,
    setProgressionViewMode,
    setLeftHanded,
    setWood,
    cycleWood,
    announce,

    scaleNotes,
    scaleFormula,
  }
}

export type UseFretboardApp = ReturnType<typeof useFretboardApp>
