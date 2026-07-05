/**
 * Supabase helpers for "Ask the Strategist".
 *
 * Two clients:
 *  - anon client — only used to verify a caller's access token (getUserFromRequest)
 *  - service-role client — used server-side to read/write the ask_* tables,
 *    bypassing RLS. NEVER import this into client components.
 *
 * Both use fetch under the hood, so they run on the Edge runtime.
 */
import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

/** Service-role client — full access, server-only. */
export function createServiceClient(): SupabaseClient {
  if (!url || !serviceKey) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  }
  return createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}

/**
 * Resolve the authenticated user from a request's `Authorization: Bearer <token>`
 * header. Returns null when there is no valid token — callers must treat that as
 * unauthenticated. This is the server-side gate; the client never enforces auth.
 */
export async function getUserFromRequest(req: Request) {
  if (!url || !anonKey) return null
  const authz = req.headers.get('authorization') ?? ''
  const token = authz.startsWith('Bearer ') ? authz.slice(7).trim() : ''
  if (!token) return null

  const client = createClient(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
  const { data, error } = await client.auth.getUser(token)
  if (error || !data?.user) return null
  return data.user
}
