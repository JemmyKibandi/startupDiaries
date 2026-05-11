'use client'

import { useMemo } from 'react'
import { useTasks } from '@/hooks/useTasks'
import { COPY } from '@/lib/copy'

function toDateStr(date: Date): string {
  return date.toISOString().split('T')[0]
}

function getLast7Days(): string[] {
  const days: string[] = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    days.push(toDateStr(d))
  }
  return days
}

function getMomentumMessage(score: number): string {
  if (score === 100) return COPY.momentum.perfect
  if (score >= 70) return COPY.momentum.solid
  if (score >= 50) return COPY.momentum.inconsistent
  return COPY.momentum.failing
}

function getDayLabel(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-GB', { weekday: 'short' }).toUpperCase()
}

export default function WeeklySummary() {
  const { history } = useTasks()

  const last7 = getLast7Days()

  const weekData = useMemo(() => {
    const completedSet = new Set(
      history
        .filter((d) => Object.values(d.tasks).every(Boolean))
        .map((d) => d.date)
    )
    return last7.map((date) => ({
      date,
      day: getDayLabel(date),
      completed: completedSet.has(date),
      isToday: date === toDateStr(new Date()),
    }))
  }, [history, last7])

  const completedCount = weekData.filter((d) => d.completed).length
  const momentumScore = Math.round((completedCount / 7) * 100)
  const message = getMomentumMessage(momentumScore)

  const scoreColor =
    momentumScore === 100
      ? '#00ff88'
      : momentumScore >= 70
        ? '#00ff88'
        : momentumScore >= 50
          ? '#ffaa00'
          : '#ff3b3b'

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col items-center gap-3 py-4">
        <div
          className="font-mono text-[80px] font-bold leading-none tabular-nums"
          style={{ color: scoreColor }}
        >
          {momentumScore}%
        </div>
        <div className="font-mono text-xs uppercase tracking-[0.3em] text-muted">
          Momentum Score
        </div>
        <div className="font-serif text-xl italic text-white mt-2">{message}</div>
      </div>

      <div className="grid grid-cols-7 gap-1.5">
        {weekData.map((day) => (
          <div key={day.date} className="flex flex-col items-center gap-2">
            <div
              className="w-full aspect-square rounded-md flex items-center justify-center transition-all"
              style={{
                background: day.completed
                  ? '#00ff88'
                  : day.isToday
                    ? 'rgba(255,255,255,0.05)'
                    : 'rgba(255,255,255,0.03)',
                border: day.isToday
                  ? '1px solid rgba(255,255,255,0.2)'
                  : '1px solid rgba(255,255,255,0.06)',
              }}
            >
              {day.completed && (
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path
                    d="M2.5 7L5.5 10L11.5 4"
                    stroke="#0a0a0a"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
              {!day.completed && day.isToday && (
                <div
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ background: '#00ff88' }}
                />
              )}
              {!day.completed && !day.isToday && (
                <div className="w-1 h-1 rounded-full bg-white/20" />
              )}
            </div>
            <span
              className="font-mono text-[9px] uppercase tracking-wide"
              style={{ color: day.isToday ? 'white' : 'rgba(255,255,255,0.3)' }}
            >
              {day.day.slice(0, 2)}
            </span>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-3">
        <h3 className="font-mono text-xs uppercase tracking-widest text-muted">This week</h3>
        {weekData.map((day) => (
          <div
            key={day.date}
            className="flex items-center justify-between py-3 border-b"
            style={{ borderColor: 'rgba(255,255,255,0.06)' }}
          >
            <div className="flex items-center gap-3">
              <div
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ background: day.completed ? '#00ff88' : 'rgba(255,255,255,0.15)' }}
              />
              <span
                className="font-mono text-sm"
                style={{ color: day.isToday ? 'white' : 'rgba(255,255,255,0.6)' }}
              >
                {new Date(day.date).toLocaleDateString('en-GB', {
                  weekday: 'long',
                  month: 'short',
                  day: 'numeric',
                })}
              </span>
              {day.isToday && (
                <span className="font-mono text-[10px] uppercase tracking-widest text-muted">
                  TODAY
                </span>
              )}
            </div>
            <span
              className="font-mono text-xs uppercase tracking-wider"
              style={{ color: day.completed ? '#00ff88' : 'rgba(255,59,59,0.7)' }}
            >
              {day.completed ? 'Done' : 'Missed'}
            </span>
          </div>
        ))}
      </div>

      <div
        className="rounded border p-4"
        style={{ borderColor: `${scoreColor}22`, background: `${scoreColor}08` }}
      >
        <p className="font-mono text-xs leading-relaxed" style={{ color: scoreColor }}>
          {completedCount}/7 days completed.{' '}
          {momentumScore < 50
            ? 'You know what needs to change.'
            : momentumScore < 100
              ? 'Keep closing the gap.'
              : 'Perfect week. Build on it.'}
        </p>
      </div>
    </div>
  )
}
