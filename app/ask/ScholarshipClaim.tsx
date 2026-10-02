'use client'
import { useEffect, useState } from 'react'
import type { Session } from '@supabase/supabase-js'

export default function ScholarshipClaim({ session }: { session: Session | null }) {
 const [token,setToken]=useState<string|null>(null)
 const [busy,setBusy]=useState(false)
 const [message,setMessage]=useState<string|null>(null)
 useEffect(()=>{
   const incoming=new URLSearchParams(window.location.hash.slice(1)).get('scholarship')
   if(incoming && /^[a-f0-9]{64}$/.test(incoming)){
     localStorage.setItem('strategist-scholarship',incoming)
     window.history.replaceState(null,'',window.location.pathname+window.location.search)
   }
   const saved=localStorage.getItem('strategist-scholarship')
   const frame = window.requestAnimationFrame(() => {
     if(saved && /^[a-f0-9]{64}$/.test(saved)) setToken(saved)
   })
   return () => window.cancelAnimationFrame(frame)
 },[])
 if(!token) return null
 const activate=async()=>{
   if(!session) return
   setBusy(true);setMessage(null)
   try{
     const res=await fetch('/api/ask/scholarship',{method:'POST',
       headers:{'Content-Type':'application/json',Authorization:`Bearer ${session.access_token}`},
       body:JSON.stringify({token})})
     const body=await res.json().catch(()=>null)
     if(res.ok && body?.activated){
       localStorage.removeItem('strategist-scholarship')
       window.location.reload();return
     }
     const errors:Record<string,string>={
       invitation_claimed:'This invitation has already been claimed by another account.',
       invitation_expired:'This invitation has expired. Please request a new link.',
       invalid_invitation:'This invitation is invalid or has been withdrawn.',
       verified_account_required:'Please verify your email and sign in first.',
       already_claimed:'This account has already claimed a scholarship.',
     }
     setMessage(errors[body?.error??'']??'Activation is temporarily unavailable. Please try again.')
   }catch{setMessage('Activation is temporarily unavailable. Please try again.')}
   finally{setBusy(false)}
 }
 return <section style={{padding:22,margin:'20px 0',border:'1px solid var(--gold)',borderRadius:12}}>
   <h2 style={{fontSize:22}}>Activate your Academy scholarship</h2>
   <p style={{margin:'10px 0',lineHeight:1.6}}>Three months of Builder access, starting when you activate. Up to 100 messages per day. No card, charges or automatic renewal.</p>
   {session ? <>
     <p style={{marginBottom:12}}>Claiming for {session.user.email}. Check that this is your account.</p>
     <button onClick={activate} disabled={busy} style={{padding:'12px 18px',background:'var(--gold)',color:'var(--ink)',border:0,borderRadius:8,cursor:'pointer'}}>
       {busy?'Activating…':'Activate my scholarship'}
     </button>
   </> : <p>Use the sign-in form below to create your account. After confirming your email, return here to activate. If you use another browser, reopen your private invitation link there.</p>}
   {message && <p role="alert" style={{marginTop:12}}>{message}</p>}
 </section>
}
