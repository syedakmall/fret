'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  SCALES,
  STANDARD_TUNING,
  TUNINGS,
  getChordName,
  getChordQuality,
  getDefaultTuning,
  getInterval,
  getNoteAtFret,
  getPositions,
  getRootFret,
  getStringSets,
  getTriadShapes,
  getVoicing,
  getVoicingCount,
  INVERSION_NAMES,
  type ChordQuality,
  type Note,
} from '@/lib/music'
import { CHORD_PROGRESSIONS, getProgressionChordAt } from '@/lib/music/progressions'
import { fretMidi, getSynth } from '@/lib/audio/synth'
import { useWood } from './useWood'

export type PracticeMode = 'scale' | 'chord' | 'triad' | 'progression'
export type ScaleDirection = 'up' | 'down' | 'upDown'

export interface PracticeStep {
  /** [stringIndex, fret] pairs sounded on this beat. */
  notes: [number, number][]
  label: string
  /** Chords are strummed; single notes are plucked. */
  strum: boolean
}

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))

export function usePracticeSession() {
  const { wood, setWood } = useWood()

  const [mode, setMode] = useState<PracticeMode>('scale')
  const [rootNote, setRootNote] = useState<Note>('A')
  const [scale, setScale] = useState('minorPentatonic')
  const [stringCount, setStringCount] = useState(6)
  const [tuningKey, setTuningKey] = useState('standard')
  const [position, setPosition] = useState(0)
  const [chordQualityOverride, setChordQualityOverride] = useState<ChordQuality | null>(null)
  const [scaleDirection, setScaleDirection] = useState<ScaleDirection>('upDown')
  const [triadStringSetIndex, setTriadStringSetIndex] = useState(0)
  const [selectedProgression, setSelectedProgression] = useState('1-5-6-4')
  const [bpm, setBpm] = useState(84)
  const [metronomeOn, setMetronomeOn] = useState(true)
  const [arpeggioOn, setArpeggioOn] = useState(false)
  const [showFingerings, setShowFingerings] = useState(true)
  const [showOnlyChordTones, setShowOnlyChordTones] = useState(false)
  const [leftHanded, setLeftHanded] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [stepIndex, setStepIndex] = useState(0)

  const tuning = TUNINGS[tuningKey] ?? STANDARD_TUNING
  const chordQuality: ChordQuality = chordQualityOverride ?? getChordQuality(scale)
  const formula = SCALES[scale] ?? SCALES.minorPentatonic
  const stringSets = useMemo(() => getStringSets(tuning.length), [tuning.length])

  const handleStringCountChange = useCallback((count: number) => {
    setStringCount(count)
    setTuningKey(getDefaultTuning(count))
    setTriadStringSetIndex(0)
    setStepIndex(0)
  }, [])

  const setKey = useCallback((root: Note, nextScale: string) => {
    setRootNote(root)
    setScale(nextScale)
    setChordQualityOverride(null)
    setPosition(0)
    setStepIndex(0)
  }, [])

  /** The beat-by-beat sequence for the current settings. */
  const steps = useMemo<PracticeStep[]>(() => {
    if (mode === 'scale') {
      const windows = getPositions(scale)
      const window = windows[clamp(position, 0, windows.length - 1)]
      const rootFret = getRootFret(rootNote, tuning)
      const start = Math.max(0, rootFret + window.start)
      const end = rootFret + window.end
      const ascending: PracticeStep[] = []
      for (let s = 0; s < tuning.length; s++) {
        for (let fret = start; fret <= end; fret++) {
          const note = getNoteAtFret(tuning[s], fret)
          if (!formula.includes(getInterval(rootNote, note))) continue
          ascending.push({ notes: [[s, fret]], label: note, strum: false })
        }
      }
      if (ascending.length === 0) return []
      if (scaleDirection === 'up') return ascending
      if (scaleDirection === 'down') return [...ascending].reverse()
      return [...ascending, ...[...ascending].slice(0, -1).reverse().slice(0, -1)]
    }

    if (mode === 'chord') {
      const count = getVoicingCount(rootNote, chordQuality, tuning)
      if (count === 0) return []
      const voicing = getVoicing(rootNote, chordQuality, clamp(position, 0, count - 1), tuning)
      if (!voicing) return []
      const sounding = voicing.frets
        .map((fret, s) => (fret === 'x' ? null : ([s, fret] as [number, number])))
        .filter((entry): entry is [number, number] => entry !== null)
      const name = `${getChordName(rootNote, chordQuality)} (${voicing.shape})`
      if (arpeggioOn) {
        return sounding.map(([s, fret]) => ({
          notes: [[s, fret]] as [number, number][],
          label: `${name} · ${getNoteAtFret(tuning[s], fret)}`,
          strum: false,
        }))
      }
      return [{ notes: sounding, label: name, strum: true }]
    }

    if (mode === 'triad') {
      const set = stringSets[clamp(triadStringSetIndex, 0, Math.max(0, stringSets.length - 1))]
      if (!set) return []
      const shapes = getTriadShapes(rootNote, chordQuality, tuning, set.strings)
      return shapes.flatMap<PracticeStep>((shape) => {
        const label = `${getChordName(rootNote, chordQuality)} · ${INVERSION_NAMES[shape.inversion] ?? ''}`
        if (arpeggioOn) {
          return shape.notes.map(([s, fret]) => ({
            notes: [[s, fret]] as [number, number][],
            label: `${label} · ${getNoteAtFret(tuning[s], fret)}`,
            strum: false,
          }))
        }
        return [{ notes: shape.notes, label, strum: true }]
      })
    }

    // progression
    const degrees = CHORD_PROGRESSIONS[selectedProgression]?.degreesMajor ?? []
    return degrees.flatMap<PracticeStep>((_, index) => {
      const chord = getProgressionChordAt(rootNote, scale, index, selectedProgression)
      if (!chord) return []
      const voicing = getVoicing(chord.root, chord.quality, position, tuning)
      if (!voicing) return []
      const sounding = voicing.frets
        .map((fret, s) => (fret === 'x' ? null : ([s, fret] as [number, number])))
        .filter((entry): entry is [number, number] => entry !== null)
      if (arpeggioOn) {
        return sounding.map(([s, fret]) => ({
          notes: [[s, fret]] as [number, number][],
          label: `${chord.name} · ${getNoteAtFret(tuning[s], fret)}`,
          strum: false,
        }))
      }
      return [{ notes: sounding, label: chord.name, strum: true }]
    })
  }, [
    mode,
    scale,
    position,
    rootNote,
    tuning,
    formula,
    scaleDirection,
    chordQuality,
    arpeggioOn,
    stringSets,
    triadStringSetIndex,
    selectedProgression,
  ])

  const stepCount = steps.length
  const currentStep = stepCount > 0 ? steps[stepIndex % stepCount] : null

  const activeNotes = useMemo(() => {
    const set = new Set<string>()
    currentStep?.notes.forEach(([s, fret]) => set.add(`${s}:${fret}`))
    return set
  }, [currentStep])

  // Beat clock: plays the current step and advances on each beat
  const stepRef = useRef(0)
  useEffect(() => {
    stepRef.current = stepIndex
  }, [stepIndex])

  useEffect(() => {
    if (!isPlaying || stepCount === 0) return
    const synth = getSynth()
    void synth.resume()
    const interval = (60 / bpm) * 1000

    const tick = () => {
      const index = stepRef.current % stepCount
      const step = steps[index]
      if (metronomeOn) synth.click(0, index % 4 === 0)
      if (step) {
        const midis = step.notes.map(([s, fret]) => fretMidi(tuningKey, s, fret))
        if (step.strum) synth.strum(midis)
        else midis.forEach((midi) => synth.pluck(midi, 0, Math.min(1.2, (60 / bpm) * 1.6)))
      }
      setStepIndex((current) => (current + 1) % stepCount)
    }

    tick()
    const id = window.setInterval(tick, interval)
    return () => window.clearInterval(id)
  }, [isPlaying, bpm, stepCount, steps, metronomeOn, tuningKey])

  const togglePlay = useCallback(() => {
    setIsPlaying((playing) => {
      if (!playing) void getSynth().resume()
      return !playing
    })
  }, [])

  // A settings change restarts the phrase rather than landing mid-sequence
  const sequenceKey = [
    mode,
    scale,
    rootNote,
    tuningKey,
    position,
    chordQuality,
    arpeggioOn,
    scaleDirection,
    triadStringSetIndex,
    selectedProgression,
  ].join('|')
  const [lastSequenceKey, setLastSequenceKey] = useState(sequenceKey)
  if (sequenceKey !== lastSequenceKey) {
    setLastSequenceKey(sequenceKey)
    setStepIndex(0)
  }

  const currentChordIndex = useMemo(() => {
    if (mode !== 'progression' || stepCount === 0) return 0
    const degrees = CHORD_PROGRESSIONS[selectedProgression]?.degreesMajor ?? []
    const perChord = Math.max(1, Math.floor(stepCount / Math.max(1, degrees.length)))
    return Math.floor((stepIndex % stepCount) / perChord)
  }, [mode, stepCount, stepIndex, selectedProgression])

  const currentChord = useMemo(
    () =>
      mode === 'progression'
        ? getProgressionChordAt(rootNote, scale, currentChordIndex, selectedProgression)
        : null,
    [mode, rootNote, scale, currentChordIndex, selectedProgression]
  )

  return {
    mode,
    rootNote,
    scale,
    stringCount,
    tuningKey,
    tuning,
    position,
    chordQuality,
    scaleDirection,
    stringSets,
    triadStringSetIndex,
    selectedProgression,
    bpm,
    metronomeOn,
    arpeggioOn,
    showFingerings,
    showOnlyChordTones,
    leftHanded,
    wood,
    isPlaying,
    steps,
    stepIndex,
    stepCount,
    currentStep,
    currentChord,
    currentChordIndex,
    activeNotes,

    setMode,
    setRootNote,
    setScale,
    setKey,
    setStringCount: handleStringCountChange,
    setTuningKey,
    setPosition,
    setChordQuality: setChordQualityOverride,
    setScaleDirection,
    setTriadStringSetIndex,
    setSelectedProgression,
    setBpm,
    setMetronomeOn,
    setArpeggioOn,
    setShowFingerings,
    setShowOnlyChordTones,
    setLeftHanded,
    setWood,
    setStepIndex,
    togglePlay,
  }
}
