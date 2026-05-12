import { PrismaClient } from '../lib/generated/prisma/index.js'
import { PrismaNeonHttp } from '@prisma/adapter-neon'

const CONN =
  'postgresql://neondb_owner:npg_XvAK0uc2yVfo@ep-round-forest-ap70nc6o-pooler.c-7.us-east-1.aws.neon.tech/neondb?sslmode=require'

// Prisma 7: PrismaNeonHttp takes the connection string directly
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
