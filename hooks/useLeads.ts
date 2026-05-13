'use client'

import { useState, useEffect, useCallback } from 'react'
import { getItem, setItem, KEYS } from '@/lib/storage'
import { getDeviceId } from '@/lib/deviceId'
import type { Lead, LeadStatus } from '@/types'

function uuid(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36)
}

export function useLeads() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [synced, setSynced] = useState(false)

  // Load from localStorage immediately, then sync from DB
  useEffect(() => {
    const cached = getItem<Lead[]>(KEYS.LEADS) ?? []
    setLeads(cached)

    const deviceId = getDeviceId()
    fetch(`/api/leads?deviceId=${deviceId}`)
      .then((r) => r.json())
      .then((data: Lead[]) => {
        setLeads(data)
        setItem(KEYS.LEADS, data)
        setSynced(true)
      })
      .catch(() => setSynced(true)) // fall back to cache on network error
  }, [])

  // Persist optimistically to localStorage + sync to DB
  const persist = useCallback((updated: Lead[]) => {
    setLeads(updated)
    setItem(KEYS.LEADS, updated)
  }, [])

  const addLead = useCallback(
    async (data: Omit<Lead, 'id' | 'createdAt' | 'updatedAt'>) => {
      // Optimistic local insert
      const now = new Date().toISOString()
      const tempLead: Lead = { ...data, id: uuid(), createdAt: now, updatedAt: now }
      const optimistic = [tempLead, ...leads]
      persist(optimistic)

      const deviceId = getDeviceId()
      try {
        const res = await fetch('/api/leads', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...data, deviceId }),
        })
        const created: Lead = await res.json()
        // Replace temp with real DB record
        const final = optimistic.map((l) => (l.id === tempLead.id ? created : l))
        persist(final)
      } catch {
        // Keep optimistic version if offline
      }
    },
    [leads, persist]
  )

  const updateLead = useCallback(
    async (id: string, data: Partial<Omit<Lead, 'id' | 'createdAt'>>) => {
      const updated = leads.map((l) =>
        l.id === id ? { ...l, ...data, updatedAt: new Date().toISOString() } : l
      )
      persist(updated)

      try {
        await fetch(`/api/leads/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        })
      } catch {
        // Keep optimistic version
      }
    },
    [leads, persist]
  )

  const deleteLead = useCallback(
    async (id: string) => {
      persist(leads.filter((l) => l.id !== id))
      try {
        await fetch(`/api/leads/${id}`, { method: 'DELETE' })
      } catch {
        // Keep optimistic delete
      }
    },
    [leads, persist]
  )

  const updateStatus = useCallback(
    (id: string, status: LeadStatus) => updateLead(id, { status }),
    [updateLead]
  )

  const stats = {
    total: leads.length,
    callsBooked: leads.filter((l) => l.status === 'Call Booked').length,
    proposalsSent: leads.filter((l) => l.status === 'Proposal Sent').length,
    clientsWon: leads.filter((l) => l.status === 'Client Won').length,
    messaged: leads.filter((l) =>
      ['Messaged', 'Replied', 'Call Booked', 'Proposal Sent', 'Client Won'].includes(l.status)
    ).length,
  }

  return { leads, addLead, updateLead, deleteLead, updateStatus, stats, synced }
}
