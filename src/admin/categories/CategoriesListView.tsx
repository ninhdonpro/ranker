import { getTranslation } from '@payloadcms/translations'
import type { ListViewServerProps, TypedLocale } from 'payload'

import { isAdminUser } from '@/access/roles'
import { buildCategoryTree, flattenCategoryTree } from '@/lib/categoryTree'

import { CategoriesManager } from './CategoriesManager'

/**
 * Màn hình danh sách Chuyên mục (admin.components.views.list): cây 3 tầng thay cho bảng phân
 * trang mặc định. Nạp toàn bộ chuyên mục một lần (vài chục bản ghi), sắp theo `_order` ở DB.
 */
export async function CategoriesListView({
  collectionConfig,
  i18n,
  locale,
  payload,
  user,
}: ListViewServerProps) {
  const { docs } = await payload.find({
    collection: 'categories',
    depth: 0,
    limit: 0,
    pagination: false,
    sort: '_order',
    // `locale.code` của view luôn là một locale đã khai báo trong payload.config.
    locale: locale?.code as TypedLocale | undefined,
    user,
    overrideAccess: false,
    select: { name: true, slug: true, path: true, parent: true, color: true, _order: true },
  })

  const rows = flattenCategoryTree(buildCategoryTree(docs))
  const description = collectionConfig.admin.description
  return (
    <CategoriesManager
      title={getTranslation(collectionConfig.labels.plural, i18n)}
      description={typeof description === 'string' ? description : undefined}
      rows={rows}
      isAdmin={isAdminUser(user)}
    />
  )
}
