'use client'

import { useState, useEffect, useCallback } from 'react'
import { getItem, setItem, KEYS } from '@/lib/storage'
import type { DailyCompletion, TaskId } from '@/types'

const TASK_IDS: TaskId[] = ['outreach', 'log_replies', 'follow_up', 'linkedin', 'update_tracker']

function todayISO(): string {
  return new Date().toISOString().split('T')[0]
}

function emptyTasks(): Record<TaskId, boolean> {
  return Object.fromEntries(TASK_IDS.map((id) => [id, false])) as Record<TaskId, boolean>
}

export function useTasks() {
  const [today, setToday] = useState<DailyCompletion | null>(null)
  const [history, setHistory] = useState<DailyCompletion[]>([])

  useEffect(() => {
    const stored = getItem<DailyCompletion[]>(KEYS.COMPLETIONS) ?? []
    setHistory(stored)

    const date = todayISO()
    const existing = stored.find((d) => d.date === date)
    if (existing) {
      setToday(existing)
    } else {
      const fresh: DailyCompletion = { date, tasks: emptyTasks() }
      setToday(fresh)
    }
  }, [])

  const toggle = useCallback(
    (taskId: TaskId) => {
      if (!today) return

      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate(10)
      }

      const updated: DailyCompletion = {
        ...today,
        tasks: { ...today.tasks, [taskId]: !today.tasks[taskId] },
      }

      const allDone = Object.values(updated.tasks).every(Boolean)
      if (allDone && !updated.completedAt) {
        updated.completedAt = new Date().toISOString()
      }

      setToday(updated)

      const stored = getItem<DailyCompletion[]>(KEYS.COMPLETIONS) ?? []
      const idx = stored.findIndex((d) => d.date === updated.date)
      if (idx >= 0) {
        stored[idx] = updated
      } else {
        stored.push(updated)
      }
      setItem(KEYS.COMPLETIONS, stored)
      setHistory([...stored])
    },
    [today]
  )

  const completionPct = today
    ? Math.round((Object.values(today.tasks).filter(Boolean).length / TASK_IDS.length) * 100)
    : 0

  const allComplete = completionPct === 100

  return { today, history, toggle, completionPct, allComplete, taskIds: TASK_IDS }
}
