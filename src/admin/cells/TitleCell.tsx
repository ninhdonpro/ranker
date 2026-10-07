import type { ClientField, DefaultServerCellComponentProps } from 'payload'

import { getCategoryIndex, getThumbUrl } from './data'
import { TitleCellClient, type Leading } from './TitleCellClient'

type Props = DefaultServerCellComponentProps & {
  /** Field upload chứa ảnh đại diện của dòng (ví dụ `image`, `coverImage`). */
  imageField?: string
  /** Hiện chấm màu của chính chuyên mục (danh sách Chuyên mục). */
  categoryDot?: boolean
}

/** Ô tiêu đề trong bảng danh sách admin: ảnh nhỏ 40px hoặc chấm màu chuyên mục + tiêu đề có link. */
export async function TitleCell({
  imageField,
  categoryDot,
  payload,
  field,
  i18n: _i18n,
  collectionConfig: _collectionConfig,
  ...props
}: Props) {
  let leading: Leading
  if (categoryDot) {
    const category = (await getCategoryIndex(payload)).get(Number(props.rowData.id))
    leading = { kind: 'dot', color: category?.color ?? null }
  } else {
    leading = {
      kind: 'thumb',
      url: await getThumbUrl(payload, props.rowData[imageField ?? ''] ?? null),
    }
  }

  // Field gửi xuống client chỉ cần tên và kiểu để DefaultCell hiển thị giá trị chữ.
  const clientField = { name: 'name' in field ? field.name : 'title', type: 'text' } as ClientField

  return <TitleCellClient {...props} field={clientField} leading={leading} />
}
