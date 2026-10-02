import { createHash } from 'node:crypto'
import { createServiceClient, getUserFromRequest } from '@/lib/ask-supabase'
export const runtime = 'nodejs'
export async function POST(req: Request) {
 const user = await getUserFromRequest(req)
 if (!user || !user.email_confirmed_at) return Response.json({error:'verified_account_required'},{status:401})
 const body = await req.json().catch(()=>null) as {token?:unknown}|null
 if (typeof body?.token !== 'string' || !/^[a-f0-9]{64}$/.test(body.token)) {
   return Response.json({error:'invalid_invitation'},{status:400})
 }
 const {data,error} = await createServiceClient().rpc('claim_strategist_scholarship',{
   p_token_hash:createHash('sha256').update(body.token).digest('hex'),p_user_id:user.id,
 })
 if (error) return Response.json({error:'scholarship_unavailable'},{status:503})
 return Response.json(data,{status:data?.activated?200:409})
}
