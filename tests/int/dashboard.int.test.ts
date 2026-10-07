import type { Payload } from 'payload'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

import { getDashboardData } from '@/admin/dashboard/data'
import type { Category, Item, List, User } from '@/payload-types'

import { clearContent, createStaff, getTestPayload } from './helpers'

type Staff = User & { collection: 'users' }

let payload: Payload
let editor: Staff
let film: Category

const as = () => ({ user: editor, overrideAccess: false })

describe('Dashboard admin', () => {
  beforeAll(async () => {
    payload = await getTestPayload()
    ;({ editor } = await createStaff(payload))
    await clearContent(payload)
    const info = await payload.create({
      collection: 'categories',
      data: { name: 'Thông tin', slug: 'info', itemRoute: 'wiki' } as Category,
    })
    film = await payload.create({
      collection: 'categories',
      data: { name: 'Phim & Series', parent: info.id } as Category,
    })
  })
  afterAll(async () => {
    await payload.destroy()
  })

  it('đếm nội dung đã đăng, suất tham gia và việc cần xử lý; phân biệt nháp với thay đổi chưa đăng', async () => {
    const list = await payload.create({
      collection: 'lists',
      data: { title: 'Phim Việt Hay Nhất', category: film.id, _status: 'published' } as List,
      ...as(),
    })
    const published = await payload.create({
      collection: 'items',
      data: { name: 'Bố Già', category: film.id, _status: 'published' } as Item,
      ...as(),
    })
    await payload.create({
      collection: 'entries',
      data: { list: list.id, item: published.id },
      ...as(),
    })
    // Mục chưa đăng lần nào.
    const draft = await payload.create({
      collection: 'items',
      data: { name: 'Hai Phượng', category: film.id, _status: 'draft' } as Item,
      draft: true,
      ...as(),
    })
    // Bảng đã đăng, sau đó có bản nháp mới hơn.
    await payload.update({
      collection: 'lists',
      id: list.id,
      data: { rules: 'Luật mới', _status: 'draft' },
      draft: true,
      ...as(),
    })

    const data = await getDashboardData(payload, editor)

    expect(data.stats).toEqual({
      lists: { total: 1, lastWeek: 1 },
      items: { total: 1, lastWeek: 1 },
      entries: { total: 1, lastWeek: 1 },
      pending: 2,
    })
    expect(data.pending.map((row) => [row.collection, row.id, row.status]).sort()).toEqual(
      [
        ['items', draft.id, 'draft'],
        ['lists', list.id, 'changed'],
      ].sort(),
    )
    expect(data.pending.find((row) => row.collection === 'lists')).toMatchObject({
      title: 'Phim Việt Hay Nhất',
      categoryId: film.id,
    })

    // Mỗi tài liệu một dòng hoạt động, ghi người sửa và có đăng hay không.
    const keys = data.activity.map((a) => `${a.collection}-${a.id}`)
    expect(new Set(keys).size).toBe(keys.length)
    expect(
      data.activity.find((a) => a.collection === 'items' && a.id === published.id),
    ).toMatchObject({ userId: editor.id, published: true })
    expect(data.activity.find((a) => a.collection === 'lists')).toMatchObject({ published: false })

    // Một tuần sau: không còn gì "mới trong 7 ngày".
    const later = await getDashboardData(payload, editor, {
      now: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000),
    })
    expect(later.stats.lists.lastWeek).toBe(0)
    expect(later.stats.entries.lastWeek).toBe(0)
  })
})
