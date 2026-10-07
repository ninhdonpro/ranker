import type { MetadataRoute } from 'next'

export const dynamic = 'force-dynamic'

/**
 * robots.txt. Staging đặt `NOINDEX=true` để chặn toàn bộ. Production vẫn chặn admin và API.
 * Sitemap sẽ thêm ở pass dựng trang công khai.
 */
export default function robots(): MetadataRoute.Robots {
  if (process.env.NOINDEX === 'true') {
    return { rules: { userAgent: '*', disallow: '/' } }
  }
  return { rules: { userAgent: '*', allow: '/', disallow: ['/admin', '/api'] } }
}
