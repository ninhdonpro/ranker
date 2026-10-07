import { addDataAndFileToRequest, type Endpoint } from 'payload'

import { isStaffUser } from '@/access/roles'
import { relId } from '@/lib/relations'

import { findPublished } from '@/hooks/publishedUrl'
import type { Item } from '@/payload-types'

import { resolveItemUrl } from './placement'

/**
 * POST /api/items/url-preview — xem trước URL mới của một mục đã đăng khi đổi slug
 * hoặc chuyên mục (đổi sang nhóm lớn khác thì đổi tiền tố /review ↔ /wiki).
 */
export const itemUrlPreviewEndpoint: Endpoint = {
  path: '/url-preview',
  method: 'post',
  handler: async (req) => {
    if (!isStaffUser(req.user)) return Response.json({ error: 'Forbidden' }, { status: 403 })
    await addDataAndFileToRequest(req)
    const body = (req.data ?? {}) as { id?: unknown; slug?: unknown; category?: unknown }

    const id = relId(body.id)
    if (!id) return Response.json({ changed: false })
    const oldUrl = (await findPublished<Item>(req, 'items', id))?.url ?? null
    if (!oldUrl) return Response.json({ changed: false })

    const doc = await req.payload.findByID({ collection: 'items', id, draft: true, depth: 0, req })
    const result = await resolveItemUrl(req, {
      id,
      slug: body.slug ?? doc.slug,
      category: body.category !== undefined ? body.category : doc.category,
      attributes: doc.attributes,
    })
    if (!result.ok) return Response.json({ changed: false, errors: result.errors })

    const changed = result.url !== oldUrl
    return Response.json({ changed, oldUrl, newUrl: result.url, affected: changed ? 1 : 0 })
  },
}
