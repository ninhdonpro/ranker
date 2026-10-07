import { NextResponse, type NextRequest } from 'next/server'

import { getPayloadClient } from '@/lib/payload'
import { resolveRedirect } from '@/lib/redirects'

/**
 * Redirect 301 cho URL công khai cũ (đổi slug, đổi chuyên mục...). Chạy trên Node.js runtime
 * (mặc định của proxy trong Next 16), tra bảng redirects qua Payload Local API.
 *
 * Cache trong bộ nhớ chỉ là cache ngắn hạn (TTL 60 giây) của từng tiến trình, không phải dữ liệu
 * gốc: khi chạy nhiều container, redirect mới có thể mất tối đa 60 giây để có hiệu lực ở mọi nơi.
 */
const TTL_MS = 60_000
const MAX_ENTRIES = 5_000
const cache = new Map<string, { target: null | string; expires: number }>()

async function lookup(path: string): Promise<null | string> {
  const hit = cache.get(path)
  if (hit && hit.expires > Date.now()) return hit.target
  const payload = await getPayloadClient()
  const target = await resolveRedirect(payload, path)
  if (cache.size >= MAX_ENTRIES) cache.delete(cache.keys().next().value as string)
  cache.set(path, { target, expires: Date.now() + TTL_MS })
  return target
}

/** Staging (`NOINDEX=true`): gắn `X-Robots-Tag` cho mọi trang công khai để không bị index. */
const withRobots = (response: NextResponse) => {
  if (process.env.NOINDEX === 'true') response.headers.set('X-Robots-Tag', 'noindex, nofollow')
  return response
}

export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl
  // URL chuẩn không có dấu / ở cuối; bỏ dấu / và tra redirect trong cùng một bước 301.
  const path = pathname.length > 1 ? pathname.replace(/\/+$/, '') : pathname
  try {
    const target = (await lookup(decodeURIComponent(path))) ?? (path !== pathname ? path : null)
    if (target) {
      return withRobots(NextResponse.redirect(new URL(`${target}${search}`, request.url), 301))
    }
  } catch (error) {
    // Lỗi tra redirect không được làm sập trang: để request đi tiếp như bình thường.
    console.error('[proxy] Không tra được redirect', error)
  }
  return withRobots(NextResponse.next())
}

export const config = {
  // Chỉ các đường dẫn công khai: bỏ qua admin, API, healthcheck, file tĩnh và file có phần mở rộng.
  matcher: ['/((?!admin|api|healthz|_next|favicon\\.ico|.*\\.[a-zA-Z0-9]+$).*)'],
}
