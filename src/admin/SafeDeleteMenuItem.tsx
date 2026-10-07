'use client'

import {
  Button,
  Modal,
  PopupList,
  TextInput,
  toast,
  useAuth,
  useConfig,
  useDocumentInfo,
  useModal,
  useTranslation,
} from '@payloadcms/ui'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

import { isAdminUser, type Role } from '@/access/roles'
import type { DeleteImpact, ImpactDoc } from '@/lib/deletion'

import type { RankerTranslationKeys, RankerTranslations } from './translations'

type Group = { docs: ImpactDoc[]; total: number }

/**
 * Mục "Xóa…" trong menu ⋮ của trang sửa Bảng, Mục, Chuyên mục (chỉ Admin thấy). Thay cho nút
 * xóa mặc định: hiện những gì bị ảnh hưởng và chỉ cho xóa khi gõ đúng tên. Server kiểm tra lại
 * mọi điều kiện (endpoint `safe-delete`).
 */
export function SafeDeleteMenuItem() {
  const { user } = useAuth<{ collection: string; role?: Role }>()
  const { id, collectionSlug } = useDocumentInfo()
  const { openModal } = useModal()
  const { t } = useTranslation<RankerTranslations, RankerTranslationKeys>()

  if (!id || !collectionSlug || !isAdminUser(user)) return null
  const slug = `rk-safe-delete-${collectionSlug}-${id}`

  return (
    <>
      <PopupList.Button onClick={() => openModal(slug)}>{t('ranker:deleteMenu')}</PopupList.Button>
      <SafeDeleteModal collectionSlug={collectionSlug} id={id} modalSlug={slug} />
    </>
  )
}

type DialogProps = { collectionSlug: string; id: number | string; modalSlug: string }

function SafeDeleteModal(props: DialogProps) {
  const { isModalOpen } = useModal()
  // Chỉ mount nội dung khi mở: mỗi lần mở bắt đầu với trạng thái mới.
  return isModalOpen(props.modalSlug) ? <SafeDeleteDialog {...props} /> : null
}

function SafeDeleteDialog({ collectionSlug, id, modalSlug }: DialogProps) {
  const { t } = useTranslation<RankerTranslations, RankerTranslationKeys>()
  const { config } = useConfig()
  const { closeModal } = useModal()
  const router = useRouter()
  const [impact, setImpact] = useState<DeleteImpact | null>(null)
  const [typed, setTyped] = useState('')
  const [error, setError] = useState('')
  const [deleting, setDeleting] = useState(false)

  const api = `${config.serverURL}${config.routes.api}/${collectionSlug}/${id}`
  const adminCollection = (slug: string) => `${config.routes.admin}/collections/${slug}`

  useEffect(() => {
    fetch(`${api}/delete-impact`, { credentials: 'include' })
      .then(async (res) => {
        const body = await res.json()
        if (res.ok) setImpact(body as DeleteImpact)
        else setError(body.error)
      })
      .catch(() => setError(t('general:error')))
  }, [api, t])

  const matches = impact !== null && typed.trim() === impact.name.trim()
  const close = () => !deleting && closeModal(modalSlug)

  const onDelete = async () => {
    if (!impact || !matches) return
    setDeleting(true)
    setError('')
    const res = await fetch(`${api}/safe-delete`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ confirmation: typed }),
    })
    setDeleting(false)
    if (!res.ok) {
      setError(((await res.json()) as { error: string }).error)
      return
    }
    closeModal(modalSlug)
    toast.success(t('ranker:deleteSuccess', { name: impact.name }))
    router.push(adminCollection(collectionSlug))
  }

  const docLinks = (slug: string, docs: ImpactDoc[]) => (
    <ul className="rk-danger-dialog__docs">
      {docs.map((doc) => (
        <li key={doc.id}>
          <a href={`${adminCollection(slug)}/${doc.id}`} target="_blank" rel="noreferrer">
            {doc.title}
          </a>
        </li>
      ))}
    </ul>
  )

  const categoryGroup = (
    group: Group | undefined,
    slug: string,
    filterField: string,
    label:
      'ranker:deleteCategoryChildren' | 'ranker:deleteCategoryItems' | 'ranker:deleteCategoryLists',
  ) =>
    group && group.total > 0 ? (
      <li>
        <strong>{t(label, { count: group.total })}</strong> ·{' '}
        <a
          href={`${adminCollection(slug)}?where[${filterField}][equals]=${id}`}
          target="_blank"
          rel="noreferrer"
        >
          {t('ranker:deleteViewAll')}
        </a>
        {docLinks(slug, group.docs)}
      </li>
    ) : null

  return (
    <Modal className="confirmation-modal rk-danger-dialog" closeOnBlur={false} slug={modalSlug}>
      <div className="confirmation-modal__wrapper rk-danger-dialog__box" role="alertdialog">
        <div className="confirmation-modal__content">
          <h2>
            {impact ? t('ranker:deleteHeading', { name: impact.name }) : t('ranker:deleteMenu')}
          </h2>

          {!impact && !error ? <p>{t('ranker:deleteLoading')}</p> : null}

          {impact?.listsContaining ? (
            impact.listsContaining.length ? (
              <>
                <p>{t('ranker:deleteItemLists', { count: impact.listsContaining.length })}</p>
                {docLinks('lists', impact.listsContaining)}
              </>
            ) : (
              <p>{t('ranker:deleteItemNoLists')}</p>
            )
          ) : null}

          {impact?.entryCount !== undefined ? (
            <p>{t('ranker:deleteListEntries', { count: impact.entryCount })}</p>
          ) : null}

          {impact?.blocked ? (
            <>
              <p className="rk-danger-dialog__error">
                <span aria-hidden="true">⚠</span> {t('ranker:deleteCategoryBlocked')}
              </p>
              <ul className="rk-danger-dialog__groups">
                {categoryGroup(
                  impact.children,
                  'categories',
                  'parent',
                  'ranker:deleteCategoryChildren',
                )}
                {categoryGroup(impact.lists, 'lists', 'category', 'ranker:deleteCategoryLists')}
                {categoryGroup(impact.items, 'items', 'category', 'ranker:deleteCategoryItems')}
              </ul>
            </>
          ) : null}

          {impact && !impact.blocked && collectionSlug === 'categories' ? (
            <p>{t('ranker:deleteCategoryEmpty')}</p>
          ) : null}

          {impact && !impact.blocked ? (
            <>
              <p className="rk-danger-dialog__warning">
                <span aria-hidden="true">⚠</span> {t('ranker:deleteIrreversible')}
              </p>
              <TextInput
                label={t('ranker:deleteTypeToConfirm', { name: impact.name })}
                path="rk-safe-delete-confirmation"
                value={typed}
                onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                  setTyped(event.target.value)
                }
              />
            </>
          ) : null}

          {error ? (
            <p className="rk-danger-dialog__error" role="alert">
              <span aria-hidden="true">⚠</span> {error}
            </p>
          ) : null}
        </div>

        <div className="confirmation-modal__controls">
          <Button
            buttonStyle="secondary"
            disabled={deleting}
            onClick={close}
            size="large"
            type="button"
          >
            {impact?.blocked ? t('ranker:deleteClose') : t('ranker:deleteCancel')}
          </Button>
          {impact && !impact.blocked ? (
            <Button
              className="rk-danger-dialog__delete"
              disabled={!matches || deleting}
              onClick={onDelete}
              size="large"
              type="button"
            >
              {deleting ? t('ranker:deleteDeleting') : t('ranker:deleteConfirm')}
            </Button>
          ) : null}
        </div>
      </div>
    </Modal>
  )
}
