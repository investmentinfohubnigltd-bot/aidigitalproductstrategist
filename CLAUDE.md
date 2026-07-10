@AGENTS.md

# AI Digital Product Strategist

Marketing site + "Ask the Strategist" AI mentor for **Aurum Digital Consulting**, a
Lagos-based digital product studio. It is a single Next.js app that serves a luxury
editorial landing page and a gated, streaming AI chat product for founders building
in Nigerian/African markets.

> **Read `AGENTS.md` first.** This repo pins **Next.js 16** (App Router) and
> **React 19**, which differ from most training data. Before writing framework code,
> read the relevant guide under `node_modules/next/dist/docs/` and heed deprecation
> notices. (`node_modules` is only present after `npm install`.)

## Commands

```bash
npm install       # install deps (Node 20+; Vercel uses `npm install`)
npm run dev       # local dev server → http://localhost:3000
npm run build     # production build (run before pushing risky changes)
npm run lint      # ESLint (eslint-config-next, flat config)
npm start         # serve a production build
```

There is **no test suite** and no test runner configured. "Verifying a change" means
`npm run build` + `npm run lint` and, for behavior, driving the page/route manually.

## Tech stack

- **Next.js 16.2.9** — App Router, React Server Components by default.
- **React 19.2** — client components opt in with `'use client'`.
- **TypeScript 5**, `strict: true`. Path alias `@/*` → repo root (e.g. `@/lib/...`).
- **Tailwind CSS v4** via `@tailwindcss/postcss` — but note: components are styled
  almost entirely with **CSS variables + inline styles / a global stylesheet**, not
  Tailwind utility classes. Follow the surrounding pattern (see Styling below).
- **Supabase** (`@supabase/supabase-js`) — auth (magic link) + Postgres for the chat.
- **Anthropic SDK** (`@anthropic-ai/sdk`) — streams the Strategist's replies.
- **Resend** — transactional email for the contact form.
- **Vercel** — hosting, `@vercel/analytics` for events. Deploy config in `vercel.json`.

## Directory layout

```
app/
  layout.tsx            Root layout: fonts (Fraunces/Inter via next/font), metadata, Analytics
  page.tsx              Landing page ('use client') — composes the section components
  globals.css           Design system: brand tokens, resets, .reveal animations
  opengraph-image.tsx   Generated OG social card (next/og ImageResponse)
  components/           Landing-page sections: Nav, Hero, About, Services, Portfolio,
                        Process, Contact, Footer, ScrollReveal
  ask/
    page.tsx            /ask route (server component, metadata)
    AskChat.tsx         The whole chat UI ('use client') — auth, streaming, paywall
  api/
    ask/route.ts        POST — auth, usage limits, persist, stream Claude reply
    ask/waitlist/route.ts  POST — capture plan interest (payments not live yet)
    contact/route.ts    POST — send enquiry + auto-reply via Resend
components/
  StrategistAvatar.tsx  Animated avatar (idle/thinking/speaking states)
lib/
  strategist-system-prompt.ts  The persona system prompt + tier-aware builder
  ask-supabase.ts       Supabase client factories + bearer-token auth helper
supabase/
  migrations/0001_ask_the_strategist.sql  Full schema, RLS, RPCs, signup trigger
public/
  downloads/            Lead-magnet PDFs (e.g. Product-Builder-Prompt-Pack.pdf)
```

Note the two `components/` dirs: **`app/components/`** holds landing-page sections;
top-level **`components/`** holds shared UI (`StrategistAvatar`) imported via `@/components`.

## "Ask the Strategist" — how the chat works

The single most important subsystem. Data flow:

1. **Auth (client).** `AskChat.tsx` uses the browser Supabase client (anon key) for
   magic-link sign-in only. It never reads/writes chat tables directly — it just holds
   the session and sends the access token.
2. **Request.** The client POSTs `{ messages }` to `/api/ask` with
   `Authorization: Bearer <access_token>` and streams the plaintext response body.
3. **Server gate (`app/api/ask/route.ts`).** This is the security boundary:
   - Verifies the bearer token via `getUserFromRequest` → returns the user or `null`.
   - Loads/creates the user's `profiles` row to get `tier` + `first_name`.
   - **Enforces limits server-side, before any model call:**
     - `free` tier → lifetime cap of `FREE_LIMIT` (5) via the atomic
       `ask_consume_message` RPC (guarded UPDATE so concurrent requests can't overspend).
       Over limit → HTTP **402** `limit_reached`.
     - paid tiers → fair-use `DAILY_CAP` (100) user messages per **Africa/Lagos** day
       (`lagosDayStartUtc()`, fixed UTC+1, no DST). Over cap → an in-character 200 reply
       with header `X-Daily-Cap: 1`.
   - Persists the user message, builds the system prompt, streams Claude
     (`claude-sonnet-4-6`, thinking disabled, `effort: low`) back as a `ReadableStream`,
     then persists the full assistant reply.
   - Response headers the client reads: `X-Messages-Remaining`, `X-Daily-Cap`.
4. **Persona.** `lib/strategist-system-prompt.ts` — `STRATEGIST_SYSTEM_PROMPT` is the
   base persona; `buildSystemPrompt({ tier, messagesRemaining, userName })` appends
   tier-aware notes (free-tier upsell nudge only when ≤2 remaining; deeper answers for
   founder tiers).

**Tiers:** `free | builder | founder | founding50` (matches the DB `check` constraint
and the prompt builder). Payments are **not live** — plan CTAs call `/api/ask/waitlist`
to record interest in `plan_waitlist`.

### Supabase / data model (`supabase/migrations/0001_ask_the_strategist.sql`)

- `profiles` (tier + first_name, one per auth user), `ask_messages` (full transcript),
  `ask_usage` (lifetime free counter), `plan_waitlist`.
- **RLS is on** with self-read-only policies. All writes go through the **service-role
  key**, which bypasses RLS. `plan_waitlist` has no policies → unreadable by anon key.
- RPCs: `ask_consume_message(user_id, limit)` (atomic free-message consumption),
  `handle_new_ask_user()` (trigger auto-creates a profile on `auth.users` insert).
- Migrations are idempotent (`if not exists` / `or replace`). Apply via `supabase db push`
  or the Supabase SQL editor.

## Runtime & security conventions

- **API routes run on the Node.js runtime** (`export const runtime = 'nodejs'`), not Edge:
  `@supabase/supabase-js` transitively imports `node:fs`/`node:path`, which the Edge
  bundler rejects. Streaming works fine on Node serverless.
- **Never import the service-role client into a client component.** `createServiceClient()`
  is server-only. Auth is enforced on the server; the client is never trusted.
- Anthropic replies are **streamed as plaintext** (not SSE/JSON) — the client reads the
  body with a `ReadableStream` reader. Keep that contract if you touch either side.

## Environment variables

Set in Vercel (and a local `.env.local`, which is gitignored). No `.env.example` exists.

| Variable | Used by |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | client + server Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | client auth + server token verification |
| `SUPABASE_SERVICE_ROLE_KEY` | server-only data access (bypasses RLS) |
| `ANTHROPIC_API_KEY` | `/api/ask` model streaming |
| `RESEND_API_KEY` | `/api/contact` email |

## Styling & design system

- Brand: **dark luxury**, gold accents, editorial serif. Tokens live in `:root` in
  `app/globals.css` — e.g. `--ink #1C1A16`, `--parchment #F2EDE4`, `--gold #D4B074`,
  `--gold-dim`, `--surface`, `--rule`, `--secondary`, `--tertiary`, plus motion
  (`--ease`, `--t-fast`) and rhythm (`--section-y`, `--container`) tokens.
- Fonts: **Fraunces** (display serif, `--font-serif`) and **Inter** (`--font-sans`),
  loaded via `next/font/google` in `layout.tsx` and exposed as CSS variables. Reference
  them with `var(--font-serif)`, not by re-importing.
- Components use **inline `style={{ ... }}` with `var(--token)`** heavily (see
  `AskChat.tsx`). Match that idiom — reach for existing tokens rather than hard-coding
  hex values or adding Tailwind utility classes.
- Scroll-in animation: add class `reveal` to an element; the `IntersectionObserver` in
  `app/page.tsx` toggles `.visible` (styled in `globals.css`).

## Content integrity rules (product, not just code)

The brand is built on honesty and these are enforced in copy:

- The chat is **openly an AI** version of the Strategist — never claim to be the human
  in real time, never fabricate dated anecdotes, named clients, or specific figures.
- Portfolio claims must stay substantiated: **12 products across 11 industries**, each
  card carries a real industry tag, **no invented metrics or URLs** (see `Portfolio.tsx`).
- Use "developed" / "launched" (not "built" / "shipped") for products; "we/our" for the
  studio, "I" for mentoring. No fake scarcity, no invented testimonials.

## Git & workflow

- Active development branch for this work: **`claude/claude-md-docs-ozamt8`**. Develop,
  commit, and push there; push with `git push -u origin <branch>`. Don't open a PR unless
  explicitly asked.
- Trunk is `main`; Vercel deploys from it. Commit messages in history are short and
  descriptive (e.g. "Harden industry-tag color with hex fallback").
