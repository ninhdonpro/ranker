import type { Payload, TypedUser, Where } from 'payload'

import { relId } from '@/lib/relations'

const WEEK_MS = 7 * 24 * 60 * 60 * 1000

type ContentSlug = 'lists' | 'items'

export type DashboardRow = {
  collection: ContentSlug
  id: number
  title: string | null
  categoryId: number | null
  imageId: number | null
  /** draft: chưa đăng lần nào; changed: đã đăng, có bản nháp mới hơn. */
  status: 'draft' | 'changed'
  updatedAt: string
}

export type DashboardActivity = {
  collection: ContentSlug
  id: number
  title: string | null
  userId: number | null
  published: boolean
  updatedAt: string
}

export type DashboardData = {
  stats: {
    lists: { total: number; lastWeek: number }
    items: { total: number; lastWeek: number }
    entries: { total: number; lastWeek: number }
    pending: number
  }
  pending: DashboardRow[]
  activity: DashboardActivity[]
}

/** Trường tiêu đề và ảnh đại diện của từng loại nội dung. */
const CONTENT = {
  lists: { title: 'title', image: 'coverImage' },
  items: { title: 'name', image: 'image' },
} as const

type VersionDoc = {
  parent: unknown
  updatedAt: string
  version: Record<string, unknown>
}

/**
 * Số liệu cho dashboard admin, đọc bằng quyền của người đang đăng nhập. Mọi truy vấn chạy song
 * song; danh sách "cần xử lý" là các tài liệu có phiên bản mới nhất đang là bản nháp.
 */
export async function getDashboardData(
  payload: Payload,
  user: TypedUser,
  { limit = 6, now = new Date() }: { limit?: number; now?: Date } = {},
): Promise<DashboardData> {
  const as = { user, overrideAccess: false } as const
  const weekAgo = new Date(now.getTime() - WEEK_MS).toISOString()
  const published: Where = { _status: { equals: 'published' } }
  const latestDraft: Where = {
    and: [{ latest: { equals: true } }, { 'version._status': { equals: 'draft' } }],
  }

  const countPublished = (collection: ContentSlug) =>
    Promise.all([
      payload.count({ collection, where: published, ...as }),
      payload.count({
        collection,
        where: { and: [published, { publishedAt: { greater_than_equal: weekAgo } }] },
        ...as,
      }),
    ]).then(([all, week]) => ({ total: all.totalDocs, lastWeek: week.totalDocs }))

  const findVersions = (collection: ContentSlug, where?: Where) =>
    payload.findVersions({
      collection,
      where,
      sort: '-updatedAt',
      limit,
      depth: 0,
      ...as,
    }) as unknown as Promise<{ docs: VersionDoc[]; totalDocs: number }>

  const [lists, items, entriesAll, entriesWeek, listDrafts, itemDrafts, listRecent, itemRecent] =
    await Promise.all([
      countPublished('lists'),
      countPublished('items'),
      payload.count({ collection: 'entries', ...as }),
      payload.count({
        collection: 'entries',
        where: { createdAt: { greater_than_equal: weekAgo } },
        ...as,
      }),
      findVersions('lists', latestDraft),
      findVersions('items', latestDraft),
      // phiên bản mới nhất của mỗi tài liệu: mỗi nội dung một dòng trong "Hoạt động gần đây"
      findVersions('lists', { latest: { equals: true } }),
      findVersions('items', { latest: { equals: true } }),
    ])

  const toRow = (collection: ContentSlug, doc: VersionDoc): DashboardRow => {
    const v = doc.version
    return {
      collection,
      id: relId(doc.parent) as number,
      title:
        typeof v[CONTENT[collection].title] === 'string'
          ? (v[CONTENT[collection].title] as string)
          : null,
      categoryId: relId(v.category),
      imageId: relId(v[CONTENT[collection].image]),
      status: v.publishedAt ? 'changed' : 'draft',
      updatedAt: doc.updatedAt,
    }
  }

  const byNewest = <T extends { updatedAt: string }>(a: T, b: T) =>
    b.updatedAt.localeCompare(a.updatedAt)

  const pending = [
    ...listDrafts.docs.map((doc) => toRow('lists', doc)),
    ...itemDrafts.docs.map((doc) => toRow('items', doc)),
  ]
    .sort(byNewest)
    .slice(0, limit)

  const activity: DashboardActivity[] = [
    ...listRecent.docs.map((doc) => ({ collection: 'lists' as const, doc })),
    ...itemRecent.docs.map((doc) => ({ collection: 'items' as const, doc })),
  ]
    .map(({ collection, doc }) => {
      const { id, title, updatedAt } = toRow(collection, doc)
      return {
        collection,
        id,
        title,
        updatedAt,
        userId: relId(doc.version.updatedBy),
        published: doc.version._status === 'published',
      }
    })
    .sort(byNewest)
    .slice(0, limit)

  return {
    stats: {
      lists,
      items,
      entries: { total: entriesAll.totalDocs, lastWeek: entriesWeek.totalDocs },
      pending: listDrafts.totalDocs + itemDrafts.totalDocs,
    },
    pending,
    activity,
  }
}
