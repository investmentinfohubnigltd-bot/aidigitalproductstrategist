'use client'
import { useState } from 'react'
import Link from 'next/link'

type Product = {
  num: string
  name: string
  desc: string
  category: string
  url?: string
  href?: string
  internal?: boolean
  status: 'live' | 'development'
}

// 12 products across 11 industries. Every card carries its industry tag so the
// claim is substantiated on the page. No invented metrics or URLs.
const products: Product[] = [
  { num: '01', name: 'Cloakra', category: 'Identity & Security', url: 'cloakra.com', href: 'https://cloakra.com', status: 'live',
    desc: 'An invite-only AI identity protection platform for public figures — voice enrollment, search monitoring, verified statements, and takedown infrastructure.' },
  { num: '02', name: 'WingWatch', category: 'Aviation', url: 'wingwatch.ng', href: 'https://wingwatch.ng', status: 'live',
    desc: 'A consumer rights platform for air passengers — flight tracker, compensation calculator, delay diary, and a premium claims service.' },
  { num: '03', name: 'TradeSprint', category: 'Logistics', url: 'tradesprint.ng', href: 'https://tradesprint.ng', status: 'live',
    desc: 'A cargo clearance companion helping importers and clearing agents navigate duties, regulations, and multi-agency compliance.' },
  { num: '04', name: 'Football FanIQ', category: 'Sports', url: 'footballfaniq.com', href: 'https://footballfaniq.com', status: 'live',
    desc: 'An all-in-one football fan platform with match tracker, VAR decoder, fan wallet, MindScore, and broadcast rights finder across 195 countries.' },
  { num: '05', name: 'Sonalia', category: 'Luxury', url: 'sonalia.africa', href: 'https://sonalia.africa', status: 'live',
    desc: "Africa's first invite-only luxury membership community for high-achieving women — curated brand partnerships and editorial content." },
  { num: '06', name: 'InsightEx', category: 'Market Intelligence', url: 'dashboard.investmentinfohubnigeria.com', href: 'https://dashboard.investmentinfohubnigeria.com', status: 'live',
    desc: 'A financial intelligence dashboard covering equities, FX, macro, and fixed income — delivering automated daily market data.' },
  { num: '07', name: 'Vaulté', category: 'Luxury', url: 'vaulte.africa', href: 'https://vaulte.africa', status: 'development',
    desc: 'A private luxury platform connecting authenticated global brands to verified high-net-worth individuals across Africa. Three membership tiers.' },
  { num: '08', name: 'Keeep', category: 'Fintech', url: 'keeep.ng', href: 'https://keeep.ng', status: 'development',
    desc: 'A fintech PWA for informal economy operators — daily ledger, digital cooperative savings, and a behavioural credit readiness score from 0 to 1000.' },
  { num: '09', name: 'ScamProtect', category: 'Consumer Protection', status: 'development',
    desc: 'A consumer-protection tool that helps everyday people recognise fraudulent messages, fake offers, and financial scams before they part with money or details.' },
  { num: '10', name: 'LearnedIQ', category: 'Legal Tech', status: 'development',
    desc: 'A legal-knowledge platform that turns dense statutes and everyday legal questions into plain, practical answers — for people who can’t afford a first consultation.' },
  { num: '11', name: 'SupplyLensIQ', category: 'Supply Chain Intelligence', status: 'development',
    desc: 'A supply-chain intelligence tool giving operators clearer visibility into sourcing, inventory, and the moving parts behind getting goods where they need to be.' },
  { num: '12', name: 'Ask the Strategist', category: 'AI Mentorship', href: '/ask', internal: true, status: 'live',
    desc: 'An AI product-strategy mentor trained on my own frameworks and market experience — naira examples, real constraints, and one clear next step. Available now.' },
]

// One card body, rendered identically for every product regardless of link type.
// Order of slots is fixed for all 12: number · title · description · status badge · industry tag.
function CardBody({ p, hovered }: { p: Product; hovered: boolean }) {
  return (
    <>
      {/* number */}
      <span className="pi-num-cell" style={{
        fontFamily: 'var(--font-serif)', fontSize: '14px', fontStyle: 'italic', color: 'var(--tertiary)',
      }}>{p.num}</span>

      {/* title · description · status badge */}
      <div>
        <span className="pi-name-cell" style={{
          fontFamily: 'var(--font-serif)', fontWeight: 400, fontSize: '32px', lineHeight: 1.15,
          display: 'block', letterSpacing: '-0.01em',
          color: hovered ? 'var(--gold)' : 'var(--parchment)', transition: 'color var(--t-mid)',
        }}>{p.name}</span>

        <span style={{
          fontSize: '13px', fontWeight: 300, color: 'var(--secondary)',
          lineHeight: 1.7, marginTop: '10px', display: 'block', maxWidth: '46ch',
        }}>{p.desc}</span>

        {p.status === 'development' && (
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px', marginTop: '14px',
            fontSize: '10px', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase',
            color: 'var(--gold)', border: '1px solid var(--gold-dim)', padding: '6px 13px',
          }}>In Development</span>
        )}
      </div>

      {/* industry tag · url / live indicator — identical treatment for all 12 */}
      {/* Top-aligned so the industry tag lines up with the product title.
          The row is align-items:center, but development cards have a taller
          middle column (extra badge) with a single-line right column — left
          centered, the lone tag floats to the row's vertical middle and reads
          as detached from the title. alignSelf pins it to the top for all 12. */}
      <div className="pi-meta-cell" style={{
        display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px', textAlign: 'right',
        alignSelf: 'flex-start',
      }}>
        <span className="pi-tag-cell" style={{
          fontSize: '10px', fontWeight: 600, letterSpacing: '0.2em', textTransform: 'uppercase',
          // Literal hex fallback so the gold tag never depends on --gold resolving
          // (guards against a stale/partial CSS bundle dropping the custom property).
          color: 'var(--gold, #D4B074)',
        }}>{p.category}</span>
        {p.url ? (
          <span style={{ fontSize: '12px', fontWeight: 300, letterSpacing: '0.04em', color: 'var(--tertiary)' }}>
            {p.url}
          </span>
        ) : p.internal ? (
          <span style={{ fontSize: '11px', fontWeight: 500, letterSpacing: '0.08em', color: 'var(--tertiary)' }}>
            Live now
          </span>
        ) : (
          // Cards 9–11 have no public URL yet. Plain-text "Coming soon" in the
          // exact same style as the domain line above, so all 12 cards carry an
          // identical two-line right column (tag + second line).
          <span style={{ fontSize: '12px', fontWeight: 300, letterSpacing: '0.04em', color: 'var(--tertiary)' }}>
            Coming soon
          </span>
        )}
      </div>

      {p.href && (
        <span className="pi-arrow-cell" aria-hidden style={{
          position: 'absolute', right: 0, top: '50%', marginTop: '-9px',
          fontSize: '18px', color: 'var(--gold)',
          opacity: hovered ? 1 : 0,
          transform: hovered ? 'translateX(0)' : 'translateX(-8px)',
          transition: 'opacity var(--t-mid), transform var(--t-mid)',
        }}>→</span>
      )}
    </>
  )
}

function PortfolioItem({ p, delay }: { p: Product; delay: string }) {
  const [hovered, setHovered] = useState(false)
  const interactive = !!p.href

  // Identical hover treatment on all 12 cards — linked or not: the same lift
  // (horizontal gutter inset + surface fill), the same gold title highlight
  // (in CardBody), and the same --t-mid timing. The lift is no longer gated on
  // `interactive`, so unlinked cards (9–11) animate exactly like linked ones.
  // Unlinked cards keep cursor:default so they don't pretend to be clickable.
  const style: React.CSSProperties = {
    display: 'grid', gridTemplateColumns: '54px 1fr 240px', gap: '44px', alignItems: 'center',
    padding: hovered ? '46px var(--gutter)' : '46px 0',
    margin: hovered ? '0 calc(-1 * var(--gutter))' : '0',
    borderBottom: '1px solid var(--rule)',
    background: hovered ? 'var(--surface)' : 'transparent',
    transition: 'background var(--t-mid), padding var(--t-mid), margin var(--t-mid)',
    position: 'relative', textDecoration: 'none',
    cursor: interactive ? 'pointer' : 'default',
  }

  const handlers = {
    onMouseEnter: () => setHovered(true),
    onMouseLeave: () => setHovered(false),
    onFocus: () => setHovered(true),
    onBlur: () => setHovered(false),
  }
  const className = `reveal portfolio-row-grid ${delay}`

  if (p.internal && p.href) {
    return (
      <Link href={p.href} className={className} style={style} {...handlers}>
        <CardBody p={p} hovered={hovered} />
      </Link>
    )
  }
  if (p.href) {
    return (
      <a href={p.href} target="_blank" rel="noopener noreferrer" className={className} style={style} {...handlers}>
        <CardBody p={p} hovered={hovered} />
      </a>
    )
  }
  return (
    <div className={className} style={style} {...handlers}>
      <CardBody p={p} hovered={hovered} />
    </div>
  )
}

export default function Portfolio() {
  return (
    <section id="portfolio" className="section" style={{ background: 'var(--lift)' }}>
      <div className="container">
        <p className="eyebrow reveal" style={{ marginBottom: '48px' }}>Portfolio</p>

        <h2 className="reveal" style={{
          fontFamily: 'var(--font-serif)', fontWeight: 300,
          fontSize: 'clamp(42px, 5.5vw, 74px)', lineHeight: 1.06,
          letterSpacing: '-0.02em', color: 'var(--parchment)', marginBottom: '28px',
        }}>
          Twelve products.<br />
          <em style={{ color: 'var(--gold)' }}>Eleven industries.</em>
        </h2>

        <p className="reveal reveal-d1" style={{
          fontSize: '15px', fontWeight: 300, color: 'var(--secondary)',
          lineHeight: 1.8, maxWidth: '58ch', marginBottom: '72px',
        }}>
          Twelve products developed across eleven industries — each taken from idea to deployment,
          most solo-operated, all under one studio standard.
        </p>

        <div style={{ borderTop: '1px solid var(--rule)' }}>
          {products.map((p, i) => (
            <PortfolioItem key={p.num} p={p} delay={`reveal-d${(i % 4) + 1}`} />
          ))}
        </div>
      </div>
    </section>
  )
}
