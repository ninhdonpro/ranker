import type { UIField } from 'payload'

import { hideFromList } from './hideFromList'

/**
 * Khối thông tin ở đầu cột bên của màn hình sửa: trạng thái, chỉnh sửa lần cuối, ngày tạo
 * (thay cho dòng thông tin nằm ngang của Payload, ẩn bằng CSS). Field giao diện, không lưu dữ liệu.
 */
export const docMetaField = (): UIField =>
  hideFromList({
    name: 'docMeta',
    type: 'ui',
    admin: {
      position: 'sidebar',
      components: { Field: '@/admin/DocMeta#DocMeta' },
    },
  })
