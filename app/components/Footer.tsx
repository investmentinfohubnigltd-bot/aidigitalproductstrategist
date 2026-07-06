import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="footer-wrap" style={{
      background: 'var(--ink)', borderTop: '1px solid var(--rule)',
      padding: '36px var(--gutter)', display: 'flex',
      justifyContent: 'space-between', alignItems: 'center', gap: '24px',
    }}>
      <a href="#hero" aria-label="AI·DS — back to top" style={{
        fontFamily: 'var(--font-serif)', fontWeight: 400, fontSize: '18px',
        letterSpacing: '0.1em', color: 'var(--parchment)', textDecoration: 'none',
      }}>
        AI<em style={{ fontStyle: 'italic', color: 'var(--gold)' }}>·</em>DS
      </a>

      <span style={{ fontSize: '11px', fontWeight: 300, letterSpacing: '0.04em', color: 'var(--tertiary)' }}>
        © 2026 AI Digital Product Strategist. All rights reserved.
      </span>

      <div style={{ display: 'flex', alignItems: 'center', gap: '28px' }}>
        <Link href="/ask" style={{
          fontSize: '11px', fontWeight: 600, letterSpacing: '0.14em',
          textTransform: 'uppercase', color: 'var(--secondary)', textDecoration: 'none',
          transition: 'color var(--t-fast)',
        }}>Ask the Strategist</Link>
        <a href="https://instagram.com/aidigitalproductstrategist" target="_blank" rel="noopener noreferrer"
          style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.14em', color: 'var(--gold)', textDecoration: 'none' }}>
          @aidigitalproductstrategist
        </a>
      </div>
    </footer>
  )
}
