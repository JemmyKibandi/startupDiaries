'use client'

import { useState, useEffect } from 'react'
import { getItem, setItem, KEYS } from '@/lib/storage'
import { getDeviceId } from '@/lib/deviceId'
import type { DailyCompletion, StreakData, PauseState } from '@/types'

function toDateStr(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function wasCompleted(c: DailyCompletion): boolean {
  return Object.values(c.tasks).every(Boolean)
}

function calculateStreak(
  completions: DailyCompletion[],
  pause: PauseState | null,
  stored: StreakData
): StreakData {
  const today = toDateStr(new Date())
  const yesterday = toDateStr(new Date(Date.now() - 86400000))

  const completedDates = new Set(completions.filter(wasCompleted).map((c) => c.date))

  let current = 0
  let checkDate = completedDates.has(today) ? today : yesterday
  let cursor = new Date(checkDate)

  while (true) {
    const dateStr = toDateStr(cursor)
    if (completedDates.has(dateStr)) {
      current++
      cursor = new Date(cursor.getTime() - 86400000)
    } else if (pause?.active && dateStr >= pause.loggedAt.split('T')[0] && dateStr <= pause.until) {
      cursor = new Date(cursor.getTime() - 86400000)
    } else {
      break
    }
  }

  if (pause?.active) {
    current = Math.max(current, stored.current)
  }

  const lastCompleted = completedDates.has(today)
    ? today
    : completedDates.has(yesterday)
      ? yesterday
      : stored.lastCompletedDate

  return {
    current,
    longest: Math.max(current, stored.longest),
    lastCompletedDate: lastCompleted,
  }
}

export function useStreak() {
  const [streak, setStreak] = useState<StreakData>({ current: 0, longest: 0, lastCompletedDate: '' })

  useEffect(() => {
    const deviceId = getDeviceId()
    const stored = getItem<StreakData>(KEYS.STREAK) ?? { current: 0, longest: 0, lastCompletedDate: '' }
    const cachedCompletions = getItem<DailyCompletion[]>(KEYS.COMPLETIONS) ?? []
    const cachedPause = getItem<PauseState>(KEYS.PAUSE)

    // Optimistic from cache
    const optimistic = calculateStreak(cachedCompletions, cachedPause, stored)
    setStreak(optimistic)

    // Sync from DB
    Promise.all([
      fetch(`/api/tasks/history?deviceId=${deviceId}`).then((r) => r.json()),
      fetch(`/api/streak?deviceId=${deviceId}`).then((r) => r.json()),
      fetch(`/api/pause?deviceId=${deviceId}`).then((r) => r.json()),
    ])
      .then(([completions, dbStreak, pauseData]: [DailyCompletion[], StreakData, { state: PauseState | null }]) => {
        const pause = pauseData.state
        const recalculated = calculateStreak(completions, pause, dbStreak)

        // Save back to DB if recalculated differs
        if (
          recalculated.current !== dbStreak.current ||
          recalculated.longest !== dbStreak.longest
        ) {
          fetch('/api/streak', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ deviceId, ...recalculated }),
          }).catch(() => {})
        }

        setStreak(recalculated)
        setItem(KEYS.STREAK, recalculated)
      })
      .catch(() => setStreak(optimistic))
  }, [])

  return streak
}
