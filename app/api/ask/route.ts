import Anthropic from '@anthropic-ai/sdk'
import { buildSystemPrompt } from '@/lib/strategist-system-prompt'
import { createServiceClient, getUserFromRequest } from '@/lib/ask-supabase'

// Node.js runtime: @supabase/supabase-js transitively references node:fs/node:path,
// which the Edge bundler rejects. Node serverless streams ReadableStream responses
// just as well, so streaming (the goal) is unaffected.
export const runtime = 'nodejs'

const FREE_LIMIT = 5
// Fair-use cap: paid tiers get up to this many user messages per Africa/Lagos day.
const DAILY_CAP = 100
const DAILY_CAP_MESSAGE =
  "We've covered a lot today — I put a lot into every answer, so I cap our sessions at 100 messages a day. Come back tomorrow and we'll pick it right up."

type ChatMessage = { role: 'user' | 'assistant'; content: string }

function jsonError(error: string, status: number, extra: Record<string, unknown> = {}) {
  return Response.json({ error, ...extra }, { status })
}

/**
 * Start of the current Africa/Lagos calendar day, as a UTC ISO string.
 * Lagos (WAT) is a fixed UTC+1 with no DST, so midnight there is 23:00 UTC the
 * previous day. We read the Lagos wall-clock date, then subtract the +1h offset.
 */
function lagosDayStartUtc(): string {
  const now = Date.now()
  const wat = new Date(now + 60 * 60 * 1000) // shift so UTC getters read Lagos wall clock
  const midnightAsUtc = Date.UTC(wat.getUTCFullYear(), wat.getUTCMonth(), wat.getUTCDate())
  return new Date(midnightAsUtc - 60 * 60 * 1000).toISOString()
}

export async function POST(req: Request) {
  // 1. Authenticate via bearer token — enforced here, never client-side.
  const user = await getUserFromRequest(req)
  if (!user) return jsonError('unauthenticated', 401)

  // 2. Parse + validate the conversation.
  let body: { messages?: unknown }
  try {
    body = await req.json()
  } catch {
    return jsonError('bad_request', 400)
  }
  const incoming = Array.isArray(body.messages) ? body.messages : []
  const messages: ChatMessage[] = incoming
    .filter(
      (m: unknown): m is ChatMessage =>
        !!m &&
        typeof (m as ChatMessage).content === 'string' &&
        ((m as ChatMessage).role === 'user' || (m as ChatMessage).role === 'assistant'),
    )
    .map((m) => ({ role: m.role, content: m.content }))
  if (messages.length === 0 || messages[messages.length - 1].role !== 'user') {
    return jsonError('bad_request', 400)
  }

  const supa = createServiceClient()

  // 3. Load (or lazily create) the profile for tier + first name.
  const { data: existing } = await supa
    .from('profiles')
    .select('first_name, tier')
    .eq('id', user.id)
    .maybeSingle()

  let profile = existing
  if (!profile) {
    await supa.from('profiles').upsert({ id: user.id, tier: 'free' }, { onConflict: 'id', ignoreDuplicates: true })
    profile = { first_name: null, tier: 'free' }
  }
  const tier: 'free' | 'builder' | 'founder' | 'founding50' = (profile.tier ?? 'free') as
    | 'free'
    | 'builder'
    | 'founder'
    | 'founding50'

  // 4. Enforce usage limits server-side, before any model work.
  let messagesRemaining: number | undefined
  if (tier === 'free') {
    // Free tier: lifetime cap, atomic increment so concurrent requests can't overspend.
    const { data: consumed, error } = await supa.rpc('ask_consume_message', {
      p_user_id: user.id,
      p_limit: FREE_LIMIT,
    })
    if (error) return jsonError('server_error', 500)
    if (!consumed?.allowed) {
      return jsonError('limit_reached', 402, { tier, messagesRemaining: 0 })
    }
    messagesRemaining = consumed.remaining as number
  } else {
    // Paid tiers: fair-use cap of DAILY_CAP user messages per Africa/Lagos day.
    const { count, error } = await supa
      .from('ask_messages')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('role', 'user')
      .gte('created_at', lagosDayStartUtc())
    if (error) return jsonError('server_error', 500)
    if ((count ?? 0) >= DAILY_CAP) {
      // Warm, in-character sign-off — returned as a normal streamed reply so the
      // client renders it in the Strategist's voice rather than as an error.
      return new Response(DAILY_CAP_MESSAGE, {
        status: 200,
        headers: {
          'Content-Type': 'text/plain; charset=utf-8',
          'Cache-Control': 'no-cache, no-transform',
          'X-Messages-Remaining': '',
          // Marks this 200 as the fair-use cap sign-off (vs a normal model reply)
          // so the client can fire the daily_cap_hit analytics event.
          'X-Daily-Cap': '1',
        },
      })
    }
  }

  // 5. Persist the user's message.
  const lastUser = messages[messages.length - 1]
  await supa.from('ask_messages').insert({ user_id: user.id, role: 'user', content: lastUser.content })

  // 6. Build the persona system prompt and stream the reply.
  const system = buildSystemPrompt({
    tier,
    messagesRemaining,
    userName: profile.first_name ?? undefined,
  })

  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

  const modelStream = anthropic.messages.stream({
    model: 'claude-sonnet-4-6',
    max_tokens: 1024,
    system,
    // Snappy chat: thinking off, low effort keeps latency and cost down.
    thinking: { type: 'disabled' },
    output_config: { effort: 'low' },
    messages: messages.map((m) => ({ role: m.role, content: m.content })),
  })

  const encoder = new TextEncoder()
  let assistantText = ''

  const readable = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        for await (const event of modelStream) {
          if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
            assistantText += event.delta.text
            controller.enqueue(encoder.encode(event.delta.text))
          }
        }
        if (assistantText) {
          await supa.from('ask_messages').insert({ user_id: user.id, role: 'assistant', content: assistantText })
        }
      } catch {
        controller.enqueue(
          encoder.encode('\n\nThe Strategist is unavailable for a moment. Please try again shortly.'),
        )
      } finally {
        controller.close()
      }
    },
  })

  return new Response(readable, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      'X-Messages-Remaining': messagesRemaining === undefined ? '' : String(messagesRemaining),
    },
  })
}
