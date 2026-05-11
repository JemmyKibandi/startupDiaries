'use client'

import { useEffect, useRef, useState } from 'react'

interface Props {
  current: number
  longest: number
}

export default function StreakCounter({ current, longest }: Props) {
  const [displayed, setDisplayed] = useState(0)
  const animRef = useRef<number | null>(null)

  useEffect(() => {
    const start = performance.now()
    const duration = 900
    const end = current

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
  }, [current])

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative flex items-center justify-center">
        <div
          className="font-mono text-6xl font-bold tabular-nums"
          style={{ color: '#00ff88' }}
        >
          {displayed}
        </div>
        {current > 0 && (
          <span
            className="absolute -top-1 -right-4 text-xs font-mono"
            style={{ color: '#00ff88' }}
          >
            🔥
          </span>
        )}
      </div>
      <div className="font-mono text-xs tracking-[0.25em] uppercase text-muted">
        day streak
      </div>
      {longest > 0 && (
        <div className="font-mono text-[10px] text-muted tracking-widest">
          BEST: {longest}
        </div>
      )}
    </div>
  )
}
