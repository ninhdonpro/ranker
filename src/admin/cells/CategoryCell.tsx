import type { DefaultServerCellComponentProps } from 'payload'

import { relId } from '@/lib/relations'

import { getCategoryIndex } from './data'

/** Ô chuyên mục: chấm màu `cat-*` + tên (design.md › category-dot). */
export async function CategoryCell({ cellData, payload }: DefaultServerCellComponentProps) {
  const id = relId(cellData)
  const category = id ? (await getCategoryIndex(payload)).get(id) : undefined
  if (!category) return null
  return (
    <span className="rk-cat-cell">
      <i
        className="rk-dot"
        style={category.color ? { background: `var(--rk-cat-${category.color})` } : undefined}
      />
      {category.name}
    </span>
  )
}
