'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

export default function Nav() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const update = () => setScrolled(window.scrollY > 30)
    update(); window.addEventListener('scroll', update, { passive: true })
    return () => window.removeEventListener('scroll', update)
  }, [])
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  return (
    <header className={`nav-v3-wrap ${scrolled ? 'scrolled' : ''}`}>
      <nav className="container nav-v3" aria-label="Primary navigation">
        <a href="#hero" className="v3-brand" aria-label="ADPS home"><span className="brand-bracket">[</span>ADPS<span className="brand-bracket">]</span></a>
        <div className={`nav-v3-links ${open ? 'open' : ''}`}>
          <a href="#about" onClick={() => setOpen(false)}>Approach</a>
          <a href="#services" onClick={() => setOpen(false)}>Capabilities</a>
          <a href="#portfolio" onClick={() => setOpen(false)}>Signature work</a>
          <a href="#process" onClick={() => setOpen(false)}>Method</a>
          <Link href="/ask" onClick={() => setOpen(false)}>Ask the Strategist</Link>
          <a href="#contact" className="nav-enquire" onClick={() => setOpen(false)}>Enquire <span>↗</span></a>
        </div>
        <button type="button" className="nav-v3-toggle" aria-label={open ? 'Close menu' : 'Open menu'} aria-expanded={open} onClick={() => setOpen(v => !v)}><span /><span /></button>
      </nav>
    </header>
  )
}
