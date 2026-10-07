import { commitTransaction, initTransaction, killTransaction, type PayloadRequest } from 'payload'

import { isAdminUser } from '@/access/roles'
import { relId } from '@/lib/relations'

/** Collection có quy trình xóa an toàn (gõ tên để xác nhận). */
export type SafeDeleteCollection = 'categories' | 'items' | 'lists'

export type ImpactDoc = { id: number; title: string }

export type DeleteImpact = {
  name: string
  /** Chuyên mục còn chuyên mục con, bảng hoặc mục: không cho xóa. */
  blocked: boolean
  /** Xóa mục: các bảng đang chứa mục (suất trong các bảng này bị gỡ theo). */
  listsContaining?: ImpactDoc[]
  /** Xóa bảng: số suất bị gỡ (mục vẫn giữ nguyên). */
  entryCount?: number
  /** Xóa chuyên mục: những gì còn thuộc chuyên mục (phải chuyển đi trước). */
  children?: { docs: ImpactDoc[]; total: number }
  lists?: { docs: ImpactDoc[]; total: number }
  items?: { docs: ImpactDoc[]; total: number }
}

const SAMPLE = 20

/** Tên dùng để xác nhận xóa: tên/tiêu đề tiếng Việt (ngôn ngữ mặc định). */
async function displayName(req: PayloadRequest, collection: SafeDeleteCollection, id: number) {
  const doc = await req.payload.findByID({
    collection,
    id,
    depth: 0,
    draft: collection !== 'categories',
    locale: 'vi',
    req,
    overrideAccess: true,
    disableErrors: true,
  })
  if (!doc) return null
  return 'title' in doc ? doc.title : doc.name
}

async function sample(
  req: PayloadRequest,
  collection: 'categories' | 'items' | 'lists',
  where: Parameters<PayloadRequest['payload']['find']>[0]['where'],
) {
  const res = await req.payload.find({
    collection,
    where,
    depth: 0,
    limit: SAMPLE,
    draft: collection !== 'categories',
    locale: 'vi',
    req,
    overrideAccess: true,
  })
  return {
    total: res.totalDocs,
    docs: res.docs.map((doc) => ({ id: doc.id, title: 'title' in doc ? doc.title : doc.name })),
  }
}

/** Những gì bị ảnh hưởng khi xóa (hiển thị trong hộp thoại trước khi xác nhận). */
export async function getDeleteImpact(
  req: PayloadRequest,
  collection: SafeDeleteCollection,
  id: number,
): Promise<DeleteImpact | null> {
  const name = await displayName(req, collection, id)
  if (name == null) return null

  if (collection === 'items') {
    const entries = await req.payload.find({
      collection: 'entries',
      where: { item: { equals: id } },
      depth: 0,
      limit: 0,
      pagination: false,
      req,
      overrideAccess: true,
    })
    const listIds = entries.docs
      .map((entry) => relId(entry.list))
      .filter((v): v is number => v !== null)
    const lists = listIds.length
      ? await req.payload.find({
          collection: 'lists',
          where: { id: { in: listIds } },
          depth: 0,
          limit: 0,
          pagination: false,
          draft: true,
          locale: 'vi',
          req,
          overrideAccess: true,
        })
      : { docs: [] }
    return {
      name,
      blocked: false,
      listsContaining: lists.docs.map((list) => ({ id: list.id, title: list.title })),
    }
  }

  if (collection === 'lists') {
    const { totalDocs } = await req.payload.count({
      collection: 'entries',
      where: { list: { equals: id } },
      req,
      overrideAccess: true,
    })
    return { name, blocked: false, entryCount: totalDocs }
  }

  const [children, lists, items] = await Promise.all([
    sample(req, 'categories', { parent: { equals: id } }),
    sample(req, 'lists', { category: { equals: id } }),
    sample(req, 'items', { category: { equals: id } }),
  ])
  return {
    name,
    blocked: children.total + lists.total + items.total > 0,
    children,
    lists,
    items,
  }
}

export class SafeDeleteError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message)
  }
}

/**
 * Xóa sau khi đã gõ đúng tên. Kiểm tra lại quyền, tên và ràng buộc ở server, rồi xóa trong
 * một transaction: suất tham gia liên quan và redirect trỏ tới tài liệu bị xóa theo.
 */
export async function safeDelete(
  req: PayloadRequest,
  collection: SafeDeleteCollection,
  id: number,
  confirmation: unknown,
) {
  if (!isAdminUser(req.user)) throw new SafeDeleteError('Chỉ Admin được xóa.', 403)

  const impact = await getDeleteImpact(req, collection, id)
  if (!impact) throw new SafeDeleteError('Không tìm thấy nội dung cần xóa.', 404)
  if (typeof confirmation !== 'string' || confirmation.trim() !== impact.name.trim()) {
    throw new SafeDeleteError('Tên nhập vào không khớp, chưa xóa gì.', 400)
  }
  if (impact.blocked) {
    throw new SafeDeleteError(
      'Chuyên mục còn chuyên mục con, bảng hoặc mục. Hãy chuyển chúng sang chuyên mục khác trước khi xóa.',
      409,
    )
  }

  const shouldCommit = await initTransaction(req)
  try {
    if (collection === 'items' || collection === 'lists') {
      await req.payload.delete({
        collection: 'entries',
        where: { [collection === 'items' ? 'item' : 'list']: { equals: id } },
        req,
        overrideAccess: true,
      })
    }
    await req.payload.delete({
      collection: 'redirects',
      where: {
        'to.reference.value': { equals: id },
        'to.reference.relationTo': { equals: collection },
      },
      req,
      overrideAccess: true,
    })
    await req.payload.delete({ collection, id, req, overrideAccess: true })
    if (shouldCommit) await commitTransaction(req)
  } catch (error) {
    await killTransaction(req)
    throw error
  }
  return impact
}
