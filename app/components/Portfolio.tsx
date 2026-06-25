'use client'
import { useState } from 'react'

const products = [
  { num: '01', name: 'TradeSprint', desc: 'A cargo clearance companion helping importers and clearing agents navigate duties, regulations, and multi-agency compliance.', category: 'Logistics', url: 'tradesprint.ng', href: 'https://tradesprint.ng', status: '' },
  { num: '02', name: 'WingWatch', desc: 'A consumer rights platform for air passengers — flight tracker, compensation calculator, delay diary, and a premium claims service.', category: 'Aviation', url: 'wingwatch.ng', href: 'https://wingwatch.ng', status: '' },
  { num: '03', name: 'InsightEx', desc: 'A financial intelligence dashboard covering equities, FX, macro, and fixed income — delivering automated daily market data.', category: 'Fintech', url: 'dashboard.investmentinfohubnigeria.com', href: 'https://dashboard.investmentinfohubnigeria.com', status: '' },
  { num: '04', name: 'Football FanIQ', desc: 'An all-in-one football fan platform with match tracker, VAR decoder, fan wallet, MindScore, and broadcast rights finder across 195 countries.', category: 'Sports', url: 'footballfaniq.com', href: 'https://footballfaniq.com', status: '' },
  { num: '05', name: 'Cloakra', desc: 'An invite-only AI identity protection platform for public figures — voice enrollment, search monitoring, verified statements, takedown infrastructure.', category: 'Identity & Security', url: 'cloakra.com', href: 'https://cloakra.com', status: '' },
  { num: '06', name: 'Sonalia', desc: "Africa's first invite-only luxury membership community for high-achieving women — curated brand partnerships and editorial content.", category: 'Luxury', url: 'sonalia.africa', href: 'https://sonalia.africa', status: '' },
  { num: '07', name: 'Vaulté', desc: 'A private luxury platform connecting authenticated global brands to verified high-net-worth individuals across Africa. Three membership tiers.', category: 'Luxury', url: 'vaulte.africa', href: 'https://vaulte.africa', status: 'development' },
  { num: '08', name: 'Keeep', desc: 'A fintech PWA for informal economy operators — daily ledger, digital cooperative savings, and a behavioural credit readiness score from 0 to 1000.', category: 'Fintech', url: 'keeep.ng', href: 'https://keeep.ng', status: 'development' },
]

type Product = typeof products[0]

function PortfolioItem({ p, delay }: { p: Product; delay: string }) {
  const [hovered, setHovered] = useState(false)
  const isDev = p.status === 'development'

  return (
    <a
      href={p.href}
      target="_blank"
      rel="noopener noreferrer"
      className={`reveal portfolio-row-grid ${delay}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'grid', gridTemplateColumns: '60px 1fr 180px 160px',
        gap: '48px', alignItems: 'center',
        padding: hovered ? '52px 60px' : '52px 0',
        margin: hovered ? '0 -60px' : '0',
        borderBottom: '1px solid var(--rule)',
        textDecoration: 'none',
        background: hovered ? 'var(--surface)' : 'transparent',
        transition: 'all 0.2s',
        position: 'relative',
      }}>
      <span style={{
        fontFamily: "'Cormorant Garamond', 'Palatino Linotype', Georgia, serif",
        fontSize: '14px', fontStyle: 'italic', color: 'var(--tertiary)',
      }} className="pi-num-cell">{p.num}</span>
      <div>
        <span style={{
          fontFamily: "'Cormorant Garamond', 'Palatino Linotype', Georgia, serif",
          fontWeight: 400, fontSize: '30px', lineHeight: 1.2, display: 'block',
          color: hovered ? 'var(--gold)' : 'var(--parchment)',
          transition: 'color 0.25s',
        }} className="pi-name-cell">{p.name}</span>
        <span style={{
          fontSize: '13px', fontWeight: 300, color: 'var(--secondary)',
          lineHeight: 1.7, marginTop: '8px', display: 'block',
        }}>{p.desc}</span>
        {isDev && (
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            marginTop: '12px', fontSize: '11px', fontWeight: 500,
            letterSpacing: '0.1em', textTransform: 'uppercase',
            color: 'var(--gold)', border: '1px solid var(--gold-dim)',
            padding: '6px 14px',
          }}>
            🛠️ In Development &nbsp;·&nbsp; Join the Waitlist
          </span>
        )}
      </div>
      <span style={{
        fontSize: '10px', fontWeight: 500, letterSpacing: '0.22em',
        textTransform: 'uppercase', color: 'var(--tertiary)',
      }} className="pi-cat-cell">{p.category}</span>
      <div className="pi-url-cell">
        <span style={{ fontSize: '12px', fontWeight: 300, letterSpacing: '0.06em', color: 'var(--secondary)', display: 'block' }}>
          {p.url}
        </span>
      </div>
      <span style={{
        position: 'absolute', right: '0', fontSize: '18px', color: 'var(--gold)',
        opacity: hovered ? 1 : 0,
        transform: hovered ? 'translateX(0)' : 'translateX(-10px)',
        transition: 'opacity 0.25s, transform 0.25s',
      }} className="pi-arrow-cell">→</span>
    </a>
  )
}

export default function Portfolio() {
  return (
    <section id="portfolio" className="section-pad" style={{
      padding: '140px 60px', borderTop: '1px solid var(--rule)',
      background: 'var(--lift)',
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <p className="reveal" style={{
          fontSize: '10px', fontWeight: 500, letterSpacing: '0.28em',
          textTransform: 'uppercase', color: 'var(--gold)',
          marginBottom: '80px', display: 'flex', alignItems: 'center', gap: '20px',
        }}>
          Portfolio
          <span style={{ flex: 1, height: '1px', background: 'var(--rule)', maxWidth: '80px' }} />
        </p>
        <h2 className="reveal" style={{
          fontFamily: "'Cormorant Garamond', 'Palatino Linotype', Georgia, serif",
          fontWeight: 300, fontSize: 'clamp(44px, 5.5vw, 72px)',
          lineHeight: 1.1, letterSpacing: '-0.02em', color: 'var(--parchment)',
          marginBottom: '80px',
        }}>
          Eight live products.<br /><em style={{ fontStyle: 'italic', color: 'var(--gold)' }}>All built from scratch.</em>
        </h2>
        <div style={{ borderTop: '1px solid var(--rule)' }}>
          {products.map((p, i) => (
            <PortfolioItem key={p.num} p={p} delay={`reveal-d${(i % 4) + 1}`} />
          ))}
        </div>
      </div>
    </section>
  )
}
