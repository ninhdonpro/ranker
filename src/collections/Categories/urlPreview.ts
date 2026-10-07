import { addDataAndFileToRequest, type Endpoint } from 'payload'

import { isAdminUser, isStaffUser } from '@/access/roles'
import { relId } from '@/lib/relations'
import { categoryUrl } from '@/lib/url'

import { countAffectedUrls, resolvePlacement } from './placement'

/**
 * POST /api/categories/url-preview — cho admin xem trước URL mới và số URL bị ảnh hưởng
 * (chính nó và mọi chuyên mục con) khi đổi slug hoặc chuyên mục cha, trước khi lưu.
 */
export const urlPreviewEndpoint: Endpoint = {
  path: '/url-preview',
  method: 'post',
  handler: async (req) => {
    if (!isStaffUser(req.user)) return Response.json({ error: 'Forbidden' }, { status: 403 })
    await addDataAndFileToRequest(req)
    const body = (req.data ?? {}) as { id?: unknown; slug?: unknown; parent?: unknown }

    const id = relId(body.id)
    if (!id) return Response.json({ changed: false })
    const doc = await req.payload.findByID({ collection: 'categories', id, depth: 0, req })
    if (!doc.path) return Response.json({ changed: false })

    // Chỉ admin đổi được slug/cha; với biên tập viên, server luôn giữ giá trị đang lưu.
    const canMove = isAdminUser(req.user)
    const result = await resolvePlacement(req, {
      id,
      slug: canMove && body.slug !== undefined ? body.slug : doc.slug,
      parent: canMove && body.parent !== undefined ? (body.parent ?? null) : doc.parent,
      itemRoute: doc.itemRoute,
      original: doc,
    })
    if (!result.ok) return Response.json({ changed: false, errors: result.errors })

    const oldUrl = categoryUrl(doc.path)
    const newUrl = categoryUrl(result.placement.path)
    const changed = oldUrl !== newUrl
    return Response.json({
      changed,
      oldUrl,
      newUrl,
      affected: changed ? await countAffectedUrls(req, id) : 0,
    })
  },
}
