import { createServiceClient, getUserFromRequest } from '@/lib/ask-supabase'
import { paystackSecret } from '@/lib/strategist-billing'

export const runtime = 'nodejs'

async function currentSubscription(req: Request) {
  const user = await getUserFromRequest(req)
  if (!user) return { error: Response.json({ error: 'unauthenticated' }, { status: 401 }) }
  const supa = createServiceClient()
  const { data, error } = await supa
    .from('strategist_subscriptions')
    .select('plan,status,current_period_end,cancel_at_period_end,paystack_subscription_code')
    .eq('user_id', user.id)
    .maybeSingle()
  if (error) return { error: Response.json({ error: 'billing_unavailable' }, { status: 503 }) }
  return { data }
}

export async function GET(req: Request) {
  const result = await currentSubscription(req)
  if ('error' in result) return result.error
  const subscription = result.data
  if (!subscription) return Response.json({ subscription: null })
  return Response.json({
    subscription: {
      plan: subscription.plan,
      status: subscription.status,
      currentPeriodEnd: subscription.current_period_end,
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
      manageable: Boolean(subscription.paystack_subscription_code),
    },
  })
}

export async function POST(req: Request) {
  const result = await currentSubscription(req)
  if ('error' in result) return result.error
  const code = result.data?.paystack_subscription_code
  if (!code || !/^SUB_[A-Za-z0-9]+$/.test(code)) {
    return Response.json({ error: 'subscription_not_manageable' }, { status: 409 })
  }
  try {
    const response = await fetch(`https://api.paystack.co/subscription/${encodeURIComponent(code)}/manage/link`, {
      headers: { Authorization: `Bearer ${paystackSecret()}` },
      cache: 'no-store',
      signal: AbortSignal.timeout(8000),
    })
    const body = await response.json().catch(() => null) as { status?: boolean; data?: { link?: string } } | null
    const link = body?.data?.link
    if (!response.ok || body?.status !== true || !link) throw new Error()
    const url = new URL(link)
    if (url.protocol !== 'https:' || (url.hostname !== 'paystack.com' && !url.hostname.endsWith('.paystack.com'))) {
      throw new Error()
    }
    return Response.json({ url: url.toString() })
  } catch {
    return Response.json({ error: 'billing_unavailable' }, { status: 502 })
  }
}
