import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/streak?deviceId=xxx
export async function GET(req: NextRequest) {
  const deviceId = req.nextUrl.searchParams.get('deviceId')
  if (!deviceId) return NextResponse.json({ error: 'deviceId required' }, { status: 400 })

  const record = await db.streakData.findUnique({ where: { deviceId } })
  return NextResponse.json(
    record
      ? { current: record.current, longest: record.longest, lastCompletedDate: record.lastCompletedDate }
      : { current: 0, longest: 0, lastCompletedDate: '' }
  )
}

// POST /api/streak
export async function POST(req: NextRequest) {
  const body = await req.json() as {
    deviceId: string
    current: number
    longest: number
    lastCompletedDate: string
  }

  const record = await db.streakData.upsert({
    where: { deviceId: body.deviceId },
    create: {
      deviceId: body.deviceId,
      current: body.current,
      longest: body.longest,
      lastCompletedDate: body.lastCompletedDate,
    },
    update: {
      current: body.current,
      longest: body.longest,
      lastCompletedDate: body.lastCompletedDate,
    },
  })

  return NextResponse.json({
    current: record.current,
    longest: record.longest,
    lastCompletedDate: record.lastCompletedDate,
  })
}
