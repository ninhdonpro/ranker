import type { PayloadRequest } from 'payload'

import { vnSlugify } from '@/lib/slug'

type SlugDoc = {
  id?: number
  slug?: null | string
  generateSlug?: boolean | null
  publishedAt?: null | string
}

type Args = {
  req: PayloadRequest
  data: Record<string, unknown>
  original: SlugDoc | undefined
  /** Tên/tiêu đề dùng để sinh slug. */
  source: unknown
  /** Slug có đang bị tài liệu khác dùng không (tính cả bản nháp). */
  isTaken: (slug: string) => Promise<boolean>
  /** Các slug thay thế khi `base` đã bị dùng, theo thứ tự ưu tiên. */
  candidates: (base: string) => string[]
}

/**
 * Sinh slug cho collection có bản nháp và autosave (Mục, Bảng). Thay cho hook tự sinh của
 * Payload, vì hook đó chạy sau hook của mình và ghi đè hậu tố chống trùng.
 *
 * - Trước lần đăng đầu tiên: slug đi theo tên/tiêu đề (kèm hậu tố khi trùng).
 * - Người dùng tự sửa slug: giữ nguyên, thôi tự sinh (`generateSlug = false`).
 * - Từ lần đăng đầu tiên: slug cố định; đổi phải sửa tay và xác nhận đổi URL.
 */
export async function applyAutoSlug({ data, original, source, isTaken, candidates }: Args) {
  const typed = typeof data.slug === 'string' ? vnSlugify(data.slug) : undefined
  const previous = original?.slug ?? null
  const userOverride = typed !== undefined && typed !== '' && typed !== (previous ?? '')

  if (userOverride) {
    data.slug = typed
    data.generateSlug = false
    return
  }

  const auto = original ? original.generateSlug !== false && !original.publishedAt : !typed
  const base = vnSlugify(source)
  if (!auto || !base) {
    data.slug = typed || previous
    if (data._status === 'published') data.generateSlug = false
    return
  }

  let slug = base
  if (await isTaken(base)) {
    for (const candidate of candidates(base)) {
      if (!(await isTaken(candidate))) {
        slug = candidate
        break
      }
    }
  }
  data.slug = slug
  data.generateSlug = data._status !== 'published'
}
