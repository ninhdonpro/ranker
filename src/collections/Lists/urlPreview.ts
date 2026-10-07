import { addDataAndFileToRequest, type Endpoint } from 'payload'

import { isStaffUser } from '@/access/roles'
import { findPublished } from '@/hooks/publishedUrl'
import { relId } from '@/lib/relations'
import { isValidSlug, vnSlugify } from '@/lib/slug'
import { listUrl } from '@/lib/url'
import type { List } from '@/payload-types'

/** POST /api/lists/url-preview — xem trước URL mới của bảng đã đăng khi đổi slug. */
export const listUrlPreviewEndpoint: Endpoint = {
  path: '/url-preview',
  method: 'post',
  handler: async (req) => {
    if (!isStaffUser(req.user)) return Response.json({ error: 'Forbidden' }, { status: 403 })
    await addDataAndFileToRequest(req)
    const body = (req.data ?? {}) as { id?: unknown; slug?: unknown }

    const id = relId(body.id)
    if (!id) return Response.json({ changed: false })
    const live = await findPublished<List>(req, 'lists', id)
    if (!live?.url) return Response.json({ changed: false })

    const slug = typeof body.slug === 'string' ? vnSlugify(body.slug) : live.slug
    if (!isValidSlug(slug)) return Response.json({ changed: false })
    const newUrl = listUrl(slug)
    const changed = newUrl !== live.url
    return Response.json({ changed, oldUrl: live.url, newUrl, affected: changed ? 1 : 0 })
  },
}
