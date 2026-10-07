import type { I18nClient } from '@payloadcms/translations'
import { EntityType, groupNavItems } from '@payloadcms/ui/shared'
import type { Payload, SanitizedPermissions, VisibleEntities } from 'payload'
import { formatAdminURL } from 'payload/shared'

import type { RankerTranslationKeys, RankerTranslations } from '@/admin/translations'

import { NavClient, type NavGroupLinks } from './NavClient'

type Props = {
  i18n: I18nClient<RankerTranslations, RankerTranslationKeys>
  payload: Payload
  permissions: SanitizedPermissions
  visibleEntities: VisibleEntities
}

/** Nhãn menu viết Title Case (design.md › admin-nav), tách khỏi tên collection dùng cho tiêu đề trang. */
const NAV_LABELS: Record<string, RankerTranslationKeys> = {
  lists: 'ranker:navLists',
  items: 'ranker:navItems',
  categories: 'ranker:navCategories',
  users: 'ranker:navUsers',
  media: 'ranker:navMedia',
  redirects: 'ranker:navRedirects',
}

/**
 * Menu bên trái (admin.components.Nav). Thay DefaultNav của Payload để có logo, nhãn Title Case
 * và giao diện theo design system; nhóm và quyền xem vẫn tính bằng `groupNavItems` của Payload.
 */
export function Nav({ i18n, payload, permissions, visibleEntities }: Props) {
  const adminRoute = payload.config.routes.admin
  const groups = groupNavItems(
    payload.config.collections
      .filter(({ slug }) => visibleEntities.collections.includes(slug))
      .map((entity) => ({ type: EntityType.collection, entity })),
    permissions,
    i18n,
  )

  const navGroups: NavGroupLinks[] = groups.map(({ label, entities }) => ({
    label,
    links: entities.map(({ slug }) => ({
      href: formatAdminURL({ adminRoute, path: `/collections/${slug}` }),
      id: `nav-${slug}`,
      label: NAV_LABELS[slug] ? i18n.t(NAV_LABELS[slug]) : slug,
    })),
  }))

  return <NavClient groups={navGroups} homeHref={adminRoute} homeLabel={i18n.t('ranker:navHome')} />
}
