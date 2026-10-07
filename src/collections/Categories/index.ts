import { createBreadcrumbsField } from '@payloadcms/plugin-nested-docs'
import {
  MetaDescriptionField,
  MetaTitleField,
  OverviewField,
  PreviewField,
} from '@payloadcms/plugin-seo/fields'
import { ValidationError, type CollectionConfig, type Where } from 'payload'

import { adminOnly, adminOnlyField, isAdminUser, staffOnly } from '@/access/roles'
import { safeDeleteEndpoints } from '@/endpoints/safeDelete'
import { auditFields } from '@/fields/audit'
import { slugFields } from '@/fields/slug'
import { urlChangeConfirmField } from '@/fields/urlChangeConfirm'
import { redirectOnUrlChange } from '@/hooks/redirectOnUrlChange'
import { editorFull } from '@/lexical/editors'
import { relId } from '@/lib/relations'
import { vnSlugify } from '@/lib/slug'
import { categoryUrl } from '@/lib/url'
import type { Category } from '@/payload-types'

import { MAX_LEVEL, resolvePlacement } from './placement'
import { urlPreviewEndpoint } from './urlPreview'

/** Màu chuyên mục lấy từ token `cat-*` trong docs/design.md. */
const CATEGORY_COLORS = [
  { value: 'tech', label: 'Xanh thép (cat-tech)' },
  { value: 'food', label: 'Gỉ sắt (cat-food)' },
  { value: 'beauty', label: 'Hồng berry (cat-beauty)' },
  { value: 'finance', label: 'Lục bảo (cat-finance)' },
  { value: 'travel', label: 'Xanh cổ vịt (cat-travel)' },
  { value: 'film', label: 'Tím đậm (cat-film)' },
  { value: 'music', label: 'Mận (cat-music)' },
  { value: 'education', label: 'Đồng (cat-education)' },
]

/** Field chỉ admin được đổi; giá trị biên tập viên gửi lên bị bỏ qua. */
type MoveField = 'slug' | 'parent' | 'itemRoute'

export const Categories: CollectionConfig = {
  slug: 'categories',
  labels: { singular: 'Chuyên mục', plural: 'Chuyên mục' },
  orderable: true,
  admin: {
    components: { edit: { editMenuItems: ['@/admin/SafeDeleteMenuItem#SafeDeleteMenuItem'] } },
    useAsTitle: 'name',
    defaultColumns: ['name', 'path', 'level', 'updatedAt'],
    description:
      'Ba tầng: Nhóm lớn › Chuyên mục › Chuyên mục con. Chỉ Admin được tạo, di chuyển, đổi slug hoặc xóa chuyên mục.',
  },
  access: {
    read: staffOnly,
    create: adminOnly,
    update: staffOnly,
    // Không xóa trực tiếp qua API/nút mặc định: dùng "Xóa…" (gõ tên để xác nhận, endpoint safe-delete).
    delete: () => false,
  },
  endpoints: [urlPreviewEndpoint, ...safeDeleteEndpoints('categories')],
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Nội dung',
          fields: [
            { name: 'name', label: 'Tên', type: 'text', required: true, localized: true },
            {
              name: 'description',
              label: 'Mô tả ngắn',
              type: 'textarea',
              localized: true,
              admin: { description: 'Hiện ở banner đầu trang chuyên mục (1–2 câu).' },
            },
            {
              name: 'about',
              label: 'Giới thiệu',
              type: 'richText',
              localized: true,
              editor: editorFull(),
            },
            {
              name: 'faq',
              label: 'Câu hỏi thường gặp',
              localized: true,
              labels: { singular: 'Câu hỏi', plural: 'Câu hỏi' },
              type: 'array',
              fields: [
                { name: 'question', label: 'Câu hỏi', type: 'text', required: true },
                { name: 'answer', label: 'Trả lời', type: 'textarea', required: true },
              ],
            },
          ],
        },
        {
          name: 'meta',
          label: 'SEO',
          fields: [
            OverviewField({ titlePath: 'meta.title', descriptionPath: 'meta.description' }),
            MetaTitleField({ hasGenerateFn: true }),
            MetaDescriptionField({ hasGenerateFn: true }),
            PreviewField({
              hasGenerateFn: true,
              titlePath: 'meta.title',
              descriptionPath: 'meta.description',
            }),
          ],
        },
      ],
    },
    slugFields({ useAsSlug: 'name', disableUnique: true, update: adminOnlyField }),
    urlChangeConfirmField(),
    {
      name: 'parent',
      label: 'Chuyên mục cha',
      type: 'relationship',
      relationTo: 'categories',
      index: true,
      maxDepth: 0,
      access: { update: adminOnlyField },
      admin: {
        position: 'sidebar',
        description: 'Để trống nếu đây là nhóm lớn.',
      },
      // Chỉ chọn được cha ở tầng 0–1, cùng nhóm lớn, không phải chính nó hay con cháu của nó.
      filterOptions: ({ data, id }) => {
        if (id && data?.level === 0) return false // nhóm lớn không có cha
        const where: Where[] = [{ level: { less_than: MAX_LEVEL } }]
        if (id) where.push({ id: { not_equals: id } }, { 'breadcrumbs.doc': { not_in: [id] } })
        const group = relId(data?.group)
        if (id && group) {
          where.push({ or: [{ id: { equals: group } }, { group: { equals: group } }] })
        }
        return { and: where }
      },
    },
    {
      name: 'itemRoute',
      label: 'Tiền tố URL của mục',
      type: 'select',
      options: [
        { value: 'review', label: '/review — Sản phẩm & Dịch vụ' },
        { value: 'wiki', label: '/wiki — Thông tin' },
      ],
      access: { update: adminOnlyField },
      admin: {
        position: 'sidebar',
        description: 'Chỉ đặt ở nhóm lớn, không đổi được sau khi tạo. Chuyên mục con kế thừa.',
        condition: (data) => !data?.parent,
      },
    },
    {
      name: 'path',
      label: 'Đường dẫn',
      type: 'text',
      unique: true,
      index: true,
      admin: {
        position: 'sidebar',
        readOnly: true,
        description: 'Tự tính từ slug và chuyên mục cha.',
      },
    },
    {
      name: 'level',
      label: 'Tầng',
      type: 'number',
      index: true,
      admin: {
        position: 'sidebar',
        readOnly: true,
        description: '0 = nhóm lớn, 1 = chuyên mục, 2 = chuyên mục con.',
      },
    },
    {
      name: 'group',
      label: 'Nhóm lớn',
      type: 'relationship',
      relationTo: 'categories',
      index: true,
      maxDepth: 0,
      admin: { hidden: true },
    },
    { name: 'icon', label: 'Biểu tượng (emoji)', type: 'text', admin: { position: 'sidebar' } },
    {
      name: 'color',
      label: 'Màu chuyên mục',
      type: 'select',
      options: CATEGORY_COLORS,
      admin: { position: 'sidebar' },
    },
    createBreadcrumbsField('categories', { localized: false, admin: { hidden: true } }),
    ...auditFields(),
  ],
  hooks: {
    beforeValidate: [
      ({ data, operation, req }) => {
        if (!data) return data
        // Field ảo `confirmUrlChange` bị bỏ khỏi `data` trước beforeChange, nên ghi nhận ở đây.
        // Cờ nằm trong context nên các chuyên mục con được plugin lưu lại theo cũng nhận được.
        if (data.confirmUrlChange === true) req.context.urlChangeConfirmed = true
        // Slug luôn ở dạng chuẩn; khi tạo mà để trống thì sinh từ tên.
        if (typeof data.slug === 'string' && data.slug) data.slug = vnSlugify(data.slug)
        else if (operation === 'create' && data.name) data.slug = vnSlugify(data.name)
        return data
      },
    ],
    beforeChange: [
      async ({ data, operation, originalDoc, req }) => {
        const original = operation === 'update' ? (originalDoc as Category) : null
        // Biên tập viên không đổi được slug/cha/tiền tố: luôn dùng giá trị đang lưu.
        const canMove = !req.user || isAdminUser(req.user)
        const pick = (key: MoveField) =>
          canMove && data[key] !== undefined ? data[key] : original?.[key]

        const result = await resolvePlacement(req, {
          id: original?.id ?? null,
          slug: pick('slug'),
          parent: pick('parent'),
          itemRoute: pick('itemRoute'),
          original,
        })
        if (!result.ok) {
          throw new ValidationError({ collection: 'categories', errors: result.errors, req }, req.t)
        }
        const { placement } = result

        if (original && original.path !== placement.path) {
          // Đọc qua `req.context`: các lời gọi Local API ở trên đã thay nó bằng bản sao.
          if (!req.context.urlChangeConfirmed) {
            throw new ValidationError(
              {
                collection: 'categories',
                req,
                errors: [
                  {
                    path: 'slug',
                    message:
                      'Chuyên mục này đã có URL công khai. Hãy tick "Tôi xác nhận đổi URL" để đổi (hệ thống sẽ tạo redirect 301).',
                  },
                ],
              },
              req.t,
            )
          }
        }

        return { ...data, ...placement }
      },
    ],
    afterChange: [
      redirectOnUrlChange<Category>({ getUrl: (doc) => (doc.path ? categoryUrl(doc.path) : null) }),
    ],
  },
}
