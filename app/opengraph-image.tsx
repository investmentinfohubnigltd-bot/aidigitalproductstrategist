import { ImageResponse } from 'next/og'

export const alt =
  'AI Digital Product Strategist — 12 products across 11 industries, developed end to end'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

// On-brand social card: dark luxury ground, gold accents, AI·DS mark.
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
          AI<span style={{ color: '#D4B074', margin: '0 4px' }}>·</span>DS
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
            Digital Product Strategist
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
            The developer who turns your idea into something the world can use.
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
          12 products across 11 industries · developed end to end
        </div>
      </div>
    ),
    { ...size },
  )
}
