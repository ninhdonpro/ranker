import type { CollectionAfterChangeHook, PayloadRequest, RequestContext } from 'payload'

import type { Redirect } from '@/payload-types'

/** Collection có thể làm đích redirect (khai báo trong redirectsPlugin). */
export type RedirectTarget = NonNullable<NonNullable<Redirect['to']>['reference']>['relationTo']

type Args<T> = {
  /** URL công khai hiện tại của document, hoặc null nếu chưa có. */
  getUrl: (doc: T) => null | string
  /** Document có đang hiển thị công khai không (ví dụ đã đăng). */
  isLive?: (doc: T) => boolean
  /**
   * URL công khai trước lần lưu này. Mặc định lấy từ `previousDoc`; collection có bản nháp
   * cần lấy URL của bản đã đăng (xem collection Items).
   */
  getPreviousUrl?: (args: { context: RequestContext; previousDoc: T | undefined }) => null | string
}

/** Tạo (hoặc trỏ lại) redirect 301 từ `from` tới document. */
export async function upsertRedirect(
  req: PayloadRequest,
  from: string,
  relationTo: RedirectTarget,
  id: number,
) {
  const data = { from, to: { type: 'reference' as const, reference: { relationTo, value: id } } }
  const { docs } = await req.payload.find({
    collection: 'redirects',
    where: { from: { equals: from } },
    depth: 0,
    limit: 1,
    req,
  })
  if (docs[0]) {
    await req.payload.update({ collection: 'redirects', id: docs[0].id, data, req })
  } else {
    await req.payload.create({ collection: 'redirects', data, req })
  }
}

/**
 * Khi URL công khai của document đổi, tự tạo redirect 301 từ URL cũ. Redirect trỏ tới
 * document (không trỏ tới URL), nên đổi tiếp lần nữa cũng không tạo chuỗi redirect.
 * URL hiện tại của document không bao giờ được là nguồn của một redirect (tránh vòng lặp).
 */
export const redirectOnUrlChange =
  <T extends { id: number }>({
    getUrl,
    isLive = () => true,
    getPreviousUrl = ({ previousDoc }) =>
      previousDoc && isLive(previousDoc) ? getUrl(previousDoc) : null,
  }: Args<T>): CollectionAfterChangeHook<T> =>
  async ({ collection, context, doc, operation, previousDoc, req }) => {
    if (!isLive(doc)) return doc
    const url = getUrl(doc)
    if (!url) return doc

    await req.payload.delete({ collection: 'redirects', where: { from: { equals: url } }, req })

    if (operation === 'update') {
      const oldUrl = getPreviousUrl({ context, previousDoc })
      if (oldUrl && oldUrl !== url) {
        await upsertRedirect(req, oldUrl, collection.slug as RedirectTarget, doc.id)
      }
    }
    return doc
  }
