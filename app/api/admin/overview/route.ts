import { createServiceClient, getUserFromRequest } from '@/lib/ask-supabase'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const ownerEmail = 'hello@aidigitalproductstrategist.com'

export async function GET(request: Request) {
  const user = await getUserFromRequest(request)
  if (!user) return Response.json({ error: 'Sign in to continue.' }, { status: 401 })
  if (!user.email_confirmed_at || user.email?.toLowerCase() !== ownerEmail) {
    return Response.json({ error: 'Owner access required.' }, { status: 403 })
  }

  const db = createServiceClient()
  const [invites, subscriptions, usage, checkouts] = await Promise.all([
    db.from('strategist_scholarships')
      .select('recipient_name,claim_before,duration_months,claimed_by,claimed_at,access_until,revoked_at,created_at')
      .order('created_at', { ascending: false }).limit(200),
    db.from('strategist_subscriptions')
      .select('user_id,email,plan,status,current_period_end,last_paid_at,cancel_at_period_end,created_at')
      .order('created_at', { ascending: false }).limit(200),
    db.from('ask_usage').select('user_id,message_count').limit(1000),
    db.from('strategist_checkouts')
      .select('email,plan,status,amount_kobo,created_at').order('created_at', { ascending: false }).limit(100),
  ])
  if ([invites, subscriptions, usage, checkouts].some(result => result.error)) {
    return Response.json({ error: 'Dashboard data is temporarily unavailable.' }, { status: 503 })
  }

  const claimantIds = [...new Set((invites.data ?? []).map(row => row.claimed_by).filter(Boolean))]
  const claimants = new Map<string, string>()
  await Promise.all(claimantIds.map(async id => {
    const { data } = await db.auth.admin.getUserById(id)
    if (data.user?.email) claimants.set(id, data.user.email)
  }))
  const usageById = new Map((usage.data ?? []).map(row => [row.user_id, row.message_count]))
  const now = Date.now()
  const scholarships = (invites.data ?? []).map(row => ({
    name: row.recipient_name,
    status: row.revoked_at ? 'withdrawn' : row.claimed_at ? 'claimed' :
      new Date(row.claim_before).getTime() <= now ? 'expired' : 'available',
    claimedBy: row.claimed_by ? claimants.get(row.claimed_by) ?? 'Account unavailable' : null,
    claimedAt: row.claimed_at,
    accessUntil: row.access_until,
    claimBefore: row.claim_before,
    months: row.duration_months,
  }))
  const paid = (subscriptions.data ?? []).map(row => ({
    email: row.email, plan: row.plan, status: row.status,
    currentPeriodEnd: row.current_period_end, lastPaidAt: row.last_paid_at,
    cancelAtPeriodEnd: row.cancel_at_period_end,
    messagesUsed: usageById.get(row.user_id) ?? 0,
  }))
  const payments = (checkouts.data ?? []).map(row => ({
    email: row.email, plan: row.plan, status: row.status,
    amountNgn: row.amount_kobo / 100, createdAt: row.created_at,
  }))
  return Response.json({
    generatedAt: new Date().toISOString(),
    scholarships, paid, payments,
    academy: {
      status: 'Enrolment is not open yet',
      detail: 'Academy enquiry forms currently deliver by email. No enrolment or lesson progress database is connected.',
      url: 'https://academy.aurumdigitalconsulting.com/',
    },
  }, { headers: { 'Cache-Control': 'private, no-store', 'X-Robots-Tag': 'noindex, nofollow' } })
}
