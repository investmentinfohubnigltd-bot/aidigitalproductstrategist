'use client'

import { useCallback, useEffect, useState } from 'react'
import { createClient, type Session } from '@supabase/supabase-js'

const auth = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'https://placeholder.supabase.co',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? 'placeholder-anon-key',
)
type Scholarship = { name: string; status: string; claimedBy: string | null; claimedAt: string | null; accessUntil: string | null; claimBefore: string; months: number }
type Paid = { email: string; plan: string; status: string; currentPeriodEnd: string | null; lastPaidAt: string | null; cancelAtPeriodEnd: boolean; messagesUsed: number }
type Payment = { email: string; plan: string; status: string; amountNgn: number; createdAt: string }
type Overview = { generatedAt: string; scholarships: Scholarship[]; paid: Paid[]; payments: Payment[]; academy: { status: string; detail: string; url: string } }
const date = (value: string | null) => value ? new Date(value).toLocaleString('en-NG', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Africa/Lagos' }) : '—'
const money = (value: number) => new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(value)

export default function OwnerDashboard() {
  const [session, setSession] = useState<Session | null>(null)
  const [ready, setReady] = useState(false)
  const [email, setEmail] = useState('hello@aidigitalproductstrategist.com')
  const [sent, setSent] = useState(false)
  const [notice, setNotice] = useState('')
  const [data, setData] = useState<Overview | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    auth.auth.getSession().then(({ data }) => { setSession(data.session); setReady(true) })
    const { data: listener } = auth.auth.onAuthStateChange((_event, next) => setSession(next))
    return () => listener.subscription.unsubscribe()
  }, [])
  const refresh = useCallback(async (current: Session) => {
    setLoading(true)
    try {
      const response = await fetch('/api/admin/overview', {
        headers: { Authorization: `Bearer ${current.access_token}` }, cache: 'no-store',
      })
      const body = await response.json()
      if (!response.ok) { setData(null); setNotice(body.error ?? 'Could not load the dashboard.'); return }
      setData(body as Overview); setNotice('')
    } catch { setNotice('Could not load the dashboard. Please retry.') }
    finally { setLoading(false) }
  }, [])
  useEffect(() => { if (session) void refresh(session); else setData(null) }, [session, refresh])
  async function signIn() {
    setNotice('')
    const address = email.trim().toLowerCase()
    if (address !== 'hello@aidigitalproductstrategist.com') { setNotice('Use hello@aidigitalproductstrategist.com for owner sign-in.'); return }
    const { error } = await auth.auth.signInWithOtp({
      email: address, options: { emailRedirectTo: `${window.location.origin}/admin`, shouldCreateUser: true },
    })
    if (error) setNotice('Could not send a secure link to hello@aidigitalproductstrategist.com. Please try again.')
    else setSent(true)
  }
  return <main style={{ minHeight: '100vh', background: '#1c1a16', color: '#eee9dd', padding: '36px 20px', fontFamily: 'Arial, sans-serif' }}>
    <div style={{ maxWidth: 1100, margin: 'auto' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <div><a href="/" style={{ color: '#c8a96b' }}>← Aurum</a><h1 style={{ fontFamily: 'Georgia, serif', fontSize: 'clamp(30px,5vw,48px)', fontWeight: 400, margin: '16px 0 4px' }}>Owner dashboard</h1><p style={{ color: '#bcb5a6' }}>Academy and Ask the Strategist</p></div>
        {session && <button onClick={() => auth.auth.signOut()} style={button}>Sign out</button>}
      </header>
      {!ready ? <p>Checking sign-in…</p> : !session ? <section style={panel}>
        <h2>Sign in as owner</h2><p>Use hello@aidigitalproductstrategist.com. The first secure link will create and verify this owner account.</p>
        {sent ? <p>Check your inbox for your secure sign-in link.</p> : <form onSubmit={event => { event.preventDefault(); void signIn() }} style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <input type="email" required autoComplete="email" value={email} onChange={event => setEmail(event.target.value)} placeholder="Owner email" style={{ ...button, minWidth: 250, background: '#322f29', color: '#fff' }} />
          <button type="submit" style={button}>Email sign-in link</button>
        </form>}
      </section> : <>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '22px 0', flexWrap: 'wrap' }}>
          <span>Signed in: {session.user.email}</span><button style={button} disabled={loading} onClick={() => void refresh(session)}>{loading ? 'Refreshing…' : 'Refresh data'}</button>
          {data && <small>Updated {date(data.generatedAt)}</small>}
        </div>
        {data && <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 12 }}>
            <Metric label="Invitations claimed" value={data.scholarships.filter(x => x.status === 'claimed').length} />
            <Metric label="Invitations available" value={data.scholarships.filter(x => x.status === 'available').length} />
            <Metric label="Paid subscribers" value={data.paid.filter(x => ['active','past_due','not_renewing'].includes(x.status) && new Date(x.currentPeriodEnd ?? 0).getTime() > Date.now()).length} />
            <Metric label="Academy enrolments" value="Not open" />
          </div>
          <section style={panel}><h2>Scholarship activations</h2><p>First confirmed activation claims each link. Times shown in Lagos time.</p>
            <div style={{ overflowX: 'auto' }}><table style={table}><thead><tr><th>Invitation</th><th>Status</th><th>Claimed by</th><th>Activated</th><th>Access ends / claim deadline</th></tr></thead><tbody>
              {data.scholarships.map((item, index) => <tr key={index}><td>{item.name}</td><td><strong style={{ color: item.status === 'claimed' ? '#b7d89a' : '#e4be78' }}>{item.status}</strong></td><td>{item.claimedBy ?? '—'}</td><td>{date(item.claimedAt)}</td><td>{date(item.accessUntil ?? item.claimBefore)}</td></tr>)}
            </tbody></table></div>
          </section>
          <section style={panel}><h2>Strategist subscriptions</h2><div style={{ overflowX: 'auto' }}><table style={table}><thead><tr><th>Email</th><th>Plan</th><th>Status</th><th>Messages used</th><th>Paid at</th><th>Period ends</th></tr></thead><tbody>
            {data.paid.map((item, index) => <tr key={index}><td>{item.email}</td><td>{item.plan}</td><td>{item.status}{item.cancelAtPeriodEnd ? ' · ending' : ''}</td><td>{item.messagesUsed}</td><td>{date(item.lastPaidAt)}</td><td>{date(item.currentPeriodEnd)}</td></tr>)}
          </tbody></table>{!data.paid.length && <p>No subscription records yet.</p>}</div></section>
          <section style={panel}><h2>Recent checkout records</h2><div style={{ overflowX: 'auto' }}><table style={table}><thead><tr><th>Started</th><th>Email</th><th>Plan</th><th>Amount</th><th>Status</th></tr></thead><tbody>
            {data.payments.map((item, index) => <tr key={index}><td>{date(item.createdAt)}</td><td>{item.email}</td><td>{item.plan}</td><td>{money(item.amountNgn)}</td><td>{item.status}</td></tr>)}
          </tbody></table>{!data.payments.length && <p>No checkout records yet.</p>}</div></section>
          <section style={panel}><h2>Aurum Academy</h2><p><strong>{data.academy.status}</strong></p><p>{data.academy.detail}</p><a href={data.academy.url} style={{ color: '#e4be78' }}>Open Academy ↗</a></section>
        </>}
      </>}
      {notice && <p role="alert" style={{ color: '#e4be78' }}>{notice}</p>}
    </div>
  </main>
}
const panel: React.CSSProperties = { border: '1px solid #514739', borderRadius: 14, padding: '22px', marginTop: 22, background: '#26231e' }
const button: React.CSSProperties = { border: '1px solid #bca36e', borderRadius: 8, padding: '11px 15px', background: '#d9bb7c', color: '#211c14', cursor: 'pointer' }
const table: React.CSSProperties = { width: '100%', borderCollapse: 'collapse', textAlign: 'left', lineHeight: 1.8, minWidth: 680 }
function Metric({ label, value }: { label: string; value: number | string }) {
  return <div style={panel}><strong style={{ display: 'block', fontSize: 30, color: '#e4be78' }}>{value}</strong><span>{label}</span></div>
}
