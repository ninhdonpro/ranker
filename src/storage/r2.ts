import { s3Storage } from '@payloadcms/storage-s3'

/**
 * Lưu media lên Cloudflare R2 (API tương thích S3). File được phục vụ thẳng từ domain public
 * của bucket (CDN Cloudflare), không đi qua server Node.
 *
 * Tắt khi chạy test để test không ghi vào bucket thật (khi đó Payload dùng thư mục local).
 */
export const r2Storage = () => {
  const publicUrl = (process.env.R2_PUBLIC_URL ?? '').replace(/\/+$/, '')
  const prefix = process.env.R2_PREFIX || undefined

  return s3Storage({
    enabled: process.env.NODE_ENV !== 'test',
    bucket: process.env.R2_BUCKET ?? '',
    config: {
      endpoint: process.env.R2_ENDPOINT,
      region: 'auto',
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID ?? '',
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY ?? '',
      },
    },
    collections: {
      media: {
        prefix,
        disablePayloadAccessControl: true,
        generateFileURL: ({ filename, prefix: filePrefix }) =>
          [publicUrl, filePrefix, filename].filter(Boolean).join('/'),
      },
    },
  })
}
