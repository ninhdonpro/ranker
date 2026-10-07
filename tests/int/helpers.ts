import config from '@/payload.config'
import { getPayload, type CollectionSlug, type Payload } from 'payload'

export const getTestPayload = (): Promise<Payload> => getPayload({ config })

/** Xóa sạch một collection (kể cả các phiên bản) trong DB test, bỏ qua access control và hook. */
export async function clearCollection(payload: Payload, collection: CollectionSlug) {
  if (payload.collections[collection]?.config.versions) {
    await payload.db.deleteVersions({ collection, where: {} })
  }
  await payload.db.deleteMany({ collection, where: {} })
}

/**
 * Xóa nội dung theo thứ tự an toàn với khóa ngoại (suất → bảng → mục → chuyên mục), để các file
 * test không phụ thuộc vào thứ tự chạy.
 */
const CONTENT_ORDER: CollectionSlug[] = ['redirects', 'entries', 'lists', 'items', 'categories']

export async function clearContent(payload: Payload, upTo: CollectionSlug = 'categories') {
  for (const collection of CONTENT_ORDER.slice(0, CONTENT_ORDER.indexOf(upTo) + 1)) {
    await clearCollection(payload, collection)
  }
}

/** Tạo một admin và một biên tập viên mới (xóa toàn bộ user cũ trong DB test). */
export async function createStaff(payload: Payload) {
  await clearCollection(payload, 'users')
  const make = (email: string, role: 'admin' | 'editor') =>
    payload.create({
      collection: 'users',
      data: { email, password: 'mat-khau-test-123', displayName: email, role },
    })
  const admin = await make('admin@ranker.test', 'admin')
  const editor = await make('bientap@ranker.test', 'editor')
  return {
    admin: { ...admin, collection: 'users' as const },
    editor: { ...editor, collection: 'users' as const },
  }
}
