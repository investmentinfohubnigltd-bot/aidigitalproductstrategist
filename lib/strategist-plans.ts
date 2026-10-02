export type PaidPlanId = 'builder' | 'founder' | 'founding50'

export type PaidPlan = {
  id: PaidPlanId
  name: string
  amountKobo: number
  price: string
  cadence: string
  note: string
}

export const PAID_PLANS: readonly PaidPlan[] = [
  { id: 'builder', name: 'Builder', amountKobo: 1_000_000, price: '₦10,000', cadence: '/month', note: 'Up to 100 mentoring messages per day.' },
  { id: 'founder', name: 'Founder', amountKobo: 2_500_000, price: '₦25,000', cadence: '/month', note: 'Deeper frameworks and sharper trade-off analysis.' },
  { id: 'founding50', name: 'Founding 100', amountKobo: 750_000, price: '₦7,500', cadence: '/month', note: 'Launch price for the first 100 active members.' },
] as const

export function isPaidPlanId(value: unknown): value is PaidPlanId {
  return PAID_PLANS.some((plan) => plan.id === value)
}

export function getPaidPlan(id: PaidPlanId) {
  return PAID_PLANS.find((plan) => plan.id === id)!
}
