'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

const links = [['about', 'Approach'], ['services', 'Capabilities'], ['work', 'Systems'], ['process', 'Method']]

export default function Nav() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const update = () => setScrolled(window.scrollY > 24)
    update(); window.addEventListener('scroll', update, { passive: true })
    return () => window.removeEventListener('scroll', update)
  }, [])
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  return (
    <header className={`site-header ${scrolled ? 'is-scrolled' : ''}`}>
      <nav className="nav container" aria-label="Primary navigation">
        <a className="brand" href="#hero" aria-label="AI Digital Product Strategist home"><span>AI</span><i>/</i>DPS</a>
        <div className={`nav-links ${open ? 'is-open' : ''}`}>
          {links.map(([id, label]) => <a key={id} href={`#${id}`} onClick={() => setOpen(false)}>{label}</a>)}
          <Link className="nav-ask" href="/ask" onClick={() => setOpen(false)}>Ask the Strategist</Link>
          <a className="nav-contact" href="#contact" onClick={() => setOpen(false)}>Start a project <span>↗</span></a>
        </div>
        <button className="nav-toggle" type="button" aria-label={open ? 'Close menu' : 'Open menu'} aria-expanded={open} onClick={() => setOpen(v => !v)}>
          <span /><span />
        </button>
      </nav>
    </header>
  )
}
