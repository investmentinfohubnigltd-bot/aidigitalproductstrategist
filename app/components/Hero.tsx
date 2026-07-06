'use client'
import { useEffect, useState } from 'react'

const STATS = [
  { n: '12', l: 'Products Developed' },
  { n: '11', l: 'Industries' },
  { n: '100%', l: 'End-to-End' },
  { n: '0', l: 'Middlemen' },
]

export default function Hero() {
  const [loaded, setLoaded] = useState(false)
  const [reduce, setReduce] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReduce(mq.matches)
    const t = setTimeout(() => setLoaded(true), 80)
    return () => clearTimeout(t)
  }, [])

  const fade = (delay: string) =>
    reduce
      ? {}
      : {
          opacity: loaded ? 1 : 0,
          transform: loaded ? 'translateY(0)' : 'translateY(22px)',
          transition: `opacity 0.9s ${delay} var(--ease), transform 0.9s ${delay} var(--ease)`,
        }

  return (
    <section id="hero" style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', textAlign: 'center',
      padding: '132px var(--gutter) 96px', position: 'relative',
    }}>
      {/* Subtle gold aura behind the headline — pure CSS, no assets. */}
      <div aria-hidden style={{
        position: 'absolute', top: '38%', left: '50%',
        width: 'min(760px, 90vw)', height: '520px',
        transform: 'translate(-50%, -50%)',
        background: 'radial-gradient(ellipse at center, rgba(212,176,116,0.10), transparent 68%)',
        pointerEvents: 'none', opacity: loaded || reduce ? 1 : 0,
        transition: 'opacity 1.4s var(--ease)',
      }} />

      <p className="hero-eyebrow" style={{
        fontSize: 'clamp(9px, 2.4vw, 11px)', fontWeight: 600, letterSpacing: '0.28em',
        textTransform: 'uppercase', color: 'var(--gold)', marginBottom: '44px',
        position: 'relative', width: '100%', maxWidth: '100%',
        ...fade('0.15s'),
      }}>
        Digital Product Strategist &amp; Developer
      </p>

      <h1 style={{
        fontFamily: 'var(--font-serif)', fontOpticalSizing: 'auto',
        fontWeight: 300, fontStyle: 'italic',
        fontSize: 'clamp(34px, 8vw, 116px)',
        lineHeight: 1.04, letterSpacing: '-0.015em',
        color: 'var(--parchment)', width: '100%', maxWidth: 'min(15ch, 100%)',
        position: 'relative', ...fade('0.35s'),
      }}>
        The developer who turns your idea into something{' '}
        <em style={{ color: 'var(--gold)' }}>the world can use.</em>
      </h1>

      <div style={{
        width: '1px', height: '64px', background: 'var(--rule)', margin: '56px auto',
        opacity: loaded || reduce ? 1 : 0, transition: 'opacity 1s 0.9s var(--ease)',
      }} />

      <p style={{
        fontSize: '15px', fontWeight: 300, letterSpacing: '0.01em',
        color: 'var(--secondary)', width: '100%', maxWidth: 'min(540px, 100%)', lineHeight: 1.85,
        position: 'relative', ...fade('1.0s'),
      }}>
        End-to-end product development, brand strategy, and content systems — for founders and
        businesses who demand the highest standard of work.
      </p>

      <div style={{
        display: 'flex', gap: '18px', marginTop: '48px', flexWrap: 'wrap',
        justifyContent: 'center', position: 'relative', ...fade('1.2s'),
      }}>
        <a href="#portfolio" style={{
          fontFamily: 'var(--font-sans)', fontSize: '11px', fontWeight: 600,
          letterSpacing: '0.18em', textTransform: 'uppercase',
          color: 'var(--ink)', background: 'var(--gold)', padding: '15px 36px',
          textDecoration: 'none', transition: 'background var(--t-fast)',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--gold-soft)')}
        onMouseLeave={(e) => (e.currentTarget.style.background = 'var(--gold)')}
        >View the Work</a>
        <a href="#contact" style={{
          fontFamily: 'var(--font-sans)', fontSize: '11px', fontWeight: 600,
          letterSpacing: '0.18em', textTransform: 'uppercase',
          color: 'var(--parchment)', border: '1px solid var(--rule)',
          padding: '15px 36px', textDecoration: 'none',
          transition: 'border-color var(--t-fast), color var(--t-fast)',
        }}
        onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--gold-dim)'; e.currentTarget.style.color = 'var(--gold)' }}
        onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--rule)'; e.currentTarget.style.color = 'var(--parchment)' }}
        >Start a Conversation</a>
      </div>

      <div className="hero-stats-row" style={{
        display: 'flex', gap: '72px', marginTop: '92px', paddingTop: '48px',
        borderTop: '1px solid var(--rule)', flexWrap: 'wrap',
        justifyContent: 'center', position: 'relative', ...fade('1.4s'),
      }}>
        {STATS.map((s) => (
          <div key={s.l} style={{ textAlign: 'center' }}>
            <span style={{
              fontFamily: 'var(--font-serif)', fontWeight: 300, fontSize: '54px',
              color: 'var(--gold)', lineHeight: 1, display: 'block',
            }}>{s.n}</span>
            <span style={{
              fontSize: '10px', fontWeight: 600, letterSpacing: '0.2em',
              textTransform: 'uppercase', color: 'var(--secondary)',
              marginTop: '12px', display: 'block',
            }}>{s.l}</span>
          </div>
        ))}
      </div>
    </section>
  )
}
