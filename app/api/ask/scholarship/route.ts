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
 const tokenHash=createHash('sha256').update(body.token).digest('hex')
 const db=createServiceClient()
 const {data,error} = await db.rpc('claim_strategist_scholarship',{
   p_token_hash:tokenHash,p_user_id:user.id,
 })
 if (error) return Response.json({error:'scholarship_unavailable'},{status:503})
 if (data?.activated) {
   const { data: invitation } = await db.from('strategist_scholarships')
     .select('recipient_name,access_until').eq('token_hash',tokenHash).maybeSingle()
   const key=process.env.RESEND_API_KEY
   const from=process.env.STRATEGIST_ALERT_FROM || 'Ask the Strategist <notifications@aidigitalproductstrategist.com>'
   if (key && from && invitation) {
     try {
       const response=await fetch('https://api.resend.com/emails',{
         method:'POST',
         headers:{
           Authorization:`Bearer ${key}`,
           'Content-Type':'application/json',
           'Idempotency-Key':`strategist-claim-${tokenHash.slice(0,32)}`,
         },
         body:JSON.stringify({
           from,to:['hello@aidigitalproductstrategist.com'],
           subject:`Scholarship activated: ${invitation.recipient_name}`,
           text:`A Strategist scholarship was activated.\n\nInvitation: ${invitation.recipient_name}\nClaimed by: ${user.email}\nAccess ends: ${invitation.access_until ?? 'See dashboard'}\n\nView: https://aidigitalproductstrategist.com/admin`,
         }),
         signal:AbortSignal.timeout(7000),
       })
       if (!response.ok) console.error('Scholarship alert delivery failed',response.status)
     } catch { console.error('Scholarship alert delivery failed') }
   } else {
     console.error('Scholarship alert is not configured or invitation was not found')
   }
 }
 return Response.json(data,{status:data?.activated?200:409})
}
