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

  const inputStyle: React.CSSProperties = {
    width: '100%', background: 'transparent',
    border: 'none', borderBottom: '1px solid var(--rule)',
    padding: '14px 0', fontSize: '15px', fontWeight: 300,
    fontFamily: 'var(--font-sans)', color: 'var(--parchment)',
    outline: 'none', marginBottom: '30px', display: 'block',
    transition: 'border-color var(--t-fast)',
  }
  const onFieldFocus = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    (e.currentTarget.style.borderBottomColor = 'var(--gold-dim)')
  const onFieldBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    (e.currentTarget.style.borderBottomColor = 'var(--rule)')

  const labelStyle: React.CSSProperties = {
    fontSize: '9px', fontWeight: 600, letterSpacing: '0.26em',
    textTransform: 'uppercase', color: 'var(--tertiary)',
  }

  return (
    <section id="contact" className="section" style={{ background: 'var(--lift)', padding: 'var(--section-y) 0' }}>
      <div className="container contact-grid-wrap" style={{
        padding: '0 var(--gutter)',
        display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '112px', alignItems: 'start',
      }}>
        {/* Left */}
        <div>
          <p className="eyebrow reveal" style={{ marginBottom: '44px' }}>Let&apos;s work together</p>

          <h2 className="reveal" style={{
            fontFamily: 'var(--font-serif)', fontWeight: 300, fontStyle: 'italic',
            fontSize: 'clamp(42px, 5vw, 70px)', lineHeight: 1.06,
            color: 'var(--parchment)', marginBottom: '32px', letterSpacing: '-0.01em',
          }}>
            Have something<br />worth developing?
          </h2>

          <p className="reveal" style={{
            fontSize: '15px', fontWeight: 300, color: 'var(--secondary)',
            lineHeight: 1.85, marginBottom: '48px', maxWidth: '48ch',
          }}>
            Whether you are building from scratch, scaling something that exists, or trying to figure
            out where to even start — reach out. I respond to every serious enquiry personally.
          </p>

          <div className="reveal">
            {[
              { label: 'Instagram', value: '@aidigitalproductstrategist' },
              { label: 'Website', value: 'aidigitalproductstrategist.com' },
            ].map((l) => (
              <div key={l.label} style={{
                display: 'flex', alignItems: 'center', gap: '24px',
                padding: '20px 0', borderBottom: '1px solid var(--rule)',
              }}>
                <span style={{
                  fontSize: '9px', fontWeight: 600, letterSpacing: '0.26em',
                  textTransform: 'uppercase', color: 'var(--tertiary)', minWidth: '84px',
                }}>{l.label}</span>
                <span style={{ fontSize: '14px', fontWeight: 300, color: 'var(--parchment)' }}>{l.value}</span>
              </div>
            ))}
          </div>

          {/* Instagram CTA */}
          <div className="reveal" style={{
            marginTop: '56px', border: '1px solid var(--rule)', padding: '40px',
            position: 'relative', textAlign: 'center', background: 'var(--surface)',
          }}>
            <div style={{
              position: 'absolute', top: '-1px', left: '50%', transform: 'translateX(-50%)',
              width: '60px', height: '1px', background: 'var(--gold)',
            }} />
            <span style={{
              fontSize: '10px', fontWeight: 600, letterSpacing: '0.26em', textTransform: 'uppercase',
              color: 'var(--gold)', marginBottom: '24px', display: 'block',
            }}>Fastest way to reach me</span>
            <span style={{
              fontFamily: 'var(--font-serif)', fontWeight: 300, fontStyle: 'italic', fontSize: '29px',
              color: 'var(--parchment)', lineHeight: 1.25, marginBottom: '28px', display: 'block',
            }}>Follow the page,<br />then send a message.</span>
            <span style={{
              fontSize: '11px', fontWeight: 400, letterSpacing: '0.12em',
              color: 'var(--secondary)', marginBottom: '20px', display: 'block',
            }}>On Instagram, send the word</span>
            <span style={{
              display: 'inline-block', fontSize: '13px', fontWeight: 600, letterSpacing: '0.26em',
              textTransform: 'uppercase', color: 'var(--ink)', background: 'var(--gold)', padding: '14px 32px',
            }}>STRATEGY</span>
          </div>
        </div>

        {/* Right — Email form */}
        <div className="reveal reveal-d2">
          <h3 style={{
            fontFamily: 'var(--font-serif)', fontWeight: 300, fontStyle: 'italic', fontSize: '32px',
            color: 'var(--parchment)', marginBottom: '44px',
          }}>Or send a message directly.</h3>

          {status === 'sent' ? (
            <div style={{ border: '1px solid var(--rule)', padding: '48px', textAlign: 'center' }}>
              <p style={{
                fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: '25px',
                color: 'var(--gold)', marginBottom: '12px',
              }}>Message received.</p>
              <p style={{ fontSize: '14px', color: 'var(--secondary)' }}>
                I&apos;ll be in touch within 24 hours.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <label htmlFor="c-name" style={labelStyle}>Name</label>
              <input id="c-name" type="text" required value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                onFocus={onFieldFocus} onBlur={onFieldBlur}
                placeholder="Your name" style={inputStyle} />

              <label htmlFor="c-email" style={labelStyle}>Email</label>
              <input id="c-email" type="email" required value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                onFocus={onFieldFocus} onBlur={onFieldBlur}
                placeholder="your@email.com" style={inputStyle} />

              <label htmlFor="c-msg" style={labelStyle}>What are you building?</label>
              <textarea id="c-msg" required rows={6} value={form.message}
                onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
                onFocus={onFieldFocus} onBlur={onFieldBlur}
                placeholder="Tell me about your idea, project, or what you need help with."
                style={{ ...inputStyle, resize: 'none' }} />

              {status === 'error' && (
                <p style={{ fontSize: '13px', color: 'var(--warn)', marginBottom: '16px' }}>
                  Something went wrong. Please try Instagram instead.
                </p>
              )}
              <button type="submit" disabled={status === 'sending'} style={{
                fontFamily: 'var(--font-sans)', fontSize: '11px', fontWeight: 600,
                letterSpacing: '0.18em', textTransform: 'uppercase',
                color: 'var(--ink)', background: 'var(--gold)',
                padding: '16px 40px', border: 'none', cursor: 'pointer',
                opacity: status === 'sending' ? 0.6 : 1, transition: 'opacity var(--t-fast), background var(--t-fast)',
              }}>
                {status === 'sending' ? 'Sending…' : 'Send Message'}
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  )
}
