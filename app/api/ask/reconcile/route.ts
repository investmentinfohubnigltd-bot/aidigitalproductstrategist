import { createHash } from 'node:crypto'
import { createServiceClient, getUserFromRequest } from '@/lib/ask-supabase'
import { paystackSecret } from '@/lib/strategist-billing'

export const runtime = 'nodejs'
export const maxDuration = 60
type Obj = Record<string, unknown>
const obj = (v: unknown): Obj => v && typeof v === 'object' && !Array.isArray(v) ? v as Obj : {}
const str = (v: unknown) => typeof v === 'string' ? v : ''
const hash = (v: string) => createHash('sha256').update(v).digest('hex')

async function provider(path: string, secret: string) {
  const res = await fetch(`https://api.paystack.co${path}`, {
    headers: { Authorization: `Bearer ${secret}` }, cache: 'no-store',
    signal: AbortSignal.timeout(10000), redirect: 'error',
  })
  const body = obj(await res.json())
  if (!res.ok || body.status !== true) throw new Error('provider_unavailable')
  return body.data
}

export async function POST(req: Request) {
  const user = await getUserFromRequest(req)
  if (!user?.email) return Response.json({ error: 'unauthenticated' }, { status: 401 })
  const supa = createServiceClient()
  const { data: current, error: currentError } = await supa.from('strategist_subscriptions')
    .select('status,current_period_end').eq('user_id', user.id).maybeSingle()
  if (currentError) return Response.json({ error: 'billing_unavailable' }, { status: 503 })
  if (current && ['active', 'not_renewing', 'past_due'].includes(current.status) &&
      new Date(current.current_period_end).getTime() > Date.now()) {
    return Response.json({ activated: true })
  }

  // Never accept a browser-supplied amount, plan, customer or payment reference.
  const { data: checkouts, error } = await supa.from('strategist_checkouts')
    .select('reference,email,amount_kobo,currency,paystack_plan_code,created_at')
    .eq('user_id', user.id).eq('status', 'initialized')
    .order('created_at', { ascending: false }).limit(3)
  if (error) return Response.json({ error: 'billing_unavailable' }, { status: 503 })
  if (!checkouts?.length) return Response.json({ error: 'no_pending_payment' }, { status: 409 })

  try {
    const secret = paystackSecret()
    for (const checkout of checkouts) {
      const tx = obj(await provider(`/transaction/verify/${encodeURIComponent(checkout.reference)}`, secret))
      if (tx.status !== 'success') continue
      const customer = obj(tx.customer)
      const code = str(obj(tx.plan_object).plan_code) || str(obj(tx.plan).plan_code) || str(tx.plan)
      const paidAt = str(tx.paid_at) || str(tx.paidAt)
      if (tx.domain !== 'live' || tx.reference !== checkout.reference ||
          tx.amount !== checkout.amount_kobo || tx.currency !== checkout.currency ||
          code !== checkout.paystack_plan_code ||
          str(customer.email).toLowerCase() !== checkout.email.toLowerCase() ||
          checkout.email.toLowerCase() !== user.email.toLowerCase() ||
          !/^CUS_[A-Za-z0-9]+$/.test(str(customer.customer_code)) ||
          !Number.isSafeInteger(customer.id) ||
          !Number.isFinite(Date.parse(paidAt))) {
        return Response.json({ error: 'payment_mismatch' }, { status: 409 })
      }
      const list = await provider(`/subscription?customer=${customer.id}&perPage=100`, secret)
      const candidates = Array.isArray(list) ? list.map(obj).filter(s =>
        s.domain === 'live' && s.status === 'active' &&
        obj(s.plan).plan_code === code &&
        obj(s.customer).customer_code === customer.customer_code &&
        obj(s.authorization).authorization_code === obj(tx.authorization).authorization_code &&
        /^SUB_[A-Za-z0-9]+$/.test(str(s.subscription_code))) : []
      // An ambiguous subscription must never be attached to the account.
      if (candidates.length !== 1) return Response.json({ error: 'subscription_pending' }, { status: 409 })
      const sub = obj(await provider(`/subscription/${encodeURIComponent(str(candidates[0].subscription_code))}`, secret))
      const plan = obj(sub.plan)
      const end = Date.parse(str(sub.next_payment_date))
      if (sub.domain !== 'live' || sub.status !== 'active' ||
          sub.subscription_code !== candidates[0].subscription_code ||
          obj(sub.customer).customer_code !== customer.customer_code ||
          str(obj(sub.customer).email).toLowerCase() !== checkout.email.toLowerCase() ||
          obj(sub.authorization).authorization_code !== obj(tx.authorization).authorization_code ||
          !str(obj(tx.authorization).authorization_code) ||
          plan.plan_code !== code || plan.interval !== 'monthly' ||
          plan.currency !== checkout.currency || plan.amount !== checkout.amount_kobo ||
          sub.amount !== checkout.amount_kobo || !Number.isFinite(end) || end <= Date.now()) {
        return Response.json({ error: 'subscription_mismatch' }, { status: 409 })
      }
      const { error: pendingError } = await supa.rpc('process_strategist_subscription_event', {
        p_event_hash: hash(`provider-recovery:subscription:${checkout.reference}:${sub.subscription_code}`),
        p_event_type: 'subscription.create', p_subscription_code: sub.subscription_code,
        p_customer_code: customer.customer_code, p_email: checkout.email, p_plan_code: code,
        p_next_payment_date: sub.next_payment_date, p_paid: false, p_domain: 'live',
      })
      if (pendingError) throw new Error('database_unavailable')
      const { error: activationError } = await supa.rpc('activate_strategist_subscription', {
        p_event_hash: hash(`provider-recovery:charge:${checkout.reference}`),
        p_reference: checkout.reference, p_amount_kobo: tx.amount, p_currency: tx.currency,
        p_plan_code: code, p_customer_code: customer.customer_code,
        p_subscription_code: sub.subscription_code, p_paid_at: paidAt, p_domain: 'live',
      })
      if (activationError) {
        // A signed webhook may have activated the same checkout concurrently.
        const { data: paid } = await supa.from('strategist_checkouts').select('status')
          .eq('reference', checkout.reference).eq('user_id', user.id).maybeSingle()
        if (paid?.status !== 'paid') throw new Error('database_unavailable')
      }
      return Response.json({ activated: true })
    }
    return Response.json({ error: 'payment_pending' }, { status: 409 })
  } catch {
    return Response.json({ error: 'billing_unavailable' }, { status: 502 })
  }
}
