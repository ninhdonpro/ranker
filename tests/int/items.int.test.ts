import type { Payload } from 'payload'
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'

import { relId } from '@/lib/relations'
import type { Category, Item, User } from '@/payload-types'

import { expectRejected } from './expect'
import { clearContent, createStaff, getTestPayload } from './helpers'

type Staff = User & { collection: 'users' }
type ItemInput = Partial<Item> & { confirmUrlChange?: boolean }

let payload: Payload
let admin: Staff
let editor: Staff
let film: Category
let food: Category
let tech: Category
let info: Category

const createCategory = (data: Partial<Category>) =>
  payload.create({ collection: 'categories', data: data as Category })

const createItem = (data: ItemInput, opts: { draft?: boolean; user?: Staff } = {}) =>
  payload.create({
    collection: 'items',
    data: { _status: opts.draft ? 'draft' : 'published', ...data } as Item,
    draft: opts.draft,
    user: opts.user ?? editor,
    overrideAccess: false,
  })

const updateItem = (id: number, data: ItemInput, opts: { draft?: boolean } = {}) =>
  payload.update({
    collection: 'items',
    id,
    data: { _status: opts.draft ? 'draft' : 'published', ...data },
    draft: opts.draft,
    user: editor,
    overrideAccess: false,
  })

async function redirectTarget(from: string) {
  const { docs } = await payload.find({
    collection: 'redirects',
    where: { from: { equals: from } },
  })
  return docs[0] ? relId(docs[0].to?.reference?.value) : null
}

const place = (city: string, district?: string) => [{ blockType: 'place' as const, city, district }]

describe('Mục', () => {
  beforeAll(async () => {
    payload = await getTestPayload()
    ;({ admin, editor } = await createStaff(payload))
    await clearContent(payload)
    const product = await createCategory({
      name: 'Sản phẩm & Dịch vụ',
      slug: 'product',
      itemRoute: 'review',
    })
    info = await createCategory({ name: 'Thông tin', slug: 'info', itemRoute: 'wiki' })
    film = await createCategory({ name: 'Phim & Series', parent: info.id })
    food = await createCategory({ name: 'Ẩm thực', parent: product.id })
    tech = await createCategory({ name: 'Công nghệ', parent: product.id })
  })
  afterAll(async () => {
    await payload.destroy()
  })
  beforeEach(async () => {
    await clearContent(payload, 'items')
  })

  describe('URL và slug', () => {
    it('sinh slug tiếng Việt; tiền tố URL theo nhóm lớn của chuyên mục', async () => {
      const matBiec = await createItem({ name: 'Mắt Biếc', category: film.id })
      const iphone = await createItem({ name: 'iPhone 17 Pro Max', category: tech.id })
      expect(matBiec).toMatchObject({ slug: 'mat-biec', url: '/wiki/mat-biec' })
      expect(iphone).toMatchObject({ slug: 'iphone-17-pro-max', url: '/review/iphone-17-pro-max' })
      expect(relId(matBiec.createdBy)).toBe(editor.id)
    })

    it('không cho chọn nhóm lớn làm chuyên mục', async () => {
      await expectRejected(
        createItem({ name: 'Mắt Biếc', category: info.id }),
        /không chọn nhóm lớn/,
      )
    })

    it('slug tự sinh bị trùng thì tự gắn hậu tố có nghĩa (khu vực, năm)', async () => {
      await createItem({
        name: 'Phở Thìn',
        category: food.id,
        attributes: place('Hà Nội', 'Hai Bà Trưng'),
      })
      const saigon = await createItem({
        name: 'Phở Thìn',
        category: food.id,
        attributes: place('TP. Hồ Chí Minh', 'Quận 1'),
      })
      expect(saigon.slug).toBe('pho-thin-tp-ho-chi-minh')

      await createItem({ name: 'Mắt Biếc', category: film.id })
      const remake = await createItem({
        name: 'Mắt Biếc',
        category: film.id,
        attributes: [{ blockType: 'creativeWork', workType: 'movie', year: 2019 }],
      })
      expect(remake.slug).toBe('mat-biec-2019')
    })

    it('không có thông tin để làm hậu tố thì dùng -2', async () => {
      await createItem({ name: 'Sơn Tùng M-TP', category: film.id })
      const again = await createItem({ name: 'Sơn Tùng M-TP', category: film.id })
      expect(again.slug).toBe('son-tung-m-tp-2')
    })

    it('slug gõ tay bị trùng thì báo lỗi kèm gợi ý', async () => {
      await createItem({ name: 'Phở Thìn', category: food.id, attributes: place('Hà Nội') })
      await expectRejected(
        createItem({
          name: 'Phở Thìn Bờ Hồ',
          slug: 'pho-thin',
          category: food.id,
          attributes: place('Hà Nội'),
        }),
        /đã được dùng bởi mục "Phở Thìn". Gợi ý: pho-thin-ha-noi/,
      )
    })

    it('slug của bản nháp chưa đăng cũng được tính là đã dùng', async () => {
      await createItem({ name: 'Bố Già', category: film.id }, { draft: true })
      await expectRejected(
        createItem({ name: 'Phim khác', slug: 'bo-gia', category: film.id }),
        /đã được dùng/,
      )
    })
  })

  describe('nháp, đăng và redirect', () => {
    it('lưu nháp rồi đăng tạo ra các phiên bản', async () => {
      const item = await createItem({ name: 'Hai Phượng', category: film.id }, { draft: true })
      expect(item._status).toBe('draft')
      await updateItem(item.id, { summary: 'Phim hành động của Ngô Thanh Vân.' })
      const { totalDocs } = await payload.countVersions({
        collection: 'items',
        where: { parent: { equals: item.id } },
      })
      expect(totalDocs).toBeGreaterThanOrEqual(2)
      expect((await payload.findByID({ collection: 'items', id: item.id }))._status).toBe(
        'published',
      )
    })

    it('đổi slug của mục đã đăng: lưu nháp không cần xác nhận, đăng thì cần xác nhận và tạo redirect', async () => {
      const item = await createItem({ name: 'Mắt Biếc', category: film.id })

      await updateItem(item.id, { slug: 'mat-biec-phim' }, { draft: true })
      expect(await redirectTarget('/wiki/mat-biec')).toBeNull()
      // Bản đã đăng vẫn giữ URL cũ cho tới khi đăng lại.
      expect((await payload.findByID({ collection: 'items', id: item.id })).url).toBe(
        '/wiki/mat-biec',
      )

      await expectRejected(updateItem(item.id, { slug: 'mat-biec-phim' }), /xác nhận đổi URL/)
      await updateItem(item.id, { slug: 'mat-biec-phim', confirmUrlChange: true })

      expect((await payload.findByID({ collection: 'items', id: item.id })).url).toBe(
        '/wiki/mat-biec-phim',
      )
      expect(await redirectTarget('/wiki/mat-biec')).toBe(item.id)
    })

    it('đổi chuyên mục sang nhóm lớn khác: URL đổi tiền tố và có redirect', async () => {
      const item = await createItem({ name: 'Netflix', category: film.id })
      await updateItem(item.id, { category: tech.id, confirmUrlChange: true })
      expect((await payload.findByID({ collection: 'items', id: item.id })).url).toBe(
        '/review/netflix',
      )
      expect(await redirectTarget('/wiki/netflix')).toBe(item.id)
    })

    it('khôi phục phiên bản cũ giữ nguyên URL đang công khai', async () => {
      const item = await createItem({ name: 'Mắt Biếc', category: film.id, summary: 'Bản đầu' })
      await updateItem(item.id, {
        slug: 'mat-biec-2019',
        summary: 'Bản sau',
        confirmUrlChange: true,
      })
      const { docs } = await payload.findVersions({
        collection: 'items',
        where: {
          and: [{ parent: { equals: item.id } }, { 'version.summary': { equals: 'Bản đầu' } }],
        },
      })
      await payload.restoreVersion({
        collection: 'items',
        id: docs[0].id,
        user: editor,
        overrideAccess: false,
      })

      const restored = await payload.findByID({ collection: 'items', id: item.id })
      expect(restored).toMatchObject({
        summary: 'Bản đầu',
        slug: 'mat-biec-2019',
        url: '/wiki/mat-biec-2019',
      })
    })

    it('mục chưa từng đăng thì đổi slug không cần xác nhận, không tạo redirect', async () => {
      const item = await createItem({ name: 'Song Lang', category: film.id }, { draft: true })
      await updateItem(item.id, { slug: 'song-lang-2018' }, { draft: true })
      await updateItem(item.id, {})
      expect((await payload.findByID({ collection: 'items', id: item.id })).url).toBe(
        '/wiki/song-lang-2018',
      )
      const { totalDocs } = await payload.count({ collection: 'redirects' })
      expect(totalDocs).toBe(0)
    })
  })

  describe('thông tin riêng và thư viện', () => {
    it('lưu block thông tin riêng và thông tin thêm', async () => {
      const item = await createItem({
        name: 'Bố Già',
        category: film.id,
        attributes: [
          {
            blockType: 'creativeWork',
            workType: 'movie',
            year: 2021,
            creators: 'Trấn Thành, Vũ Ngọc Đãng',
            durationMinutes: 128,
          },
        ],
        facts: [{ label: 'Doanh thu', value: 'hơn 400 tỷ đồng' }],
      })
      expect(item.attributes?.[0]).toMatchObject({ blockType: 'creativeWork', year: 2021 })
      expect(item.facts?.[0]).toMatchObject({ label: 'Doanh thu', value: 'hơn 400 tỷ đồng' })
    })

    it('video trong thư viện phải là link YouTube', async () => {
      await expectRejected(
        createItem({
          name: 'Mắt Biếc',
          category: film.id,
          gallery: [{ kind: 'video', videoUrl: 'https://vimeo.com/123' }],
        }),
        /link YouTube/,
      )
      const ok = await createItem({
        name: 'Mắt Biếc',
        category: film.id,
        gallery: [
          {
            kind: 'video',
            videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
            caption: 'Trailer',
          },
        ],
      })
      expect(ok.gallery).toHaveLength(1)
    })
  })

  it('không xóa trực tiếp được mục (kể cả admin)', async () => {
    const item = await createItem({ name: 'Ròm', category: film.id })
    await expectRejected(
      payload.delete({ collection: 'items', id: item.id, user: editor, overrideAccess: false }),
      /không có quyền/,
    )
    // Nút xóa mặc định bị tắt cho cả admin: phải qua luồng gõ tên để xác nhận.
    await expectRejected(
      payload.delete({ collection: 'items', id: item.id, user: admin, overrideAccess: false }),
      /không có quyền/,
    )
  })
})
