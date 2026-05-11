import type { Metadata } from 'next'
import WeeklySummary from '@/components/WeeklySummary'

export const metadata: Metadata = {
  title: 'Weekly — PIPELINE',
}

export default function WeeklyPage() {
  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      <div className="pt-2">
        <h1 className="font-serif text-3xl italic text-white">This Week</h1>
        <p className="font-mono text-xs text-muted mt-1">No lies. Just data.</p>
      </div>
      <WeeklySummary />
    </div>
  )
}
