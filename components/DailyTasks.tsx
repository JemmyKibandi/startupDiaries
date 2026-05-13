'use client'

import { useState, useRef, useEffect } from 'react'
import type { TaskId } from '@/types'
import { COPY } from '@/lib/copy'
import { useTasks } from '@/hooks/useTasks'

const ACCENT = '#00ff88'

interface RingProps {
  pct: number
  size?: number
}

function Ring({ pct, size = 72 }: RingProps) {
  const r = (size - 8) / 2
  const circ = 2 * Math.PI * r
  const [offset, setOffset] = useState(circ)

  useEffect(() => {
    const timeout = setTimeout(() => {
      setOffset(circ - (pct / 100) * circ)
    }, 200)
    return () => clearTimeout(timeout)
  }, [pct, circ])

  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="rgba(255,255,255,0.08)"
        strokeWidth={4}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={ACCENT}
        strokeWidth={4}
        strokeLinecap="round"
        strokeDasharray={circ}
        strokeDashoffset={offset}
        style={{ transition: 'stroke-dashoffset 0.8s cubic-bezier(0.4,0,0.2,1)' }}
      />
    </svg>
  )
}

interface TaskRowProps {
  id: TaskId
  label: string
  checked: boolean
  delayed: boolean
  onToggle: () => void
  index: number
}

function TaskRow({ id, label, checked, delayed, onToggle, index }: TaskRowProps) {
  const [tooltip, setTooltip] = useState(false)
  const [flash, setFlash] = useState(false)
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 80 * index)
    return () => clearTimeout(t)
  }, [index])

  const handleToggle = () => {
    setFlash(true)
    setTimeout(() => setFlash(false), 300)
    onToggle()
  }

  const onPressStart = () => {
    longPressTimer.current = setTimeout(() => setTooltip(true), 500)
  }
  const onPressEnd = () => {
    if (longPressTimer.current) clearTimeout(longPressTimer.current)
    setTimeout(() => setTooltip(false), 2500)
  }

  return (
    <div
      className={`transition-all duration-500 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
    >
      <div
        className={`relative flex items-center gap-4 px-4 py-4 rounded-lg border transition-all duration-200 ${
          checked
            ? 'border-accent/30 bg-accent/5'
            : delayed
              ? 'border-warn/30 bg-warn/5'
              : 'border-white/8 bg-transparent'
        } ${flash ? 'scale-[0.98]' : 'scale-100'}`}
        style={{ minHeight: '56px' }}
      >
        <button
          onClick={handleToggle}
          onTouchStart={onPressStart}
          onTouchEnd={onPressEnd}
          onMouseDown={onPressStart}
          onMouseUp={onPressEnd}
          className="flex items-center gap-4 w-full text-left"
          aria-label={`Toggle ${label}`}
        >
          <div
            className={`w-6 h-6 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all duration-200 ${
              checked ? 'border-accent bg-accent' : 'border-white/30 bg-transparent'
            }`}
          >
            {checked && (
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path
                  d="M2.5 7L5.5 10L11.5 4"
                  stroke="#0a0a0a"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )}
          </div>
          <span
            className={`font-mono text-sm leading-snug transition-all duration-200 ${
              checked ? 'line-through text-muted' : 'text-white'
            }`}
          >
            {label}
          </span>
        </button>

        {delayed && !checked && (
          <span className="ml-auto flex-shrink-0 font-mono text-[10px] uppercase tracking-widest text-warn">
            LATE
          </span>
        )}
      </div>

      {tooltip && (
        <div className="mx-4 mt-1 px-3 py-2 rounded bg-surface border border-white/10 text-xs font-mono text-muted leading-relaxed animate-fade-in">
          {COPY.taskWhy[id]}
        </div>
      )}
    </div>
  )
}

interface Props {
  isPaused: boolean
}

export default function DailyTasks({ isPaused }: Props) {
  const { today, toggle, completionPct, taskIds } = useTasks()

  const isLate = new Date().getHours() >= 18

  const completedCount = today ? Object.values(today.tasks).filter(Boolean).length : 0

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between px-1">
        <div>
          <h2 className="font-serif text-2xl italic text-white">Today&apos;s Tasks</h2>
          <p className="font-mono text-xs text-muted mt-0.5">
            {completedCount} of {taskIds.length} done
          </p>
        </div>
        <div className="relative flex items-center justify-center">
          <Ring pct={completionPct} size={64} />
          <span
            className="absolute font-mono text-xs font-bold tabular-nums"
            style={{ color: completionPct === 100 ? '#00ff88' : 'white' }}
          >
            {completionPct}%
          </span>
        </div>
      </div>

      {isPaused && (
        <div className="px-4 py-3 rounded border border-warn/30 bg-warn/5">
          <span className="font-mono text-xs text-warn tracking-widest uppercase">
            Paused — tasks optional
          </span>
        </div>
      )}

      <div className="flex flex-col gap-2">
        {taskIds.map((id, i) => (
          <TaskRow
            key={id}
            id={id}
            label={COPY.taskLabels[id]}
            checked={today?.tasks[id] ?? false}
            delayed={isLate && !(today?.tasks[id] ?? false)}
            onToggle={() => toggle(id)}
            index={i}
          />
        ))}
      </div>

      {completionPct === 100 && (
        <div
          className="text-center font-mono text-sm tracking-widest uppercase animate-fade-in"
          style={{ color: '#00ff88' }}
        >
          All done. That&apos;s how it&apos;s done.
        </div>
      )}
    </div>
  )
}
