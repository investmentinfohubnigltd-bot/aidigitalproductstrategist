'use client'
import { useState } from 'react'

const services = [
  { idx: 'i', name: 'End-to-End Product Development', desc: 'A complete, working product — designed, developed, and deployed. Authentication, database, interface, admin panel, and everything in between. No handoffs. No gaps.' },
  { idx: 'ii', name: 'Starter MVP', desc: 'One core flow, developed properly and deployed fast. The clearest path from an idea to something real people can use — without unnecessary scope.' },
  { idx: 'iii', name: 'Brand & Content Strategy', desc: 'Positioning, voice, content architecture, and social strategy — the foundation that turns a business into a brand people remember and trust.' },
  { idx: 'iv', name: 'Monthly Strategy Retainer', desc: 'Ongoing strategic direction, content guidance, and brand consistency — for businesses serious about building a presence that compounds over time.' },
]

function ServiceRow({ s, delay }: { s: typeof services[0]; delay: string }) {
  const [hovered, setHovered] = useState(false)
  return (
    <div
      className={`reveal service-row-grid ${delay}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'grid', gridTemplateColumns: '72px 1fr 1.2fr auto',
        gap: '40px', alignItems: 'center',
        padding: hovered ? '44px var(--gutter)' : '44px 0',
        margin: hovered ? '0 calc(-1 * var(--gutter))' : '0',
        borderBottom: '1px solid var(--rule)',
        background: hovered ? 'var(--lift)' : 'transparent',
        transition: 'background var(--t-mid), padding var(--t-mid), margin var(--t-mid)',
      }}>
      <div className="svc-idx" style={{
        fontFamily: 'var(--font-serif)', fontWeight: 300, fontSize: '32px',
        color: 'var(--tertiary)', fontStyle: 'italic',
      }}>{s.idx}</div>
      <div className="svc-name" style={{
        fontFamily: 'var(--font-serif)', fontWeight: 400, fontSize: '27px',
        color: hovered ? 'var(--gold)' : 'var(--parchment)', letterSpacing: '-0.01em',
        transition: 'color var(--t-mid)',
      }}>{s.name}</div>
      <div className="svc-desc" style={{ fontSize: '14px', fontWeight: 300, color: 'var(--secondary)', lineHeight: 1.75 }}>{s.desc}</div>
      <div className="svc-cta">
        <a href="#contact" style={{
          fontSize: '10px', fontWeight: 600, letterSpacing: '0.18em', textTransform: 'uppercase',
          color: 'var(--gold)', textDecoration: 'none', whiteSpace: 'nowrap',
          borderBottom: '1px solid var(--gold-dim)', paddingBottom: '3px',
          transition: 'border-color var(--t-fast)',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--gold)')}
        onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--gold-dim)')}
        >Request a Quote →</a>
      </div>
    </div>
  )
}

export default function Services() {
  return (
    <section id="services" className="section" style={{ background: 'var(--ink)' }}>
      <div className="container">
        <p className="eyebrow reveal" style={{ marginBottom: '48px' }}>Services</p>
        <h2 className="reveal" style={{
          fontFamily: 'var(--font-serif)', fontWeight: 300, fontSize: 'clamp(42px, 5.5vw, 74px)',
          lineHeight: 1.06, letterSpacing: '-0.02em', color: 'var(--parchment)', marginBottom: '72px',
        }}>
          Services rendered<br />with <em style={{ color: 'var(--gold)' }}>full precision.</em>
        </h2>
        <div style={{ borderTop: '1px solid var(--rule)' }}>
          {services.map((s, i) => (
            <ServiceRow key={s.idx} s={s} delay={`reveal-d${i + 1}`} />
          ))}
        </div>
      </div>
    </section>
  )
}
