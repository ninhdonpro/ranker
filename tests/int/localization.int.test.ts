import type { Payload } from 'payload'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

import type { Category, Item, User } from '@/payload-types'

import { clearContent, createStaff, getTestPayload } from './helpers'

let payload: Payload
let editor: User & { collection: 'users' }
let film: Category

describe('Đa ngôn ngữ (vi mặc định, en chưa dịch thì dùng bản vi)', () => {
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

  it('lưu bản tiếng Anh riêng; slug và URL giữ nguyên; bản en chưa dịch thì hiện bản vi', async () => {
    const item = await payload.create({
      collection: 'items',
      data: {
        name: 'Mắt Biếc',
        summary: 'Mối tình đơn phương của Ngạn dành cho Hà Lan.',
        category: film.id,
        _status: 'published',
      } as Item,
      user: editor,
      overrideAccess: false,
    })

    await payload.update({
      collection: 'items',
      id: item.id,
      locale: 'en',
      data: { name: 'Dreamy Eyes', _status: 'published' },
      user: editor,
      overrideAccess: false,
    })

    const vi = await payload.findByID({ collection: 'items', id: item.id, locale: 'vi' })
    const en = await payload.findByID({ collection: 'items', id: item.id, locale: 'en' })

    expect(vi).toMatchObject({ name: 'Mắt Biếc', slug: 'mat-biec', url: '/wiki/mat-biec' })
    expect(en).toMatchObject({ name: 'Dreamy Eyes', slug: 'mat-biec', url: '/wiki/mat-biec' })
    // Tóm tắt tiếng Anh chưa có: dùng bản tiếng Việt.
    expect(en.summary).toBe('Mối tình đơn phương của Ngạn dành cho Hà Lan.')

    const { totalDocs } = await payload.count({ collection: 'redirects' })
    expect(totalDocs).toBe(0)
  })

  it('tên chuyên mục có bản tiếng Anh, đường dẫn không đổi', async () => {
    await payload.update({
      collection: 'categories',
      id: film.id,
      locale: 'en',
      data: { name: 'Movies & Series' },
    })
    const en = await payload.findByID({ collection: 'categories', id: film.id, locale: 'en' })
    const vi = await payload.findByID({ collection: 'categories', id: film.id, locale: 'vi' })
    expect(en).toMatchObject({ name: 'Movies & Series', path: 'phim-series' })
    expect(vi).toMatchObject({ name: 'Phim & Series', path: 'phim-series' })
  })
})
