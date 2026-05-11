'use client'

import { useState, useEffect } from 'react'
import CountdownClock from '@/components/CountdownClock'
import StreakCounter from '@/components/StreakCounter'
import DailyTasks from '@/components/DailyTasks'
import PauseModal from '@/components/PauseModal'
import { useStreak } from '@/hooks/useStreak'
import { usePause } from '@/hooks/usePause'
import { useTasks } from '@/hooks/useTasks'
import { useNotifications } from '@/hooks/useNotifications'
import { getItem, setItem, KEYS } from '@/lib/storage'
import { COPY } from '@/lib/copy'
import type { OnboardingState, PauseReason } from '@/types'

// ─── Onboarding ────────────────────────────────────────────────────────────────

function OnboardingSlide({
  slide,
  current,
  total,
  onNext,
}: {
  slide: { headline: string; sub: string }
  current: number
  total: number
  onNext: () => void
}) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-bg px-8 text-center">
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute inset-0 opacity-5"
          style={{
            background: 'radial-gradient(ellipse 80% 60% at 50% 40%, #00ff88 0%, transparent 70%)',
          }}
        />
      </div>

      <div className="relative z-10 flex flex-col items-center gap-8">
        <div className="font-mono text-xs uppercase tracking-[0.4em] text-muted">
          {current + 1} / {total}
        </div>

        <div className="flex flex-col gap-4">
          <h1 className="font-serif text-[clamp(36px,10vw,64px)] italic leading-tight text-white">
            {slide.headline}
          </h1>
          <p className="font-mono text-lg text-muted">{slide.sub}</p>
        </div>

        <button
          onClick={onNext}
          className="mt-6 px-10 py-4 rounded font-mono text-sm font-bold text-bg transition-all active:scale-95"
          style={{ background: '#00ff88', minHeight: '52px' }}
        >
          {current === total - 1 ? "Let's go" : 'Next'}
        </button>
      </div>

      <div className="absolute bottom-12 flex gap-2">
        {Array.from({ length: total }).map((_, i) => (
          <div
            key={i}
            className="w-1.5 h-1.5 rounded-full transition-all"
            style={{ background: i === current ? '#00ff88' : 'rgba(255,255,255,0.2)' }}
          />
        ))}
      </div>
    </div>
  )
}

// ─── Status Badge ──────────────────────────────────────────────────────────────

function StatusBadge({
  isPaused,
  completionPct,
  streakCurrent,
}: {
  isPaused: boolean
  completionPct: number
  streakCurrent: number
}) {
  let label: string
  let color: string
  let bg: string

  if (isPaused) {
    label = COPY.status.paused
    color = '#ffaa00'
    bg = 'rgba(255,170,0,0.12)'
  } else if (streakCurrent >= 5 && completionPct === 100) {
    label = COPY.status.onTrack
    color = '#00ff88'
    bg = 'rgba(0,255,136,0.1)'
  } else {
    label = COPY.status.fallingBehind
    color = '#ff3b3b'
    bg = 'rgba(255,59,59,0.1)'
  }

  return (
    <span
      className="font-mono text-[11px] uppercase tracking-[0.25em] px-3 py-1.5 rounded"
      style={{ color, background: bg, border: `1px solid ${color}33` }}
    >
      {label}
    </span>
  )
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

export default function HomePage() {
  const [onboardingDone, setOnboardingDone] = useState(true)
  const [onboardingSlide, setOnboardingSlide] = useState(0)
  const [showPauseModal, setShowPauseModal] = useState(false)
  const [mounted, setMounted] = useState(false)

  const streak = useStreak()
  const { isPaused, activatePause, deactivatePause, pause } = usePause()
  const { completionPct } = useTasks()
  const { permission, requestPermission } = useNotifications(completionPct, streak.current)

  useEffect(() => {
    setMounted(true)
    const state = getItem<OnboardingState>(KEYS.ONBOARDING)
    if (!state?.completed) {
      setOnboardingDone(false)
    }
    // Ask for notification permission on first meaningful interaction
    if (typeof Notification !== 'undefined' && Notification.permission === 'default') {
      setTimeout(requestPermission, 3000)
    }
  }, [])

  const completeOnboarding = () => {
    if (onboardingSlide < COPY.onboarding.length - 1) {
      setOnboardingSlide((s) => s + 1)
    } else {
      setItem(KEYS.ONBOARDING, { completed: true, completedAt: new Date().toISOString() })
      setOnboardingDone(true)
    }
  }

  const handlePause = (reason: PauseReason, until: string) => {
    activatePause(reason, until)
    setShowPauseModal(false)
  }

  if (!mounted) return null

  if (!onboardingDone) {
    return (
      <OnboardingSlide
        slide={COPY.onboarding[onboardingSlide]}
        current={onboardingSlide}
        total={COPY.onboarding.length}
        onNext={completeOnboarding}
      />
    )
  }

  return (
    <>
      <div className="flex flex-col gap-10 animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between pt-2">
          <h1 className="font-serif text-3xl italic text-white">PIPELINE</h1>
          <StatusBadge
            isPaused={isPaused}
            completionPct={completionPct}
            streakCurrent={streak.current}
          />
        </div>

        {/* Countdown — full bleed hero */}
        <div className="flex flex-col items-center py-6 border rounded-lg border-white/8">
          <CountdownClock targetDate="2027-01-01" />
          {isPaused && pause && (
            <div className="mt-3 font-mono text-xs text-warn">
              Paused until {new Date(pause.until).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
            </div>
          )}
        </div>

        {/* Streak — pulsing */}
        <div className="flex items-center justify-center">
          <div className={streak.current > 0 ? 'streak-pulse' : ''}>
            <StreakCounter current={streak.current} longest={streak.longest} />
          </div>
        </div>

        {/* Streak copy */}
        {streak.current > 0 && (
          <p className="text-center font-mono text-xs text-muted leading-relaxed px-2">
            {streak.current < 5
              ? COPY.streakMessages.low(streak.current)
              : streak.current < 14
                ? COPY.streakMessages.mid(streak.current)
                : COPY.streakMessages.high(streak.current)}
          </p>
        )}

        {/* Daily tasks */}
        <DailyTasks isPaused={isPaused} />

        {/* Pause / Resume controls */}
        <div className="flex justify-center pb-2">
          {isPaused ? (
            <button
              onClick={deactivatePause}
              className="font-mono text-xs uppercase tracking-widest text-muted border border-white/10 px-6 py-3 rounded hover:border-white/20 transition-all"
              style={{ minHeight: '48px' }}
            >
              Resume
            </button>
          ) : (
            <button
              onClick={() => setShowPauseModal(true)}
              className="font-mono text-xs uppercase tracking-widest text-danger border px-6 py-3 rounded transition-all"
              style={{
                borderColor: 'rgba(255,59,59,0.3)',
                color: '#ff3b3b',
                minHeight: '48px',
              }}
            >
              Pause
            </button>
          )}
        </div>
      </div>

      {showPauseModal && (
        <PauseModal onConfirm={handlePause} onCancel={() => setShowPauseModal(false)} />
      )}
    </>
  )
}
