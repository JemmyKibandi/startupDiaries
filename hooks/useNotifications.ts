'use client'

import { useState, useEffect, useCallback } from 'react'
import { getItem, setItem, KEYS } from '@/lib/storage'
import { COPY } from '@/lib/copy'
import type { NotificationSettings } from '@/types'

const DEFAULT_SETTINGS: NotificationSettings = {
  morningTime: '08:00',
  eveningTime: '19:00',
  enabled: false,
}

function daysUntilJan2027(): number {
  const target = new Date('2027-01-01')
  const now = new Date()
  return Math.ceil((target.getTime() - now.getTime()) / 86400000)
}

function dayNumber(): number {
  const start = new Date('2026-01-01')
  const now = new Date()
  return Math.ceil((now.getTime() - start.getTime()) / 86400000)
}

function scheduleNotification(title: string, body: string, delayMs: number) {
  if (typeof window === 'undefined') return
  setTimeout(() => {
    if (Notification.permission === 'granted') {
      new Notification(title, { body, icon: '/icons/icon-192.png' })
    }
  }, delayMs)
}

function msUntilTime(timeStr: string): number {
  const [hours, minutes] = timeStr.split(':').map(Number)
  const now = new Date()
  const target = new Date()
  target.setHours(hours, minutes, 0, 0)
  if (target <= now) target.setDate(target.getDate() + 1)
  return target.getTime() - now.getTime()
}

export function useNotifications(completionPct: number, streakCount: number) {
  const [settings, setSettings] = useState<NotificationSettings>(DEFAULT_SETTINGS)
  const [permission, setPermission] = useState<NotificationPermission>('default')

  useEffect(() => {
    const stored = getItem<NotificationSettings>(KEYS.NOTIFICATIONS) ?? DEFAULT_SETTINGS
    setSettings(stored)
    if (typeof Notification !== 'undefined') {
      setPermission(Notification.permission)
    }
  }, [])

  const requestPermission = useCallback(async () => {
    if (typeof Notification === 'undefined') return
    const result = await Notification.requestPermission()
    setPermission(result)
    if (result === 'granted') {
      const updated = { ...settings, enabled: true }
      setSettings(updated)
      setItem(KEYS.NOTIFICATIONS, updated)
    }
  }, [settings])

  const updateSettings = useCallback((updates: Partial<NotificationSettings>) => {
    const updated = { ...settings, ...updates }
    setSettings(updated)
    setItem(KEYS.NOTIFICATIONS, updated)
  }, [settings])

  useEffect(() => {
    if (!settings.enabled || permission !== 'granted') return

    const daysLeft = daysUntilJan2027()
    const day = dayNumber()

    const morningMs = msUntilTime(settings.morningTime)
    const eveningMs = msUntilTime(settings.eveningTime)

    const morningTimer = setTimeout(() => {
      scheduleNotification(
        'PIPELINE',
        COPY.notifications.morning(day, daysLeft),
        0
      )
    }, morningMs)

    const eveningTimer = setTimeout(() => {
      if (completionPct < 100) {
        scheduleNotification('PIPELINE', COPY.notifications.evening(daysLeft), 0)
      }
    }, eveningMs)

    return () => {
      clearTimeout(morningTimer)
      clearTimeout(eveningTimer)
    }
  }, [settings, permission, completionPct])

  useEffect(() => {
    if (!settings.enabled || permission !== 'granted') return
    if (streakCount === 7) scheduleNotification('PIPELINE', COPY.notifications.streak7, 1000)
    if (streakCount === 14) scheduleNotification('PIPELINE', COPY.notifications.streak14, 1000)
    if (streakCount === 30) scheduleNotification('PIPELINE', COPY.notifications.streak30, 1000)
  }, [streakCount, settings.enabled, permission])

  return { settings, permission, requestPermission, updateSettings }
}
