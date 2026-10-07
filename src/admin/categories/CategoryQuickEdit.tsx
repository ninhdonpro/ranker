'use client'

import { toast, useConfig, useLocale, useTranslation } from '@payloadcms/ui'
import { useRouter } from 'next/navigation'
import { useEffect, useState, type FormEvent } from 'react'

import type { RankerTranslationKeys, RankerTranslations } from '@/admin/translations'
import type { CategoryRow } from '@/lib/categoryTree'

import { serverErrors } from './api'

type Preview = { changed: boolean; oldUrl?: string; newUrl?: string; affected?: number }

type Props = {
  row: CategoryRow
  /** Chỉ Admin được đổi slug (khớp access của field `slug`). */
  isAdmin: boolean
  onClose: () => void
}

/**
 * Sửa nhanh tại dòng (design.md › quick-edit-row): tên và slug. Đổi slug làm URL đổi thì hiện cảnh
 * báo kèm ô xác nhận (server tính qua `url-preview`, và vẫn từ chối lưu nếu chưa xác nhận).
 */
export function CategoryQuickEdit({ row, isAdmin, onClose }: Props) {
  const { t } = useTranslation<RankerTranslations, RankerTranslationKeys>()
  const { config } = useConfig()
  const locale = useLocale()
  const router = useRouter()
  const [name, setName] = useState(row.name)
  const [slug, setSlug] = useState(row.slug)
  const [confirm, setConfirm] = useState(false)
  const [preview, setPreview] = useState<Preview | null>(null)
  const [errors, setErrors] = useState<{ name?: string; slug?: string }>({})
  const [saving, setSaving] = useState(false)

  const api = `${config.serverURL}${config.routes.api}/categories`
  const slugChanged = isAdmin && slug.trim() !== row.slug

  useEffect(() => {
    if (!slugChanged) return
    const controller = new AbortController()
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`${api}/url-preview`, {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: row.id, slug: slug.trim() }),
          signal: controller.signal,
        })
        if (res.ok) {
          const body = (await res.json()) as Preview & { errors?: { message: string }[] }
          setPreview(body)
          if (!body.changed) setConfirm(false)
          setErrors((current) => ({ ...current, slug: body.errors?.[0]?.message }))
        }
      } catch {
        // Bỏ qua: request bị hủy khi người dùng tiếp tục gõ.
      }
    }, 300)
    return () => {
      clearTimeout(timer)
      controller.abort()
    }
  }, [api, row.id, slug, slugChanged])

  // Chỉ dùng kết quả xem trước khi slug đang khác bản gốc (quay lại slug cũ thì không còn cảnh báo).
  const activePreview = slugChanged ? preview : null
  const needsConfirm = Boolean(activePreview?.changed) && !confirm

  async function submit(event: FormEvent) {
    event.preventDefault()
    if (!name.trim()) {
      setErrors({ name: t('ranker:quickEditNameRequired') })
      return
    }
    setSaving(true)
    try {
      const res = await fetch(`${api}/${row.id}?locale=${locale.code}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          ...(slugChanged ? { slug: slug.trim(), confirmUrlChange: confirm } : {}),
        }),
      })
      if (!res.ok) {
        const found: { name?: string; slug?: string } = {}
        for (const error of serverErrors(await res.json().catch(() => null))) {
          if (error.path === 'name' || error.path === 'slug') found[error.path] ??= error.message
        }
        if (Object.keys(found).length > 0) setErrors(found)
        else toast.error(t('ranker:quickEditError'))
        return
      }
      toast.success(t('ranker:quickEditSaved', { name: name.trim() }))
      onClose()
      router.refresh()
    } finally {
      setSaving(false)
    }
  }

  return (
    <form className="rk-quick-edit" onSubmit={submit} noValidate>
      <div className={`rk-field${errors.name ? ' rk-field--error' : ''}`}>
        <label htmlFor={`rk-qe-name-${row.id}`}>{t('ranker:quickEditName')}</label>
        <input
          id={`rk-qe-name-${row.id}`}
          className="rk-input"
          value={name}
          autoFocus
          aria-invalid={Boolean(errors.name)}
          onChange={(event) => setName(event.target.value)}
        />
        {errors.name ? (
          <span className="rk-field__error" role="alert">
            {errors.name}
          </span>
        ) : null}
      </div>

      <div className={`rk-field${errors.slug ? ' rk-field--error' : ''}`}>
        <label htmlFor={`rk-qe-slug-${row.id}`}>{t('ranker:quickEditSlug')}</label>
        <input
          id={`rk-qe-slug-${row.id}`}
          className="rk-input"
          value={slug}
          disabled={!isAdmin}
          aria-invalid={Boolean(errors.slug)}
          onChange={(event) => {
            setSlug(event.target.value)
            setConfirm(false) // đổi slug thì phải xác nhận lại theo URL mới
          }}
        />
        {errors.slug ? (
          <span className="rk-field__error" role="alert">
            {errors.slug}
          </span>
        ) : null}
      </div>

      {activePreview?.changed ? (
        <div className="rk-alert-warning" role="alert">
          <p className="rk-alert-warning__title">
            <span aria-hidden="true">⚠</span> {t('ranker:urlChangeTitle')}
          </p>
          <p>
            {t('ranker:urlChangeFromTo', { from: activePreview.oldUrl, to: activePreview.newUrl })}
          </p>
          <p>{t('ranker:urlChangeAffected', { count: activePreview.affected })}</p>
          <label className="rk-alert-warning__confirm">
            <input
              type="checkbox"
              checked={confirm}
              onChange={(event) => setConfirm(event.target.checked)}
            />
            {t('ranker:urlChangeConfirm')}
          </label>
        </div>
      ) : null}

      <div className="rk-quick-edit__actions">
        <button
          type="submit"
          className="rk-btn rk-btn--primary rk-btn--sm"
          disabled={saving || needsConfirm}
        >
          {t(saving ? 'ranker:quickEditSaving' : 'ranker:quickEditUpdate')}
        </button>
        <button type="button" className="rk-btn rk-btn--secondary rk-btn--sm" onClick={onClose}>
          {t('ranker:quickEditCancel')}
        </button>
      </div>
    </form>
  )
}
