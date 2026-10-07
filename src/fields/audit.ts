import type { Field, FieldHook } from 'payload'

import { relId } from '@/lib/relations'

const staffId = (user: { collection?: string; id?: number | string } | null | undefined) =>
  user && user.collection === 'users' ? relId(user.id) : null

/** Người tạo: gán một lần khi tạo, không ai sửa được sau đó. */
const setCreatedBy: FieldHook = ({ operation, originalDoc, req, value }) => {
  if (operation === 'create') return staffId(req.user) ?? relId(value)
  return relId(originalDoc?.createdBy)
}

/** Người sửa cuối: luôn là người đang thao tác (nếu có). */
const setUpdatedBy: FieldHook = ({ originalDoc, req, value }) =>
  staffId(req.user) ?? relId(value) ?? relId(originalDoc?.updatedBy)

/**
 * Ghi nhận người đóng góp (dùng cho chia doanh thu sau này). Giá trị do hook đặt từ
 * `req.user`, mọi giá trị gửi lên qua API đều bị bỏ qua (trừ Local API không có user, ví dụ seed).
 */
export const auditFields = (): Field[] => [
  {
    name: 'createdBy',
    label: 'Người tạo',
    type: 'relationship',
    relationTo: 'users',
    index: true,
    admin: { position: 'sidebar', readOnly: true },
    hooks: { beforeChange: [setCreatedBy] },
  },
  {
    name: 'updatedBy',
    label: 'Người sửa cuối',
    type: 'relationship',
    relationTo: 'users',
    admin: { position: 'sidebar', readOnly: true },
    hooks: { beforeChange: [setUpdatedBy] },
  },
]
