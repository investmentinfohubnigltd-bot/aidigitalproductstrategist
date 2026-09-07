import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="footer-v3">
      <div className="container">
        <div className="footer-v3-main">
          <a href="#hero" className="v3-brand" aria-label="ADPS home"><span className="brand-bracket">[</span>ADPS<span className="brand-bracket">]</span></a>
          <p>AI product strategy, architecture and full-stack execution.</p>
          <div><Link href="/ask">Ask the Strategist</Link><a href="https://instagram.com/aidigitalproductstrategist" target="_blank" rel="noopener noreferrer">Instagram</a></div>
        </div>
        <div className="footer-v3-bottom"><span>© 2026 ADPS · AI Digital Product Strategist</span><span>Independent practice · Nigeria · Global outlook</span></div>
      </div>
    </footer>
  )
}
