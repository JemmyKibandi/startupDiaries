'use client'

import { useState, useEffect, useRef } from 'react'

function daysUntil(target: Date): number {
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  const t = new Date(target)
  t.setHours(0, 0, 0, 0)
  return Math.ceil((t.getTime() - now.getTime()) / 86400000)
}

interface Props {
  targetDate: string
}

export default function CountdownClock({ targetDate }: Props) {
  const target = new Date(targetDate)
  const [days, setDays] = useState(daysUntil(target))
  const [displayed, setDisplayed] = useState(0)
  const animRef = useRef<number | null>(null)

  useEffect(() => {
    const interval = setInterval(() => {
      setDays(daysUntil(target))
    }, 60000)
    return () => clearInterval(interval)
  }, [])

  // Count-up animation on mount
  useEffect(() => {
    const start = performance.now()
    const duration = 1200
    const end = days

    function step(now: number) {
      const elapsed = now - start
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setDisplayed(Math.round(eased * end))
      if (progress < 1) {
        animRef.current = requestAnimationFrame(step)
      }
    }

    animRef.current = requestAnimationFrame(step)
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current)
    }
  }, [days])

  return (
    <div className="flex flex-col items-center gap-1">
      <div
        className="font-mono text-[clamp(72px,20vw,160px)] font-bold leading-none tracking-tighter text-white tabular-nums"
        style={{ fontVariantNumeric: 'tabular-nums' }}
      >
        {String(displayed).padStart(3, ' ')}
      </div>
      <div className="font-mono text-xs tracking-[0.3em] uppercase text-muted">
        days to January 2027
      </div>
    </div>
  )
}
