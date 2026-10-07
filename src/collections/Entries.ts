import { ValidationError, type CollectionConfig } from 'payload'

import { staffOnly } from '@/access/roles'
import { auditFields } from '@/fields/audit'
import { editorCompact } from '@/lexical/editors'
import { relId } from '@/lib/relations'
import type { Entry } from '@/payload-types'

/**
 * Suất tham gia: một mục nằm trong một bảng. Là bản ghi riêng có ID ổn định để sau này gắn
 * vote, thứ hạng, xu hướng, tài trợ, affiliate và người đóng góp. Quản lý ngay trong màn hình
 * sửa bảng (tab "Các mục"), không có menu riêng.
 */
export const Entries: CollectionConfig = {
  slug: 'entries',
  labels: { singular: 'Suất tham gia', plural: 'Suất tham gia' },
  admin: {
    // Ẩn khỏi menu nhưng vẫn mở được trong drawer của bảng.
    group: false,
    useAsTitle: 'itemName',
    defaultColumns: ['itemName', 'list', 'updatedAt'],
  },
  access: {
    read: staffOnly,
    create: staffOnly,
    update: staffOnly,
    delete: staffOnly,
  },
  // Lịch sử phiên bản (không có nháp): mỗi lần sửa lưu lại nội dung kèm `updatedBy`, làm dữ liệu
  // ghi nhận người đóng góp cho chia doanh thu sau này.
  versions: { maxPerDoc: 100 },
  // Một mục không xuất hiện hai lần trong cùng một bảng (chặn ở DB).
  indexes: [{ fields: ['list', 'item'], unique: true }],
  fields: [
    {
      name: 'list',
      label: 'Bảng xếp hạng',
      type: 'relationship',
      relationTo: 'lists',
      required: true,
      index: true,
      maxDepth: 0,
      admin: { readOnly: true },
    },
    {
      name: 'item',
      label: 'Mục',
      type: 'relationship',
      relationTo: 'items',
      required: true,
      index: true,
      maxDepth: 1,
      admin: {
        allowCreate: true,
        description: 'Chọn mục có sẵn, hoặc bấm + để tạo mục mới ngay tại đây.',
      },
    },
    {
      name: 'itemName',
      label: 'Mục',
      type: 'text',
      virtual: 'item.name',
      admin: { hidden: true },
    },
    {
      name: 'blurb',
      label: 'Mô tả theo ngữ cảnh',
      type: 'richText',
      localized: true,
      editor: editorCompact(),
      admin: {
        description:
          'Vì sao mục này có mặt trong bảng này (khác với mô tả chung của mục). Ví dụ trong bảng "chụp ảnh đẹp" thì nói về camera.',
      },
    },
    ...auditFields(),
  ],
  hooks: {
    beforeChange: [
      async ({ data, operation, originalDoc, req }) => {
        const original = originalDoc as Entry | undefined
        const list = relId(data.list ?? original?.list)
        const item = relId(data.item ?? original?.item)

        // Suất gắn chặt với một bảng và một mục (vote, đóng góp sẽ gắn vào đây):
        // muốn đổi thì gỡ suất này và thêm suất mới.
        if (operation === 'update' && original) {
          if (list !== relId(original.list) || item !== relId(original.item)) {
            throw new ValidationError(
              {
                collection: 'entries',
                req,
                errors: [
                  {
                    path: 'item',
                    message:
                      'Không đổi được mục hoặc bảng của một suất đã tạo. Hãy gỡ suất này và thêm mục khác.',
                  },
                ],
              },
              req.t,
            )
          }
        }

        if (list && item) {
          const { docs } = await req.payload.find({
            collection: 'entries',
            where: {
              and: [
                { list: { equals: list } },
                { item: { equals: item } },
                ...(original?.id ? [{ id: { not_equals: original.id } }] : []),
              ],
            },
            depth: 0,
            limit: 1,
            req,
          })
          if (docs[0]) {
            const existing = await req.payload.findByID({
              collection: 'items',
              id: item,
              draft: true,
              depth: 0,
              req,
              disableErrors: true,
            })
            throw new ValidationError(
              {
                collection: 'entries',
                req,
                errors: [
                  { path: 'item', message: `Mục "${existing?.name ?? ''}" đã có trong bảng này.` },
                ],
              },
              req.t,
            )
          }
        }
        return data
      },
    ],
  },
}
