const isClient = typeof window !== 'undefined'

export function getItem<T>(key: string): T | null {
  if (!isClient) return null
  try {
    const raw = localStorage.getItem(key)
    if (raw === null) return null
    return JSON.parse(raw) as T
  } catch {
    return null
  }
}

export function setItem<T>(key: string, value: T): void {
  if (!isClient) return
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // localStorage full or unavailable
  }
}

export function removeItem(key: string): void {
  if (!isClient) return
  localStorage.removeItem(key)
}

export const KEYS = {
  LEADS: 'pipeline_leads',
  COMPLETIONS: 'pipeline_completions',
  STREAK: 'pipeline_streak',
  PAUSE: 'pipeline_pause',
  PAUSE_LOG: 'pipeline_pause_log',
  NOTIFICATIONS: 'pipeline_notifications',
  ONBOARDING: 'pipeline_onboarding',
} as const
