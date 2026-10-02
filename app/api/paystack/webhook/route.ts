import { createHmac, timingSafeEqual } from 'node:crypto'

export const runtime = 'nodejs'
const MAX_BYTES = 256 * 1024

export async function POST(req: Request) {
  const secret = process.env.PAYSTACK_SECRET_KEY
  if (!secret?.startsWith('sk_live_')) return new Response(null, { status: 503 })
  const signature = req.headers.get('x-paystack-signature')
  if (!signature || !/^[a-f0-9]{128}$/.test(signature)) return new Response(null, { status: 401 })
  const reader = req.body?.getReader()
  if (!reader) return new Response(null, { status: 400 })
  const chunks: Uint8Array[] = []
  let size = 0
  try {
    for (;;) {
      const { done, value } = await reader.read()
      if (done) break
      size += value.byteLength
      if (size > MAX_BYTES) {
        await reader.cancel()
        return new Response(null, { status: 413 })
      }
      chunks.push(value)
    }
  } catch { return new Response(null, { status: 400 }) }
  const raw = Buffer.concat(chunks)
  const expected = createHmac('sha512', secret).update(raw).digest()
  if (!timingSafeEqual(expected, Buffer.from(signature, 'hex'))) return new Response(null, { status: 401 })
  try {
    const event = JSON.parse(raw.toString('utf8'))
    if (!event || typeof event !== 'object' || Array.isArray(event) || typeof event.event !== 'string') {
      return new Response(null, { status: 400 })
    }
  } catch { return new Response(null, { status: 400 }) }
  // Preserve the existing LearnedIQ receiver while Strategist billing is prepared.
  // Forward the exact signed bytes; never acknowledge a failed downstream delivery.
  try {
    const response = await fetch('https://learnediq.ng/api/billing/paystack/webhook', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-paystack-signature': signature },
      body: raw,
      redirect: 'error',
      signal: AbortSignal.timeout(8000),
    })
    if (!response.ok) return new Response(null, { status: 502 })
  } catch { return new Response(null, { status: 502 }) }
  return Response.json({ received: true })
}
