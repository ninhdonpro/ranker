import type { Metadata } from 'next'
import type { ReactNode } from 'react'

/**
 * Layout tối giản cho các trang kiểm tra của Pass 1 (không style). Toàn bộ gắn noindex;
 * pass dựng trang công khai sẽ thay layout và các trang này.
 */
export const metadata: Metadata = {
  robots: { index: false, follow: false },
}

export default function FrontendLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="vi">
      <body>{children}</body>
    </html>
  )
}
