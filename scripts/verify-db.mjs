import { PrismaClient } from '../lib/generated/prisma/index.js'
import { PrismaNeonHttp } from '@prisma/adapter-neon'

const CONN = process.env.DATABASE_URL
if (!CONN) throw new Error('DATABASE_URL is not set — add it to .env.local')

const adapter = new PrismaNeonHttp(CONN)
const db = new PrismaClient({ adapter })

const rows = await db.$queryRaw`
  SELECT table_name
  FROM information_schema.tables
  WHERE table_schema = 'public'
  ORDER BY table_name
`

console.log('\n✅ Connected to Neon over HTTPS. Tables:\n')
for (const r of rows) {
  console.log(' ✓', r.table_name)
}

await db.$disconnect()
