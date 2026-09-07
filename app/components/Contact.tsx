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
    <section id="contact" className="section-v3 contact-v3">
      <div className="container contact-v3-grid">
        <div>
          <p className="section-mark">05 / Enquiries</p>
          <h2>Have something difficult worth building?</h2>
          <p>Share the context, constraint and outcome. I respond personally to serious product enquiries.</p>
          <a className="direct-email" href="mailto:hello@aidigitalproductstrategist.com">hello@aidigitalproductstrategist.com</a>
        </div>
        {status === 'sent' ? <div className="contact-success"><small>Message received</small><h3>Thank you.</h3><p>I will respond directly.</p></div> : (
          <form onSubmit={submit} className="contact-v3-form">
            <div className="form-title"><span>Project brief</span><span>Private enquiry</span></div>
            <label>Name<input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Your name" /></label>
            <label>Email<input required type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="you@company.com" /></label>
            <label>What needs to be solved?<textarea required rows={5} value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} placeholder="The problem, current state and desired outcome" /></label>
            {status === 'error' && <p className="contact-error">The form could not send. Please use the direct email address.</p>}
            <button disabled={status === 'sending'}>{status === 'sending' ? 'Sending…' : 'Send enquiry'} <span>↗</span></button>
          </form>
        )}
      </div>
    </section>
  )
}
