import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <a className="brand" href="#hero"><span>AI</span><i>/</i>DPS</a>
        <p>Independent AI product strategy and technical execution.</p>
        <div><Link href="/ask">Ask the Strategist</Link><a href="https://instagram.com/aidigitalproductstrategist" target="_blank" rel="noopener noreferrer">Instagram</a></div>
        <small>© 2026 AI Digital Product Strategist</small>
      </div>
    </footer>
  )
}
