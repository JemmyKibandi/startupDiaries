import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/onboarding?deviceId=xxx
export async function GET(req: NextRequest) {
  const deviceId = req.nextUrl.searchParams.get('deviceId')
  if (!deviceId) return NextResponse.json({ error: 'deviceId required' }, { status: 400 })

  const record = await db.onboardingState.findUnique({ where: { deviceId } })
  return NextResponse.json(
    record
      ? { completed: record.completed, completedAt: record.completedAt?.toISOString() }
      : { completed: false }
  )
}

// POST /api/onboarding
export async function POST(req: NextRequest) {
  const body = await req.json() as { deviceId: string; completed: boolean; completedAt?: string }

  const record = await db.onboardingState.upsert({
    where: { deviceId: body.deviceId },
    create: {
      deviceId: body.deviceId,
      completed: body.completed,
      completedAt: body.completedAt ? new Date(body.completedAt) : null,
    },
    update: {
      completed: body.completed,
      completedAt: body.completedAt ? new Date(body.completedAt) : null,
    },
  })

  return NextResponse.json({
    completed: record.completed,
    completedAt: record.completedAt?.toISOString(),
  })
}
