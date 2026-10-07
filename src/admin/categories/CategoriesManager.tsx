'use client'

import { Gutter, useStepNav } from '@payloadcms/ui'
import { useEffect, useState } from 'react'

import type { CategoryRow } from '@/lib/categoryTree'

import { CategoryAddForm } from './CategoryAddForm'
import { CategoryTree } from './CategoryTree'

type Props = {
  title: string
  description?: string
  rows: CategoryRow[]
  /** Admin: được tạo, đổi slug, xóa chuyên mục (khớp access của collection). */
  isAdmin: boolean
}

/**
 * Màn hình Chuyên mục kiểu WordPress (design.md › admin-split-layout): form thêm bên trái, cây
 * bên phải. Giữ trạng thái mở/đóng ở đây để thêm xong thì mở nhánh cha cho thấy dòng mới.
 */
export function CategoriesManager({ title, description, rows, isAdmin }: Props) {
  const { setStepNav } = useStepNav()
  const [preset, setPreset] = useState<{ parentId: number; nonce: number } | null>(null)
  const [expanded, setExpanded] = useState<ReadonlySet<number>>(
    () => new Set(rows.filter((row) => row.level === 0).map((row) => row.id)),
  )

  // Thanh breadcrumb: view danh sách tùy biến phải tự đặt (view mặc định làm việc này).
  useEffect(() => {
    setStepNav([{ label: title }])
  }, [setStepNav, title])

  /** Mở cha và mọi tổ tiên của nó. */
  const reveal = (parentId: number) =>
    setExpanded((current) => {
      const next = new Set(current)
      const byId = new Map(rows.map((row) => [row.id, row]))
      for (let id: number | null = parentId; id !== null; id = byId.get(id)?.parentId ?? null) {
        next.add(id)
      }
      return next
    })

  return (
    <Gutter className="rk-tree-view">
      <header className="rk-tree-view__header">
        <h1 className="rk-tree-view__title">{title}</h1>
        {description ? <p className="rk-tree-view__description">{description}</p> : null}
      </header>
      <div className={`rk-split${isAdmin ? '' : ' rk-split--single'}`}>
        {isAdmin ? <CategoryAddForm rows={rows} preset={preset} onCreated={reveal} /> : null}
        <CategoryTree
          rows={rows}
          expanded={expanded}
          onExpandedChange={setExpanded}
          isAdmin={isAdmin}
          onAddChild={(parentId) => setPreset({ parentId, nonce: Date.now() })}
        />
      </div>
    </Gutter>
  )
}
