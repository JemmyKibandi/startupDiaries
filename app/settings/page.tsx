'use client'

import { useState, useEffect } from 'react'
import { useNotifications } from '@/hooks/useNotifications'
import { usePause } from '@/hooks/usePause'
import { useTasks } from '@/hooks/useTasks'
import { useStreak } from '@/hooks/useStreak'
import { COPY } from '@/lib/copy'
import { removeItem, KEYS } from '@/lib/storage'

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-3">
      <h2 className="font-mono text-xs uppercase tracking-[0.3em] text-muted">{title}</h2>
      <div className="flex flex-col gap-2 rounded border border-white/8 overflow-hidden">
        {children}
      </div>
    </div>
  )
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div
      className="flex items-center justify-between px-4 py-4 border-b last:border-b-0"
      style={{ borderColor: 'rgba(255,255,255,0.06)' }}
    >
      <span className="font-mono text-sm text-white">{label}</span>
      <div className="flex items-center gap-2">{children}</div>
    </div>
  )
}

export default function SettingsPage() {
  const { completionPct } = useTasks()
  const streak = useStreak()
  const { settings, permission, requestPermission, updateSettings } = useNotifications(
    completionPct,
    streak.current
  )
  const { pauseLog, isPaused, deactivatePause } = usePause()
  const [confirmReset, setConfirmReset] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  const handleReset = () => {
    if (!confirmReset) {
      setConfirmReset(true)
      return
    }
    Object.values(KEYS).forEach(removeItem)
    window.location.reload()
  }

  if (!mounted) return null

  return (
    <div className="flex flex-col gap-8 animate-fade-in">
      <div className="pt-2">
        <h1 className="font-serif text-3xl italic text-white">Settings</h1>
        <p className="font-mono text-xs text-muted mt-1">Configure the war room.</p>
      </div>

      {/* Notifications */}
      <Section title="Notifications">
        <Row label="Permission">
          {permission === 'granted' ? (
            <span className="font-mono text-xs text-accent">Granted</span>
          ) : permission === 'denied' ? (
            <span className="font-mono text-xs text-danger">Denied</span>
          ) : (
            <button
              onClick={requestPermission}
              className="font-mono text-xs px-3 py-2 rounded border border-accent/40 text-accent"
              style={{ minHeight: '36px' }}
            >
              Enable
            </button>
          )}
        </Row>
        <Row label="Morning nudge">
          <input
            type="time"
            value={settings.morningTime}
            onChange={(e) => updateSettings({ morningTime: e.target.value })}
            disabled={permission !== 'granted'}
            className="bg-transparent border border-white/10 rounded px-2 py-1.5 font-mono text-sm text-white focus:border-accent/50 focus:outline-none disabled:opacity-40"
          />
        </Row>
        <Row label="Evening pressure">
          <input
            type="time"
            value={settings.eveningTime}
            onChange={(e) => updateSettings({ eveningTime: e.target.value })}
            disabled={permission !== 'granted'}
            className="bg-transparent border border-white/10 rounded px-2 py-1.5 font-mono text-sm text-white focus:border-accent/50 focus:outline-none disabled:opacity-40"
          />
        </Row>
      </Section>

      {/* Pause log */}
      <Section title="Pause history">
        {pauseLog.length === 0 ? (
          <div className="px-4 py-4">
            <span className="font-mono text-sm text-muted">No pauses logged.</span>
          </div>
        ) : (
          pauseLog.map((p, i) => (
            <div
              key={i}
              className="flex items-center justify-between px-4 py-3 border-b last:border-b-0"
              style={{ borderColor: 'rgba(255,255,255,0.06)' }}
            >
              <div>
                <div className="font-mono text-sm text-white">
                  {COPY.pauseReasons[p.reason]}
                </div>
                <div className="font-mono text-xs text-muted mt-0.5">
                  Until{' '}
                  {new Date(p.until).toLocaleDateString('en-GB', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </div>
              </div>
              <span
                className="font-mono text-[10px] uppercase tracking-wider px-2 py-1 rounded"
                style={
                  p.active
                    ? { color: '#ffaa00', background: 'rgba(255,170,0,0.1)', border: '1px solid rgba(255,170,0,0.3)' }
                    : { color: 'rgba(255,255,255,0.3)', background: 'transparent' }
                }
              >
                {p.active ? 'Active' : 'Past'}
              </span>
            </div>
          ))
        )}
        {isPaused && (
          <div className="px-4 py-3">
            <button
              onClick={deactivatePause}
              className="font-mono text-xs text-muted border border-white/10 px-4 py-2 rounded hover:border-white/20 transition-all"
              style={{ minHeight: '40px' }}
            >
              End current pause
            </button>
          </div>
        )}
      </Section>

      {/* Danger zone */}
      <Section title="Danger zone">
        <div className="px-4 py-4 flex flex-col gap-3">
          <p className="font-mono text-xs text-muted leading-relaxed">
            Reset clears all data: leads, tasks, streak. This cannot be undone.
          </p>
          <button
            onClick={handleReset}
            className="py-3 rounded border font-mono text-sm transition-all"
            style={{
              borderColor: confirmReset ? '#ff3b3b' : 'rgba(255,59,59,0.3)',
              color: '#ff3b3b',
              background: confirmReset ? 'rgba(255,59,59,0.15)' : 'transparent',
              minHeight: '48px',
            }}
          >
            {confirmReset ? 'Tap again to confirm reset' : 'Reset all data'}
          </button>
        </div>
      </Section>

      <div className="text-center pb-4">
        <p className="font-mono text-[10px] text-muted uppercase tracking-widest">
          PIPELINE — Built for founders
        </p>
      </div>
    </div>
  )
}
