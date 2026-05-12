import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/pause?deviceId=xxx
export async function GET(req: NextRequest) {
  const deviceId = req.nextUrl.searchParams.get('deviceId')
  if (!deviceId) return NextResponse.json({ error: 'deviceId required' }, { status: 400 })

  const [state, log] = await Promise.all([
    db.pauseState.findUnique({ where: { deviceId } }),
    db.pauseLog.findMany({ where: { deviceId }, orderBy: { createdAt: 'desc' } }),
  ])

  return NextResponse.json({
    state: state
      ? { active: state.active, reason: state.reason, until: state.until, loggedAt: state.loggedAt }
      : null,
    log: log.map((l) => ({
      active: l.active,
      reason: l.reason,
      until: l.until,
      loggedAt: l.loggedAt,
    })),
  })
}

// POST /api/pause  — activate or deactivate
export async function POST(req: NextRequest) {
  const body = await req.json() as {
    deviceId: string
    active: boolean
    reason?: string
    until?: string
    loggedAt?: string
  }

  const reason = (body.reason ?? 'other') as 'new_client' | 'project_delivery' | 'travel' | 'other'

  const state = await db.pauseState.upsert({
    where: { deviceId: body.deviceId },
    create: {
      deviceId: body.deviceId,
      active: body.active,
      reason,
      until: body.until ?? '',
      loggedAt: body.loggedAt ?? '',
    },
    update: {
      active: body.active,
      reason,
      until: body.until ?? '',
      loggedAt: body.loggedAt ?? '',
    },
  })

  // Add to log when activating
  if (body.active) {
    await db.pauseLog.create({
      data: {
        deviceId: body.deviceId,
        active: true,
        reason,
        until: body.until ?? '',
        loggedAt: body.loggedAt ?? new Date().toISOString(),
      },
    })
  }

  return NextResponse.json({
    active: state.active,
    reason: state.reason,
    until: state.until,
    loggedAt: state.loggedAt,
  })
}
