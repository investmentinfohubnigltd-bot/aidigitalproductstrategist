'use client'

import { useState } from 'react'

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', message: '' })
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')

  async function submit(e: React.FormEvent) {
    e.preventDefault(); setStatus('sending')
    try {
      const response = await fetch('/api/contact', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
      if (!response.ok) throw new Error()
      setForm({ name: '', email: '', message: '' }); setStatus('sent')
    } catch { setStatus('error') }
  }

  return (
    <section id="contact" className="section contact-section">
      <div className="container contact-layout">
        <div className="contact-copy">
          <p className="eyebrow">Start a conversation</p>
          <h2>Bring me the difficult part.</h2>
          <p>Share the problem, the current state and what a successful product needs to change. Serious enquiries receive a direct response.</p>
          <div className="contact-channel"><small>Direct channel</small><a href="mailto:hello@aidigitalproductstrategist.com">hello@aidigitalproductstrategist.com</a></div>
          <div className="availability"><span className="status-dot" /><div><b>Selective engagements</b><small>Product strategy · advisory · end-to-end builds</small></div></div>
        </div>

        {status === 'sent' ? (
          <div className="form-success"><span>REQUEST.RECEIVED</span><h3>Thank you.</h3><p>Your message is in. I will respond directly.</p></div>
        ) : (
          <form className="contact-form" onSubmit={submit}>
            <div className="form-head"><span>PROJECT.BRIEF</span><span>SECURE FORM / 01</span></div>
            <label>Name<input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Your name" /></label>
            <label>Email<input required type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="you@company.com" /></label>
            <label>What needs to be solved?<textarea required rows={5} value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} placeholder="Context, constraint and desired outcome" /></label>
            {status === 'error' && <p className="form-error">The form could not send. Please use the direct email channel.</p>}
            <button className="button button-primary" disabled={status === 'sending'}>{status === 'sending' ? 'Transmitting…' : 'Send project brief'} <span>↗</span></button>
          </form>
        )}
      </div>
    </section>
  )
}
