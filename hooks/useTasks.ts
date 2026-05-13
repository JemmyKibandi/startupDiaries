'use client'

import { useState, useEffect, useCallback } from 'react'
import { getItem, setItem, KEYS } from '@/lib/storage'
import { getDeviceId } from '@/lib/deviceId'
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
    const date = todayISO()
    // Optimistic: load from cache immediately
    const cached = getItem<DailyCompletion[]>(KEYS.COMPLETIONS) ?? []
    setHistory(cached)
    const cachedToday = cached.find((d) => d.date === date)
    setToday(cachedToday ?? { date, tasks: emptyTasks() })

    // Sync from DB
    const deviceId = getDeviceId()
    Promise.all([
      fetch(`/api/tasks?deviceId=${deviceId}&date=${date}`).then((r) => r.json()),
      fetch(`/api/tasks/history?deviceId=${deviceId}`).then((r) => r.json()),
    ])
      .then(([todayData, historyData]: [DailyCompletion, DailyCompletion[]]) => {
        setToday(todayData)
        setHistory(historyData)
        // Update cache
        setItem(KEYS.COMPLETIONS, historyData)
      })
      .catch(() => {}) // keep cached values on network error
  }, [])

  const toggle = useCallback(
    async (taskId: TaskId) => {
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

      // Optimistic update
      setToday(updated)
      const cached = getItem<DailyCompletion[]>(KEYS.COMPLETIONS) ?? []
      const idx = cached.findIndex((d) => d.date === updated.date)
      if (idx >= 0) cached[idx] = updated
      else cached.push(updated)
      setItem(KEYS.COMPLETIONS, cached)
      setHistory([...cached])

      // Sync to DB
      const deviceId = getDeviceId()
      try {
        await fetch('/api/tasks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ deviceId, ...updated }),
        })
      } catch {
        // Optimistic version already saved to localStorage
      }
    },
    [today]
  )

  const completionPct = today
    ? Math.round((Object.values(today.tasks).filter(Boolean).length / TASK_IDS.length) * 100)
    : 0

  const allComplete = completionPct === 100

  return { today, history, toggle, completionPct, allComplete, taskIds: TASK_IDS }
}
