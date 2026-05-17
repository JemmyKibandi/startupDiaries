'use client'

import { useState } from 'react'
import type { PauseReason } from '@/types'
import { COPY } from '@/lib/copy'

interface Props {
  onConfirm: (_reason: PauseReason, _until: string) => void
  onCancel: () => void
}

const DURATIONS = [
  { label: '1 day', days: 1 },
  { label: '3 days', days: 3 },
  { label: '1 week', days: 7 },
  { label: 'Custom', days: 0 },
]

const REASONS: { value: PauseReason; label: string }[] = [
  { value: 'new_client', label: COPY.pauseReasons.new_client },
  { value: 'project_delivery', label: COPY.pauseReasons.project_delivery },
  { value: 'travel', label: COPY.pauseReasons.travel },
  { value: 'other', label: COPY.pauseReasons.other },
]

function addDays(n: number): string {
  const d = new Date()
  d.setDate(d.getDate() + n)
  return d.toISOString().split('T')[0]
}

export default function PauseModal({ onConfirm, onCancel }: Props) {
  const [reason, setReason] = useState<PauseReason>('other')
  const [durationIdx, setDurationIdx] = useState(0)
  const [customDate, setCustomDate] = useState('')

  const isCustom = DURATIONS[durationIdx].days === 0

  const handleConfirm = () => {
    const until = isCustom ? customDate : addDays(DURATIONS[durationIdx].days)
    if (!until) return
    onConfirm(reason, until)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/80 backdrop-blur-sm">
      <div
        className="w-full max-w-lg rounded-t-2xl border border-white/10 bg-surface p-6 pb-10 animate-slide-up"
        style={{ background: '#111111' }}
      >
        <div className="mb-6">
          <h2 className="font-serif text-2xl italic text-white">Pause Mode</h2>
          <p className="font-mono text-xs text-muted mt-1">
            Your streak will be frozen. Come back strong.
          </p>
        </div>

        <div className="mb-5">
          <label className="font-mono text-xs text-muted uppercase tracking-widest mb-2 block">
            Reason
          </label>
          <div className="grid grid-cols-2 gap-2">
            {REASONS.map((r) => (
              <button
                key={r.value}
                onClick={() => setReason(r.value)}
                className={`py-3 px-3 rounded border text-left font-mono text-xs transition-all ${
                  reason === r.value
                    ? 'border-accent/50 bg-accent/10 text-accent'
                    : 'border-white/10 text-muted hover:border-white/20'
                }`}
                style={{ minHeight: '48px' }}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-6">
          <label className="font-mono text-xs text-muted uppercase tracking-widest mb-2 block">
            Duration
          </label>
          <div className="grid grid-cols-4 gap-2">
            {DURATIONS.map((d, i) => (
              <button
                key={d.label}
                onClick={() => setDurationIdx(i)}
                className={`py-3 rounded border font-mono text-xs transition-all ${
                  durationIdx === i
                    ? 'border-accent/50 bg-accent/10 text-accent'
                    : 'border-white/10 text-muted hover:border-white/20'
                }`}
                style={{ minHeight: '48px' }}
              >
                {d.label}
              </button>
            ))}
          </div>

          {isCustom && (
            <input
              type="date"
              value={customDate}
              onChange={(e) => setCustomDate(e.target.value)}
              min={addDays(1)}
              className="mt-3 w-full rounded border border-white/10 bg-transparent px-3 py-3 font-mono text-sm text-white focus:border-accent/50 focus:outline-none"
              style={{ minHeight: '48px' }}
            />
          )}
        </div>

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-4 rounded border border-white/10 font-mono text-sm text-muted hover:border-white/20 transition-all"
            style={{ minHeight: '52px' }}
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className="flex-1 py-4 rounded border font-mono text-sm font-bold transition-all"
            style={{
              borderColor: '#ff3b3b',
              color: '#ff3b3b',
              background: 'rgba(255,59,59,0.1)',
              minHeight: '52px',
            }}
          >
            PAUSE
          </button>
        </div>
      </div>
    </div>
  )
}
