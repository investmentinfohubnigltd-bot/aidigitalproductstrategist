import { ImageResponse } from 'next/og'

export const alt = 'AI Digital Product Strategist — working digital systems for complex markets'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

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
          background: '#080C0F',
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
          <span style={{ color: '#5678FF' }}>AI</span><span style={{ color: '#8997AA', margin: '0 8px' }}>/</span>DPS
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div
            style={{
              fontSize: 34,
              letterSpacing: '0.28em',
              textTransform: 'uppercase',
              color: '#8FA5FF',
              marginBottom: 28,
            }}
          >
            AI Product Strategy · Technical Execution
          </div>
          <div
            style={{
              display: 'flex',
              fontSize: 78,
              lineHeight: 1.05,
              color: '#F1EFE8',
              maxWidth: 900,
            }}
          >
            Difficult ideas. Working digital systems.
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            fontSize: 28,
            color: '#7E8987',
            letterSpacing: '0.02em',
          }}
        >
          Product strategy · system architecture · full-stack development · Nigeria → Africa
        </div>
      </div>
    ),
    { ...size },
  )
}
