import type { PayloadRequest } from 'payload'

import { vnSlugify } from '@/lib/slug'
import type { Item } from '@/payload-types'

type Attributes = NonNullable<Item['attributes']>[number]

/**
 * Hậu tố có nghĩa lấy từ thông tin riêng của mục, theo thứ tự ưu tiên:
 * khu vực (pho-thin-ha-noi), năm (mat-biec-2019), năm sinh, hãng, trụ sở.
 */
export function meaningfulSuffixes(attributes: Item['attributes']): string[] {
  const block: Attributes | undefined = attributes?.[0]
  if (!block) return []
  const values: (null | number | string | undefined)[] = []
  switch (block.blockType) {
    case 'place':
      values.push(block.city, block.district)
      break
    case 'creativeWork':
      values.push(block.year, block.releaseDate?.slice(0, 4))
      break
    case 'person':
      values.push(block.birthYear, block.profession)
      break
    case 'product':
      values.push(block.brand, block.releaseDate?.slice(0, 4))
      break
    case 'organization':
      values.push(block.headquarters, block.foundedYear)
      break
  }
  return values.map((value) => vnSlugify(value == null ? '' : String(value))).filter(Boolean)
}

/** Ứng viên slug khi `base` đã bị dùng: hậu tố có nghĩa trước, sau đó -2, -3... */
export function slugCandidates(base: string, attributes: Item['attributes']): string[] {
  const meaningful = meaningfulSuffixes(attributes)
    .filter((suffix) => !base.endsWith(`-${suffix}`))
    .map((suffix) => `${base}-${suffix}`)
  const numbered = Array.from({ length: 20 }, (_, i) => `${base}-${i + 2}`)
  return [...new Set([...meaningful, ...numbered])]
}

/** Tìm mục đang dùng slug (tính cả bản nháp chưa đăng), trừ chính nó. */
export async function findItemBySlug(req: PayloadRequest, slug: string, excludeId?: number | null) {
  const { docs } = await req.payload.find({
    collection: 'items',
    draft: true,
    where: {
      and: [{ slug: { equals: slug } }, ...(excludeId ? [{ id: { not_equals: excludeId } }] : [])],
    },
    depth: 0,
    limit: 1,
    pagination: false,
    req,
  })
  return docs[0] ?? null
}

/** Các slug gợi ý còn trống (tối đa `limit`). */
export async function availableSlugSuggestions(
  req: PayloadRequest,
  base: string,
  attributes: Item['attributes'],
  excludeId?: number | null,
  limit = 3,
): Promise<string[]> {
  const result: string[] = []
  for (const candidate of slugCandidates(base, attributes)) {
    if (!(await findItemBySlug(req, candidate, excludeId))) result.push(candidate)
    if (result.length >= limit) break
  }
  return result
}
