import type { Payload } from 'payload'
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'

import { relId } from '@/lib/relations'
import type { Category, Item, List, User } from '@/payload-types'

import { expectRejected } from './expect'
import { clearContent, createStaff, getTestPayload } from './helpers'

type Staff = User & { collection: 'users' }

let payload: Payload
let admin: Staff
let editor: Staff
let film: Category
let food: Category

const as = () => ({ user: editor, overrideAccess: false })

/** Lưu nháp như admin: form gửi lại cả slug đang hiển thị. */
const saveItemDraft = (id: number, data: Partial<Item>, autosave = true) =>
  payload.update({
    collection: 'items',
    id,
    data: { ...data, _status: 'draft' },
    draft: true,
    autosave,
    ...as(),
  })

const publishItem = (id: number, data: Partial<Item> = {}) =>
  payload.update({ collection: 'items', id, data: { ...data, _status: 'published' }, ...as() })

const newItemDraft = (data: Partial<Item> = {}) =>
  payload.create({
    collection: 'items',
    data: { ...data, _status: 'draft' } as Item,
    draft: true,
    ...as(),
  })

describe('Nháp, autosave, slug tự sinh và ngày đăng', () => {
  beforeAll(async () => {
    payload = await getTestPayload()
    ;({ admin, editor } = await createStaff(payload))
    await clearContent(payload)
    const info = await payload.create({
      collection: 'categories',
      data: { name: 'Thông tin', slug: 'info', itemRoute: 'wiki' } as Category,
    })
    const product = await payload.create({
      collection: 'categories',
      data: { name: 'Sản phẩm & Dịch vụ', slug: 'product', itemRoute: 'review' } as Category,
    })
    film = await payload.create({
      collection: 'categories',
      data: { name: 'Phim & Series', parent: info.id } as Category,
    })
    food = await payload.create({
      collection: 'categories',
      data: { name: 'Ẩm thực', parent: product.id } as Category,
    })
  })
  afterAll(async () => {
    await payload.destroy()
  })
  beforeEach(async () => {
    await clearContent(payload, 'items')
  })

  describe('mục', () => {
    it('autosave lưu được nháp còn trống tên và chuyên mục; đăng thì báo thiếu', async () => {
      const draft = await newItemDraft()
      expect(draft).toMatchObject({ _status: 'draft', url: null, publishedAt: null })
      expect(draft.slug ?? null).toBeNull()
      await expectRejected(publishItem(draft.id), /./)
    })

    it('trước lần đăng đầu, slug đi theo tên; từ lần đăng đầu slug cố định', async () => {
      const draft = await newItemDraft({ name: 'Hai Phượng' })
      expect(draft.slug).toBe('hai-phuong')

      const renamed = await saveItemDraft(draft.id, {
        name: 'Hai Phượng Bản Đặc Biệt',
        slug: draft.slug,
      })
      expect(renamed.slug).toBe('hai-phuong-ban-dac-biet')

      const published = await publishItem(draft.id, { category: film.id, slug: renamed.slug })
      expect(published).toMatchObject({
        slug: 'hai-phuong-ban-dac-biet',
        url: '/wiki/hai-phuong-ban-dac-biet',
        generateSlug: false,
      })

      const after = await saveItemDraft(draft.id, {
        name: 'Hai Phượng (2019)',
        slug: published.slug,
      })
      expect(after.slug).toBe('hai-phuong-ban-dac-biet')
    })

    it('slug tự sửa tay được giữ nguyên khi đổi tên sau đó', async () => {
      const draft = await newItemDraft({ name: 'Mắt Biếc' })
      const manual = await saveItemDraft(draft.id, { name: 'Mắt Biếc', slug: 'Mắt Biếc Phim' })
      expect(manual).toMatchObject({ slug: 'mat-biec-phim', generateSlug: false })
      const renamed = await saveItemDraft(draft.id, { name: 'Mắt Biếc (2019)', slug: manual.slug })
      expect(renamed.slug).toBe('mat-biec-phim')
    })

    it('hậu tố chống trùng không bị autosave ghi đè', async () => {
      const district = (d: string) => [{ blockType: 'place' as const, city: 'Hà Nội', district: d }]
      await payload.create({
        collection: 'items',
        data: { name: 'Phở Thìn', category: food.id, _status: 'published' } as Item,
        ...as(),
      })
      const second = await newItemDraft({
        name: 'Phở Thìn',
        category: food.id,
        attributes: district('Hai Bà Trưng'),
      })
      expect(second.slug).toBe('pho-thin-ha-noi')
      const again = await saveItemDraft(second.id, {
        name: 'Phở Thìn',
        slug: second.slug,
        summary: 'Phở tái lăn.',
      })
      expect(again.slug).toBe('pho-thin-ha-noi')
    })

    it('ngày đăng ghi một lần ở lần đăng đầu và không đổi ở các lần lưu sau', async () => {
      const draft = await newItemDraft({ name: 'Song Lang', category: film.id })
      expect(draft.publishedAt).toBeNull()
      const first = await publishItem(draft.id)
      expect(first.publishedAt).toBeTruthy()
      await saveItemDraft(draft.id, { summary: 'Phim về cải lương.' })
      const second = await publishItem(draft.id, { summary: 'Phim về cải lương.' })
      expect(second.publishedAt).toBe(first.publishedAt)
    })

    it('không sửa được ngày đăng qua API', async () => {
      const item = await payload.create({
        collection: 'items',
        data: { name: 'Bố Già', category: film.id, _status: 'published' } as Item,
        ...as(),
      })
      const updated = await publishItem(item.id, { publishedAt: '2000-01-01T00:00:00.000Z' })
      expect(updated.publishedAt).toBe(item.publishedAt)
    })
  })

  describe('bảng', () => {
    it('nháp trống tiêu đề lưu được; slug theo tiêu đề trước khi đăng; đăng ghi ngày đăng', async () => {
      const draft = await payload.create({
        collection: 'lists',
        data: { _status: 'draft' } as List,
        draft: true,
        ...as(),
      })
      expect(draft.url).toBeNull()

      const titled = await payload.update({
        collection: 'lists',
        id: draft.id,
        data: { title: 'Phim Việt Hay Nhất', _status: 'draft' },
        draft: true,
        autosave: true,
        ...as(),
      })
      expect(titled.slug).toBe('phim-viet-hay-nhat')

      await expectRejected(
        payload.update({
          collection: 'lists',
          id: draft.id,
          data: { _status: 'published' },
          ...as(),
        }),
        /chuyên mục/,
      )

      const published = await payload.update({
        collection: 'lists',
        id: draft.id,
        data: { category: film.id, slug: titled.slug, _status: 'published' },
        ...as(),
      })
      expect(published).toMatchObject({ url: '/list/phim-viet-hay-nhat', generateSlug: false })
      expect(published.publishedAt).toBeTruthy()
    })
  })

  describe('suất tham gia', () => {
    it('mỗi lần sửa lưu một phiên bản kèm người sửa', async () => {
      const list = await payload.create({
        collection: 'lists',
        data: { title: 'Phim Việt Hay Nhất', category: film.id, _status: 'published' } as List,
        ...as(),
      })
      const item = await payload.create({
        collection: 'items',
        data: { name: 'Bố Già', category: film.id, _status: 'published' } as Item,
        ...as(),
      })
      const entry = await payload.create({
        collection: 'entries',
        data: { list: list.id, item: item.id },
        ...as(),
      })
      await payload.update({
        collection: 'entries',
        id: entry.id,
        data: { blurb: null },
        user: admin,
        overrideAccess: false,
      })

      const { docs } = await payload.findVersions({
        collection: 'entries',
        where: { parent: { equals: entry.id } },
        sort: 'createdAt',
      })
      expect(docs.map((v) => relId(v.version.updatedBy))).toEqual([editor.id, admin.id])
    })
  })
})
