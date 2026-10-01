import { createHash, createHmac, timingSafeEqual } from 'node:crypto'
import { createServiceClient } from '@/lib/ask-supabase'
import { paystackSecret } from '@/lib/strategist-billing'

export const runtime = 'nodejs'

type PaystackEvent = { event?: string; data?: Record<string, unknown> }

function signaturesMatch(payload: string, supplied: string | null, secret: string) {
  if (!supplied) return false
  const expected = Buffer.from(createHmac('sha512', secret).update(payload).digest('hex'), 'utf8')
  const received = Buffer.from(supplied, 'utf8')
  return received.length === expected.length && timingSafeEqual(received, expected)
}

function text(value: unknown) { return typeof value === 'string' ? value : null }
function object(value: unknown) { return value && typeof value === 'object' ? value as Record<string, unknown> : {} }

export async function POST(req: Request) {
  let secret: string
  try { secret = paystackSecret() } catch { return new Response(null, { status: 503 }) }
  const raw = await req.text()
  if (!signaturesMatch(raw, req.headers.get('x-paystack-signature'), secret)) return new Response(null, { status: 401 })

  let payload: PaystackEvent
  try { payload = JSON.parse(raw) as PaystackEvent } catch { return new Response(null, { status: 400 }) }
  const eventType = text(payload.event)
  const data = object(payload.data)
  if (!eventType) return new Response(null, { status: 400 })

  const eventHash = createHash('sha256').update(raw).digest('hex')
  const supa = createServiceClient()

  if (eventType === 'charge.success') {
    const reference = text(data.reference)
    const customer = object(data.customer)
    const plan = object(data.plan_object)
    const fallbackPlan = object(data.plan)
    if (!reference || typeof data.amount !== 'number') return new Response(null, { status: 400 })
    const { error } = await supa.rpc('activate_strategist_subscription', {
      p_event_hash: eventHash,
      p_reference: reference,
      p_amount_kobo: data.amount,
      p_currency: text(data.currency) ?? '',
      p_plan_code: text(plan.plan_code) ?? text(fallbackPlan.plan_code),
      p_customer_code: text(customer.customer_code),
      p_subscription_code: text(data.subscription_code),
      p_paid_at: text(data.paid_at) ?? text(data.paidAt),
      p_domain: text(data.domain),
    })
    if (error) return new Response(null, { status: 500 })
  } else if (['subscription.create', 'subscription.disable', 'subscription.not_renew', 'invoice.update', 'invoice.payment_failed'].includes(eventType)) {
    const customer = object(data.customer)
    const subscription = object(data.subscription)
    const { error } = await supa.rpc('process_strategist_subscription_event', {
      p_event_hash: eventHash,
      p_event_type: eventType,
      p_subscription_code: text(data.subscription_code) ?? text(subscription.subscription_code),
      p_customer_code: text(customer.customer_code),
      p_email: text(customer.email),
      p_next_payment_date: text(data.next_payment_date) ?? text(subscription.next_payment_date),
      p_paid: data.paid === true || text(data.status) === 'success',
    })
    if (error) return new Response(null, { status: 500 })
  }

  return Response.json({ received: true })
}
