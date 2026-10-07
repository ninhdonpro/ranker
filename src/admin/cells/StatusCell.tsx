'use client'

import { useTranslation } from '@payloadcms/ui'
import type { DefaultCellComponentProps } from 'payload'

import type { RankerTranslationKeys, RankerTranslations } from '@/admin/translations'

const LABEL_KEYS = {
  draft: 'ranker:statusDraft',
  published: 'ranker:statusPublished',
  changed: 'ranker:statusChanged',
} as const satisfies Record<string, RankerTranslationKeys>

/**
 * Nhãn trạng thái (design.md › status-pill). Danh sách của Payload đã tính sẵn `_displayStatus`
 * ("changed" = có bản nháp mới hơn bản đã đăng).
 */
export function StatusCell({ rowData }: DefaultCellComponentProps) {
  const { t } = useTranslation<RankerTranslations, RankerTranslationKeys>()
  const raw = String(rowData._displayStatus ?? rowData._status ?? 'draft')
  const status = raw in LABEL_KEYS ? (raw as keyof typeof LABEL_KEYS) : 'draft'
  return <span className={`rk-status rk-status--${status}`}>{t(LABEL_KEYS[status])}</span>
}
