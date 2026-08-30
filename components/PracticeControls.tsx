'use client'

import {
  CHORD_PROGRESSIONS,
  CHORD_QUALITIES,
  CHORD_QUALITY_LABELS,
  NOTES,
  SCALE_GROUPS,
  SCALE_NAMES,
  STRING_COUNTS,
  getInstrumentName,
  getPositionName,
  getPositions,
  getProgressionLabel,
  getTuningsByStringCount,
  getVoicings,
  type ChordQuality,
  type Note,
} from '@/lib/music'
import type { StringSet } from '@/lib/music/triads'
import type { PracticeMode, ScaleDirection } from '@/hooks/usePracticeSession'
import type { WoodKey } from '@/lib/wood'
import { Field, SectionLabel, Segmented, Select, Toggle } from './ui'
import { WoodPicker } from './WoodPicker'

interface Props {
  mode: PracticeMode
  rootNote: Note
  scale: string
  stringCount: number
  tuningKey: string
  tuning: Note[]
  position: number
  chordQuality: ChordQuality
  scaleDirection: ScaleDirection
  stringSets: StringSet[]
  triadStringSetIndex: number
  selectedProgression: string
  metronomeOn: boolean
  arpeggioOn: boolean
  showFingerings: boolean
  leftHanded: boolean
  wood: WoodKey
  onRootChange: (note: Note) => void
  onScaleChange: (scale: string) => void
  onStringCountChange: (count: number) => void
  onTuningChange: (tuning: string) => void
  onPositionChange: (position: number) => void
  onChordQualityChange: (quality: ChordQuality) => void
  onScaleDirectionChange: (direction: ScaleDirection) => void
  onTriadStringSetChange: (index: number) => void
  onProgressionChange: (key: string) => void
  onMetronomeToggle: (value: boolean) => void
  onArpeggioToggle: (value: boolean) => void
  onFingeringsToggle: (value: boolean) => void
  onLeftHandedChange: (value: boolean) => void
  onWoodChange: (wood: WoodKey) => void
}

function Divider() {
  return <div className="h-px bg-hairline" />
}

export function PracticeControls(props: Props) {
  const tunings = getTuningsByStringCount(props.stringCount)
  const positions = getPositions(props.scale)
  const voicings = getVoicings(props.rootNote, props.chordQuality, props.tuning)

  return (
    <div className="space-y-5 p-5">
      <div>
        <SectionLabel hint="root note">Key</SectionLabel>
        <div className="grid grid-cols-6 gap-1.5">
          {NOTES.map((note) => {
            const selected = note === props.rootNote
            return (
              <button
                key={note}
                type="button"
                aria-pressed={selected}
                onClick={() => props.onRootChange(note)}
                className={`h-9 rounded-none border-2 font-pixel text-lg transition-transform hover:-translate-y-0.5 active:translate-y-1 ${
                  selected
                    ? 'border-black bg-[#ff3366] text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-none'
                    : 'border-black bg-white text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-none'
                }`}
              >
                {note}
              </button>
            )
          })}
        </div>
      </div>

      <Field label="Scale">
        <Select value={props.scale} onChange={props.onScaleChange} ariaLabel="Scale">
          {SCALE_GROUPS.map((group) => (
            <optgroup key={group.label} label={group.label}>
              {group.scales.map((key) => (
                <option key={key} value={key}>
                  {SCALE_NAMES[key]}
                </option>
              ))}
            </optgroup>
          ))}
        </Select>
      </Field>

      <Divider />

      {props.mode === 'scale' && (
        <div className="space-y-4">
          <Field label="Position">
            <Select
              value={String(props.position)}
              onChange={(value) => props.onPositionChange(Number(value))}
              ariaLabel="Position"
            >
              {positions.map((_, index) => (
                <option key={index} value={index}>
                  {getPositionName(props.scale, index)}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Direction">
            <Segmented
              ariaLabel="Scale direction"
              value={props.scaleDirection}
              onChange={props.onScaleDirectionChange}
              options={[
                { value: 'up', label: 'Up' },
                { value: 'down', label: 'Down' },
                { value: 'upDown', label: 'Both' },
              ]}
            />
          </Field>
        </div>
      )}

      {(props.mode === 'chord' || props.mode === 'triad') && (
        <Field label="Chord type">
          <Select
            value={props.chordQuality}
            onChange={(value) => props.onChordQualityChange(value as ChordQuality)}
            ariaLabel="Chord type"
          >
            {CHORD_QUALITIES.map((quality) => (
              <option key={quality} value={quality}>
                {CHORD_QUALITY_LABELS[quality]}
              </option>
            ))}
          </Select>
        </Field>
      )}

      {props.mode === 'chord' && (
        <Field label="Voicing">
          <Select
            value={String(props.position)}
            onChange={(value) => props.onPositionChange(Number(value))}
            ariaLabel="Voicing"
          >
            {voicings.map((voicing, index) => (
              <option key={index} value={index}>
                {voicing.shape} shape · {voicing.hasOpen ? 'open' : `fret ${voicing.baseFret}`}
              </option>
            ))}
          </Select>
        </Field>
      )}

      {props.mode === 'triad' && (
        <Field label="String set">
          <Select
            value={String(props.triadStringSetIndex)}
            onChange={(value) => props.onTriadStringSetChange(Number(value))}
            ariaLabel="String set"
          >
            {props.stringSets.map((set, index) => (
              <option key={set.label} value={index}>
                Strings {set.label}
              </option>
            ))}
          </Select>
        </Field>
      )}

      {props.mode === 'progression' && (
        <Field label="Progression">
          <Select
            value={props.selectedProgression}
            onChange={props.onProgressionChange}
            ariaLabel="Progression"
          >
            {Object.entries(CHORD_PROGRESSIONS).map(([key, progression]) => (
              <option key={key} value={key}>
                {getProgressionLabel(props.scale, key)} · {progression.description}
              </option>
            ))}
          </Select>
        </Field>
      )}

      <Divider />

      <div className="space-y-4">
        <Field label="Strings" hint={getInstrumentName(props.stringCount)}>
          <Segmented
            ariaLabel="String count"
            value={props.stringCount}
            onChange={props.onStringCountChange}
            options={STRING_COUNTS.map((count) => ({
              value: count,
              label: `${count}`,
              title: getInstrumentName(count),
            }))}
          />
        </Field>

        <Field label="Tuning">
          <Select value={props.tuningKey} onChange={props.onTuningChange} ariaLabel="Tuning">
            {tunings.map(([key, config]) => (
              <option key={key} value={key}>
                {config.name}
              </option>
            ))}
          </Select>
        </Field>

        <Field label="Fretboard wood">
          <WoodPicker wood={props.wood} onChange={props.onWoodChange} compact />
        </Field>
      </div>

      <Divider />

      <div className="space-y-2">
        <SectionLabel>Playback</SectionLabel>
        <Toggle
          label="Metronome"
          description="Click on every beat"
          checked={props.metronomeOn}
          onChange={props.onMetronomeToggle}
        />
        <Toggle
          label="Arpeggiate"
          description="One note per beat"
          checked={props.arpeggioOn}
          onChange={props.onArpeggioToggle}
          disabled={props.mode === 'scale'}
        />
        <Toggle
          label="Fingerings"
          description="Numbers on chord shapes"
          checked={props.showFingerings}
          onChange={props.onFingeringsToggle}
        />
        <Toggle
          label="Left-handed"
          description="Mirror the neck"
          checked={props.leftHanded}
          onChange={props.onLeftHandedChange}
        />
      </div>
    </div>
  )
}
