export default function Footer() {
  return (
    <footer className="footer-wrap" style={{
      background: 'var(--ink)', borderTop: '1px solid var(--rule)',
      padding: '36px 60px', display: 'flex',
      justifyContent: 'space-between', alignItems: 'center',
    }}>
      <a href="#hero" style={{
        fontFamily: "'Cormorant Garamond', 'Palatino Linotype', Georgia, serif",
        fontWeight: 400, fontSize: '17px', letterSpacing: '0.1em',
        color: 'var(--parchment)', textDecoration: 'none',
      }}>
        AI<em style={{ fontStyle: 'italic', color: 'var(--gold)' }}>·</em>DS
      </a>
      <span style={{ fontSize: '11px', fontWeight: 300, letterSpacing: '0.06em', color: 'var(--tertiary)' }}>
        © 2026 AI Digital Product Strategist. All rights reserved.
      </span>
      <a
        href="https://instagram.com/aidigitalproductstrategist"
        target="_blank"
        rel="noopener noreferrer"
        style={{ fontSize: '11px', fontWeight: 500, letterSpacing: '0.14em', color: 'var(--gold)', textDecoration: 'none' }}
      >
        @aidigitalproductstrategist
      </a>
    </footer>
  )
}
