import 'server-only'
import { getPaidPlan, type PaidPlanId } from '@/lib/strategist-plans'

const PLAN_ENV: Record<PaidPlanId, string> = {
  builder: 'PAYSTACK_PLAN_BUILDER',
  founder: 'PAYSTACK_PLAN_FOUNDER',
  founding50: 'PAYSTACK_PLAN_FOUNDING_100',
}

export function paystackSecret() {
  const value = process.env.PAYSTACK_SECRET_KEY
  if (!value) throw new Error('PAYSTACK_SECRET_KEY is not configured')
  return value
}

export function paystackPlanCode(plan: PaidPlanId) {
  const envName = PLAN_ENV[plan]
  const value = process.env[envName]
  if (!value) throw new Error(`${envName} is not configured`)
  return value
}

export function appUrl() {
  return (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://aidigitalproductstrategist.com').replace(/\/$/, '')
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
