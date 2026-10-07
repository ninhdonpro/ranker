/**
 * Đoạn đầu tiên của URL công khai đã dành cho hệ thống. Chuyên mục nằm ở gốc URL
 * nên không được trùng các từ này.
 */
export const SYSTEM_ROOT_SEGMENTS = [
  'list', // bảng xếp hạng: /list/[slug]
  'review', // mục nhóm Sản phẩm & Dịch vụ: /review/[slug]
  'wiki', // mục nhóm Thông tin: /wiki/[slug]
  'admin',
  'api',
  'media',
  '_next',
] as const

/** Slug trang của 2 nhóm lớn (cũng nằm ở gốc URL). */
export const GROUP_SLUGS = ['product', 'info'] as const

export const RESERVED_ROOT_SEGMENTS: readonly string[] = [...SYSTEM_ROOT_SEGMENTS, ...GROUP_SLUGS]

/** Trang người dùng công khai dùng /@username, nên mọi đoạn bắt đầu bằng @ đều dành riêng. */
export const isReservedRootSegment = (segment: string): boolean =>
  segment.startsWith('@') || RESERVED_ROOT_SEGMENTS.includes(segment)

export const isSystemRootSegment = (segment: string): boolean =>
  segment.startsWith('@') || (SYSTEM_ROOT_SEGMENTS as readonly string[]).includes(segment)
