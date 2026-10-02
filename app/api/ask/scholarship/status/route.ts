import { createHash } from 'node:crypto'
import { createServiceClient } from '@/lib/ask-supabase'

export const runtime = 'nodejs'

export async function POST(req: Request) {
  const body = await req.json().catch(() => null) as { token?: unknown } | null
  if (typeof body?.token !== 'string' || !/^[a-f0-9]{64}$/.test(body.token)) {
    return Response.json({ status: 'invalid' }, { status: 400, headers: { 'Cache-Control': 'no-store' } })
  }
  const tokenHash = createHash('sha256').update(body.token).digest('hex')
  const { data, error } = await createServiceClient().from('strategist_scholarships')
    .select('claimed_at,claim_before,revoked_at')
    .eq('token_hash', tokenHash).maybeSingle()
  if (error) return Response.json({ status: 'unavailable' }, { status: 503, headers: { 'Cache-Control': 'no-store' } })
  const availability = !data || data.revoked_at ? 'invalid'
    : data.claimed_at ? 'claimed'
    : new Date(data.claim_before).getTime() <= Date.now() ? 'expired'
    : 'available'
  return Response.json({ status: availability }, { headers: { 'Cache-Control': 'no-store' } })
}
