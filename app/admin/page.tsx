import type { Metadata } from 'next'
import OwnerDashboard from './OwnerDashboard'

export const metadata: Metadata = {
  title: 'Aurum owner dashboard',
  robots: { index: false, follow: false },
}

export default function DashboardPage() {
  return <OwnerDashboard />
}
