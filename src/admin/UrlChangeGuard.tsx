'use client'

import { useConfig, useDocumentInfo, useField, useFormFields, useTranslation } from '@payloadcms/ui'
import type { CheckboxFieldClientComponent } from 'payload'
import { useEffect, useState } from 'react'

import type { RankerTranslationKeys, RankerTranslations } from './translations'

type Preview = { changed: boolean; oldUrl?: string; newUrl?: string; affected?: number }

/**
 * Cảnh báo khi slug, chuyên mục cha (chuyên mục) hoặc chuyên mục (mục) thay đổi làm URL công khai
 * đổi, kèm ô xác nhận.
 * URL mới và số URL bị ảnh hưởng do server tính (endpoint `url-preview` của collection).
 */
export const UrlChangeGuard: CheckboxFieldClientComponent = ({ path }) => {
  const { t } = useTranslation<RankerTranslations, RankerTranslationKeys>()
  const { config } = useConfig()
  const { id, collectionSlug, lastUpdateTime } = useDocumentInfo()
  const slug = useFormFields(([fields]) => fields.slug?.value)
  const parent = useFormFields(([fields]) => fields.parent?.value)
  const category = useFormFields(([fields]) => fields.category?.value)
  const { value, setValue } = useField<boolean>({ path })
  const [preview, setPreview] = useState<Preview | null>(null)

  useEffect(() => {
    if (!id || !collectionSlug) return
    const controller = new AbortController()
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(
          `${config.serverURL}${config.routes.api}/${collectionSlug}/url-preview`,
          {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id, slug, parent, category }),
            signal: controller.signal,
          },
        )
        if (res.ok) setPreview((await res.json()) as Preview)
      } catch {
        // Bỏ qua: request bị hủy khi người dùng tiếp tục gõ.
      }
    }, 300)
    return () => {
      clearTimeout(timer)
      controller.abort()
    }
  }, [
    id,
    collectionSlug,
    slug,
    parent,
    category,
    lastUpdateTime,
    config.serverURL,
    config.routes.api,
  ])

  const changed = Boolean(preview?.changed)
  useEffect(() => {
    // Không đánh dấu form là "đã sửa" khi tự bỏ tick.
    if (!changed && value) setValue(false, true)
  }, [changed, value, setValue])

  if (!changed || !preview) return null

  return (
    <div className="rk-alert-warning" role="alert">
      <p className="rk-alert-warning__title">
        <span aria-hidden="true">⚠</span> {t('ranker:urlChangeTitle')}
      </p>
      <p>{t('ranker:urlChangeFromTo', { from: preview.oldUrl, to: preview.newUrl })}</p>
      <p>{t('ranker:urlChangeAffected', { count: preview.affected })}</p>
      <label className="rk-alert-warning__confirm">
        <input
          type="checkbox"
          checked={Boolean(value)}
          onChange={(event) => setValue(event.target.checked)}
        />
        {t('ranker:urlChangeConfirm')}
      </label>
    </div>
  )
}
