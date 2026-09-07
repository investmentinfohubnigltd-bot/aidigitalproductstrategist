import { ImageResponse } from 'next/og'

export const alt = 'ADPS — Independent AI product strategy and systems practice'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

// On-brand social card: dark luxury ground, gold accents, ADPS mark.
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: '#1C1A16',
          padding: '80px',
          color: '#F2EDE4',
        }}
      >
        <div
          style={{
            display: 'flex',
            fontSize: 40,
            letterSpacing: '0.08em',
            color: '#F2EDE4',
          }}
        >
          <span style={{ color: '#D4B074' }}>[</span>ADPS<span style={{ color: '#D4B074' }}>]</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div
            style={{
              fontSize: 34,
              letterSpacing: '0.28em',
              textTransform: 'uppercase',
              color: '#D4B074',
              marginBottom: 28,
            }}
          >
            Independent product practice
          </div>
          <div
            style={{
              display: 'flex',
              fontSize: 78,
              lineHeight: 1.05,
              color: '#F2EDE4',
              maxWidth: 900,
            }}
          >
            Strategy that survives production.
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            fontSize: 28,
            color: '#B8B0A2',
            letterSpacing: '0.02em',
          }}
        >
          Product strategy · AI · architecture · full-stack systems
        </div>
      </div>
    ),
    { ...size },
  )
}
