'use client'

import { useConfig, useDocumentInfo, useTranslation } from '@payloadcms/ui'
import { formatDate } from '@payloadcms/ui/shared'

import type { RankerTranslationKeys, RankerTranslations } from '@/admin/translations'

const STATUS_KEYS = {
  draft: 'ranker:statusDraft',
  published: 'ranker:statusPublished',
  changed: 'ranker:statusChanged',
} as const satisfies Record<string, RankerTranslationKeys>

/**
 * Thông tin tài liệu ở đầu cột bên (design.md › doc-meta): nhãn trạng thái (`status-pill`), ngày
 * chỉnh sửa lần cuối và ngày tạo theo định dạng ngày của admin (dd/mm/yyyy). Chỉ hiện khi sửa
 * tài liệu đã có; trạng thái chỉ có ở collection có bản nháp.
 */
export function DocMeta() {
  const { id, savedDocumentData, hasPublishedDoc } = useDocumentInfo()
  const { config } = useConfig()
  const { i18n, t } = useTranslation<RankerTranslations, RankerTranslationKeys>()
  if (!id || !savedDocumentData) return null

  const pattern = config.admin.dateFormat
  const raw = savedDocumentData._status
  const status =
    raw === 'published'
      ? 'published'
      : raw === 'draft'
        ? hasPublishedDoc
          ? 'changed'
          : 'draft'
        : null

  const rows: { label: string; value: React.ReactNode }[] = [
    ...(status
      ? [
          {
            label: t('ranker:metaStatus'),
            value: (
              <span className={`rk-status rk-status--${status}`}>{t(STATUS_KEYS[status])}</span>
            ),
          },
        ]
      : []),
    {
      label: t('ranker:metaUpdated'),
      value: formatDate({ date: savedDocumentData.updatedAt, i18n, pattern }),
    },
    {
      label: t('ranker:metaCreated'),
      value: formatDate({ date: savedDocumentData.createdAt, i18n, pattern }),
    },
  ]

  return (
    <dl className="rk-doc-meta">
      {rows.map((row) => (
        <div className="rk-doc-meta__row" key={row.label}>
          <dt>{row.label}</dt>
          <dd>{row.value}</dd>
        </div>
      ))}
    </dl>
  )
}
