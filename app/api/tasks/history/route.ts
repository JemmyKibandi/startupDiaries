import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/tasks/history?deviceId=xxx  — last 60 days of completions
export async function GET(req: NextRequest) {
  const deviceId = req.nextUrl.searchParams.get('deviceId')
  if (!deviceId) return NextResponse.json({ error: 'deviceId required' }, { status: 400 })

  const since = new Date()
  since.setDate(since.getDate() - 60)
  const sinceStr = since.toISOString().split('T')[0]

  const records = await db.dailyCompletion.findMany({
    where: {
      deviceId,
      date: { gte: sinceStr },
    },
    orderBy: { date: 'desc' },
  })

  return NextResponse.json(
    records.map((r) => ({
      date: r.date,
      tasks: {
        outreach: r.outreach,
        log_replies: r.logReplies,
        follow_up: r.followUp,
        linkedin: r.linkedin,
        update_tracker: r.updateTracker,
      },
      completedAt: r.completedAt?.toISOString() ?? undefined,
    }))
  )
}
