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
  getProgressionLabel,
  getTuningsByStringCount,
  type ChordQuality,
  type Note,
} from '@/lib/music'
import type { DisplayMode, ProgressionViewMode, ViewMode } from '@/hooks/useFretboardApp'
import type { WoodKey } from '@/lib/wood'
import { Field, SectionLabel, Segmented, Select, Toggle } from './ui'
import { WoodPicker } from './WoodPicker'

interface Props {
  mode: ViewMode
  rootNote: Note
  scale: string
  stringCount: number
  tuning: string
  wood: WoodKey
  displayMode: DisplayMode
  leftHanded: boolean
  showOnlyChordTones: boolean
  selectedProgression: string
  showFingerings: boolean
  progressionViewMode: ProgressionViewMode
  chordQuality: ChordQuality
  onRootChange: (note: Note) => void
  onScaleChange: (scale: string) => void
  onStringCountChange: (count: number) => void
  onTuningChange: (tuning: string) => void
  onWoodChange: (wood: WoodKey) => void
  onDisplayModeChange: (mode: DisplayMode) => void
  onLeftHandedChange: (value: boolean) => void
  onChordTonesToggle: (value: boolean) => void
  onProgressionSelect: (key: string) => void
  onFingeringsToggle: (value: boolean) => void
  onProgressionViewModeChange: (mode: ProgressionViewMode) => void
  onChordQualityChange: (quality: ChordQuality) => void
}

function Divider() {
  return <div className="h-px bg-hairline" />
}

export function Controls(props: Props) {
  const tunings = getTuningsByStringCount(props.stringCount)

  return (
    <div className="space-y-5 p-5">
      {/* Key */}
      <div>
        <SectionLabel hint="root note">Key</SectionLabel>
        <div className="grid grid-cols-6 gap-1.5">
          {NOTES.map((note) => {
            const selected = note === props.rootNote
            const accidental = note.includes('#')
            return (
              <button
                key={note}
                type="button"
                aria-pressed={selected}
                onClick={() => props.onRootChange(note)}
                className={`h-9 rounded-none border-2 font-pixel text-lg transition-transform hover:-translate-y-0.5 active:translate-y-1 ${
                  selected
                    ? 'border-black bg-[#ff3366] text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-none'
                    : accidental
                      ? 'border-black bg-gray-200 text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-none'
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

      {/* Mode-specific settings, so only what matters is on screen */}
      {props.mode === 'chords' && (
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

      {props.mode === 'progressions' && (
        <div className="space-y-4">
          <Field label="Progression">
            <Select
              value={props.selectedProgression}
              onChange={props.onProgressionSelect}
              ariaLabel="Progression"
            >
              {Object.entries(CHORD_PROGRESSIONS).map(([key, progression]) => (
                <option key={key} value={key}>
                  {getProgressionLabel(props.scale, key)} · {progression.description}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Show each chord as">
            <Segmented
              ariaLabel="Progression view"
              value={props.progressionViewMode}
              onChange={props.onProgressionViewModeChange}
              options={[
                { value: 'chord', label: 'Shape' },
                { value: 'scale', label: 'Scale' },
              ]}
            />
          </Field>
        </div>
      )}

      {props.mode !== 'scale' && <Divider />}

      {/* Instrument */}
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
          <Select value={props.tuning} onChange={props.onTuningChange} ariaLabel="Tuning">
            {tunings.map(([key, config]) => (
              <option key={key} value={key}>
                {config.name}
              </option>
            ))}
          </Select>
        </Field>
      </div>

      <Divider />

      <Field label="Note labels">
        <Segmented
          ariaLabel="Note labels"
          value={props.displayMode}
          onChange={props.onDisplayModeChange}
          options={[
            { value: 'notes', label: 'Notes' },
            { value: 'intervals', label: 'Intervals' },
            { value: 'degrees', label: 'Degrees' },
          ]}
        />
      </Field>

      <Field label="Fretboard wood">
        <WoodPicker wood={props.wood} onChange={props.onWoodChange} />
      </Field>

      <Divider />

      <div className="space-y-2">
        <SectionLabel>Display</SectionLabel>
        {props.mode === 'scale' && (
          <Toggle
            label="Only R-3-5"
            description="Hide the other scale tones"
            checked={props.showOnlyChordTones}
            onChange={props.onChordTonesToggle}
          />
        )}
        {props.mode !== 'scale' && (
          <Toggle
            label="Fingerings"
            description="Numbers instead of note names"
            checked={props.showFingerings}
            onChange={props.onFingeringsToggle}
          />
        )}
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
