import Anthropic from '@anthropic-ai/sdk'
import { buildSystemPrompt } from '@/lib/strategist-system-prompt'
import { createServiceClient, getUserFromRequest } from '@/lib/ask-supabase'

// Node.js runtime: @supabase/supabase-js transitively references node:fs/node:path,
// which the Edge bundler rejects. Node serverless streams ReadableStream responses
// just as well, so streaming (the goal) is unaffected.
export const runtime = 'nodejs'

const FREE_LIMIT = 5

type ChatMessage = { role: 'user' | 'assistant'; content: string }

function jsonError(error: string, status: number, extra: Record<string, unknown> = {}) {
  return Response.json({ error, ...extra }, { status })
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

  // 4. Enforce the free-tier limit server-side with an atomic increment.
  let messagesRemaining: number | undefined
  if (tier === 'free') {
    const { data: consumed, error } = await supa.rpc('ask_consume_message', {
      p_user_id: user.id,
      p_limit: FREE_LIMIT,
    })
    if (error) return jsonError('server_error', 500)
    if (!consumed?.allowed) {
      return jsonError('limit_reached', 402, { tier, messagesRemaining: 0 })
    }
    messagesRemaining = consumed.remaining as number
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
