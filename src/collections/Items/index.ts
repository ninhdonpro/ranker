import {
  MetaDescriptionField,
  MetaImageField,
  MetaTitleField,
  OverviewField,
  PreviewField,
} from '@payloadcms/plugin-seo/fields'
import { ValidationError, type CollectionConfig, type TextFieldSingleValidation } from 'payload'

import { staffOnly } from '@/access/roles'
import { safeDeleteEndpoints } from '@/endpoints/safeDelete'
import { auditFields } from '@/fields/audit'
import { slugFields } from '@/fields/slug'
import { statusColumnField } from '@/fields/statusColumn'
import { urlChangeConfirmField } from '@/fields/urlChangeConfirm'
import { applyAutoSlug } from '@/hooks/autoSlug'
import {
  captureUrlChangeConfirmation,
  findPublished,
  guardPublishedUrlChange,
  publishedAtField,
  redirectOnPublishedUrlChange,
  stampPublishedAt,
} from '@/hooks/publishedUrl'
import { editorFull } from '@/lexical/editors'
import type { Item } from '@/payload-types'

import { attributeBlocks } from './attributes'
import { resolveItemUrl } from './placement'
import { findItemBySlug, slugCandidates } from './slugSuggestions'
import { itemUrlPreviewEndpoint } from './urlPreview'

const YOUTUBE_URL = /^https:\/\/(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)[\w-]{11}/

const validateYoutube: TextFieldSingleValidation = (value, { siblingData }) => {
  if ((siblingData as { kind?: string })?.kind !== 'video') return true
  return (
    (typeof value === 'string' && YOUTUBE_URL.test(value)) ||
    'Nhập link YouTube dạng https://www.youtube.com/watch?v=... hoặc https://youtu.be/...'
  )
}

/**
 * Mục: một "thứ" được xếp hạng (Phở Thìn, iPhone 17, một ca sĩ). Tồn tại một lần, có trang
 * riêng, có thể nằm trong nhiều bảng xếp hạng (qua Suất tham gia).
 */
export const Items: CollectionConfig = {
  slug: 'items',
  labels: { singular: 'Mục', plural: 'Mục' },
  admin: {
    components: { edit: { editMenuItems: ['@/admin/SafeDeleteMenuItem#SafeDeleteMenuItem'] } },
    useAsTitle: 'name',
    defaultColumns: ['name', 'category', 'statusColumn', 'publishedAt', 'updatedAt'],
    listSearchableFields: ['name', 'slug'],
  },
  versions: {
    // Autosave: biên tập viên không mất bài khi lỡ đóng tab (chỉ lưu nháp, không đăng).
    drafts: { autosave: { interval: 2000 } },
    maxPerDoc: 50,
  },
  access: {
    read: staffOnly,
    create: staffOnly,
    update: staffOnly,
    // Không xóa trực tiếp qua API/nút mặc định: dùng "Xóa…" (gõ tên để xác nhận, endpoint safe-delete).
    delete: () => false,
  },
  endpoints: [itemUrlPreviewEndpoint, ...safeDeleteEndpoints('items')],
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Nội dung',
          fields: [
            {
              name: 'name',
              label: 'Tên',
              type: 'text',
              required: true,
              localized: true,
              admin: {
                components: {
                  Cell: {
                    path: '@/admin/cells/TitleCell#TitleCell',
                    clientProps: { imageField: 'image' },
                  },
                },
              },
            },
            {
              name: 'summary',
              label: 'Tóm tắt',
              type: 'textarea',
              localized: true,
              maxLength: 300,
              admin: {
                description:
                  '1–2 câu, dùng cho thẻ, dòng phụ trong bảng và mô tả SEO mặc định (tối đa 300 ký tự).',
              },
            },
            {
              name: 'description',
              label: 'Mô tả',
              type: 'richText',
              localized: true,
              editor: editorFull(),
            },
          ],
        },
        {
          label: 'Thông tin riêng',
          description: 'Chọn một nhóm thông tin phù hợp; chi tiết lẻ ghi ở "Thông tin thêm".',
          fields: [
            {
              name: 'attributes',
              label: 'Nhóm thông tin',
              labels: { singular: 'Nhóm thông tin', plural: 'Nhóm thông tin' },
              type: 'blocks',
              maxRows: 1,
              blocks: attributeBlocks,
            },
            {
              name: 'facts',
              label: 'Thông tin thêm',
              localized: true,
              labels: { singular: 'Thông tin', plural: 'Thông tin' },
              type: 'array',
              admin: {
                description: 'Ví dụ: "Doanh thu" – "hơn 400 tỷ đồng", "Pin" – "5.000 mAh".',
              },
              fields: [
                {
                  type: 'row',
                  fields: [
                    { name: 'label', label: 'Nhãn', type: 'text', required: true },
                    { name: 'value', label: 'Giá trị', type: 'text', required: true },
                  ],
                },
              ],
            },
          ],
        },
        {
          label: 'Hình ảnh',
          fields: [
            {
              name: 'image',
              label: 'Ảnh chính',
              type: 'upload',
              relationTo: 'media',
              admin: { description: 'Ảnh đại diện của mục (thumbnail trong bảng, ảnh chia sẻ).' },
            },
            {
              name: 'gallery',
              label: 'Thư viện ảnh và video',
              labels: { singular: 'Ảnh / video', plural: 'Ảnh / video' },
              type: 'array',
              fields: [
                {
                  name: 'kind',
                  label: 'Loại',
                  type: 'radio',
                  defaultValue: 'image',
                  options: [
                    { value: 'image', label: 'Ảnh' },
                    { value: 'video', label: 'Video YouTube' },
                  ],
                  admin: { layout: 'horizontal' },
                },
                {
                  name: 'image',
                  label: 'Ảnh',
                  type: 'upload',
                  relationTo: 'media',
                  admin: { condition: (_, sibling) => sibling?.kind !== 'video' },
                  validate: (value: unknown, { siblingData }: { siblingData: unknown }) =>
                    (siblingData as { kind?: string })?.kind === 'video' ||
                    Boolean(value) ||
                    'Hãy chọn ảnh.',
                },
                {
                  name: 'videoUrl',
                  label: 'Link YouTube',
                  type: 'text',
                  validate: validateYoutube,
                  admin: { condition: (_, sibling) => sibling?.kind === 'video' },
                },
                { name: 'caption', label: 'Chú thích', type: 'text', localized: true },
              ],
            },
          ],
        },
        {
          name: 'meta',
          label: 'SEO',
          fields: [
            OverviewField({
              titlePath: 'meta.title',
              descriptionPath: 'meta.description',
              imagePath: 'meta.image',
            }),
            MetaTitleField({ hasGenerateFn: true }),
            MetaDescriptionField({ hasGenerateFn: true }),
            MetaImageField({ relationTo: 'media' }),
            PreviewField({
              hasGenerateFn: true,
              titlePath: 'meta.title',
              descriptionPath: 'meta.description',
            }),
          ],
        },
      ],
    },
    slugFields({ useAsSlug: 'name' }),
    urlChangeConfirmField(),
    {
      name: 'category',
      label: 'Chuyên mục',
      type: 'relationship',
      relationTo: 'categories',
      required: true,
      index: true,
      maxDepth: 0,
      filterOptions: { level: { greater_than: 0 } },
      admin: {
        position: 'sidebar',
        components: { Cell: '@/admin/cells/CategoryCell#CategoryCell' },
        description:
          'Nhóm lớn của chuyên mục quyết định URL: /review (Sản phẩm & Dịch vụ) hoặc /wiki (Thông tin).',
      },
    },
    {
      name: 'url',
      label: 'URL',
      type: 'text',
      index: true,
      admin: { position: 'sidebar', readOnly: true, description: 'Tự tính từ slug và chuyên mục.' },
    },
    publishedAtField(),
    statusColumnField(),
    {
      name: 'appearsIn',
      label: 'Có mặt trong các bảng',
      type: 'join',
      collection: 'entries',
      on: 'item',
      defaultLimit: 50,
      admin: {
        allowCreate: false,
        defaultColumns: ['list', 'updatedAt'],
        description: 'Thêm hoặc gỡ mục khỏi bảng trong màn hình sửa bảng (tab "Các mục").',
      },
    },
    ...auditFields(),
  ],
  hooks: {
    beforeValidate: [
      async ({ data, originalDoc, req }) => {
        if (!data) return data
        captureUrlChangeConfirmation(data, req)

        const original = originalDoc as Item | undefined
        await applyAutoSlug({
          req,
          data,
          original,
          source: data.name ?? original?.name,
          isTaken: async (slug) => Boolean(await findItemBySlug(req, slug, original?.id)),
          candidates: (base) =>
            slugCandidates(
              base,
              data.attributes !== undefined ? data.attributes : original?.attributes,
            ),
        })
        return data
      },
    ],
    beforeChange: [
      async ({ data, originalDoc, req }) => {
        const original = originalDoc as Item | undefined

        // Khôi phục phiên bản cũ chỉ khôi phục nội dung, giữ nguyên URL đang công khai.
        if (req.context.isRestoringVersion && original?.id) {
          const live = await findPublished<Item>(req, 'items', original.id)
          if (live) {
            data.slug = live.slug
            data.category = live.category
          }
        }

        stampPublishedAt(data, original)
        const isPublishing = data._status === 'published'
        const slug = data.slug ?? original?.slug
        const category = data.category !== undefined ? data.category : original?.category
        // Bản nháp chưa có tên hoặc chuyên mục (autosave lúc mới tạo): chưa có URL, kiểm tra khi đăng.
        if (!isPublishing && (!slug || !category)) return { ...data, url: null }

        const result = await resolveItemUrl(req, {
          id: original?.id ?? null,
          slug,
          category,
          attributes: data.attributes !== undefined ? data.attributes : original?.attributes,
        })
        if (!result.ok) {
          throw new ValidationError({ collection: 'items', errors: result.errors, req }, req.t)
        }

        await guardPublishedUrlChange({
          req,
          collection: 'items',
          id: original?.id,
          newUrl: result.url,
          isPublishing,
          noun: 'Mục',
        })
        return { ...data, url: result.url }
      },
    ],
    afterChange: [redirectOnPublishedUrlChange<Item>()],
  },
}
