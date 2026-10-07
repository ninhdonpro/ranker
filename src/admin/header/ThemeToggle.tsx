'use client'

import { useTheme, useTranslation } from '@payloadcms/ui'

import type { RankerTranslationKeys, RankerTranslations } from '@/admin/translations'

/** Nút đổi giao diện sáng/tối ở đầu trang (design.md › admin-header-control). */
export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const { t } = useTranslation<RankerTranslations, RankerTranslationKeys>()
  const isDark = theme === 'dark'
  const label = t(isDark ? 'ranker:themeToLight' : 'ranker:themeToDark')

  return (
    <button
      type="button"
      className="rk-header-control"
      aria-label={label}
      title={label}
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
    >
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        {isDark ? (
          <>
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
          </>
        ) : (
          <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
        )}
      </svg>
    </button>
  )
}
