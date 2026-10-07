import type { Payload } from 'payload'
import { cache } from 'react'

import { relId } from '@/lib/relations'

/**
 * Dữ liệu phụ cho các ô trong bảng danh sách admin. Danh sách truy vấn ở depth 0, nên ảnh và
 * chuyên mục chỉ có id; các hàm dưới đây nạp gộp theo request (React `cache`), không truy vấn
 * từng dòng.
 */

type CategoryInfo = { name: string; color: string | null }

/**
 * Toàn bộ chuyên mục (vài chục bản ghi), nạp một lần cho mỗi request. Chuyên mục chưa chọn màu
 * dùng màu của chuyên mục cha gần nhất (chuyên mục con thường không đặt màu riêng).
 */
export const getCategoryIndex = cache(async (payload: Payload) => {
  const { docs } = await payload.find({
    collection: 'categories',
    depth: 0,
    limit: 0,
    pagination: false,
    select: { name: true, color: true, parent: true },
  })
  const byId = new Map(docs.map((doc) => [doc.id, doc]))
  const colorOf = (id: number | null, seen = new Set<number>()): string | null => {
    const doc = id ? byId.get(id) : undefined
    if (!doc || seen.has(doc.id)) return null
    seen.add(doc.id)
    return doc.color ?? colorOf(relId(doc.parent), seen)
  }
  return new Map<number, CategoryInfo>(
    docs.map((doc) => [doc.id, { name: doc.name, color: colorOf(doc.id) }]),
  )
})

/** Gom các lời gọi trong cùng một nhịp thành một truy vấn `id in [...]`. */
function batchLoader<V>(fetchMany: (ids: number[]) => Promise<Map<number, V>>) {
  let queue: number[] = []
  let batch: Promise<Map<number, V>> | null = null
  return (id: number): Promise<V | undefined> => {
    queue.push(id)
    if (!batch) {
      batch = Promise.resolve().then(() => {
        const ids = [...new Set(queue)]
        queue = []
        batch = null
        return fetchMany(ids)
      })
    }
    return batch.then((found) => found.get(id))
  }
}

/** URL ảnh nhỏ (size `thumb`) theo id media, nạp gộp theo request. */
const getThumbLoader = cache((payload: Payload) =>
  batchLoader(async (ids) => {
    const { docs } = await payload.find({
      collection: 'media',
      depth: 0,
      limit: 0,
      pagination: false,
      where: { id: { in: ids } },
      select: { url: true, sizes: { thumb: { url: true } } },
    })
    return new Map(docs.map((doc) => [doc.id, doc.sizes?.thumb?.url ?? doc.url ?? null]))
  }),
)

export async function getThumbUrl(payload: Payload, media: unknown): Promise<string | null> {
  const id = relId(media)
  if (typeof id !== 'number') return null
  return (await getThumbLoader(payload)(id)) ?? null
}
