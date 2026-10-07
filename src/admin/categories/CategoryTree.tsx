'use client'

import {
  DraggableSortable,
  DraggableSortableItem,
  toast,
  useConfig,
  useDocumentDrawer,
  useLocale,
  useModal,
  useTranslation,
} from '@payloadcms/ui'
import { useRouter } from 'next/navigation'
import { useMemo, useState, type CSSProperties } from 'react'

import { SafeDeleteModal, safeDeleteModalSlug } from '@/admin/SafeDeleteMenuItem'
import type { RankerTranslationKeys, RankerTranslations } from '@/admin/translations'
import {
  filterCategoryRows,
  moveCategoryBlock,
  parentIdsOf,
  visibleCategoryRows,
  type CategoryRow,
} from '@/lib/categoryTree'
import { categoryUrl } from '@/lib/url'

import { CategoryQuickEdit } from './CategoryQuickEdit'

/** Thuộc tính chung của icon nét 16px (design.md › icon trong admin: stroke 2px, đầu nét tròn). */
const ICON = {
  width: 16,
  height: 16,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
} as const

type Props = {
  rows: CategoryRow[]
  expanded: ReadonlySet<number>
  onExpandedChange: (expanded: ReadonlySet<number>) => void
  /** Admin: được sửa slug, thêm con, xóa. */
  isAdmin: boolean
  onAddChild: (parentId: number) => void
}

/**
 * Cây chuyên mục (design.md › tree-row, tree-toggle, row-action, quick-edit-row): một cột Tên, con
 * thụt lề 24px mỗi tầng, thao tác luôn hiện dưới tên. Nhóm lớn mở sẵn, các tầng dưới thu gọn: chỉ
 * những dòng đang hiện mới được vẽ, nên danh sách hàng trăm chuyên mục vẫn nhẹ. "Chỉnh sửa" mở popup
 * (drawer) sửa đầy đủ; "Sửa nhanh" sửa tên/slug tại dòng; kéo tay ⋮⋮ đổi thứ tự giữa các chuyên
 * mục cùng cha (gọi /api/reorder của Payload); ô tìm kiếm lọc theo tên, không dấu.
 */
export function CategoryTree({ rows, expanded, onExpandedChange, isAdmin, onAddChild }: Props) {
  const { t } = useTranslation<RankerTranslations, RankerTranslationKeys>()
  const { config } = useConfig()
  const locale = useLocale()
  const router = useRouter()
  const [localRows, setLocalRows] = useState(rows)
  const [query, setQuery] = useState('')
  const [editingId, setEditingId] = useState<number | null>(null)

  // Dữ liệu mới từ server (sau router.refresh) thay thế bản cập nhật tạm khi kéo-thả.
  const [prevRows, setPrevRows] = useState(rows)
  if (rows !== prevRows) {
    setPrevRows(rows)
    setLocalRows(rows)
  }

  const parents = useMemo(() => parentIdsOf(localRows), [localRows])
  const searching = query.trim() !== ''
  const searchResult = useMemo(() => filterCategoryRows(localRows, query), [localRows, query])
  const visible = useMemo(
    () => searchResult ?? visibleCategoryRows(localRows, expanded),
    [searchResult, localRows, expanded],
  )

  const toggle = (id: number) => {
    const next = new Set(expanded)
    if (!next.delete(id)) next.add(id)
    onExpandedChange(next)
  }

  async function onDragEnd({
    moveFromIndex,
    moveToIndex,
  }: {
    moveFromIndex: number
    moveToIndex: number
  }) {
    const from = visible[moveFromIndex]
    const over = visible[moveToIndex]
    if (!from || !over || from.id === over.id) return
    if (from.parentId !== over.parentId) {
      toast.error(t('ranker:reorderSameParent'))
      return
    }
    if (!over.order) return
    const down = moveToIndex > moveFromIndex
    const previous = localRows
    setLocalRows(moveCategoryBlock(localRows, from.id, over.id, down ? 'after' : 'before'))
    try {
      const res = await fetch(
        `${config.serverURL}${config.routes.api}/reorder?locale=${locale.code}`,
        {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            collectionSlug: 'categories',
            docsToMove: [from.id],
            newKeyWillBe: down ? 'greater' : 'less',
            orderableFieldName: '_order',
            target: { id: over.id, key: over.order },
          }),
        },
      )
      if (!res.ok) throw new Error(String(res.status))
      router.refresh()
    } catch {
      setLocalRows(previous)
      toast.error(t('ranker:reorderError'))
    }
  }

  if (rows.length === 0) return <p className="rk-tree-empty">{t('ranker:treeEmpty')}</p>

  return (
    <div className="rk-tree">
      <div className="rk-tree-toolbar">
        <button
          type="button"
          className="rk-text-btn"
          onClick={() => onExpandedChange(new Set(parents))}
        >
          {t('ranker:treeExpandAll')}
          <svg {...ICON} aria-hidden="true">
            <path d="m7 15 5 5 5-5" />
            <path d="m7 9 5-5 5 5" />
          </svg>
        </button>
        <button type="button" className="rk-text-btn" onClick={() => onExpandedChange(new Set())}>
          {t('ranker:treeCollapseAll')}
          <svg {...ICON} aria-hidden="true">
            <path d="m7 20 5-5 5 5" />
            <path d="m7 4 5 5 5-5" />
          </svg>
        </button>
        <input
          type="search"
          className="rk-input rk-input--sm rk-tree-search"
          value={query}
          placeholder={t('ranker:treeSearch')}
          aria-label={t('ranker:treeSearch')}
          onChange={(event) => setQuery(event.target.value)}
        />
      </div>
      <DraggableSortable ids={visible.map((row) => String(row.id))} onDragEnd={onDragEnd}>
        <table className="rk-tree-table">
          <thead>
            <tr>
              <th>{t('ranker:treeColumnName')}</th>
            </tr>
          </thead>
          <tbody>
            {visible.map((row) => (
              <TreeRow
                key={row.id}
                row={row}
                isAdmin={isAdmin}
                hasChildren={!searching && parents.has(row.id)}
                isExpanded={expanded.has(row.id)}
                dragDisabled={searching || editingId !== null}
                editing={editingId === row.id}
                onToggle={() => toggle(row.id)}
                onEdit={(editing) => setEditingId(editing ? row.id : null)}
                onAddChild={() => onAddChild(row.id)}
              />
            ))}
          </tbody>
        </table>
      </DraggableSortable>
      {searching && visible.length === 0 ? (
        <p className="rk-tree-empty">{t('ranker:treeNoResults')}</p>
      ) : null}
    </div>
  )
}

type RowProps = {
  row: CategoryRow
  isAdmin: boolean
  hasChildren: boolean
  isExpanded: boolean
  dragDisabled: boolean
  editing: boolean
  onToggle: () => void
  onEdit: (editing: boolean) => void
  onAddChild: () => void
}

function TreeRow({
  row,
  isAdmin,
  hasChildren,
  isExpanded,
  dragDisabled,
  editing,
  onToggle,
  onEdit,
  onAddChild,
}: RowProps) {
  const { t } = useTranslation<RankerTranslations, RankerTranslationKeys>()
  const router = useRouter()
  const { openModal } = useModal()
  const [DocumentDrawer, , { openDrawer }] = useDocumentDrawer({
    collectionSlug: 'categories',
    id: row.id,
  })
  const deleteSlug = safeDeleteModalSlug('categories', row.id)

  return (
    <DraggableSortableItem id={String(row.id)} disabled={dragDisabled}>
      {({ attributes, listeners, setNodeRef, transform, transition, isDragging }) => (
        <tr
          ref={setNodeRef}
          className={isDragging ? 'rk-tree-row--dragging' : undefined}
          style={{ transform, transition }}
        >
          <td>
            {editing ? (
              <div style={{ '--rk-depth': row.level } as CSSProperties} className="rk-tree-edit">
                <CategoryQuickEdit row={row} isAdmin={isAdmin} onClose={() => onEdit(false)} />
              </div>
            ) : (
              <div
                className={`rk-tree-row${row.level === 0 ? ' rk-tree-row--group' : ''}`}
                style={{ '--rk-depth': row.level } as CSSProperties}
              >
                <button
                  type="button"
                  className="rk-tree-handle"
                  disabled={dragDisabled}
                  aria-label={t('ranker:treeDragHandle', { name: row.name })}
                  {...attributes}
                  {...listeners}
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <circle cx="9" cy="6" r="1.6" />
                    <circle cx="15" cy="6" r="1.6" />
                    <circle cx="9" cy="12" r="1.6" />
                    <circle cx="15" cy="12" r="1.6" />
                    <circle cx="9" cy="18" r="1.6" />
                    <circle cx="15" cy="18" r="1.6" />
                  </svg>
                </button>
                <div className="rk-tree-row__indent">
                  {hasChildren ? (
                    <button
                      type="button"
                      className="rk-tree-toggle"
                      aria-expanded={isExpanded}
                      aria-label={t(isExpanded ? 'ranker:treeCollapse' : 'ranker:treeExpand', {
                        name: row.name,
                      })}
                      onClick={onToggle}
                    >
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        <path d="m9 6 6 6-6 6" />
                      </svg>
                    </button>
                  ) : (
                    <span className="rk-tree-toggle rk-tree-toggle--spacer" aria-hidden="true" />
                  )}
                  <div className="rk-tree-row__main">
                    <span className="rk-tree-row__name">
                      <i
                        className="rk-dot"
                        style={row.color ? { background: `var(--rk-cat-${row.color})` } : undefined}
                      />
                      {row.name}
                    </span>
                    <div className="rk-row-actions">
                      <button type="button" onClick={openDrawer}>
                        {t('ranker:treeEdit')}
                      </button>
                      <button type="button" onClick={() => onEdit(true)}>
                        {t('ranker:treeQuickEdit')}
                      </button>
                      {isAdmin && row.level < 2 ? (
                        <button type="button" onClick={onAddChild}>
                          {t('ranker:treeAddChild')}
                        </button>
                      ) : null}
                      {isAdmin ? (
                        <button
                          type="button"
                          className="rk-row-actions__danger"
                          onClick={() => openModal(deleteSlug)}
                        >
                          {t('ranker:treeDelete')}
                        </button>
                      ) : null}
                      {row.path ? (
                        <a href={categoryUrl(row.path)} target="_blank" rel="noopener noreferrer">
                          {t('ranker:treeView')}
                        </a>
                      ) : null}
                    </div>
                  </div>
                </div>
              </div>
            )}
            <DocumentDrawer onSave={() => router.refresh()} />
            <SafeDeleteModal collectionSlug="categories" id={row.id} modalSlug={deleteSlug} />
          </td>
        </tr>
      )}
    </DraggableSortableItem>
  )
}
