'use client'
import { useState } from 'react'

const services = [
  { idx: 'i', name: 'End-to-End Product Build', desc: 'A complete, working product — designed, built, and deployed. Authentication, database, interface, admin panel, and everything in between. No handoffs. No gaps.' },
  { idx: 'ii', name: 'Starter MVP', desc: 'One core flow, built properly and deployed fast. The clearest path from an idea to something real people can use — without unnecessary scope.' },
  { idx: 'iii', name: 'Brand & Content Strategy', desc: 'Positioning, voice, content architecture, and social strategy — the foundation that turns a business into a brand people remember and trust.' },
  { idx: 'iv', name: 'Monthly Strategy Retainer', desc: 'Ongoing strategic direction, content guidance, and brand consistency — for businesses serious about building a presence that compounds over time.' },
]

function ServiceRow({ s, delay }: { s: typeof services[0]; delay: string }) {
  const [hovered, setHovered] = useState(false)
  return (
    <div
      className={`reveal ${delay}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'grid', gridTemplateColumns: '80px 1fr 1.2fr auto',
        gap: '40px', alignItems: 'center',
        padding: hovered ? '44px 60px' : '44px 0',
        margin: hovered ? '0 -60px' : '0',
        borderBottom: '1px solid var(--rule)',
        background: hovered ? 'var(--lift)' : 'transparent',
        transition: 'all 0.2s',
        cursor: 'default',
      }}>
      <div style={{
        fontFamily: "'Cormorant Garamond', 'Palatino Linotype', Georgia, serif",
        fontWeight: 300, fontSize: '32px', color: 'var(--tertiary)', fontStyle: 'italic',
      }}>{s.idx}</div>
      <div style={{
        fontFamily: "'Cormorant Garamond', 'Palatino Linotype', Georgia, serif",
        fontWeight: 400, fontSize: '26px', color: 'var(--parchment)',
      }}>{s.name}</div>
      <div style={{ fontSize: '14px', fontWeight: 300, color: 'var(--secondary)', lineHeight: 1.75 }}>{s.desc}</div>
      <div>
        <a href="#contact" style={{
          fontSize: '10px', fontWeight: 500, letterSpacing: '0.2em',
          textTransform: 'uppercase', color: 'var(--gold)',
          textDecoration: 'none', whiteSpace: 'nowrap',
          borderBottom: '1px solid var(--gold-dim)', paddingBottom: '2px',
        }}>Request a Quote →</a>
      </div>
    </div>
  )
}

export default function Services() {
  return (
    <section id="services" style={{
      padding: '140px 60px', borderTop: '1px solid var(--rule)',
      background: 'var(--ink)',
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <p className="reveal" style={{
          fontSize: '10px', fontWeight: 500, letterSpacing: '0.28em',
          textTransform: 'uppercase', color: 'var(--gold)',
          marginBottom: '80px', display: 'flex', alignItems: 'center', gap: '20px',
        }}>
          Services
          <span style={{ flex: 1, height: '1px', background: 'var(--rule)', maxWidth: '80px' }} />
        </p>
        <h2 className="reveal" style={{
          fontFamily: "'Cormorant Garamond', 'Palatino Linotype', Georgia, serif",
          fontWeight: 300, fontSize: 'clamp(44px, 5.5vw, 72px)',
          lineHeight: 1.1, letterSpacing: '-0.02em', color: 'var(--parchment)',
          marginBottom: '80px',
        }}>
          Services rendered<br />with <em style={{ fontStyle: 'italic', color: 'var(--gold)' }}>full precision.</em>
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
