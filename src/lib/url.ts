/**
 * Nguồn duy nhất sinh URL công khai. Mọi nơi cần URL (link nội bộ, redirect, SEO, sitemap)
 * đều đi qua các hàm này.
 */

/** Chuyên mục và nhóm lớn nằm ở gốc: /phim-series, /phim-series/phim-viet, /info. */
export const categoryUrl = (path: string) => `/${path}`

/** Tiền tố URL của mục, lấy từ nhóm lớn: Sản phẩm & Dịch vụ → /review, Thông tin → /wiki. */
export type ItemRoute = 'review' | 'wiki'

/** Mục: /review/iphone-17-pro-max, /wiki/mat-biec. */
export const itemUrl = (route: ItemRoute, slug: string) => `/${route}/${slug}`

/** Bảng xếp hạng: /list/top-10-dien-thoai-tot-nhat-2026. */
export const listUrl = (slug: string) => `/list/${slug}`

type Linkable =
  | { relationTo: 'categories'; value: { path?: null | string } }
  | { relationTo: 'items' | 'lists'; value: { url?: null | string } }

/**
 * URL công khai của một tài liệu được tham chiếu (link nội bộ trong rich text, redirect).
 * Mục và bảng lưu sẵn `url`; chuyên mục lưu `path`.
 */
export function docUrl(ref: Linkable): null | string {
  if (ref.relationTo === 'categories') return ref.value.path ? categoryUrl(ref.value.path) : null
  return ref.value.url ?? null
}
