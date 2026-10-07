import type { Payload } from 'payload'

import { docUrl } from '@/lib/url'

/**
 * Tra redirect cho một đường dẫn công khai. Redirect trỏ tới tài liệu, nên URL đích luôn là
 * URL hiện tại của tài liệu (không có chuỗi redirect). Trả về null nếu không có redirect.
 */
export async function resolveRedirect(payload: Payload, path: string): Promise<null | string> {
  const { docs } = await payload.find({
    collection: 'redirects',
    where: { from: { equals: path } },
    depth: 1,
    limit: 1,
    pagination: false,
  })
  const target = docs[0]?.to
  if (!target) return null
  if (target.type === 'custom') return target.url ?? null
  const ref = target.reference
  if (!ref || typeof ref.value !== 'object' || ref.value === null) return null
  const url = docUrl(ref as Parameters<typeof docUrl>[0])
  return url && url !== path ? url : null
}
