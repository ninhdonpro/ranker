import type { CollectionConfig, TextFieldSingleValidation } from 'payload'

import type { Media as MediaDoc } from '@/payload-types'

import { adminOnly, staffOnly } from '@/access/roles'
import { auditFields } from '@/fields/audit'

/** Ảnh tối đa 10 MB; chỉ nhận định dạng ảnh web. */
export const MEDIA_MAX_FILE_SIZE = 10 * 1024 * 1024
const MEDIA_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/avif']

const ALT_MIN_LENGTH = 5

/** Alt text phải mô tả nội dung ảnh, không được là tên file. */
const validateAlt: TextFieldSingleValidation = (value, { data, req }) => {
  const alt = (value ?? '').trim()
  if (alt.length < ALT_MIN_LENGTH) {
    return `Alt text cần ít nhất ${ALT_MIN_LENGTH} ký tự, mô tả nội dung ảnh cho người dùng trình đọc màn hình và Google.`
  }
  // Khi tạo mới, tên file chỉ có trong `req.file`; khi sửa thì có trong `data.filename`.
  const filenames = [req.file?.name, (data as Partial<MediaDoc> | undefined)?.filename]
  const bases = filenames
    .filter((name): name is string => Boolean(name))
    .map((name) => name.replace(/\.[a-z0-9]+$/i, '').toLowerCase())
  if (/\.(jpe?g|png|webp|avif|gif)$/i.test(alt) || bases.includes(alt.toLowerCase())) {
    return 'Alt text không được là tên file. Hãy mô tả ảnh, ví dụ: "Poster phim Mắt Biếc (2019)".'
  }
  return true
}

/** Ảnh lưu trên Cloudflare R2 (xem src/storage/r2.ts), không lưu trên ổ đĩa container. */
export const Media: CollectionConfig = {
  slug: 'media',
  labels: { singular: 'Ảnh', plural: 'Media' },
  admin: {
    useAsTitle: 'alt',
    defaultColumns: ['filename', 'alt', 'credit', 'updatedAt'],
  },
  access: {
    // Ảnh là nội dung công khai.
    read: () => true,
    create: staffOnly,
    update: staffOnly,
    delete: adminOnly,
  },
  upload: {
    mimeTypes: MEDIA_MIME_TYPES,
    focalPoint: true,
    crop: true,
    adminThumbnail: 'thumb',
    // Ảnh gốc được thu về tối đa 2400px và chuyển sang webp.
    resizeOptions: { width: 2400, height: 2400, fit: 'inside', withoutEnlargement: true },
    formatOptions: { format: 'webp', options: { quality: 82 } },
    imageSizes: [
      // Ảnh thu nhỏ trong danh sách xếp hạng (list-item-thumb 88px, @2x).
      { name: 'thumb', width: 176, height: 176, formatOptions: { format: 'webp' } },
      // Ảnh thẻ và gallery 16:9.
      { name: 'card', width: 960, height: 540, formatOptions: { format: 'webp' } },
      // Ảnh chia sẻ mạng xã hội (Open Graph).
      { name: 'og', width: 1200, height: 630, formatOptions: { format: 'webp' } },
    ],
  },
  fields: [
    {
      name: 'alt',
      label: 'Alt text',
      type: 'text',
      required: true,
      localized: true,
      validate: validateAlt,
      admin: {
        description: 'Mô tả nội dung ảnh (bắt buộc). Ví dụ: "Poster phim Mắt Biếc (2019)".',
      },
    },
    { name: 'caption', label: 'Chú thích', type: 'textarea', localized: true },
    {
      name: 'credit',
      label: 'Nguồn ảnh',
      type: 'text',
      admin: { description: 'Hiện dưới ảnh, ví dụ: "Galaxy Studio".' },
    },
    ...auditFields(),
  ],
}
