'use client'

import { DefaultCell, useListDrawerContext } from '@payloadcms/ui'
import type { DefaultCellComponentProps } from 'payload'

import { ImageIcon } from '@/admin/dashboard/icons'

export type Leading = { kind: 'thumb'; url: string | null } | { kind: 'dot'; color: string | null }

type Props = DefaultCellComponentProps & { leading: Leading }

function LeadingVisual({ leading }: { leading: Leading }) {
  if (leading.kind === 'dot') {
    return (
      <i
        className="rk-dot"
        style={leading.color ? { background: `var(--rk-cat-${leading.color})` } : undefined}
      />
    )
  }
  return (
    <span className="rk-thumb">
      {leading.url ? (
        // eslint-disable-next-line @next/next/no-img-element -- ảnh 40px từ R2, không qua next/image
        <img src={leading.url} alt="" loading="lazy" width={40} height={40} />
      ) : (
        <ImageIcon />
      )}
    </span>
  )
}

/**
 * Cột tiêu đề (cột có link) kèm ảnh nhỏ hoặc chấm màu phía trước. Giữ nguyên hành vi của Payload:
 * trong trang danh sách là link mở tài liệu, trong drawer chọn tài liệu thì bấm để chọn
 * (cùng logic với RenderDefaultCell của Payload).
 */
export function TitleCellClient({ leading, ...props }: Props) {
  const { drawerSlug, onSelect } = useListDrawerContext()
  const cellProps: DefaultCellComponentProps = { ...props }
  if (drawerSlug && props.link) {
    cellProps.link = false
    cellProps.className = 'default-cell__first-cell'
    // Giống RenderDefaultCell của Payload: truyền nguyên id (kiểu khai báo là string).
    cellProps.onClick = ({ collectionSlug, rowData }) =>
      onSelect?.({ collectionSlug, doc: rowData, docID: rowData.id as string })
  }
  return (
    <span className="rk-title-cell">
      <LeadingVisual leading={leading} />
      <DefaultCell {...cellProps} />
    </span>
  )
}
