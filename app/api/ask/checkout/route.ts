import { randomUUID } from 'node:crypto'
import { getUserFromRequest, createServiceClient } from '@/lib/ask-supabase'
import { appUrl, checkoutPlan, paystackSecret } from '@/lib/strategist-billing'
import { isPaidPlanId } from '@/lib/strategist-plans'

export const runtime = 'nodejs'

type PlanResponse = {
  status?: boolean
  data?: { plan_code?: string; amount?: number; currency?: string; interval?: string; domain?: string }
}

async function livePlanMatches(plan: ReturnType<typeof checkoutPlan>, secret: string) {
  try {
    const response = await fetch(`https://api.paystack.co/plan/${encodeURIComponent(plan.planCode)}`, {
      headers: { Authorization: `Bearer ${secret}` },
      cache: 'no-store',
      signal: AbortSignal.timeout(8000),
    })
    const body = await response.json().catch(() => null) as PlanResponse | null
    const data = body?.data
    return response.ok && body?.status === true && data?.domain === 'live' &&
      data.plan_code === plan.planCode && data.amount === plan.amountKobo &&
      data.currency === 'NGN' && data.interval === 'monthly'
  } catch {
    return false
  }
}

export async function POST(req: Request) {
  const user = await getUserFromRequest(req)
  if (!user?.email) return Response.json({ error: 'unauthenticated' }, { status: 401 })

  let requested: unknown
  try {
    const body = await req.json()
    requested = body && typeof body === 'object' ? (body as { plan?: unknown }).plan : null
  } catch {
    return Response.json({ error: 'bad_request' }, { status: 400 })
  }
  if (!isPaidPlanId(requested)) return Response.json({ error: 'invalid_plan' }, { status: 400 })

  let plan: ReturnType<typeof checkoutPlan>
  let secret: string
  try {
    plan = checkoutPlan(requested)
    secret = paystackSecret()
  } catch {
    return Response.json({ error: 'billing_unavailable' }, { status: 503 })
  }
  if (!(await livePlanMatches(plan, secret))) {
    return Response.json({ error: 'billing_unavailable' }, { status: 503 })
  }

  const supa = createServiceClient()
  const { data: profile, error: profileError } = await supa.from('profiles').select('tier').eq('id', user.id).maybeSingle()
  if (profileError) return Response.json({ error: 'billing_unavailable' }, { status: 503 })
  if (profile?.tier && profile.tier !== 'free') return Response.json({ error: 'already_subscribed' }, { status: 409 })

  const reference = `STRAT-${Date.now()}-${randomUUID().replaceAll('-', '').slice(0, 12)}`
  const source = new URL(req.url).searchParams.get('source') === 'academy' ? 'academy' : 'direct'
  const { data: reserved, error: reserveError } = await supa.rpc('reserve_strategist_checkout', {
    p_reference: reference,
    p_user_id: user.id,
    p_email: user.email,
    p_plan: requested,
    p_amount_kobo: plan.amountKobo,
    p_plan_code: plan.planCode,
    p_source: source,
  })
  if (reserveError) return Response.json({ error: 'billing_unavailable' }, { status: 503 })
  if (!reserved) return Response.json({ error: 'founding_offer_full' }, { status: 409 })

  try {
    const response = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: { Authorization: `Bearer ${secret}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: user.email,
        amount: String(plan.amountKobo),
        currency: 'NGN',
        reference,
        plan: plan.planCode,
        callback_url: `${appUrl()}/ask?billing=return`,
        metadata: JSON.stringify({ product: 'ask-the-strategist', plan: requested, source }),
      }),
      signal: AbortSignal.timeout(10000),
    })
    const body = await response.json().catch(() => null) as { status?: boolean; data?: { authorization_url?: string } } | null
    const url = body?.data?.authorization_url
    if (!response.ok || !body?.status || !url) throw new Error('checkout failed')
    const checkoutUrl = new URL(url)
    if (checkoutUrl.protocol !== 'https:' || (checkoutUrl.hostname !== 'paystack.com' && !checkoutUrl.hostname.endsWith('.paystack.com'))) {
      throw new Error('checkout failed')
    }
    return Response.json({ url: checkoutUrl.toString() })
  } catch {
    await supa.from('strategist_checkouts').update({ status: 'failed', updated_at: new Date().toISOString() }).eq('reference', reference)
    return Response.json({ error: 'checkout_failed' }, { status: 502 })
  }
}
