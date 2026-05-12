import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/leads?deviceId=xxx
export async function GET(req: NextRequest) {
  const deviceId = req.nextUrl.searchParams.get('deviceId')
  if (!deviceId) return NextResponse.json({ error: 'deviceId required' }, { status: 400 })

  const leads = await db.lead.findMany({
    where: { deviceId },
    orderBy: { createdAt: 'desc' },
  })

  // Map DB enum values back to display strings
  return NextResponse.json(leads.map(mapLead))
}

// POST /api/leads
export async function POST(req: NextRequest) {
  const body = await req.json() as {
    deviceId: string
    name: string
    company: string
    status: string
    notes: string
  }

  const lead = await db.lead.create({
    data: {
      deviceId: body.deviceId,
      name: body.name,
      company: body.company ?? '',
      status: toDbStatus(body.status),
      notes: body.notes ?? '',
    },
  })

  return NextResponse.json(mapLead(lead), { status: 201 })
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function toDbStatus(s: string) {
  const map: Record<string, string> = {
    'Identified': 'Identified',
    'Messaged': 'Messaged',
    'Replied': 'Replied',
    'Call Booked': 'CallBooked',
    'Proposal Sent': 'ProposalSent',
    'Client Won': 'ClientWon',
    'Not Interested': 'NotInterested',
  }
  return (map[s] ?? 'Identified') as Parameters<typeof db.lead.create>[0]['data']['status']
}

function fromDbStatus(s: string): string {
  const map: Record<string, string> = {
    'Identified': 'Identified',
    'Messaged': 'Messaged',
    'Replied': 'Replied',
    'CallBooked': 'Call Booked',
    'ProposalSent': 'Proposal Sent',
    'ClientWon': 'Client Won',
    'NotInterested': 'Not Interested',
  }
  return map[s] ?? s
}

function mapLead(lead: { id: string; deviceId: string; name: string; company: string; status: string; notes: string; createdAt: Date; updatedAt: Date }) {
  return {
    id: lead.id,
    name: lead.name,
    company: lead.company,
    status: fromDbStatus(lead.status),
    notes: lead.notes,
    createdAt: lead.createdAt.toISOString(),
    updatedAt: lead.updatedAt.toISOString(),
  }
}
