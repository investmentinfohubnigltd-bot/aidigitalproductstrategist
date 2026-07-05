'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'

export default function Nav() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
      padding: '0 60px', height: '68px',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      borderBottom: scrolled ? '1px solid var(--rule)' : '1px solid transparent',
      background: scrolled ? 'rgba(28,26,22,0.96)' : 'transparent',
      backdropFilter: scrolled ? 'blur(16px)' : 'none',
      transition: 'border-color 0.4s, background 0.4s',
    }}>
      <a href="#hero" style={{
        fontFamily: "'Cormorant Garamond', 'Palatino Linotype', Georgia, serif",
        fontWeight: 400, fontSize: '20px', letterSpacing: '0.08em',
        color: 'var(--parchment)', textDecoration: 'none',
      }}>
        <span className="nav-logo-text">AI<em style={{ fontStyle: 'italic', color: 'var(--gold)' }}>·</em>DS</span>
      </a>
      <ul className="nav-links-list" style={{ display: 'flex', alignItems: 'center', gap: '44px', listStyle: 'none' }}>
        <li>
          <Link className="nav-link-item nav-ask-item" href="/ask" style={{
            fontSize: '11px', fontWeight: 500, letterSpacing: '0.18em',
            textTransform: 'uppercase', color: 'var(--gold)',
            textDecoration: 'none', transition: 'color 0.2s',
          }}
          onMouseEnter={e => (e.currentTarget.style.color = 'var(--parchment)')}
          onMouseLeave={e => (e.currentTarget.style.color = 'var(--gold)')}
          >Ask the Strategist</Link>
        </li>
        {['About', 'Services', 'Portfolio', 'Process'].map(item => (
          <li key={item}>
            <a className="nav-link-item" href={`#${item.toLowerCase()}`} style={{
              fontSize: '11px', fontWeight: 500, letterSpacing: '0.18em',
              textTransform: 'uppercase', color: 'var(--secondary)',
              textDecoration: 'none', transition: 'color 0.2s',
            }}
            onMouseEnter={e => (e.currentTarget.style.color = 'var(--parchment)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'var(--secondary)')}
            >{item}</a>
          </li>
        ))}
        <li>
          <a className="nav-cta-btn" href="#contact" style={{
            fontSize: '11px', fontWeight: 500, letterSpacing: '0.18em',
            textTransform: 'uppercase', color: 'var(--gold)',
            border: '1px solid var(--gold-dim)', padding: '9px 22px',
            textDecoration: 'none', transition: 'background 0.2s, color 0.2s',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'var(--gold)'; e.currentTarget.style.color = 'var(--ink)' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--gold)' }}
          >Enquire</a>
        </li>
      </ul>
    </nav>
  )
}
