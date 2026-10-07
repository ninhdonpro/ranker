import { sql } from '@payloadcms/db-postgres'

import { getPayloadClient } from '@/lib/payload'

export const dynamic = 'force-dynamic'

/** Healthcheck cho Coolify/Docker: 200 khi Payload đã khởi tạo xong và DB trả lời được. */
export async function GET() {
  try {
    const payload = await getPayloadClient()
    await payload.db.drizzle.execute(sql`select 1`)
    return Response.json({ ok: true })
  } catch {
    return Response.json({ ok: false }, { status: 503 })
  }
}
