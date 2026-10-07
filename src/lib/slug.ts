/** Slug hợp lệ: chữ thường không dấu, số, nối bằng một dấu gạch ngang. */
export const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

/**
 * Sinh slug từ chuỗi tiếng Việt: bỏ dấu, đổi đ → d, chỉ giữ chữ thường, số và dấu gạch ngang.
 * Hàm `slugify` mặc định của Payload xóa luôn chữ có dấu ("Phim Việt" → "phim-vit"), nên không dùng.
 */
export function vnSlugify(input: unknown): string {
  if (typeof input !== 'string') return ''
  return input
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export const isValidSlug = (slug: unknown): slug is string =>
  typeof slug === 'string' && SLUG_PATTERN.test(slug)
