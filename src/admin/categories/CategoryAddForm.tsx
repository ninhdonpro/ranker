'use client'

import { toast, useConfig, useLocale, useTranslation } from '@payloadcms/ui'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState, type FormEvent } from 'react'

import type { RankerTranslationKeys, RankerTranslations } from '@/admin/translations'
import type { CategoryRow } from '@/lib/categoryTree'

import { serverErrors } from './api'

type FieldErrors = Partial<Record<'name' | 'slug' | 'parent', string>>

type Props = {
  rows: CategoryRow[]
  /** "Thêm con" ở một dòng: điền sẵn chuyên mục cha, cuộn tới form và đưa con trỏ vào ô Tên. */
  preset?: { parentId: number; nonce: number } | null
  /** Gọi sau khi thêm xong, kèm id chuyên mục cha. */
  onCreated: (parentId: number) => void
}

/**
 * Form "Thêm chuyên mục" (design.md › admin-split-form). Chỉ gọi REST API chuẩn của Payload;
 * mọi luật của cây (3 tầng, slug, từ khóa dành riêng) do server kiểm tra và trả lỗi. Luôn thêm vào
 * một chuyên mục cha (hai nhóm lớn là cố định); tiền tố URL của mục /review hay /wiki tự kế thừa
 * từ nhóm lớn nên không phải chọn.
 */
export function CategoryAddForm({ rows, preset, onCreated }: Props) {
  const { t } = useTranslation<RankerTranslations, RankerTranslationKeys>()
  const { config } = useConfig()
  const locale = useLocale()
  const router = useRouter()
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [parent, setParent] = useState('')
  const [errors, setErrors] = useState<FieldErrors>({})
  const [submitting, setSubmitting] = useState(false)
  const formRef = useRef<HTMLFormElement>(null)
  const nameRef = useRef<HTMLInputElement>(null)

  // "Thêm con": điền sẵn cha khi có yêu cầu mới (điều chỉnh state ngay lúc render, không dùng effect).
  const [seenNonce, setSeenNonce] = useState<number | null>(null)
  if (preset && preset.nonce !== seenNonce) {
    setSeenNonce(preset.nonce)
    setParent(String(preset.parentId))
  }

  useEffect(() => {
    if (!preset) return
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    nameRef.current?.focus({ preventScroll: true })
  }, [preset])

  // Chỉ chọn được cha ở tầng 0–1 (cây tối đa 3 tầng).
  const parentOptions = rows.filter((row) => row.level < 2)

  async function submit(event: FormEvent) {
    event.preventDefault()
    const next: FieldErrors = {}
    if (!name.trim()) next.name = t('ranker:addNameRequired')
    if (!parent) next.parent = t('ranker:addParentRequired')
    setErrors(next)
    if (Object.keys(next).length > 0) return

    setSubmitting(true)
    try {
      const res = await fetch(
        `${config.serverURL}${config.routes.api}/categories?locale=${locale.code}`,
        {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: name.trim(),
            ...(slug.trim() ? { slug: slug.trim() } : {}),
            parent: Number(parent),
          }),
        },
      )
      if (!res.ok) {
        const found: FieldErrors = {}
        for (const error of serverErrors(await res.json().catch(() => null))) {
          const key = error.path as keyof FieldErrors | undefined
          if (key && ['name', 'slug', 'parent'].includes(key)) found[key] ??= error.message
        }
        if (Object.keys(found).length > 0) setErrors(found)
        else toast.error(t('ranker:addError'))
        return
      }
      toast.success(t('ranker:addSuccess', { name: name.trim() }))
      // Giữ lại chuyên mục cha để thêm liên tiếp nhiều chuyên mục cùng cấp.
      setName('')
      setSlug('')
      setErrors({})
      onCreated(Number(parent))
      router.refresh()
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form className="rk-add-form" ref={formRef} onSubmit={submit} noValidate>
      <h2 className="rk-add-form__title">{t('ranker:addTitle')}</h2>

      <Field id="rk-add-name" label={t('ranker:addName')} error={errors.name}>
        <input
          id="rk-add-name"
          ref={nameRef}
          className="rk-input"
          value={name}
          placeholder={t('ranker:addNamePlaceholder')}
          aria-invalid={Boolean(errors.name)}
          onChange={(event) => setName(event.target.value)}
        />
      </Field>

      <Field id="rk-add-slug" label={t('ranker:addSlug')} error={errors.slug}>
        <input
          id="rk-add-slug"
          className="rk-input"
          value={slug}
          placeholder={t('ranker:addSlugPlaceholder')}
          aria-invalid={Boolean(errors.slug)}
          onChange={(event) => setSlug(event.target.value)}
        />
      </Field>

      <Field id="rk-add-parent" label={t('ranker:addParent')} error={errors.parent}>
        <select
          id="rk-add-parent"
          className="rk-input"
          value={parent}
          aria-invalid={Boolean(errors.parent)}
          onChange={(event) => setParent(event.target.value)}
        >
          <option value="">{t('ranker:addParentPlaceholder')}</option>
          {parentOptions.map((row) => (
            <option key={row.id} value={row.id}>
              {'  '.repeat(row.level)}
              {row.name}
            </option>
          ))}
        </select>
      </Field>

      <div>
        <button
          type="submit"
          className="rk-btn rk-btn--primary rk-btn--block"
          disabled={submitting}
        >
          {t(submitting ? 'ranker:addSubmitting' : 'ranker:addSubmit')}
        </button>
      </div>
    </form>
  )
}

function Field(props: { id: string; label: string; error?: string; children: React.ReactNode }) {
  return (
    <div className={`rk-field${props.error ? ' rk-field--error' : ''}`}>
      <label htmlFor={props.id}>{props.label}</label>
      {props.children}
      {props.error ? (
        <span className="rk-field__error" role="alert">
          {props.error}
        </span>
      ) : null}
    </div>
  )
}
