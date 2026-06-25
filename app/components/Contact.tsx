'use client'
import { useState } from 'react'

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', message: '' })
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('sending')
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (res.ok) {
        setStatus('sent')
        setForm({ name: '', email: '', message: '' })
      } else {
        setStatus('error')
      }
    } catch {
      setStatus('error')
    }
  }

  const inputStyle = {
    width: '100%', background: 'transparent',
    border: 'none', borderBottom: '1px solid var(--rule)',
    padding: '14px 0', fontSize: '14px', fontWeight: 300,
    fontFamily: 'Inter, sans-serif', color: 'var(--parchment)',
    outline: 'none', marginBottom: '32px', display: 'block',
    transition: 'border-color 0.2s',
  }

  return (
    <section id="contact" style={{
      background: 'var(--lift)', borderTop: '1px solid var(--rule)',
    }}>
      <div style={{
        maxWidth: '1200px', margin: '0 auto',
        padding: '140px 60px',
        display: 'grid', gridTemplateColumns: '1fr 1fr',
        gap: '120px', alignItems: 'start',
      }}>
        {/* Left */}
        <div>
          <p className="reveal" style={{
            fontSize: '10px', fontWeight: 500, letterSpacing: '0.28em',
            textTransform: 'uppercase', color: 'var(--gold)',
            marginBottom: '48px', display: 'flex', alignItems: 'center', gap: '20px',
          }}>
            Let&apos;s work together
            <span style={{ flex: 1, height: '1px', background: 'var(--rule)', maxWidth: '80px' }} />
          </p>

          <h2 className="reveal" style={{
            fontFamily: "'Cormorant Garamond', 'Palatino Linotype', Georgia, serif",
            fontWeight: 300, fontStyle: 'italic',
            fontSize: 'clamp(44px, 5vw, 68px)',
            lineHeight: 1.1, color: 'var(--parchment)', marginBottom: '36px',
          }}>
            Have something<br />worth building?
          </h2>

          <p className="reveal" style={{
            fontSize: '14px', fontWeight: 300, color: 'var(--secondary)',
            lineHeight: 1.9, marginBottom: '52px',
          }}>
            Whether you are building from scratch, scaling something that exists, or trying to figure out where to even start — reach out. I respond to every serious enquiry personally.
          </p>

          <div className="reveal">
            {[
              { label: 'Instagram', value: '@aidigitalproductstrategist' },
              { label: 'Website', value: 'aidigitalproductstrategist.com' },
            ].map(l => (
              <div key={l.label} style={{
                display: 'flex', alignItems: 'center', gap: '24px',
                padding: '20px 0', borderBottom: '1px solid var(--rule)',
              }}>
                <span style={{
                  fontSize: '9px', fontWeight: 500, letterSpacing: '0.28em',
                  textTransform: 'uppercase', color: 'var(--tertiary)', minWidth: '80px',
                }}>{l.label}</span>
                <span style={{ fontSize: '14px', fontWeight: 300, color: 'var(--parchment)' }}>
                  {l.value}
                </span>
              </div>
            ))}
          </div>

          {/* Instagram CTA */}
          <div className="reveal" style={{
            marginTop: '60px', border: '1px solid var(--rule)',
            padding: '40px', position: 'relative', textAlign: 'center',
          }}>
            <div style={{
              position: 'absolute', top: '-1px', left: '50%',
              transform: 'translateX(-50%)', width: '60px',
              height: '1px', background: 'var(--gold)',
            }} />
            <span style={{
              fontSize: '10px', fontWeight: 500, letterSpacing: '0.28em',
              textTransform: 'uppercase', color: 'var(--gold)',
              marginBottom: '24px', display: 'block',
            }}>Fastest way to reach me</span>
            <span style={{
              fontFamily: "'Cormorant Garamond', 'Palatino Linotype', Georgia, serif",
              fontWeight: 300, fontStyle: 'italic', fontSize: '28px',
              color: 'var(--parchment)', lineHeight: 1.25,
              marginBottom: '28px', display: 'block',
            }}>Follow the page,<br />then send a message.</span>
            <span style={{
              fontSize: '11px', fontWeight: 400, letterSpacing: '0.14em',
              color: 'var(--secondary)', marginBottom: '20px', display: 'block',
            }}>On Instagram, send the word</span>
            <span style={{
              display: 'inline-block', fontSize: '13px', fontWeight: 600,
              letterSpacing: '0.28em', textTransform: 'uppercase',
              color: 'var(--ink)', background: 'var(--gold)', padding: '14px 32px',
            }}>STRATEGY</span>
          </div>
        </div>

        {/* Right — Email form */}
        <div className="reveal reveal-d2">
          <h3 style={{
            fontFamily: "'Cormorant Garamond', 'Palatino Linotype', Georgia, serif",
            fontWeight: 300, fontStyle: 'italic', fontSize: '32px',
            color: 'var(--parchment)', marginBottom: '48px',
          }}>Or send a message directly.</h3>

          {status === 'sent' ? (
            <div style={{
              border: '1px solid var(--rule)', padding: '48px', textAlign: 'center',
            }}>
              <p style={{
                fontFamily: "'Cormorant Garamond', 'Palatino Linotype', Georgia, serif",
                fontStyle: 'italic', fontSize: '24px', color: 'var(--gold)',
                marginBottom: '12px',
              }}>Message received.</p>
              <p style={{ fontSize: '14px', color: 'var(--secondary)' }}>
                I'll be in touch within 24 hours.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <label style={{ fontSize: '9px', letterSpacing: '0.28em', textTransform: 'uppercase', color: 'var(--tertiary)' }}>Name</label>
              <input
                type="text" required value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="Your name"
                style={{ ...inputStyle } as React.CSSProperties}
              />
              <label style={{ fontSize: '9px', letterSpacing: '0.28em', textTransform: 'uppercase', color: 'var(--tertiary)' }}>Email</label>
              <input
                type="email" required value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                placeholder="your@email.com"
                style={{ ...inputStyle } as React.CSSProperties}
              />
              <label style={{ fontSize: '9px', letterSpacing: '0.28em', textTransform: 'uppercase', color: 'var(--tertiary)' }}>What are you building?</label>
              <textarea
                required rows={6} value={form.message}
                onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                placeholder="Tell me about your idea, project, or what you need help with."
                style={{ ...inputStyle, resize: 'none' } as React.CSSProperties}
              />
              {status === 'error' && (
                <p style={{ fontSize: '13px', color: '#C97B5C', marginBottom: '16px' }}>
                  Something went wrong. Please try Instagram instead.
                </p>
              )}
              <button type="submit" disabled={status === 'sending'} style={{
                fontFamily: 'Inter, sans-serif', fontSize: '11px', fontWeight: 500,
                letterSpacing: '0.2em', textTransform: 'uppercase',
                color: 'var(--ink)', background: 'var(--gold)',
                padding: '16px 40px', border: 'none', cursor: 'pointer',
                opacity: status === 'sending' ? 0.6 : 1,
                transition: 'opacity 0.2s',
              }}>
                {status === 'sending' ? 'Sending...' : 'Send Message'}
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  )
}
