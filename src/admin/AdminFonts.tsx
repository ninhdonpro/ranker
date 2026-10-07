import { Barlow_Condensed, Inter, Lora } from 'next/font/google'
import type { ReactNode } from 'react'

// Font của design system (docs/design.md › Typography), tự host bằng next/font: tải về lúc build,
// trình duyệt không gọi sang Google khi mở admin.
const inter = Inter({ subsets: ['latin', 'vietnamese'], axes: ['opsz'], display: 'swap' })
const lora = Lora({ subsets: ['latin', 'vietnamese'], weight: ['600', '700'], display: 'swap' })
const barlow = Barlow_Condensed({
  subsets: ['latin', 'vietnamese'],
  weight: '700',
  display: 'swap',
})

const fontVars = `:root{--font-body:${inter.style.fontFamily};--rk-font-heading:${lora.style.fontFamily};--rk-font-display:${barlow.style.fontFamily}}`

/** Provider của admin: gắn font cho toàn bộ trang quản trị (kể cả trang đăng nhập và modal). */
export function AdminFonts({ children }: { children?: ReactNode }) {
  return (
    <>
      <style>{fontVars}</style>
      {children}
    </>
  )
}
