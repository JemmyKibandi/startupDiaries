'use client'

import { useState, useEffect, useCallback } from 'react'
import { getItem, setItem, KEYS } from '@/lib/storage'
import type { Lead, LeadStatus } from '@/types'

function uuid(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36)
}

export function useLeads() {
  const [leads, setLeads] = useState<Lead[]>([])

  useEffect(() => {
    setLeads(getItem<Lead[]>(KEYS.LEADS) ?? [])
  }, [])

  const persist = useCallback((updated: Lead[]) => {
    setLeads(updated)
    setItem(KEYS.LEADS, updated)
  }, [])

  const addLead = useCallback(
    (data: Omit<Lead, 'id' | 'createdAt' | 'updatedAt'>) => {
      const now = new Date().toISOString()
      const lead: Lead = { ...data, id: uuid(), createdAt: now, updatedAt: now }
      persist([lead, ...leads])
    },
    [leads, persist]
  )

  const updateLead = useCallback(
    (id: string, data: Partial<Omit<Lead, 'id' | 'createdAt'>>) => {
      const updated = leads.map((l) =>
        l.id === id ? { ...l, ...data, updatedAt: new Date().toISOString() } : l
      )
      persist(updated)
    },
    [leads, persist]
  )

  const deleteLead = useCallback(
    (id: string) => {
      persist(leads.filter((l) => l.id !== id))
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

  return { leads, addLead, updateLead, deleteLead, updateStatus, stats }
}
