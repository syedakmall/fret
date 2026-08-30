'use client'

import { AppHeader } from '@/components/AppHeader'
import { Controls } from '@/components/Controls'
import Fretboard from '@/components/Fretboard'
import { LiveRegion } from '@/components/LiveRegion'

import { StepBar } from '@/components/StepBar'
import { Badge, Card, CardHeader, Kbd, Tabs } from '@/components/ui'
import { VIEW_MODES, VIEW_MODE_LABELS, useFretboardApp } from '@/hooks/useFretboardApp'
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts'
import {
  INTERVAL_NAMES,
  SCALE_NAMES,
  getChordNameForVoicing,
  getInstrumentName,
  getProgressionLabel,
} from '@/lib/music'
import { getProgressionChordName } from '@/lib/music/progressions'
import { WOODS } from '@/lib/wood'

const LEGEND = [
  { swatch: 'bg-blue-600 text-white', symbol: 'R', title: 'Root' },
  { swatch: 'bg-emerald-500 text-white', symbol: '3', title: 'Third' },
  { swatch: 'bg-amber-500 text-white', symbol: '5', title: 'Fifth' },
]

export default function Home() {
  const app = useFretboardApp()

  useKeyboardShortcuts({
    onPreviousPosition: app.handlePreviousPosition,
    onNextPosition: app.handleNextPosition,
    onToggleDisplayMode: app.handleToggleDisplayMode,
    onToggleChordsMode: app.cycleMode,
    onCycleWood: app.cycleWood,
  })

  const chordLabel =
    app.mode === 'chords'
      ? getChordNameForVoicing(app.rootNote, app.chordQuality, app.position, app.tuningNotes)
      : app.mode === 'progressions' && app.position !== null
        ? getProgressionChordName(app.rootNote, app.scale, app.position, app.selectedProgression)
        : null

  return (
    <div className="flex-1 pb-16">
      <LiveRegion message={app.announcement} />

      <AppHeader
        wood={app.wood}
        title="Fret"
        subtitle="Scales, chords and progressions on the neck"
        action={{ href: '/practice', label: 'Practice' }}
        center={
          <Tabs
            ariaLabel="View"
            value={app.mode}
            onChange={app.setMode}
            options={VIEW_MODES.map((mode) => ({ value: mode, label: VIEW_MODE_LABELS[mode] }))}
          />
        }
      />

      <main className="mx-auto max-w-[1400px] px-4 py-5 sm:px-6 sm:py-7">
        <div className="grid min-w-0 items-start gap-5 lg:grid-cols-[320px_minmax(0,1fr)] lg:gap-6">
          {/* Neck — first on every screen size */}
          <div className="order-1 min-w-0 lg:col-start-2 lg:row-start-1">
            <Card className="animate-rise overflow-hidden">
              <div className="space-y-4 border-b border-hairline px-5 py-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h1 className="text-xl font-semibold tracking-tight text-ink">
                        {app.mode === 'chords' || app.mode === 'progressions'
                          ? (chordLabel ?? `${app.rootNote} ${SCALE_NAMES[app.scale]}`)
                          : `${app.rootNote} ${SCALE_NAMES[app.scale]}`}
                      </h1>
                      {app.mode === 'progressions' && (
                        <Badge tone="sage">
                          {getProgressionLabel(app.scale, app.selectedProgression)}
                        </Badge>
                      )}
                      <Badge>{getInstrumentName(app.stringCount)}</Badge>
                      <Badge>{WOODS[app.wood].label}</Badge>
                    </div>
                    <p className="mt-1.5 text-sm text-muted">
                      <span className="font-mono text-ink">{app.scaleNotes.join(' · ')}</span>
                      <span className="mx-2 text-hairline">|</span>
                      <span className="font-mono">
                        {app.scaleFormula.map((i) => INTERVAL_NAMES[i]).join('-')}
                      </span>
                    </p>
                  </div>
                </div>

                <StepBar
                  mode={app.mode}
                  rootNote={app.rootNote}
                  scale={app.scale}
                  tuning={app.tuningNotes}
                  chordQuality={app.chordQuality}
                  selectedProgression={app.selectedProgression}
                  position={app.position}
                  onPositionChange={app.handlePositionChange}
                />
              </div>

              <div className="py-5">
                <Fretboard
                  mode={app.mode}
                  rootNote={app.rootNote}
                  scale={app.scale}
                  tuning={app.tuningNotes}
                  tuningKey={app.tuning}
                  wood={app.wood}
                  displayMode={app.displayMode}
                  position={app.position}
                  leftHanded={app.leftHanded}
                  showOnlyChordTones={app.showOnlyChordTones}
                  chordQuality={app.chordQuality}
                  selectedProgression={app.selectedProgression}
                  progressionViewMode={app.progressionViewMode}
                  showFingerings={app.showFingerings}
                  frets={22}
                />
              </div>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-hairline px-5 py-3 text-xs text-muted">
                <span className="flex items-center gap-1.5">
                  <Kbd>[</Kbd>
                  <Kbd>]</Kbd> step
                </span>
                <span className="flex items-center gap-1.5">
                  <Kbd>D</Kbd> labels
                </span>
                <span className="flex items-center gap-1.5">
                  <Kbd>C</Kbd> view
                </span>
                <span className="flex items-center gap-1.5">
                  <Kbd>W</Kbd> wood
                </span>
                <span className="ml-auto">Click a note to hear it</span>
              </div>
            </Card>
            
            {/* Reference material sits below the neck */}
            <div className="mt-5 grid gap-5 sm:grid-cols-3">
              {LEGEND.map((item) => (
                <Card key={item.title} className="p-3">
                  <div className="flex items-center gap-3">
                    <span
                      className={`grid h-8 w-8 shrink-0 place-items-center rounded-none border-2 border-black font-pixel text-lg font-bold shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] ${item.swatch}`}
                    >
                      {item.symbol}
                    </span>
                    <h3 className="font-pixel text-xl uppercase tracking-widest text-black">{item.title}</h3>
                  </div>
                </Card>
              ))}
            </div>
          </div>



          {/* Controls */}
          <Card
            as="aside"
            className="order-2 min-w-0 animate-rise lg:col-start-1 lg:row-span-2 lg:row-start-1 lg:sticky lg:top-[104px]"
          >
            <CardHeader title="Controls" subtitle={VIEW_MODE_LABELS[app.mode]} />
            <Controls
              mode={app.mode}
              rootNote={app.rootNote}
              scale={app.scale}
              stringCount={app.stringCount}
              tuning={app.tuning}
              wood={app.wood}
              displayMode={app.displayMode}
              leftHanded={app.leftHanded}
              showOnlyChordTones={app.showOnlyChordTones}
              selectedProgression={app.selectedProgression}
              showFingerings={app.showFingerings}
              progressionViewMode={app.progressionViewMode}
              chordQuality={app.chordQuality}
              onRootChange={app.handleRootChange}
              onScaleChange={app.handleScaleChange}
              onStringCountChange={app.handleStringCountChange}
              onTuningChange={app.handleTuningChange}
              onWoodChange={app.setWood}
              onDisplayModeChange={app.setDisplayMode}
              onLeftHandedChange={app.setLeftHanded}
              onChordTonesToggle={app.setShowOnlyChordTones}
              onProgressionSelect={app.setSelectedProgression}
              onFingeringsToggle={app.setShowFingerings}
              onProgressionViewModeChange={app.setProgressionViewMode}
              onChordQualityChange={app.handleChordQualityChange}
            />
          </Card>
        </div>
      </main>


    </div>
  )
}
