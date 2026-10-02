import { createHash, createHmac, timingSafeEqual } from 'node:crypto'
import { createServiceClient } from '@/lib/ask-supabase'
import { paystackSecret, planFromCode } from '@/lib/strategist-billing'

export const runtime = 'nodejs'
const MAX_BYTES = 256 * 1024

type EventObject = Record<string, unknown>
function object(value: unknown): EventObject {
  return value && typeof value === 'object' && !Array.isArray(value) ? value as EventObject : {}
}
function text(value: unknown) { return typeof value === 'string' && value.length ? value : null }

function planCode(data: EventObject) {
  const directPlan = object(data.plan)
  const planObject = object(data.plan_object)
  const subscription = object(data.subscription)
  const subscriptionPlan = object(subscription.plan)
  return text(planObject.plan_code) ?? text(directPlan.plan_code) ?? text(subscriptionPlan.plan_code)
}

async function forwardToLearnedIq(raw: string, signature: string) {
  try {
    const response = await fetch('https://learnediq.ng/api/billing/paystack/webhook', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-paystack-signature': signature },
      body: raw,
      redirect: 'error',
      signal: AbortSignal.timeout(8000),
    })
    return response.ok
  } catch {
    return false
  }
}

export async function POST(req: Request) {
  let secret: string
  try { secret = paystackSecret() } catch { return new Response(null, { status: 503 }) }

  const bytes = await req.arrayBuffer().catch(() => null)
  if (!bytes) return new Response(null, { status: 400 })
  if (bytes.byteLength > MAX_BYTES) return new Response(null, { status: 413 })
  const raw = Buffer.from(bytes).toString('utf8')
  const signature = req.headers.get('x-paystack-signature')
  if (!signature || !/^[a-f0-9]{128}$/.test(signature)) return new Response(null, { status: 401 })
  const expected = createHmac('sha512', secret).update(raw).digest()
  if (!timingSafeEqual(expected, Buffer.from(signature, 'hex'))) return new Response(null, { status: 401 })

  let payload: EventObject
  try {
    const parsed = JSON.parse(raw)
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) throw new Error()
    payload = parsed as EventObject
  } catch {
    return new Response(null, { status: 400 })
  }
  const eventType = text(payload.event)
  const data = object(payload.data)
  if (!eventType) return new Response(null, { status: 400 })

  // This Paystack integration is shared. Keep LearnedIQ delivery successful
  // before recording the event locally; a failure remains retryable by Paystack.
  if (!(await forwardToLearnedIq(raw, signature))) return new Response(null, { status: 502 })

  const eventHash = createHash('sha256').update(raw).digest('hex')
  const supa = createServiceClient()

  if (eventType === 'charge.success') {
    const reference = text(data.reference)
    if (!reference?.startsWith('STRAT-')) return Response.json({ received: true })
    const customer = object(data.customer)
    const subscription = object(data.subscription)
    if (typeof data.amount !== 'number') return new Response(null, { status: 400 })
    const { error } = await supa.rpc('activate_strategist_subscription', {
      p_event_hash: eventHash,
      p_reference: reference,
      p_amount_kobo: data.amount,
      p_currency: text(data.currency) ?? '',
      p_plan_code: planCode(data),
      p_customer_code: text(customer.customer_code),
      p_subscription_code: text(data.subscription_code) ?? text(subscription.subscription_code),
      p_paid_at: text(data.paid_at) ?? text(data.paidAt),
      p_domain: text(data.domain),
    })
    if (error) return new Response(null, { status: 500 })
  } else if (['subscription.create', 'subscription.disable', 'subscription.not_renew', 'invoice.update', 'invoice.payment_failed'].includes(eventType)) {
    const customer = object(data.customer)
    const subscription = object(data.subscription)
    const code = text(data.subscription_code) ?? text(subscription.subscription_code)
    const configuredPlan = planFromCode(planCode(data))
    if (eventType === 'subscription.create' && !configuredPlan) return Response.json({ received: true })
    const { error } = await supa.rpc('process_strategist_subscription_event', {
      p_event_hash: eventHash,
      p_event_type: eventType,
      p_subscription_code: code,
      p_customer_code: text(customer.customer_code),
      p_email: text(customer.email),
      p_plan_code: planCode(data),
      p_next_payment_date: text(data.next_payment_date) ?? text(subscription.next_payment_date),
      p_paid: data.paid === true && text(data.status) === 'success',
      p_domain: text(data.domain),
    })
    if (error) return new Response(null, { status: 500 })
  }

  return Response.json({ received: true })
}
