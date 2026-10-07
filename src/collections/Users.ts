import { APIError, type CollectionConfig, type PayloadRequest } from 'payload'

import {
  adminOnly,
  adminOnlyField,
  adminOrSelf,
  isStaffUser,
  ROLES,
  staffOnly,
} from '@/access/roles'

const roleLabels: Record<(typeof ROLES)[number], string> = {
  admin: 'Admin',
  editor: 'Biên tập viên',
}

/** Tài khoản nhân sự (vào được trang quản trị). Người dùng công khai sẽ là collection riêng. */
export const Users: CollectionConfig = {
  slug: 'users',
  labels: { singular: 'Người dùng', plural: 'Người dùng' },
  admin: {
    useAsTitle: 'displayName',
    defaultColumns: ['displayName', 'email', 'role'],
  },
  auth: {
    maxLoginAttempts: 5,
    lockTime: 15 * 60 * 1000,
  },
  access: {
    admin: ({ req }) => isStaffUser(req.user),
    // Nhân sự xem được danh sách nhân sự (để hiện tên người tạo, tác giả); chỉ admin tạo/sửa người khác.
    read: staffOnly,
    create: adminOnly,
    update: adminOrSelf,
    delete: adminOnly,
  },
  fields: [
    {
      name: 'displayName',
      label: 'Tên hiển thị',
      type: 'text',
      required: true,
    },
    { name: 'avatar', label: 'Ảnh đại diện', type: 'upload', relationTo: 'media' },
    {
      name: 'role',
      label: 'Vai trò',
      type: 'select',
      required: true,
      defaultValue: 'editor',
      saveToJWT: true,
      options: ROLES.map((value) => ({ value, label: roleLabels[value] })),
      access: {
        create: adminOnlyField,
        update: adminOnlyField,
      },
      admin: {
        position: 'sidebar',
        // Tài khoản đầu tiên luôn là admin (xem hook), không cần chọn.
        condition: (_data, _siblingData, { user }) => Boolean(user),
      },
    },
  ],
  hooks: {
    beforeChange: [
      async ({ data, operation, originalDoc, req }) => {
        // Tài khoản đầu tiên của hệ thống luôn là admin.
        if (operation === 'create') {
          const { totalDocs } = await req.payload.count({ collection: 'users', req })
          if (totalDocs === 0) return { ...data, role: 'admin' }
        }
        // Không hạ vai trò admin cuối cùng.
        if (operation === 'update' && originalDoc?.role === 'admin' && data.role === 'editor') {
          await assertNotLastAdmin(req, originalDoc.id)
        }
        return data
      },
    ],
    beforeDelete: [
      async ({ id, req }) => {
        const doc = await req.payload.findByID({ collection: 'users', id, req, depth: 0 })
        if (doc.role === 'admin') await assertNotLastAdmin(req, id)
      },
    ],
  },
}

async function assertNotLastAdmin(req: PayloadRequest, id: number | string) {
  const { totalDocs } = await req.payload.count({
    collection: 'users',
    where: { and: [{ role: { equals: 'admin' } }, { id: { not_equals: id } }] },
    req,
  })
  if (totalDocs === 0) {
    throw new APIError('Hệ thống phải còn ít nhất một tài khoản Admin.', 400, null, true)
  }
}
