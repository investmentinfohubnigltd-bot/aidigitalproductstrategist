'use client'
import { useEffect, useState } from 'react'

export default function Hero() {
  const [loaded, setLoaded] = useState(false)
  useEffect(() => { const t = setTimeout(() => setLoaded(true), 100); return () => clearTimeout(t) }, [])

  const fade = (delay: string) => ({
    opacity: loaded ? 1 : 0,
    transform: loaded ? 'translateY(0)' : 'translateY(24px)',
    transition: `opacity 1s ${delay}, transform 1s ${delay}`,
  })

  return (
    <section id="hero" style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      textAlign: 'center', padding: '120px 40px 80px',
    }}>
      <p style={{
        fontSize: '11px', fontWeight: 500, letterSpacing: '0.28em',
        textTransform: 'uppercase', color: 'var(--gold)', marginBottom: '52px',
        ...fade('0.2s'),
      }}>
        Digital Product Strategist &amp; Developer
      </p>

      <h1 style={{
        fontFamily: "'Cormorant Garamond', 'Palatino Linotype', Georgia, serif",
        fontWeight: 300, fontStyle: 'italic',
        fontSize: 'clamp(52px, 7.5vw, 108px)',
        lineHeight: 1.08, letterSpacing: '-0.01em',
        color: 'var(--parchment)', maxWidth: '960px',
        ...fade('0.4s'),
      }}>
        The developer who turns<br />
        your idea into something<br />
        <em style={{ color: 'var(--gold)' }}>the world can use.</em>
      </h1>

      <div style={{
        width: '1px', height: '72px',
        background: 'var(--rule)', margin: '64px auto',
        opacity: loaded ? 1 : 0,
        transition: 'opacity 1s 1s',
      }} />

      <p style={{
        fontSize: '14px', fontWeight: 300, letterSpacing: '0.04em',
        color: 'var(--secondary)', maxWidth: '520px', lineHeight: 1.9,
        ...fade('1.1s'),
      }}>
        End-to-end product builds, brand strategy, and content systems — for founders and businesses who demand the highest standard of work.
      </p>

      <div style={{ display: 'flex', gap: '20px', marginTop: '52px', flexWrap: 'wrap', justifyContent: 'center', ...fade('1.3s') }}>
        <a href="#portfolio" style={{
          fontFamily: 'Inter, sans-serif', fontSize: '11px', fontWeight: 500,
          letterSpacing: '0.2em', textTransform: 'uppercase',
          color: 'var(--ink)', background: 'var(--gold)',
          padding: '14px 36px', textDecoration: 'none',
        }}>View Portfolio</a>
        <a href="#contact" style={{
          fontFamily: 'Inter, sans-serif', fontSize: '11px', fontWeight: 500,
          letterSpacing: '0.2em', textTransform: 'uppercase',
          color: 'var(--parchment)', border: '1px solid var(--rule)',
          padding: '14px 36px', textDecoration: 'none',
        }}>Start a Conversation</a>
      </div>

      <div style={{
        display: 'flex', gap: '80px', marginTop: '100px',
        paddingTop: '48px', borderTop: '1px solid var(--rule)',
        flexWrap: 'wrap', justifyContent: 'center',
        ...fade('1.5s'),
      }} className="hero-stats-row">
        {[
          { n: '8', l: 'Live Products' },
          { n: '4+', l: 'Industries' },
          { n: '100%', l: 'End-to-End' },
          { n: '0', l: 'Middlemen' },
        ].map(s => (
          <div key={s.l} style={{ textAlign: 'center' }}>
            <span style={{
              fontFamily: "'Cormorant Garamond', 'Palatino Linotype', Georgia, serif",
              fontWeight: 300, fontSize: '56px', color: 'var(--gold)',
              lineHeight: 1, display: 'block',
            }}>{s.n}</span>
            <span style={{
              fontSize: '10px', fontWeight: 500, letterSpacing: '0.2em',
              textTransform: 'uppercase', color: 'var(--secondary)',
              marginTop: '10px', display: 'block',
            }}>{s.l}</span>
          </div>
        ))}
      </div>
    </section>
  )
}
