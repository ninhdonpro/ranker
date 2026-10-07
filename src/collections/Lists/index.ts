import {
  MetaDescriptionField,
  MetaImageField,
  MetaTitleField,
  OverviewField,
  PreviewField,
} from '@payloadcms/plugin-seo/fields'
import {
  ValidationError,
  type CollectionConfig,
  type PayloadRequest,
  type ValidationFieldError,
} from 'payload'

import { staffOnly } from '@/access/roles'
import { safeDeleteEndpoints } from '@/endpoints/safeDelete'
import { auditFields } from '@/fields/audit'
import { slugFields } from '@/fields/slug'
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
import { relId } from '@/lib/relations'
import { isValidSlug } from '@/lib/slug'
import { listUrl } from '@/lib/url'
import type { List } from '@/payload-types'

import { listUrlPreviewEndpoint } from './urlPreview'

async function findListBySlug(req: PayloadRequest, slug: string, excludeId?: number) {
  const { docs } = await req.payload.find({
    collection: 'lists',
    draft: true,
    where: {
      and: [{ slug: { equals: slug } }, ...(excludeId ? [{ id: { not_equals: excludeId } }] : [])],
    },
    depth: 0,
    limit: 1,
    pagination: false,
    req,
  })
  return docs[0] ?? null
}

/**
 * Bảng xếp hạng: chỉ tham chiếu tới mục qua Suất tham gia (collection `entries`), không chứa
 * thông tin của mục.
 */
export const Lists: CollectionConfig = {
  slug: 'lists',
  labels: { singular: 'Bảng xếp hạng', plural: 'Bảng xếp hạng' },
  admin: {
    components: { edit: { editMenuItems: ['@/admin/SafeDeleteMenuItem#SafeDeleteMenuItem'] } },
    useAsTitle: 'title',
    defaultColumns: ['title', 'category', 'url', '_status', 'updatedAt'],
    listSearchableFields: ['title', 'slug'],
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
  endpoints: [listUrlPreviewEndpoint, ...safeDeleteEndpoints('lists')],
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Nội dung',
          fields: [
            { name: 'title', label: 'Tiêu đề', type: 'text', required: true, localized: true },
            {
              name: 'intro',
              label: 'Giới thiệu',
              type: 'richText',
              localized: true,
              editor: editorFull(),
            },
            {
              name: 'rules',
              label: 'Luật bình chọn',
              type: 'text',
              localized: true,
              admin: {
                description:
                  'Một câu ngắn hiện ở đầu bảng, ví dụ: "Vote phim Việt bạn thấy hay nhất · không tính phim ra rạp dưới 30 ngày".',
              },
            },
            {
              name: 'itemNoun',
              label: 'Danh từ đơn vị',
              type: 'text',
              localized: true,
              defaultValue: 'mục',
              admin: { description: 'Dùng khi đếm số mục, ví dụ "120 phim", "38 quán".' },
            },
          ],
        },
        {
          label: 'Các mục',
          description:
            'Thêm mục có sẵn hoặc tạo mục mới, viết mô tả theo ngữ cảnh của bảng, kéo-thả để sắp thứ tự. Thay đổi ở đây có hiệu lực ngay, không đi theo bản nháp của bảng.',
          fields: [
            {
              name: 'entries',
              label: 'Các mục trong bảng',
              type: 'join',
              collection: 'entries',
              on: 'list',
              orderable: true,
              defaultLimit: 100,
              admin: {
                allowCreate: true,
                defaultColumns: ['itemName', 'updatedAt'],
              },
            },
          ],
        },
        {
          label: 'Hình ảnh',
          fields: [
            {
              name: 'coverImage',
              label: 'Ảnh bìa',
              type: 'upload',
              relationTo: 'media',
              admin: { description: 'Để trống thì dùng ảnh ghép từ các mục đứng đầu bảng.' },
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
    slugFields({ useAsSlug: 'title' }),
    urlChangeConfirmField(),
    {
      name: 'url',
      label: 'URL',
      type: 'text',
      index: true,
      admin: { position: 'sidebar', readOnly: true, description: 'Tự tính từ slug.' },
    },
    publishedAtField(),
    {
      name: 'category',
      label: 'Chuyên mục',
      type: 'relationship',
      relationTo: 'categories',
      required: true,
      index: true,
      maxDepth: 0,
      filterOptions: { level: { greater_than: 0 } },
      admin: { position: 'sidebar' },
    },
    {
      name: 'listType',
      label: 'Loại bảng',
      type: 'select',
      required: true,
      defaultValue: 'permanent',
      options: [
        { value: 'permanent', label: 'Thường trực' },
        { value: 'event', label: 'Sự kiện có thời hạn' },
      ],
      admin: { position: 'sidebar' },
    },
    {
      name: 'startsAt',
      label: 'Bắt đầu',
      type: 'date',
      admin: {
        position: 'sidebar',
        condition: (data) => data?.listType === 'event',
        date: { pickerAppearance: 'dayAndTime' },
      },
    },
    {
      name: 'endsAt',
      label: 'Kết thúc',
      type: 'date',
      admin: {
        position: 'sidebar',
        condition: (data) => data?.listType === 'event',
        date: { pickerAppearance: 'dayAndTime' },
      },
    },
    {
      name: 'rankingMode',
      label: 'Cách xếp hạng',
      type: 'select',
      required: true,
      defaultValue: 'manual',
      options: [
        { value: 'manual', label: 'Thủ công (theo thứ tự kéo-thả)' },
        { value: 'votes', label: 'Theo vote (chưa hỗ trợ)' },
      ],
      admin: {
        position: 'sidebar',
        readOnly: true,
        description: 'Khi có tính năng vote, thứ hạng sẽ do vote quyết định.',
      },
    },
    {
      name: 'author',
      label: 'Tác giả (byline)',
      type: 'relationship',
      relationTo: 'users',
      defaultValue: ({ user }) => (user?.collection === 'users' ? user.id : undefined),
      admin: { position: 'sidebar' },
    },
    ...auditFields(),
  ],
  hooks: {
    beforeValidate: [
      async ({ data, originalDoc, req }) => {
        if (!data) return data
        captureUrlChangeConfirmation(data, req)
        const original = originalDoc as List | undefined
        await applyAutoSlug({
          req,
          data,
          original,
          source: data.title ?? original?.title,
          isTaken: async (slug) => Boolean(await findListBySlug(req, slug, original?.id)),
          candidates: (base) => Array.from({ length: 20 }, (_, i) => `${base}-${i + 2}`),
        })
        return data
      },
    ],
    beforeChange: [
      async ({ data, originalDoc, req }) => {
        const original = originalDoc as List | undefined
        const errors: ValidationFieldError[] = []

        if (req.context.isRestoringVersion && original?.id) {
          const live = await findPublished<List>(req, 'lists', original.id)
          if (live) data.slug = live.slug
        }

        stampPublishedAt(data, original)
        // Bản nháp (kể cả autosave lúc mới tạo) được lưu khi còn thiếu thông tin; thiếu gì thì báo
        // khi đăng. Thông tin đã nhập thì luôn được kiểm tra.
        const isPublishing = data._status === 'published'
        const slug = data.slug ?? original?.slug
        if (slug || isPublishing) {
          if (!isValidSlug(slug)) {
            errors.push({
              path: 'slug',
              message: 'Slug chỉ gồm chữ thường không dấu, số và dấu gạch ngang.',
            })
          } else {
            const taken = await findListBySlug(req, slug, original?.id)
            if (taken) {
              errors.push({
                path: 'slug',
                message: `Slug "${slug}" đã được dùng bởi bảng "${taken.title}".`,
              })
            }
          }
        }

        const category = data.category !== undefined ? data.category : original?.category
        if (category || isPublishing) {
          const categoryDoc = relId(category)
            ? await req.payload.findByID({
                collection: 'categories',
                id: relId(category) as number,
                depth: 0,
                req,
                disableErrors: true,
              })
            : null
          if (!categoryDoc || categoryDoc.level === 0) {
            errors.push({
              path: 'category',
              message: 'Hãy chọn chuyên mục hoặc chuyên mục con, không chọn nhóm lớn.',
            })
          }
        }

        const listType = data.listType ?? original?.listType
        if (listType === 'event') {
          const startsAt = data.startsAt !== undefined ? data.startsAt : original?.startsAt
          const endsAt = data.endsAt !== undefined ? data.endsAt : original?.endsAt
          if (isPublishing && !startsAt)
            errors.push({ path: 'startsAt', message: 'Bảng sự kiện cần ngày bắt đầu.' })
          if (isPublishing && !endsAt)
            errors.push({ path: 'endsAt', message: 'Bảng sự kiện cần ngày kết thúc.' })
          if (startsAt && endsAt && new Date(endsAt) <= new Date(startsAt)) {
            errors.push({ path: 'endsAt', message: 'Ngày kết thúc phải sau ngày bắt đầu.' })
          }
        }

        if (errors.length) throw new ValidationError({ collection: 'lists', errors, req }, req.t)
        if (!slug) return { ...data, url: null }

        const url = listUrl(slug)
        await guardPublishedUrlChange({
          req,
          collection: 'lists',
          id: original?.id,
          newUrl: url,
          isPublishing,
          noun: 'Bảng',
        })
        return { ...data, url }
      },
    ],
    afterChange: [redirectOnPublishedUrlChange<List>()],
  },
}
