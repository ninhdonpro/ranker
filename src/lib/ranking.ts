import type { Payload, PayloadRequest } from 'payload'

import type { Entry, List } from '@/payload-types'

/** Field thứ tự kéo-thả do join `entries` (orderable) của Bảng xếp hạng sinh ra trên Suất tham gia. */
export const ENTRY_ORDER_FIELD = '_entries_entries_order'

export type RankedEntry = { rank: number; entry: Entry }

/**
 * Nguồn duy nhất để đọc thứ hạng của một bảng. Hiện tại xếp theo thứ tự biên tập (kéo-thả);
 * khi có vote, nhánh `votes` sẽ xếp theo điểm vote và dùng thứ tự biên tập làm tiêu chí phụ,
 * mọi nơi gọi hàm này không phải đổi.
 */
export async function getRankedEntries(
  payload: Payload,
  list: Pick<List, 'id' | 'rankingMode'>,
  options: {
    depth?: number
    req?: PayloadRequest
    /** Trang công khai: bỏ suất có mục chưa đăng, số hạng đánh lại sau khi lọc. */
    publishedItemsOnly?: boolean
  } = {},
): Promise<RankedEntry[]> {
  if (list.rankingMode === 'votes') {
    throw new Error('Xếp hạng theo vote chưa được hỗ trợ.')
  }
  const { docs } = await payload.find({
    collection: 'entries',
    where: { list: { equals: list.id } },
    sort: [ENTRY_ORDER_FIELD, 'createdAt'],
    depth: options.depth ?? 1,
    limit: 0,
    pagination: false,
    req: options.req,
  })
  const visible = options.publishedItemsOnly
    ? docs.filter((entry) => typeof entry.item === 'object' && entry.item._status === 'published')
    : docs
  return visible.map((entry, index) => ({ rank: index + 1, entry }))
}
