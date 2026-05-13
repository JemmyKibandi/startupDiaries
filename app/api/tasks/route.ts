import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/tasks?deviceId=xxx&date=YYYY-MM-DD  (optional date, defaults to today)
export async function GET(req: NextRequest) {
  const deviceId = req.nextUrl.searchParams.get('deviceId')
  const date = req.nextUrl.searchParams.get('date') ?? todayISO()
  if (!deviceId) return NextResponse.json({ error: 'deviceId required' }, { status: 400 })

  const record = await db.dailyCompletion.findUnique({
    where: { deviceId_date: { deviceId, date } },
  })

  return NextResponse.json(record ? mapCompletion(record) : emptyCompletion(date))
}

// GET /api/tasks/history?deviceId=xxx  — handled via query param 'all'
// GET /api/tasks?deviceId=xxx&all=true
export async function POST(req: NextRequest) {
  const body = await req.json() as {
    deviceId: string
    date: string
    tasks: {
      outreach: boolean
      log_replies: boolean
      follow_up: boolean
      linkedin: boolean
      update_tracker: boolean
    }
    completedAt?: string
  }

  const record = await db.dailyCompletion.upsert({
    where: { deviceId_date: { deviceId: body.deviceId, date: body.date } },
    create: {
      deviceId: body.deviceId,
      date: body.date,
      outreach: body.tasks.outreach,
      logReplies: body.tasks.log_replies,
      followUp: body.tasks.follow_up,
      linkedin: body.tasks.linkedin,
      updateTracker: body.tasks.update_tracker,
      completedAt: body.completedAt ? new Date(body.completedAt) : null,
    },
    update: {
      outreach: body.tasks.outreach,
      logReplies: body.tasks.log_replies,
      followUp: body.tasks.follow_up,
      linkedin: body.tasks.linkedin,
      updateTracker: body.tasks.update_tracker,
      completedAt: body.completedAt ? new Date(body.completedAt) : null,
    },
  })

  return NextResponse.json(mapCompletion(record))
}

// GET /api/tasks/history handled here with ?history=true
// (separate route file below is cleaner, but keeping it simple)

function todayISO() {
  return new Date().toISOString().split('T')[0]
}

type DbCompletion = {
  date: string
  outreach: boolean
  logReplies: boolean
  followUp: boolean
  linkedin: boolean
  updateTracker: boolean
  completedAt: Date | null
}

function mapCompletion(r: DbCompletion) {
  return {
    date: r.date,
    tasks: {
      outreach: r.outreach,
      log_replies: r.logReplies,
      follow_up: r.followUp,
      linkedin: r.linkedin,
      update_tracker: r.updateTracker,
    },
    completedAt: r.completedAt?.toISOString() ?? undefined,
  }
}

function emptyCompletion(date: string) {
  return {
    date,
    tasks: {
      outreach: false,
      log_replies: false,
      follow_up: false,
      linkedin: false,
      update_tracker: false,
    },
    completedAt: undefined,
  }
}
