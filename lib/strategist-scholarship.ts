import 'server-only'
import { createServiceClient } from '@/lib/ask-supabase'

export async function scholarshipAccess(userId: string) {
  const { data, error } = await createServiceClient().from('strategist_scholarships')
    .select('access_until').eq('claimed_by', userId).is('revoked_at', null).maybeSingle()
  if (error) throw new Error('scholarship_unavailable')
  return data && new Date(data.access_until).getTime() > Date.now() ? data.access_until as string : null
}
