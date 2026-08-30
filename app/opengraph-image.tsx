import { ImageResponse } from 'next/og'

// Required by `output: export`: pre-render this image at build time.
export const dynamic = 'force-static'

export const alt = 'Fret — an interactive fretboard for guitar and bass players'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

const ACCENT = '#ff3366'

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          background: '#ffffff',
          padding: 72,
          border: '16px solid #000000',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <div
            style={{
              display: 'flex',
              background: ACCENT,
              border: '6px solid #000000',
              boxShadow: '10px 10px 0px 0px #000000',
              padding: '8px 24px',
              fontSize: 44,
              fontWeight: 700,
              color: '#ffffff',
              letterSpacing: -1,
            }}
          >
            FRET
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            marginTop: 48,
            fontSize: 82,
            fontWeight: 700,
            color: '#000000',
            lineHeight: 1.1,
            letterSpacing: -3,
          }}
        >
          Master the fretboard.
        </div>

        <div
          style={{
            display: 'flex',
            marginTop: 24,
            fontSize: 36,
            color: '#444444',
            lineHeight: 1.35,
            maxWidth: 900,
          }}
        >
          Scales, modes, chord voicings and progressions — visualised across guitar and bass necks.
        </div>

        <div style={{ display: 'flex', marginTop: 'auto', gap: 16 }}>
          {['Scales', 'Chords', 'Triads', 'Progressions', 'Practice'].map((tag) => (
            <div
              key={tag}
              style={{
                display: 'flex',
                border: '4px solid #000000',
                boxShadow: '6px 6px 0px 0px #000000',
                background: '#ffffff',
                padding: '6px 20px',
                fontSize: 28,
                color: '#000000',
              }}
            >
              {tag}
            </div>
          ))}
        </div>
      </div>
    ),
    { ...size }
  )
}
