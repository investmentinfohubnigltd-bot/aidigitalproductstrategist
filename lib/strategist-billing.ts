import 'server-only'
import { getPaidPlan, type PaidPlanId } from '@/lib/strategist-plans'

const PLAN_ENV: Record<PaidPlanId, string> = {
  builder: 'PAYSTACK_PLAN_BUILDER',
  founder: 'PAYSTACK_PLAN_FOUNDER',
  founding50: 'PAYSTACK_PLAN_FOUNDING_100',
}

export function paystackSecret() {
  const value = process.env.PAYSTACK_SECRET_KEY
  if (!value?.startsWith('sk_live_')) throw new Error('A live Paystack secret is required')
  return value
}

export function paystackPlanCode(plan: PaidPlanId) {
  const envName = PLAN_ENV[plan]
  const value = process.env[envName]
  if (!value || !/^PLN_[A-Za-z0-9]+$/.test(value)) throw new Error(`${envName} is not configured`)
  return value
}

export function appUrl() {
  const value = (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://aidigitalproductstrategist.com').replace(/\/$/, '')
  const url = new URL(value)
  if (url.protocol !== 'https:') throw new Error('NEXT_PUBLIC_SITE_URL must use HTTPS')
  return url.origin
}

export function planFromCode(code: unknown): PaidPlanId | null {
  if (typeof code !== 'string') return null
  for (const plan of ['builder', 'founder', 'founding50'] as const) {
    if (process.env[PLAN_ENV[plan]] === code) return plan
  }
  return null
}

export function checkoutPlan(plan: PaidPlanId) {
  return { ...getPaidPlan(plan), planCode: paystackPlanCode(plan) }
}
