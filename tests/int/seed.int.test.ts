import type { Payload } from 'payload'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

import { getRankedEntries } from '@/lib/ranking'
import { seed } from '@/seed/seed'
import { FILMS } from '@/seed/data/films'

import { clearContent, getTestPayload } from './helpers'

let payload: Payload

describe('Seed dữ liệu mẫu', () => {
  beforeAll(async () => {
    payload = await getTestPayload()
    await clearContent(payload)
  })
  afterAll(async () => {
    await payload.destroy()
  })

  it('chạy lại nhiều lần không tạo bản ghi trùng', async () => {
    const first = await seed(payload)
    const second = await seed(payload)
    expect(second).toEqual(first)
    for (const [collection, total] of Object.entries(second) as [
      'categories' | 'items' | 'lists',
      number,
    ][]) {
      expect((await payload.count({ collection })).totalDocs).toBe(total)
    }
  })

  it('bảng Phim Việt có đủ 20 phim theo đúng thứ tự trong prototype', async () => {
    const { docs } = await payload.find({
      collection: 'lists',
      where: { slug: { equals: 'phim-viet-hay-nhat-moi-thoi-dai' } },
    })
    const ranked = await getRankedEntries(payload, docs[0], { depth: 1 })
    expect(ranked.map((r) => (typeof r.entry.item === 'object' ? r.entry.item.name : ''))).toEqual(
      FILMS.map((f) => f.name),
    )
  })

  it('mỗi mục chỉ tồn tại một lần; phim trùng tên khác năm có slug riêng', async () => {
    const find = async (name: string) =>
      (await payload.find({ collection: 'items', where: { name: { equals: name } } })).docs
    expect((await find('Mai')).length).toBe(1)
    expect((await find('Bố Già')).map((i) => i.slug).sort()).toEqual(['bo-gia', 'bo-gia-1972'])
  })

  it('mô tả Mắt Biếc chuyển từ Markdown thành Lexical với các tiêu đề H2', async () => {
    const [matBiec] = (
      await payload.find({ collection: 'items', where: { slug: { equals: 'mat-biec' } } })
    ).docs
    const headings = (matBiec.description?.root.children ?? []).filter((n) => n.type === 'heading')
    expect(headings.length).toBe(7)
    expect(matBiec.url).toBe('/wiki/mat-biec')
  })
})
