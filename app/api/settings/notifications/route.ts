import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/settings/notifications?deviceId=xxx
export async function GET(req: NextRequest) {
  const deviceId = req.nextUrl.searchParams.get('deviceId')
  if (!deviceId) return NextResponse.json({ error: 'deviceId required' }, { status: 400 })

  const record = await db.notificationSettings.findUnique({ where: { deviceId } })
  return NextResponse.json(
    record
      ? { morningTime: record.morningTime, eveningTime: record.eveningTime, enabled: record.enabled }
      : { morningTime: '08:00', eveningTime: '19:00', enabled: false }
  )
}

// POST /api/settings/notifications
export async function POST(req: NextRequest) {
  const body = await req.json() as {
    deviceId: string
    morningTime?: string
    eveningTime?: string
    enabled?: boolean
  }

  const record = await db.notificationSettings.upsert({
    where: { deviceId: body.deviceId },
    create: {
      deviceId: body.deviceId,
      morningTime: body.morningTime ?? '08:00',
      eveningTime: body.eveningTime ?? '19:00',
      enabled: body.enabled ?? false,
    },
    update: {
      ...(body.morningTime !== undefined && { morningTime: body.morningTime }),
      ...(body.eveningTime !== undefined && { eveningTime: body.eveningTime }),
      ...(body.enabled !== undefined && { enabled: body.enabled }),
    },
  })

  return NextResponse.json({
    morningTime: record.morningTime,
    eveningTime: record.eveningTime,
    enabled: record.enabled,
  })
}
