'use client'

import { useState, useEffect, useCallback } from 'react'
import { getItem, setItem, KEYS } from '@/lib/storage'
import { getDeviceId } from '@/lib/deviceId'
import type { PauseState, PauseReason } from '@/types'

export function usePause() {
  const [pause, setPause] = useState<PauseState | null>(null)
  const [pauseLog, setPauseLog] = useState<PauseState[]>([])

  useEffect(() => {
    // Optimistic from cache
    const cached = getItem<PauseState>(KEYS.PAUSE)
    if (cached?.active) {
      const today = new Date().toISOString().split('T')[0]
      setPause(cached.until >= today ? cached : null)
    }
    const cachedLog = getItem<PauseState[]>(KEYS.PAUSE_LOG) ?? []
    setPauseLog(cachedLog)

    // Sync from DB
    const deviceId = getDeviceId()
    fetch(`/api/pause?deviceId=${deviceId}`)
      .then((r) => r.json())
      .then((data: { state: PauseState | null; log: PauseState[] }) => {
        const today = new Date().toISOString().split('T')[0]
        const active = data.state?.active && data.state.until >= today ? data.state : null
        setPause(active)
        setPauseLog(data.log)
        setItem(KEYS.PAUSE, data.state ?? { active: false, reason: 'other', until: '', loggedAt: '' })
        setItem(KEYS.PAUSE_LOG, data.log)
      })
      .catch(() => {})
  }, [])

  const activatePause = useCallback(async (reason: PauseReason, until: string) => {
    const loggedAt = new Date().toISOString()
    const state: PauseState = { active: true, reason, until, loggedAt }
    setPause(state)

    const deviceId = getDeviceId()
    setItem(KEYS.PAUSE, state)

    try {
      await fetch('/api/pause', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deviceId, active: true, reason, until, loggedAt }),
      })
      // Reload log
      const res = await fetch(`/api/pause?deviceId=${deviceId}`)
      const data = await res.json() as { state: PauseState | null; log: PauseState[] }
      setPauseLog(data.log)
      setItem(KEYS.PAUSE_LOG, data.log)
    } catch {
      const log = getItem<PauseState[]>(KEYS.PAUSE_LOG) ?? []
      log.push(state)
      setItem(KEYS.PAUSE_LOG, log)
      setPauseLog([...log])
    }
  }, [])

  const deactivatePause = useCallback(async () => {
    setPause(null)
    const deviceId = getDeviceId()
    setItem(KEYS.PAUSE, { active: false, reason: 'other', until: '', loggedAt: '' })

    try {
      await fetch('/api/pause', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deviceId, active: false }),
      })
    } catch {
      // Optimistic already applied
    }
  }, [])

  const isPaused = pause?.active === true

  return { pause, pauseLog, isPaused, activatePause, deactivatePause }
}
