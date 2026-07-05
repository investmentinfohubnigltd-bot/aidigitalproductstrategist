import { createServiceClient, getUserFromRequest } from '@/lib/ask-supabase'

// Payments are not live yet: plan CTAs collect a waitlist entry instead.
export const runtime = 'edge'

const VALID_PLANS = ['builder', 'founder', 'founding50']

export async function POST(req: Request) {
  const user = await getUserFromRequest(req)

  let body: { plan?: unknown; email?: unknown }
  try {
    body = await req.json()
  } catch {
    return Response.json({ error: 'bad_request' }, { status: 400 })
  }

  const plan = typeof body.plan === 'string' ? body.plan : ''
  const email = user?.email ?? (typeof body.email === 'string' ? body.email : '')

  if (!VALID_PLANS.includes(plan)) return Response.json({ error: 'bad_plan' }, { status: 400 })
  if (!email) return Response.json({ error: 'email_required' }, { status: 400 })

  const supa = createServiceClient()
  const { error } = await supa
    .from('plan_waitlist')
    .insert({ user_id: user?.id ?? null, email, plan })

  if (error) return Response.json({ error: 'server_error' }, { status: 500 })
  return Response.json({ ok: true })
}
