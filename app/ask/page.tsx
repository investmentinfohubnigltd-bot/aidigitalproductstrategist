import type { Metadata } from 'next'
import AskChat from './AskChat'

export const metadata: Metadata = {
  title: 'Ask the Strategist — AI Digital Product Strategist',
  description:
    'Mentorship in the voice of the strategist behind Aurum Digital Consulting — frameworks, market realities, and one clear next action. Built for founders in Nigerian and African markets.',
}

export default function AskPage() {
  return <AskChat />
}
