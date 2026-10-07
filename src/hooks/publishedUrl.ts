import { ValidationError, type PayloadRequest } from 'payload'

import type { Item, List } from '@/payload-types'

import { redirectOnUrlChange } from './redirectOnUrlChange'

/**
 * Cơ chế URL dùng chung cho collection có bản nháp (Mục, Bảng xếp hạng):
 * - URL công khai chỉ đổi khi **đăng**, nên so sánh với bản đã đăng, không phải bản nháp gần nhất.
 * - Đăng với URL khác URL đang công khai thì phải xác nhận (`confirmUrlChange`), sau đó tự tạo
 *   redirect 301 từ URL cũ.
 * - Khôi phục phiên bản cũ chỉ khôi phục nội dung, giữ URL đang công khai.
 *
 * Lưu ý: mỗi lời gọi Local API kèm `req` thay `req.context` bằng một bản sao, nên trạng thái
 * luôn đọc/ghi qua `req.context` (không dùng tham số `context` của hook sau khi đã gọi API).
 */

type DraftCollection = 'items' | 'lists'
type DraftDoc = Item | List

/** Bản đã đăng của document, hoặc null nếu chưa từng được đăng. */
export async function findPublished<T extends DraftDoc>(
  req: PayloadRequest,
  collection: DraftCollection,
  id: number,
): Promise<T | null> {
  const published = await req.payload.findByID({
    collection,
    id,
    draft: false,
    depth: 0,
    req,
    disableErrors: true,
  })
  return published?._status === 'published' ? (published as T) : null
}

/** Gọi trong beforeValidate: field ảo `confirmUrlChange` bị bỏ khỏi `data` trước beforeChange. */
export function captureUrlChangeConfirmation(
  data: { confirmUrlChange?: unknown },
  req: PayloadRequest,
) {
  if (data.confirmUrlChange === true) req.context.urlChangeConfirmed = true
}

/**
 * Gọi trong beforeChange sau khi đã tính URL mới. Khi đăng với URL khác URL đang công khai:
 * chưa xác nhận thì chặn, đã xác nhận thì ghi lại URL cũ để afterChange tạo redirect.
 */
export async function guardPublishedUrlChange(args: {
  req: PayloadRequest
  collection: DraftCollection
  id: number | undefined
  newUrl: string
  isPublishing: boolean
  noun: string
}) {
  const { req, collection, id, newUrl, isPublishing, noun } = args
  req.context.previousPublishedUrl = null
  if (!id || !isPublishing) return

  const liveUrl = (await findPublished(req, collection, id))?.url ?? null
  if (!liveUrl || liveUrl === newUrl) return

  if (!req.context.urlChangeConfirmed) {
    throw new ValidationError(
      {
        collection,
        req,
        errors: [
          {
            path: 'slug',
            message: `${noun} này đang ở URL ${liveUrl}. Hãy tick "Tôi xác nhận đổi URL" để đăng với URL mới (hệ thống sẽ tạo redirect 301).`,
          },
        ],
      },
      req.t,
    )
  }
  req.context.previousPublishedUrl = liveUrl
}

/** afterChange: tạo redirect 301 khi URL đã đăng thay đổi. */
export const redirectOnPublishedUrlChange = <T extends DraftDoc>() =>
  redirectOnUrlChange<T>({
    getUrl: (doc) => doc.url ?? null,
    isLive: (doc) => doc._status === 'published',
    getPreviousUrl: ({ context }) => (context.previousPublishedUrl as null | string) ?? null,
  })
