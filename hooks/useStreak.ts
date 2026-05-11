'use client'

import { useState, useEffect } from 'react'
import { getItem, setItem, KEYS } from '@/lib/storage'
import type { DailyCompletion, StreakData, PauseState } from '@/types'

function toDateStr(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function daysBetween(a: string, b: string): number {
  const msPerDay = 86400000
  return Math.round((new Date(b).getTime() - new Date(a).getTime()) / msPerDay)
}

function wasCompleted(completion: DailyCompletion | undefined): boolean {
  if (!completion) return false
  return Object.values(completion.tasks).every(Boolean)
}

export function useStreak() {
  const [streak, setStreak] = useState<StreakData>({ current: 0, longest: 0, lastCompletedDate: '' })

  useEffect(() => {
    const completions = getItem<DailyCompletion[]>(KEYS.COMPLETIONS) ?? []
    const pause = getItem<PauseState>(KEYS.PAUSE)
    const stored = getItem<StreakData>(KEYS.STREAK) ?? {
      current: 0,
      longest: 0,
      lastCompletedDate: '',
    }

    const today = toDateStr(new Date())
    const yesterday = toDateStr(new Date(Date.now() - 86400000))

    // Build completed date set
    const completedDates = new Set(
      completions.filter(wasCompleted).map((c) => c.date)
    )

    // Calculate current streak
    let current = 0
    let checkDate = today

    // If today isn't completed yet, start from yesterday
    if (!completedDates.has(today)) {
      checkDate = yesterday
    }

    // Walk backwards
    let cursor = new Date(checkDate)
    while (true) {
      const dateStr = toDateStr(cursor)
      if (completedDates.has(dateStr)) {
        current++
        cursor = new Date(cursor.getTime() - 86400000)
      } else {
        // Check if paused on that day
        if (pause?.active) {
          const pauseUntil = pause.until
          const pauseFrom = pause.loggedAt.split('T')[0]
          if (dateStr >= pauseFrom && dateStr <= pauseUntil) {
            // Paused days don't break streak
            cursor = new Date(cursor.getTime() - 86400000)
            continue
          }
        }
        break
      }
    }

    // If paused, freeze streak at stored value (don't let it drop)
    if (pause?.active) {
      const frozenCurrent = Math.max(current, stored.current)
      const updatedStreak: StreakData = {
        current: frozenCurrent,
        longest: Math.max(frozenCurrent, stored.longest),
        lastCompletedDate: stored.lastCompletedDate,
      }
      setStreak(updatedStreak)
      setItem(KEYS.STREAK, updatedStreak)
      return
    }

    const lastCompleted = completedDates.has(today)
      ? today
      : completedDates.has(yesterday)
        ? yesterday
        : stored.lastCompletedDate

    const updatedStreak: StreakData = {
      current,
      longest: Math.max(current, stored.longest),
      lastCompletedDate: lastCompleted,
    }

    setStreak(updatedStreak)
    setItem(KEYS.STREAK, updatedStreak)
  }, [])

  return streak
}

export { daysBetween }
