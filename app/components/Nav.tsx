'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'

const SECTIONS = ['about', 'services', 'portfolio', 'process'] as const

export default function Nav() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState<string>('')

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Scrollspy — highlight the section currently in view.
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActive(e.target.id)
        })
      },
      { rootMargin: '-45% 0px -50% 0px' },
    )
    SECTIONS.forEach((id) => {
      const el = document.getElementById(id)
      if (el) observer.observe(el)
    })
    return () => observer.disconnect()
  }, [])

  // Lock scroll while the mobile menu is open.
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  return (
    <header>
      <nav
        aria-label="Primary"
        style={{
          position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
          padding: '0 var(--gutter)', height: '72px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          borderBottom: scrolled ? '1px solid var(--rule)' : '1px solid transparent',
          background: scrolled ? 'rgba(28,26,22,0.9)' : 'transparent',
          backdropFilter: scrolled ? 'blur(18px) saturate(1.1)' : 'none',
          WebkitBackdropFilter: scrolled ? 'blur(18px) saturate(1.1)' : 'none',
          transition: 'border-color var(--t-mid), background var(--t-mid)',
        }}
      >
        <a href="#hero" aria-label="AI·DS — back to top" style={{
          fontFamily: 'var(--font-serif)',
          fontWeight: 400, fontSize: '21px', letterSpacing: '0.08em',
          color: 'var(--parchment)', textDecoration: 'none',
        }}>
          AI<em style={{ fontStyle: 'italic', color: 'var(--gold)' }}>·</em>DS
        </a>

        {/* Desktop links */}
        <ul className="nav-desktop" style={{ display: 'flex', alignItems: 'center', gap: '38px', listStyle: 'none' }}>
          {SECTIONS.map((item) => {
            const isActive = active === item
            return (
              <li key={item}>
                <a href={`#${item}`} style={{
                  fontSize: '11px', fontWeight: 500, letterSpacing: '0.18em',
                  textTransform: 'uppercase',
                  color: isActive ? 'var(--gold)' : 'var(--secondary)',
                  textDecoration: 'none', paddingBottom: '4px',
                  borderBottom: `1px solid ${isActive ? 'var(--gold-dim)' : 'transparent'}`,
                  transition: 'color var(--t-fast), border-color var(--t-fast)',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--parchment)')}
                onMouseLeave={(e) => (e.currentTarget.style.color = isActive ? 'var(--gold)' : 'var(--secondary)')}
                >{item}</a>
              </li>
            )
          })}
          <li>
            <a href="#contact" style={{
              fontSize: '11px', fontWeight: 500, letterSpacing: '0.18em',
              textTransform: 'uppercase', color: 'var(--secondary)',
              textDecoration: 'none', transition: 'color var(--t-fast)',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--parchment)')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--secondary)')}
            >Enquire</a>
          </li>
          <li>
            <Link href="/ask" className="nav-cta" style={{
              fontSize: '11px', fontWeight: 600, letterSpacing: '0.16em',
              textTransform: 'uppercase', color: 'var(--ink)',
              background: 'var(--gold)', padding: '10px 22px',
              textDecoration: 'none', transition: 'background var(--t-fast)',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--gold-soft)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'var(--gold)')}
            >Ask the Strategist</Link>
          </li>
        </ul>

        {/* Mobile trigger */}
        <button
          type="button"
          className="nav-burger"
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          style={{
            display: 'none', width: '44px', height: '44px',
            alignItems: 'center', justifyContent: 'center',
            background: 'transparent', border: 'none', cursor: 'pointer',
          }}
        >
          <span style={{ position: 'relative', width: '22px', height: '12px', display: 'block' }}>
            <span style={{
              position: 'absolute', left: 0, top: open ? '5px' : 0, width: '22px', height: '1.5px',
              background: 'var(--parchment)', transition: 'transform var(--t-mid) var(--ease), top var(--t-mid) var(--ease)',
              transform: open ? 'rotate(45deg)' : 'none',
            }} />
            <span style={{
              position: 'absolute', left: 0, bottom: open ? '5px' : 0, width: '22px', height: '1.5px',
              background: 'var(--parchment)', transition: 'transform var(--t-mid) var(--ease), bottom var(--t-mid) var(--ease)',
              transform: open ? 'rotate(-45deg)' : 'none',
            }} />
          </span>
        </button>
      </nav>

      {/* Mobile overlay menu */}
      <div
        className="nav-overlay"
        aria-hidden={!open}
        style={{
          position: 'fixed', inset: 0, zIndex: 99,
          background: 'rgba(28,26,22,0.98)',
          backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
          display: 'flex', flexDirection: 'column',
          justifyContent: 'center', padding: '0 32px',
          opacity: open ? 1 : 0,
          visibility: open ? 'visible' : 'hidden',
          transition: 'opacity var(--t-mid) var(--ease), visibility var(--t-mid)',
        }}
      >
        <Link href="/ask" onClick={() => setOpen(false)} style={{
          fontFamily: 'var(--font-serif)', fontStyle: 'italic',
          fontSize: '34px', color: 'var(--gold)', textDecoration: 'none',
          padding: '14px 0', borderBottom: '1px solid var(--rule)',
        }}>Ask the Strategist</Link>
        {SECTIONS.map((item) => (
          <a key={item} href={`#${item}`} onClick={() => setOpen(false)} style={{
            fontFamily: 'var(--font-serif)', fontSize: '34px',
            textTransform: 'capitalize', color: 'var(--parchment)',
            textDecoration: 'none', padding: '14px 0',
            borderBottom: '1px solid var(--rule)',
          }}>{item}</a>
        ))}
        <a href="#contact" onClick={() => setOpen(false)} style={{
          fontFamily: 'var(--font-serif)', fontSize: '34px',
          color: 'var(--parchment)', textDecoration: 'none', padding: '14px 0',
        }}>Enquire</a>
      </div>

      <style>{`
        @media (max-width: 820px) {
          .nav-desktop { display: none !important; }
          .nav-burger { display: flex !important; }
        }
        @media (min-width: 821px) {
          .nav-overlay { display: none !important; }
        }
      `}</style>
    </header>
  )
}
