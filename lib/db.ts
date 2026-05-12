import { PrismaClient } from './generated/prisma'
import { PrismaNeonHttp } from '@prisma/adapter-neon'

// ─── Neon HTTP transport ──────────────────────────────────────────────────────
// PrismaNeonHttp uses Neon's HTTPS API (port 443) — no TCP port 5432 needed.
// Works on restricted networks, Vercel serverless, and Edge runtimes.
// Prisma 7.x API: pass the connection string directly to PrismaNeonHttp.

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function createClient(): PrismaClient {
  const adapter = new PrismaNeonHttp(process.env.DATABASE_URL!)
  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  })
}

export const db = globalForPrisma.prisma ?? createClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db
