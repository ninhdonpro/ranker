import { addDataAndFileToRequest, type Endpoint } from 'payload'

import { isAdminUser } from '@/access/roles'
import {
  getDeleteImpact,
  safeDelete,
  SafeDeleteError,
  type SafeDeleteCollection,
} from '@/lib/deletion'
import { relId } from '@/lib/relations'

/**
 * GET  /api/{collection}/:id/delete-impact — những gì bị ảnh hưởng nếu xóa.
 * POST /api/{collection}/:id/safe-delete   — xóa sau khi gõ đúng tên ({ confirmation }).
 */
export const safeDeleteEndpoints = (collection: SafeDeleteCollection): Endpoint[] => [
  {
    path: '/:id/delete-impact',
    method: 'get',
    handler: async (req) => {
      if (!isAdminUser(req.user))
        return Response.json({ error: 'Chỉ Admin được xóa.' }, { status: 403 })
      const id = relId(req.routeParams?.id)
      const impact = id ? await getDeleteImpact(req, collection, id) : null
      if (!impact) return Response.json({ error: 'Không tìm thấy nội dung.' }, { status: 404 })
      return Response.json(impact)
    },
  },
  {
    path: '/:id/safe-delete',
    method: 'post',
    handler: async (req) => {
      await addDataAndFileToRequest(req)
      const id = relId(req.routeParams?.id)
      if (!id) return Response.json({ error: 'Thiếu id.' }, { status: 400 })
      try {
        await safeDelete(
          req,
          collection,
          id,
          (req.data as { confirmation?: unknown })?.confirmation,
        )
        return Response.json({ ok: true })
      } catch (error) {
        if (error instanceof SafeDeleteError) {
          return Response.json({ error: error.message }, { status: error.status })
        }
        throw error
      }
    },
  },
]
