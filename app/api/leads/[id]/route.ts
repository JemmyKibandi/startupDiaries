import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// PATCH /api/leads/:id
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const body = await req.json() as { status?: string; notes?: string; company?: string; name?: string }

  const data: Record<string, unknown> = {}
  if (body.name !== undefined) data.name = body.name
  if (body.company !== undefined) data.company = body.company
  if (body.notes !== undefined) data.notes = body.notes
  if (body.status !== undefined) data.status = toDbStatus(body.status)

  const lead = await db.lead.update({
    where: { id: params.id },
    data,
  })

  return NextResponse.json(mapLead(lead))
}

// DELETE /api/leads/:id
export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  await db.lead.delete({ where: { id: params.id } })
  return NextResponse.json({ ok: true })
}

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
  return (map[s] ?? 'Identified') as Parameters<typeof db.lead.update>[0]['data']['status']
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

function mapLead(lead: { id: string; name: string; company: string; status: string; notes: string; createdAt: Date; updatedAt: Date }) {
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
