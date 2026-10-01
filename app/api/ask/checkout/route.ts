import { randomUUID } from 'node:crypto'
import { getUserFromRequest, createServiceClient } from '@/lib/ask-supabase'
import { appUrl, checkoutPlan, paystackSecret } from '@/lib/strategist-billing'
import { isPaidPlanId } from '@/lib/strategist-plans'

export const runtime = 'nodejs'

export async function POST(req: Request) {
  const user = await getUserFromRequest(req)
  if (!user?.email) return Response.json({ error: 'unauthenticated' }, { status: 401 })

  let requested: unknown
  try { requested = (await req.json()).plan } catch { return Response.json({ error: 'bad_request' }, { status: 400 }) }
  if (!isPaidPlanId(requested)) return Response.json({ error: 'invalid_plan' }, { status: 400 })

  let plan: ReturnType<typeof checkoutPlan>
  try { plan = checkoutPlan(requested) } catch { return Response.json({ error: 'billing_unavailable' }, { status: 503 }) }

  const supa = createServiceClient()
  const { data: profile } = await supa.from('profiles').select('tier').eq('id', user.id).maybeSingle()
  if (profile?.tier && profile.tier !== 'free') return Response.json({ error: 'already_subscribed' }, { status: 409 })

  if (requested === 'founding50') {
    const { count, error } = await supa.from('strategist_subscriptions').select('user_id', { count: 'exact', head: true }).eq('plan', 'founding50').in('status', ['active', 'past_due'])
    if (error) return Response.json({ error: 'billing_unavailable' }, { status: 503 })
    if ((count ?? 0) >= 100) return Response.json({ error: 'founding_offer_full' }, { status: 409 })
  }

  const reference = `STRAT-${Date.now()}-${randomUUID().replaceAll('-', '').slice(0, 12)}`
  const source = new URL(req.url).searchParams.get('source') === 'academy' ? 'academy' : 'direct'
  const { error: checkoutError } = await supa.from('strategist_checkouts').insert({
    reference, user_id: user.id, email: user.email.toLowerCase(), plan: requested,
    amount_kobo: plan.amountKobo, currency: 'NGN', paystack_plan_code: plan.planCode, source,
  })
  if (checkoutError) return Response.json({ error: 'billing_unavailable' }, { status: 503 })

  const response = await fetch('https://api.paystack.co/transaction/initialize', {
    method: 'POST',
    headers: { Authorization: `Bearer ${paystackSecret()}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: user.email,
      amount: String(plan.amountKobo),
      currency: 'NGN',
      reference,
      plan: plan.planCode,
      callback_url: `${appUrl()}/ask?billing=return`,
      metadata: JSON.stringify({ product: 'ask-the-strategist', plan: requested, source }),
    }),
  })
  const body = await response.json().catch(() => null) as { status?: boolean; data?: { authorization_url?: string } } | null
  if (!response.ok || !body?.status || !body.data?.authorization_url) {
    await supa.from('strategist_checkouts').update({ status: 'failed', updated_at: new Date().toISOString() }).eq('reference', reference)
    return Response.json({ error: 'checkout_failed' }, { status: 502 })
  }
  return Response.json({ url: body.data.authorization_url })
}
