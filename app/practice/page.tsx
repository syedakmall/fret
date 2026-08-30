'use client'

import { AppHeader } from '@/components/AppHeader'
import Fretboard from '@/components/Fretboard'
import { PracticeControls } from '@/components/PracticeControls'
import { Badge, Card, CardHeader, Tabs } from '@/components/ui'
import { usePracticeSession, type PracticeMode } from '@/hooks/usePracticeSession'
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts'
import { SCALE_NAMES, getChordName, getInstrumentName } from '@/lib/music'
import { WOODS } from '@/lib/wood'

const MODE_OPTIONS: { value: PracticeMode; label: string }[] = [
  { value: 'scale', label: 'Scale' },
  { value: 'chord', label: 'Chord' },
  { value: 'triad', label: 'Triads' },
  { value: 'progression', label: 'Progression' },
]

export default function PracticePage() {
  const session = usePracticeSession()

  useKeyboardShortcuts({
    onTogglePlay: session.togglePlay,
    onPreviousPosition: () => session.setPosition(Math.max(0, session.position - 1)),
    onNextPosition: () => session.setPosition(session.position + 1),
    onCycleWood: () => session.setWood(session.wood === 'rosewood' ? 'maple' : session.wood === 'maple' ? 'ebony' : 'rosewood'),
  })

  const heading =
    session.mode === 'progression'
      ? (session.currentChord?.name ?? '—')
      : session.mode === 'chord' || session.mode === 'triad'
        ? getChordName(session.rootNote, session.chordQuality)
        : `${session.rootNote} ${SCALE_NAMES[session.scale]}`

  const boardMode =
    session.mode === 'chord' ? 'chords' : session.mode === 'progression' ? 'progressions' : 'scale'

  return (
    <div className="flex-1 pb-16">
      <AppHeader
        wood={session.wood}
        title="Practice"
        subtitle="Play along with scales, chords, triads and progressions"
        action={{ href: '/', label: 'Fretboard' }}
        center={
          <Tabs
            ariaLabel="Practice mode"
            value={session.mode}
            onChange={session.setMode}
            options={MODE_OPTIONS}
          />
        }
      />

      <main className="mx-auto max-w-[1400px] px-4 py-5 sm:px-6 sm:py-7">
        <div className="grid min-w-0 items-start gap-5 lg:grid-cols-[320px_minmax(0,1fr)] lg:gap-6">
          <div className="order-1 min-w-0 space-y-5 lg:col-start-2 lg:row-start-1">
            {/* Transport */}
            <Card className="animate-rise p-4 sm:p-5">
              <div className="flex flex-wrap items-center gap-4">
                <button
                  type="button"
                  onClick={session.togglePlay}
                  aria-pressed={session.isPlaying}
                  className={`flex h-11 items-center gap-2 rounded-none border-2 border-black px-6 font-pixel text-xl transition-transform hover:-translate-y-1 active:translate-y-1 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-none ${
                    session.isPlaying
                      ? 'bg-rose-600 text-white'
                      : 'bg-[#ff3366] text-white'
                  }`}
                >
                  <span aria-hidden>{session.isPlaying ? '■' : '▶'}</span>
                  {session.isPlaying ? 'Stop' : 'Play'}
                </button>

                <label className="flex min-w-[220px] flex-1 items-center gap-3">
                  <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted">
                    Tempo
                  </span>
                  <input
                    type="range"
                    min={40}
                    max={220}
                    value={session.bpm}
                    onChange={(event) => session.setBpm(Number(event.target.value))}
                    className="h-1.5 flex-1 cursor-pointer appearance-none rounded-full bg-sand accent-orange-500"
                    aria-label="Tempo in beats per minute"
                  />
                  <span className="w-20 text-right font-mono text-sm text-ink">
                    {session.bpm} bpm
                  </span>
                </label>

                <div className="ml-auto text-right">
                  <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted">
                    Step
                  </div>
                  <div className="font-mono text-sm text-ink">
                    {session.stepCount === 0
                      ? '—'
                      : `${(session.stepIndex % session.stepCount) + 1} / ${session.stepCount}`}
                  </div>
                </div>
              </div>
            </Card>

            {/* Neck */}
            <Card className="animate-rise overflow-hidden">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-hairline px-5 py-4">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h1 className="text-xl font-semibold tracking-tight text-ink">{heading}</h1>
                    {session.isPlaying && <Badge tone="sage">Playing</Badge>}
                    <Badge>{getInstrumentName(session.stringCount)}</Badge>
                    <Badge>{WOODS[session.wood].label}</Badge>
                  </div>
                  <p className="mt-1 font-mono text-sm text-muted">
                    {session.currentStep?.label ?? 'Press play to start the phrase'}
                  </p>
                </div>
              </div>

              <div className="py-5">
                <Fretboard
                  mode={boardMode}
                  rootNote={
                    session.mode === 'progression'
                      ? (session.currentChord?.root ?? session.rootNote)
                      : session.rootNote
                  }
                  scale={session.scale}
                  tuning={session.tuning}
                  tuningKey={session.tuningKey}
                  wood={session.wood}
                  displayMode="notes"
                  position={
                    session.mode === 'progression' ? session.currentChordIndex : session.position
                  }
                  leftHanded={session.leftHanded}
                  showOnlyChordTones={session.mode === 'triad'}
                  chordQuality={session.chordQuality}
                  selectedProgression={session.selectedProgression}
                  progressionViewMode="chord"
                  showFingerings={session.showFingerings}
                  activeNotes={session.activeNotes}
                  silent
                  frets={22}
                />
              </div>
            </Card>

          </div>

          {/* Sequence sits below the neck, and below the controls on small screens */}
          <div className="order-3 min-w-0 lg:col-start-2 lg:row-start-2">
            <Card>
              <CardHeader title="Sequence" subtitle="Click a step to jump to it" />
              <div className="flex flex-wrap gap-1.5 p-5">
                {session.steps.length === 0 && (
                  <p className="text-sm text-muted">
                    No sequence for these settings — try another position, tuning or chord type.
                  </p>
                )}
                {session.steps.map((step, index) => {
                  const active =
                    session.stepCount > 0 && index === session.stepIndex % session.stepCount
                  return (
                    <button
                      key={`${step.label}-${index}`}
                      type="button"
                      onClick={() => session.setStepIndex(index)}
                      className={`rounded-none border-2 px-2.5 py-1.5 font-pixel text-lg transition-transform hover:-translate-y-0.5 active:translate-y-1 ${
                        active
                          ? 'border-black bg-[#ff3366] text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-none'
                          : 'border-black bg-white text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-none'
                      }`}
                    >
                      {step.label}
                    </button>
                  )
                })}
              </div>
            </Card>
          </div>

          <Card
            as="aside"
            className="order-2 min-w-0 animate-rise lg:col-start-1 lg:row-span-2 lg:row-start-1 lg:sticky lg:top-[104px]"
          >
            <CardHeader title="Session" subtitle="Space plays and stops" />
            <PracticeControls
              mode={session.mode}
              rootNote={session.rootNote}
              scale={session.scale}
              stringCount={session.stringCount}
              tuningKey={session.tuningKey}
              tuning={session.tuning}
              position={session.position}
              chordQuality={session.chordQuality}
              scaleDirection={session.scaleDirection}
              stringSets={session.stringSets}
              triadStringSetIndex={session.triadStringSetIndex}
              selectedProgression={session.selectedProgression}
              metronomeOn={session.metronomeOn}
              arpeggioOn={session.arpeggioOn}
              showFingerings={session.showFingerings}
              leftHanded={session.leftHanded}
              wood={session.wood}
              onRootChange={session.setRootNote}
              onScaleChange={session.setScale}
              onStringCountChange={session.setStringCount}
              onTuningChange={session.setTuningKey}
              onPositionChange={session.setPosition}
              onChordQualityChange={session.setChordQuality}
              onScaleDirectionChange={session.setScaleDirection}
              onTriadStringSetChange={session.setTriadStringSetIndex}
              onProgressionChange={session.setSelectedProgression}
              onMetronomeToggle={session.setMetronomeOn}
              onArpeggioToggle={session.setArpeggioOn}
              onFingeringsToggle={session.setShowFingerings}
              onLeftHandedChange={session.setLeftHanded}
              onWoodChange={session.setWood}
            />
          </Card>
        </div>
      </main>


    </div>
  )
}
