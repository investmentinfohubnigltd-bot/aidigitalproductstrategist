'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { createClient, type Session } from '@supabase/supabase-js'
import { track } from '@vercel/analytics/react'
import StrategistAvatar, { type StrategistState } from '@/components/StrategistAvatar'

// Browser client (anon key). Auth only — all data access goes through /api/ask.
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '',
)

const SERIF = "var(--font-serif)"

type Msg = { role: 'user' | 'assistant'; content: string }

type Plan = {
  id: 'builder' | 'founder' | 'founding50'
  name: string
  price: string
  cadence: string
  note?: string
}

const PLANS: Plan[] = [
  { id: 'builder', name: 'Builder', price: '₦10,000', cadence: '/month', note: 'Unlimited mentoring.' },
  { id: 'founder', name: 'Founder', price: '₦25,000', cadence: '/month', note: 'Deeper frameworks, sharper trade-offs.' },
  { id: 'founding50', name: 'Founding 100', price: '₦7,500', cadence: '/month — for life', note: 'Limited to the first 100 members.' },
]

const STARTERS = [
  'How do I price a new product for the Nigerian market?',
  'I have no ad budget. How do I get my first 100 users?',
  'Talk me through validating an idea before I build it.',
]

export default function AskChat() {
  const [session, setSession] = useState<Session | null>(null)
  const [authReady, setAuthReady] = useState(false)

  const [messages, setMessages] = useState<Msg[]>([])
  const [input, setInput] = useState('')
  const [waiting, setWaiting] = useState(false) // request in flight, awaiting first token
  const [streaming, setStreaming] = useState(false) // tokens arriving
  const [remaining, setRemaining] = useState<number | null>(null)
  const [paywall, setPaywall] = useState(false)

  const [email, setEmail] = useState('')
  const [authSent, setAuthSent] = useState(false)

  const scrollRef = useRef<HTMLDivElement>(null)

  // Auth lifecycle (magic-link session is picked up from the URL on redirect).
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setAuthReady(true)
    })
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s))
    return () => sub.subscription.unsubscribe()
  }, [])

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, waiting])

  const avatarState: StrategistState = streaming ? 'speaking' : waiting ? 'thinking' : 'idle'

  const signedIn = !!session
  const busy = waiting || streaming

  const sendMagicLink = useCallback(async () => {
    const clean = email.trim()
    if (!clean) return
    await supabase.auth.signInWithOtp({
      email: clean,
      options: { emailRedirectTo: `${window.location.origin}/ask` },
    })
    setAuthSent(true)
  }, [email])

  const send = useCallback(
    async (text: string) => {
      const trimmed = text.trim()
      if (!trimmed || busy) return

      const current = (await supabase.auth.getSession()).data.session
      if (!current) return // composer is disabled when signed out; guard anyway

      track('message_sent')

      const next: Msg[] = [...messages, { role: 'user', content: trimmed }]
      setMessages(next)
      setInput('')
      setWaiting(true)
      setPaywall(false)

      let res: Response
      try {
        res = await fetch('/api/ask', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${current.access_token}`,
          },
          body: JSON.stringify({ messages: next }),
        })
      } catch {
        setWaiting(false)
        setMessages((m) => [
          ...m,
          { role: 'assistant', content: 'I could not reach the network just now. Please try again.' },
        ])
        return
      }

      if (res.status === 402) {
        setWaiting(false)
        setRemaining(0)
        setPaywall(true)
        return
      }
      if (!res.ok || !res.body) {
        setWaiting(false)
        setMessages((m) => [
          ...m,
          { role: 'assistant', content: 'Something went wrong on my end. Please try again in a moment.' },
        ])
        return
      }

      const hdr = res.headers.get('X-Messages-Remaining')
      if (hdr !== null && hdr !== '') setRemaining(Number(hdr))

      if (res.headers.get('X-Daily-Cap') === '1') track('daily_cap_hit')

      // Stream the reply into a fresh assistant bubble.
      setMessages((m) => [...m, { role: 'assistant', content: '' }])
      setWaiting(false)
      setStreaming(true)

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let acc = ''
      try {
        for (;;) {
          const { done, value } = await reader.read()
          if (done) break
          acc += decoder.decode(value, { stream: true })
          setMessages((m) => {
            const copy = m.slice()
            copy[copy.length - 1] = { role: 'assistant', content: acc }
            return copy
          })
        }
      } finally {
        setStreaming(false)
      }
    },
    [busy, messages],
  )

  return (
    <main
      style={{
        minHeight: '100dvh',
        display: 'flex',
        flexDirection: 'column',
        background: 'var(--ink)',
        color: 'var(--parchment)',
      }}
    >
      {/* ── top bar ─────────────────────────────────────────── */}
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px 20px',
          borderBottom: '1px solid var(--rule)',
          position: 'sticky',
          top: 0,
          background: 'rgba(28,26,22,0.96)',
          backdropFilter: 'blur(16px)',
          zIndex: 20,
        }}
      >
        <Link
          href="/"
          style={{
            fontSize: '11px',
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: 'var(--tertiary)',
            textDecoration: 'none',
          }}
        >
          ← Home
        </Link>
        <span
          style={{
            fontFamily: SERIF,
            fontSize: '17px',
            letterSpacing: '0.04em',
            color: 'var(--parchment)',
          }}
        >
          Ask the Strategist
        </span>
        <span
          style={{
            fontSize: '10px',
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            color: remaining === 0 ? 'var(--gold)' : 'var(--tertiary)',
            minWidth: 64,
            textAlign: 'right',
          }}
        >
          {remaining === null ? '' : remaining > 0 ? `${remaining} free left` : 'Free used'}
        </span>
      </header>

      {/* ── conversation ─────────────────────────────────────── */}
      <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto' }}>
        <div style={{ maxWidth: 720, margin: '0 auto', padding: '32px 20px 24px', width: '100%' }}>
          {messages.length === 0 && <Hero avatarState={avatarState} onStarter={(s) => (signedIn ? send(s) : undefined)} signedIn={signedIn} />}

          {messages.map((m, i) => {
            const isLast = i === messages.length - 1
            const bubbleState: StrategistState = isLast && busy ? avatarState : 'idle'
            return m.role === 'assistant' ? (
              <AssistantBubble key={i} text={m.content} state={bubbleState} thinking={isLast && waiting && m.content === ''} />
            ) : (
              <UserBubble key={i} text={m.content} />
            )
          })}

          {waiting && messages[messages.length - 1]?.role === 'user' && (
            <AssistantBubble text="" state="thinking" thinking />
          )}

          {paywall && <Paywall email={session?.user.email ?? null} />}
        </div>
      </div>

      {/* ── composer ─────────────────────────────────────────── */}
      <div style={{ borderTop: '1px solid var(--rule)', background: 'var(--ink)' }}>
        <div style={{ maxWidth: 720, margin: '0 auto', padding: '14px 20px 20px', width: '100%' }}>
          {!authReady ? null : signedIn ? (
            <Composer input={input} setInput={setInput} onSend={() => send(input)} disabled={busy || paywall} />
          ) : (
            <AuthPanel email={email} setEmail={setEmail} onSend={sendMagicLink} sent={authSent} />
          )}
          <p style={{ marginTop: 10, fontSize: '10px', letterSpacing: '0.08em', color: 'var(--tertiary)', textAlign: 'center' }}>
            The AI version of the Strategist — trained on his frameworks. Not legal, tax, or investment advice.
          </p>
        </div>
      </div>
    </main>
  )
}

// ── hero / empty state ──────────────────────────────────────────
function Hero({
  avatarState,
  onStarter,
  signedIn,
}: {
  avatarState: StrategistState
  onStarter: (s: string) => void
  signedIn: boolean
}) {
  return (
    <div style={{ textAlign: 'center', padding: '20px 0 8px' }}>
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
        <StrategistAvatar size={120} state={avatarState} />
      </div>
      <h1 style={{ fontFamily: SERIF, fontWeight: 400, fontSize: 'clamp(28px, 7vw, 40px)', lineHeight: 1.1, letterSpacing: '0.01em' }}>
        Ask the Strategist
      </h1>
      <p style={{ margin: '14px auto 0', maxWidth: 460, fontSize: '15px', lineHeight: 1.7, color: 'var(--secondary)' }}>
        Product strategy in the voice of the strategist behind Aurum Digital Consulting. Naira examples, real market
        constraints, and one clear next step — not a lecture.
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxWidth: 460, margin: '28px auto 0' }}>
        {STARTERS.map((s) => (
          <button
            key={s}
            onClick={() => onStarter(s)}
            disabled={!signedIn}
            style={{
              textAlign: 'left',
              padding: '13px 16px',
              borderRadius: 10,
              border: '1px solid var(--rule)',
              background: 'var(--lift)',
              color: 'var(--secondary)',
              fontSize: '14px',
              fontFamily: 'inherit',
              cursor: signedIn ? 'pointer' : 'not-allowed',
              opacity: signedIn ? 1 : 0.55,
              transition: 'border-color 0.2s, color 0.2s',
            }}
            onMouseEnter={(e) => signedIn && (e.currentTarget.style.borderColor = 'var(--gold-dim)')}
            onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--rule)')}
          >
            {s}
          </button>
        ))}
      </div>
      {!signedIn && (
        <p style={{ marginTop: 22, fontSize: '12px', letterSpacing: '0.06em', color: 'var(--tertiary)' }}>
          Sign in below to start — your first 5 messages are free.
        </p>
      )}
    </div>
  )
}

// ── message bubbles ─────────────────────────────────────────────
function AssistantBubble({ text, state, thinking }: { text: string; state: StrategistState; thinking?: boolean }) {
  return (
    <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', margin: '20px 0' }}>
      <div style={{ flexShrink: 0, marginTop: 2 }}>
        <StrategistAvatar size={44} state={state} title="" />
      </div>
      <div
        style={{
          flex: 1,
          fontSize: '15px',
          lineHeight: 1.7,
          color: 'var(--parchment)',
          whiteSpace: 'pre-wrap',
          paddingTop: 4,
        }}
      >
        {thinking && text === '' ? <ThinkingDots /> : text}
      </div>
    </div>
  )
}

function UserBubble({ text }: { text: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'flex-end', margin: '20px 0' }}>
      <div
        style={{
          maxWidth: '82%',
          padding: '11px 16px',
          borderRadius: '14px 14px 4px 14px',
          background: 'var(--surface)',
          border: '1px solid var(--rule)',
          fontSize: '15px',
          lineHeight: 1.6,
          color: 'var(--parchment)',
          whiteSpace: 'pre-wrap',
        }}
      >
        {text}
      </div>
    </div>
  )
}

function ThinkingDots() {
  return (
    <span style={{ display: 'inline-flex', gap: 5, alignItems: 'center', height: 22 }} aria-label="Thinking">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          style={{
            width: 6,
            height: 6,
            borderRadius: '50%',
            background: 'var(--gold-dim)',
            animation: 'sa-dot 1.4s ease-in-out infinite',
            animationDelay: `${i * 0.2}s`,
          }}
        />
      ))}
    </span>
  )
}

// ── composer ────────────────────────────────────────────────────
function Composer({
  input,
  setInput,
  onSend,
  disabled,
}: {
  input: string
  setInput: (v: string) => void
  onSend: () => void
  disabled: boolean
}) {
  return (
    <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end' }}>
      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            if (!disabled) onSend()
          }
        }}
        rows={1}
        placeholder="Ask about pricing, launch, distribution, trust…"
        style={{
          flex: 1,
          resize: 'none',
          maxHeight: 160,
          padding: '12px 14px',
          borderRadius: 12,
          border: '1px solid var(--rule)',
          background: 'var(--lift)',
          color: 'var(--parchment)',
          fontFamily: 'inherit',
          fontSize: '15px',
          lineHeight: 1.5,
          outline: 'none',
        }}
      />
      <button
        onClick={onSend}
        disabled={disabled || !input.trim()}
        style={{
          flexShrink: 0,
          padding: '12px 20px',
          borderRadius: 12,
          border: '1px solid var(--gold-dim)',
          background: disabled || !input.trim() ? 'transparent' : 'var(--gold)',
          color: disabled || !input.trim() ? 'var(--gold)' : 'var(--ink)',
          fontSize: '11px',
          fontWeight: 600,
          letterSpacing: '0.16em',
          textTransform: 'uppercase',
          cursor: disabled || !input.trim() ? 'not-allowed' : 'pointer',
          transition: 'background 0.2s, color 0.2s',
        }}
      >
        Send
      </button>
    </div>
  )
}

// ── auth panel (magic link) ─────────────────────────────────────
function AuthPanel({
  email,
  setEmail,
  onSend,
  sent,
}: {
  email: string
  setEmail: (v: string) => void
  onSend: () => void
  sent: boolean
}) {
  if (sent) {
    return (
      <div
        style={{
          padding: '14px 16px',
          borderRadius: 12,
          border: '1px solid var(--gold-dim)',
          background: 'var(--lift)',
          textAlign: 'center',
          fontSize: '14px',
          color: 'var(--secondary)',
        }}
      >
        Check your email — I sent you a secure link to sign in.
      </div>
    )
  }
  return (
    <div style={{ display: 'flex', gap: 10, alignItems: 'stretch' }}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && onSend()}
        placeholder="you@email.com — sign in to start"
        style={{
          flex: 1,
          padding: '12px 14px',
          borderRadius: 12,
          border: '1px solid var(--rule)',
          background: 'var(--lift)',
          color: 'var(--parchment)',
          fontFamily: 'inherit',
          fontSize: '15px',
          outline: 'none',
        }}
      />
      <button
        onClick={onSend}
        disabled={!email.trim()}
        style={{
          flexShrink: 0,
          padding: '12px 18px',
          borderRadius: 12,
          border: '1px solid var(--gold-dim)',
          background: email.trim() ? 'var(--gold)' : 'transparent',
          color: email.trim() ? 'var(--ink)' : 'var(--gold)',
          fontSize: '11px',
          fontWeight: 600,
          letterSpacing: '0.14em',
          textTransform: 'uppercase',
          cursor: email.trim() ? 'pointer' : 'not-allowed',
        }}
      >
        Magic link
      </button>
    </div>
  )
}

// ── paywall / plans ─────────────────────────────────────────────
function Paywall({ email }: { email: string | null }) {
  const [joined, setJoined] = useState<string | null>(null)
  const [pending, setPending] = useState<string | null>(null)

  // The Paywall only mounts once the free limit is reached — track that here.
  useEffect(() => {
    track('free_limit_hit')
  }, [])

  const join = async (plan: Plan['id']) => {
    track('waitlist_join', { plan })
    setPending(plan)
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      const res = await fetch('/api/ask/waitlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(session ? { Authorization: `Bearer ${session.access_token}` } : {}),
        },
        body: JSON.stringify({ plan, email }),
      })
      if (res.ok) setJoined(plan)
    } finally {
      setPending(null)
    }
  }

  return (
    <div
      style={{
        margin: '28px 0 8px',
        padding: '28px 22px',
        borderRadius: 16,
        border: '1px solid var(--rule)',
        background: 'var(--lift)',
      }}
    >
      <h2 style={{ fontFamily: SERIF, fontWeight: 400, fontSize: '26px', textAlign: 'center' }}>
        You&rsquo;ve used your 5 free messages
      </h2>
      <p style={{ margin: '10px auto 24px', maxWidth: 440, textAlign: 'center', fontSize: '14px', lineHeight: 1.6, color: 'var(--secondary)' }}>
        Paid plans aren&rsquo;t live yet. Join the waitlist and I&rsquo;ll let you know the moment mentoring opens up.
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {PLANS.map((p) => (
          <div
            key={p.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 14,
              padding: '16px 18px',
              borderRadius: 12,
              border: '1px solid var(--rule)',
              background: 'var(--surface)',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, flexWrap: 'wrap' }}>
                <span style={{ fontFamily: SERIF, fontSize: '20px', color: 'var(--parchment)' }}>{p.name}</span>
                <span style={{ fontSize: '15px', color: 'var(--gold)', fontWeight: 500 }}>{p.price}</span>
                <span style={{ fontSize: '11px', color: 'var(--tertiary)' }}>{p.cadence}</span>
              </div>
              {p.note && <div style={{ marginTop: 3, fontSize: '12px', color: 'var(--tertiary)' }}>{p.note}</div>}
            </div>
            <button
              onClick={() => join(p.id)}
              disabled={joined === p.id || pending === p.id}
              style={{
                flexShrink: 0,
                padding: '10px 16px',
                borderRadius: 10,
                border: '1px solid var(--gold-dim)',
                background: joined === p.id ? 'transparent' : 'var(--gold)',
                color: joined === p.id ? 'var(--gold)' : 'var(--ink)',
                fontSize: '10px',
                fontWeight: 600,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                cursor: joined === p.id ? 'default' : 'pointer',
                whiteSpace: 'nowrap',
              }}
            >
              {joined === p.id ? "You're in" : pending === p.id ? '…' : 'Join the waitlist'}
            </button>
          </div>
        ))}
      </div>
      <p style={{ margin: '18px auto 0', maxWidth: 440, textAlign: 'center', fontSize: '12px', lineHeight: 1.6, color: 'var(--tertiary)' }}>
        Fair use: up to 100 messages per day on all paid plans.
      </p>
    </div>
  )
}
