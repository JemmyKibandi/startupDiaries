'use client'

import { useState, useEffect, useCallback } from 'react'
import { getItem, setItem, KEYS } from '@/lib/storage'
import type { PauseState, PauseReason } from '@/types'

export function usePause() {
  const [pause, setPause] = useState<PauseState | null>(null)
  const [pauseLog, setPauseLog] = useState<PauseState[]>([])

  useEffect(() => {
    const stored = getItem<PauseState>(KEYS.PAUSE)
    const log = getItem<PauseState[]>(KEYS.PAUSE_LOG) ?? []

    if (stored?.active) {
      // Check if pause has expired
      const today = new Date().toISOString().split('T')[0]
      if (stored.until < today) {
        const expired = { ...stored, active: false }
        setItem(KEYS.PAUSE, expired)
        setPause(null)
      } else {
        setPause(stored)
      }
    } else {
      setPause(null)
    }
    setPauseLog(log)
  }, [])

  const activatePause = useCallback((reason: PauseReason, until: string) => {
    const state: PauseState = {
      active: true,
      reason,
      until,
      loggedAt: new Date().toISOString(),
    }
    setItem(KEYS.PAUSE, state)
    const log = getItem<PauseState[]>(KEYS.PAUSE_LOG) ?? []
    log.push(state)
    setItem(KEYS.PAUSE_LOG, log)
    setPause(state)
    setPauseLog([...log])
  }, [])

  const deactivatePause = useCallback(() => {
    const stored = getItem<PauseState>(KEYS.PAUSE)
    if (stored) {
      setItem(KEYS.PAUSE, { ...stored, active: false })
    }
    setPause(null)
  }, [])

  const isPaused = pause?.active === true

  return { pause, pauseLog, isPaused, activatePause, deactivatePause }
}
