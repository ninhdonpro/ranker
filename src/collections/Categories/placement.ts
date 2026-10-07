import type { PayloadRequest, ValidationFieldError } from 'payload'

import type { Category } from '@/payload-types'
import { relId } from '@/lib/relations'
import { isReservedRootSegment, isSystemRootSegment } from '@/lib/reserved'
import { isValidSlug } from '@/lib/slug'

/** Tầng 0 = nhóm lớn, 1 = chuyên mục, 2 = chuyên mục con. */
export const MAX_LEVEL = 2

export type ItemRoute = NonNullable<Category['itemRoute']>

export type Placement = {
  level: number
  path: string
  group: number | null
  itemRoute: ItemRoute | null
}

type Input = {
  id?: number | null
  slug: unknown
  parent: unknown
  /** itemRoute người dùng chọn (chỉ có ý nghĩa với nhóm lớn). */
  itemRoute?: unknown
  original?: Pick<Category, 'level' | 'group' | 'itemRoute'> | null
}

export type PlacementResult =
  { ok: true; placement: Placement } | { ok: false; errors: ValidationFieldError[] }

const fail = (path: string, message: string): PlacementResult => ({
  ok: false,
  errors: [{ path, message }],
})

const getCategory = (req: PayloadRequest, id: number) =>
  req.payload.findByID({ collection: 'categories', id, depth: 0, req, disableErrors: true })

/** Độ sâu của cây con bên dưới một chuyên mục (0 nếu không có con). */
async function subtreeDepth(req: PayloadRequest, id: number): Promise<number> {
  const { docs } = await req.payload.find({
    collection: 'categories',
    where: { parent: { equals: id } },
    depth: 0,
    limit: 0,
    pagination: false,
    req,
  })
  let depth = 0
  for (const child of docs) depth = Math.max(depth, 1 + (await subtreeDepth(req, child.id)))
  return depth
}

/**
 * Tính tầng, đường dẫn, nhóm lớn và tiền tố URL của mục cho một chuyên mục,
 * đồng thời kiểm tra mọi ràng buộc của cây chuyên mục.
 */
export async function resolvePlacement(
  req: PayloadRequest,
  input: Input,
): Promise<PlacementResult> {
  const { id, original } = input
  const slug = input.slug
  if (!isValidSlug(slug)) {
    return fail('slug', 'Slug chỉ gồm chữ thường không dấu, số và dấu gạch ngang.')
  }

  const parentId = relId(input.parent)
  const parent = parentId ? await getCategory(req, parentId) : null
  if (parentId && !parent) return fail('parent', 'Không tìm thấy chuyên mục cha.')

  // Chống vòng lặp: cha không được là chính nó hoặc một chuyên mục con cháu của nó.
  if (id && parent) {
    let cursor: Category | null = parent
    while (cursor) {
      if (cursor.id === id) {
        return fail(
          'parent',
          'Không thể chọn chính chuyên mục này hoặc chuyên mục con của nó làm cha.',
        )
      }
      const next = relId(cursor.parent)
      cursor = next ? await getCategory(req, next) : null
    }
  }

  const level = parent ? (parent.level ?? 0) + 1 : 0
  if (level > MAX_LEVEL) {
    return fail('parent', 'Chuyên mục chỉ có tối đa 3 tầng: Nhóm › Chuyên mục › Chuyên mục con.')
  }
  if (id && level + (await subtreeDepth(req, id)) > MAX_LEVEL) {
    return fail(
      'parent',
      'Không thể chuyển: chuyên mục này có chuyên mục con, chuyển vào đây sẽ vượt quá 3 tầng.',
    )
  }

  const group = !parent ? null : level === 1 ? parent.id : relId(parent.group)

  if (original) {
    const wasGroup = original.level === 0
    if (wasGroup !== (level === 0)) {
      return fail('parent', 'Không thể đổi nhóm lớn thành chuyên mục thường hoặc ngược lại.')
    }
    if (!wasGroup && relId(original.group) !== group) {
      return fail('parent', 'Không thể chuyển chuyên mục sang nhóm lớn khác.')
    }
  }

  let itemRoute: ItemRoute | null
  if (level === 0) {
    itemRoute = (input.itemRoute as ItemRoute | null | undefined) ?? null
    if (!itemRoute) return fail('itemRoute', 'Nhóm lớn phải chọn tiền tố URL cho mục.')
    if (original && original.itemRoute && original.itemRoute !== itemRoute) {
      return fail('itemRoute', 'Không đổi được tiền tố URL mục của nhóm lớn sau khi đã tạo.')
    }
    if (isSystemRootSegment(slug))
      return fail('slug', `"${slug}" là từ khóa dành riêng của hệ thống.`)
  } else {
    const groupDoc = level === 1 ? parent : group ? await getCategory(req, group) : null
    itemRoute = groupDoc?.itemRoute ?? null
    if (level === 1 && isReservedRootSegment(slug)) {
      return fail('slug', `"${slug}" là từ khóa dành riêng, không dùng được cho chuyên mục.`)
    }
  }

  const path = level === 2 && parent ? `${parent.path}/${slug}` : slug

  const { docs: taken } = await req.payload.find({
    collection: 'categories',
    where: { and: [{ path: { equals: path } }, ...(id ? [{ id: { not_equals: id } }] : [])] },
    depth: 0,
    limit: 1,
    req,
  })
  if (taken[0]) return fail('slug', `URL /${path} đã được dùng bởi chuyên mục "${taken[0].name}".`)

  return { ok: true, placement: { level, path, group, itemRoute } }
}

/** Số URL bị đổi khi đường dẫn của chuyên mục đổi: chính nó và mọi chuyên mục con cháu. */
export async function countAffectedUrls(req: PayloadRequest, id: number): Promise<number> {
  const { docs } = await req.payload.find({
    collection: 'categories',
    where: { parent: { equals: id } },
    depth: 0,
    limit: 0,
    pagination: false,
    req,
  })
  let count = 1
  for (const child of docs) count += await countAffectedUrls(req, child.id)
  return count
}
