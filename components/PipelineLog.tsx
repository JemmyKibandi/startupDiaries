'use client'

import { useState, useRef } from 'react'
import type { Lead, LeadStatus } from '@/types'
import { useLeads } from '@/hooks/useLeads'
import { COPY } from '@/lib/copy'

const STATUSES: LeadStatus[] = [
  'Identified',
  'Messaged',
  'Replied',
  'Call Booked',
  'Proposal Sent',
  'Client Won',
  'Not Interested',
]

const STATUS_COLORS: Record<LeadStatus, string> = {
  Identified: 'rgba(255,255,255,0.2)',
  Messaged: '#5c8fff',
  Replied: '#ffaa00',
  'Call Booked': '#c084fc',
  'Proposal Sent': '#60cdff',
  'Client Won': '#00ff88',
  'Not Interested': '#ff3b3b',
}

interface AddFormProps {
  onAdd: (data: Omit<Lead, 'id' | 'createdAt' | 'updatedAt'>) => void
}

function AddForm({ onAdd }: AddFormProps) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [company, setCompany] = useState('')
  const [status, setStatus] = useState<LeadStatus>('Identified')
  const [notes, setNotes] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    onAdd({ name: name.trim(), company: company.trim(), status, notes: notes.trim() })
    setName('')
    setCompany('')
    setStatus('Identified')
    setNotes('')
    setOpen(false)
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="w-full py-4 rounded border border-dashed border-white/20 font-mono text-sm text-muted hover:border-accent/40 hover:text-accent transition-all"
        style={{ minHeight: '52px' }}
      >
        + Add Lead
      </button>
    )
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded border border-white/10 bg-surface p-4 flex flex-col gap-3"
      style={{ background: '#111111' }}
    >
      <input
        type="text"
        placeholder="Name *"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
        className="w-full bg-transparent border border-white/10 rounded px-3 py-3 font-mono text-sm text-white placeholder-muted focus:border-accent/50 focus:outline-none"
        style={{ minHeight: '48px' }}
      />
      <input
        type="text"
        placeholder="Company"
        value={company}
        onChange={(e) => setCompany(e.target.value)}
        className="w-full bg-transparent border border-white/10 rounded px-3 py-3 font-mono text-sm text-white placeholder-muted focus:border-accent/50 focus:outline-none"
        style={{ minHeight: '48px' }}
      />
      <select
        value={status}
        onChange={(e) => setStatus(e.target.value as LeadStatus)}
        className="w-full bg-bg border border-white/10 rounded px-3 py-3 font-mono text-sm text-white focus:border-accent/50 focus:outline-none"
        style={{ minHeight: '48px', background: '#0a0a0a' }}
      >
        {STATUSES.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>
      <textarea
        placeholder="Notes"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        rows={2}
        className="w-full bg-transparent border border-white/10 rounded px-3 py-2 font-mono text-sm text-white placeholder-muted focus:border-accent/50 focus:outline-none resize-none"
      />
      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="flex-1 py-3 rounded border border-white/10 font-mono text-sm text-muted"
          style={{ minHeight: '48px' }}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="flex-1 py-3 rounded font-mono text-sm font-bold text-bg"
          style={{ background: '#00ff88', minHeight: '48px' }}
        >
          Add
        </button>
      </div>
    </form>
  )
}

interface LeadCardProps {
  lead: Lead
  onDelete: (id: string) => void
  onStatusChange: (id: string, status: LeadStatus) => void
}

function LeadCard({ lead, onDelete, onStatusChange }: LeadCardProps) {
  const [swipeX, setSwipeX] = useState(0)
  const [showDelete, setShowDelete] = useState(false)
  const startX = useRef(0)

  const handleTouchStart = (e: React.TouchEvent) => {
    startX.current = e.touches[0].clientX
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    const dx = e.touches[0].clientX - startX.current
    if (dx < 0) {
      setSwipeX(Math.max(dx, -80))
    } else {
      setSwipeX(0)
    }
  }

  const handleTouchEnd = () => {
    if (swipeX < -50) {
      setShowDelete(true)
      setSwipeX(-80)
    } else {
      setSwipeX(0)
      setShowDelete(false)
    }
  }

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })

  return (
    <div className="relative overflow-hidden rounded border border-white/8">
      {showDelete && (
        <button
          onClick={() => onDelete(lead.id)}
          className="absolute right-0 top-0 bottom-0 w-20 flex items-center justify-center bg-danger font-mono text-xs text-white uppercase tracking-wider"
          style={{ background: '#ff3b3b' }}
        >
          Delete
        </button>
      )}
      <div
        className="flex flex-col gap-2 p-4 bg-surface transition-transform duration-150"
        style={{
          transform: `translateX(${swipeX}px)`,
          background: '#111111',
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="font-mono text-sm font-bold text-white">{lead.name}</div>
            {lead.company && (
              <div className="font-mono text-xs text-muted">{lead.company}</div>
            )}
          </div>
          <span
            className="flex-shrink-0 font-mono text-[10px] uppercase tracking-wider px-2 py-1 rounded"
            style={{
              background: `${STATUS_COLORS[lead.status]}22`,
              color: STATUS_COLORS[lead.status],
              border: `1px solid ${STATUS_COLORS[lead.status]}44`,
            }}
          >
            {lead.status}
          </span>
        </div>

        {lead.notes && (
          <p className="font-mono text-xs text-muted leading-relaxed">{lead.notes}</p>
        )}

        <div className="flex items-center justify-between mt-1">
          <select
            value={lead.status}
            onChange={(e) => onStatusChange(lead.id, e.target.value as LeadStatus)}
            className="bg-transparent border border-white/10 rounded px-2 py-1.5 font-mono text-xs text-muted focus:border-accent/50 focus:outline-none"
            style={{ background: '#0a0a0a', minHeight: '36px' }}
          >
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <span className="font-mono text-[10px] text-muted">{formatDate(lead.createdAt)}</span>
        </div>
      </div>
    </div>
  )
}

export default function PipelineLog() {
  const { leads, addLead, deleteLead, updateStatus, stats } = useLeads()

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-4 gap-2">
        {[
          { label: 'Total', value: stats.total },
          { label: 'Calls', value: stats.callsBooked },
          { label: 'Props', value: stats.proposalsSent },
          { label: 'Won', value: stats.clientsWon },
        ].map((s) => (
          <div
            key={s.label}
            className="flex flex-col items-center gap-1 rounded border border-white/8 py-3"
          >
            <span
              className="font-mono text-xl font-bold tabular-nums"
              style={{ color: s.label === 'Won' ? '#00ff88' : 'white' }}
            >
              {s.value}
            </span>
            <span className="font-mono text-[10px] uppercase tracking-widest text-muted">
              {s.label}
            </span>
          </div>
        ))}
      </div>

      {stats.total > 0 && (
        <p className="font-mono text-xs text-muted leading-relaxed">
          {COPY.contacts(stats.messaged)}
        </p>
      )}

      <AddForm onAdd={addLead} />

      <div className="flex flex-col gap-2">
        {leads.length === 0 && (
          <div className="py-12 text-center">
            <p className="font-mono text-sm text-muted">No leads yet.</p>
            <p className="font-mono text-xs text-muted mt-1">Add your first contact above.</p>
          </div>
        )}
        {leads.map((lead) => (
          <LeadCard
            key={lead.id}
            lead={lead}
            onDelete={deleteLead}
            onStatusChange={updateStatus}
          />
        ))}
      </div>
    </div>
  )
}
