'use client'

import { getTranslation } from '@payloadcms/translations'
import {
  Popup,
  PopupList,
  useConfig,
  useLocale,
  useRouteTransition,
  useTranslation,
} from '@payloadcms/ui'
import { useRouter } from 'next/navigation'
import type { ReactNode } from 'react'

import type { RankerTranslationKeys, RankerTranslations } from '@/admin/translations'

/** Cờ tròn theo mã ngôn ngữ (SVG, không dùng emoji: design.md › Icon trong admin). */
const FLAGS: Record<string, ReactNode> = {
  vi: (
    <svg viewBox="0 0 30 20" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <rect width="30" height="20" fill="#da251d" />
      <polygon
        fill="#ffff00"
        points="15,4 16.41,8.06 20.71,8.15 17.28,10.74 18.53,14.85 15,12.4 11.47,14.85 12.72,10.74 9.29,8.15 13.59,8.06"
      />
    </svg>
  ),
  en: (
    <svg viewBox="0 0 60 30" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <clipPath id="rk-flag-gb-s">
        <path d="M0,0 v30 h60 v-30 z" />
      </clipPath>
      <clipPath id="rk-flag-gb-t">
        <path d="M30,15 h30 v15 z v15 h-30 z h-30 v-15 z v-15 h30 z" />
      </clipPath>
      <g clipPath="url(#rk-flag-gb-s)">
        <path d="M0,0 v30 h60 v-30 z" fill="#012169" />
        <path d="M0,0 L60,30 M60,0 L0,30" stroke="#fff" strokeWidth="6" />
        <path
          d="M0,0 L60,30 M60,0 L0,30"
          clipPath="url(#rk-flag-gb-t)"
          stroke="#c8102e"
          strokeWidth="4"
        />
        <path d="M30,0 v30 M0,15 h60" stroke="#fff" strokeWidth="10" />
        <path d="M30,0 v30 M0,15 h60" stroke="#c8102e" strokeWidth="6" />
      </g>
    </svg>
  ),
}

/** Cờ của một ngôn ngữ, hoặc mã ngôn ngữ nếu chưa có cờ. */
const Flag = ({ code }: { code: string }) => (
  <span className="rk-flag">{FLAGS[code] ?? <span>{code.toUpperCase()}</span>}</span>
)

/**
 * Chọn ngôn ngữ nội dung: nút chỉ hiện lá cờ của ngôn ngữ đang chọn, bấm thì xổ xuống danh sách
 * các ngôn ngữ (thay ô "Ngôn ngữ: Tiếng Việt" mặc định của Payload, ẩn bằng CSS). Đổi ngôn ngữ
 * giống Payload: giữ nguyên các tham số URL, chỉ đổi `locale`.
 */
export function LocaleFlags() {
  const { config } = useConfig()
  const locale = useLocale()
  const router = useRouter()
  const { startRouteTransition } = useRouteTransition()
  const { i18n, t } = useTranslation<RankerTranslations, RankerTranslationKeys>()
  const locales = config.localization ? config.localization.locales : []
  if (locales.length < 2) return null

  const current = locales.find((option) => option.code === locale.code)
  const currentLabel = current ? getTranslation(current.label, i18n) : locale.code

  const switchTo = (code: string) => {
    const params = new URLSearchParams(window.location.search)
    params.set('locale', code)
    startRouteTransition(() => router.push(`?${params.toString()}`))
  }

  return (
    <Popup
      buttonType="custom"
      horizontalAlign="right"
      size="small"
      button={
        <span
          className="rk-header-control rk-locale-trigger"
          role="button"
          aria-label={`${t('ranker:localeGroup')}: ${currentLabel}`}
          title={currentLabel}
        >
          <Flag code={locale.code} />
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="m6 9 6 6 6-6" />
          </svg>
        </span>
      }
      render={({ close }) => (
        <PopupList.ButtonGroup>
          {locales.map((option) => (
            <PopupList.Button
              key={option.code}
              active={option.code === locale.code}
              disabled={option.code === locale.code}
              onClick={() => {
                close()
                switchTo(option.code)
              }}
            >
              <span className="rk-locale-option">
                <Flag code={option.code} />
                {getTranslation(option.label, i18n)}
              </span>
            </PopupList.Button>
          ))}
        </PopupList.ButtonGroup>
      )}
    />
  )
}
