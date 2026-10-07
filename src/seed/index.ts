import config from '@payload-config'
import { getPayload } from 'payload'

import { seed } from './seed'

/**
 * `pnpm seed` (không ảnh) hoặc `pnpm seed:images` (kèm ảnh minh họa lên R2 dev).
 * Xóa và tạo lại dữ liệu mẫu (chuyên mục, mục, bảng) cho môi trường dev. Không chạy ở production.
 *
 * `payload run` chỉ import file này rồi thoát, nên dùng top-level await để chờ seed chạy xong.
 * Tùy chọn truyền qua biến môi trường vì `payload run` bỏ các cờ `--...`.
 */
if (process.env.NODE_ENV === 'production') {
  throw new Error('Không chạy seed ở production: seed xóa toàn bộ chuyên mục, mục và bảng.')
}

const payload = await getPayload({ config })
await seed(payload, {
  withImages: process.env.SEED_WITH_IMAGES === 'true',
  log: (message) => payload.logger.info(message),
})
await payload.destroy()
