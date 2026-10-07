import { createLocalReq, type Payload } from 'payload'
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'

import { countAffectedUrls } from '@/collections/Categories/placement'
import { relId } from '@/lib/relations'
import type { Category, User } from '@/payload-types'

import { expectRejected } from './expect'
import { clearContent, createStaff, getTestPayload } from './helpers'

type Staff = User & { collection: 'users' }

let payload: Payload
let admin: Staff
let editor: Staff
let product: Category
let info: Category

const create = (data: Partial<Category>, user: Staff = admin) =>
  payload.create({
    collection: 'categories',
    data: data as Category,
    user,
    overrideAccess: false,
  })

const update = (
  id: number,
  data: Partial<Category> & { confirmUrlChange?: boolean },
  user = admin,
) => payload.update({ collection: 'categories', id, data, user, overrideAccess: false })

const get = (id: number) => payload.findByID({ collection: 'categories', id, depth: 0 })

async function redirectTarget(from: string) {
  const { docs } = await payload.find({
    collection: 'redirects',
    where: { from: { equals: from } },
    depth: 0,
  })
  return docs[0] ? relId(docs[0].to?.reference?.value) : null
}

describe('Chuyên mục', () => {
  beforeAll(async () => {
    payload = await getTestPayload()
    ;({ admin, editor } = await createStaff(payload))
  })
  afterAll(async () => {
    await payload.destroy()
  })
  beforeEach(async () => {
    await clearContent(payload)
    product = await create({ name: 'Sản phẩm & Dịch vụ', slug: 'product', itemRoute: 'review' })
    info = await create({ name: 'Thông tin', slug: 'info', itemRoute: 'wiki' })
  })

  describe('cấu trúc 3 tầng', () => {
    it('tính slug, đường dẫn, tầng, nhóm và tiền tố mục; URL không chứa nhóm lớn', async () => {
      const film = await create({ name: 'Phim & Series', parent: info.id })
      const viet = await create({ name: 'Phim Việt', parent: film.id })

      expect(film).toMatchObject({
        slug: 'phim-series',
        path: 'phim-series',
        level: 1,
        itemRoute: 'wiki',
      })
      expect(relId(film.group)).toBe(info.id)
      expect(viet).toMatchObject({ path: 'phim-series/phim-viet', level: 2, itemRoute: 'wiki' })
      expect(relId(viet.group)).toBe(info.id)
      expect(info).toMatchObject({ path: 'info', level: 0 })

      const saved = await get(viet.id)
      expect(saved.breadcrumbs?.map((b) => b.url)).toEqual([
        '/info',
        '/phim-series',
        '/phim-series/phim-viet',
      ])
    })

    it('chặn tầng thứ 4', async () => {
      const film = await create({ name: 'Phim & Series', parent: info.id })
      const viet = await create({ name: 'Phim Việt', parent: film.id })
      await expectRejected(create({ name: 'Phim Việt Cũ', parent: viet.id }), /tối đa 3 tầng/)
    })

    it('nhóm lớn bắt buộc chọn tiền tố URL mục', async () => {
      await expectRejected(create({ name: 'Nhóm Mới', slug: 'nhom-moi' }), /tiền tố URL/)
    })

    it('chặn vòng lặp chuyên mục cha', async () => {
      const film = await create({ name: 'Phim & Series', parent: info.id })
      const viet = await create({ name: 'Phim Việt', parent: film.id })
      await expectRejected(
        update(film.id, { parent: viet.id, confirmUrlChange: true }),
        /chuyên mục con của nó làm cha/,
      )
    })

    it('chặn chuyển chuyên mục sang nhóm lớn khác', async () => {
      const film = await create({ name: 'Phim & Series', parent: info.id })
      await expectRejected(
        update(film.id, { parent: product.id, confirmUrlChange: true }),
        /nhóm lớn khác/,
      )
    })

    it('chặn đổi nhóm lớn thành chuyên mục thường', async () => {
      await expectRejected(
        update(info.id, { parent: product.id, confirmUrlChange: true }),
        /Không thể đổi nhóm lớn/,
      )
    })

    it('chặn slug trùng URL đã có', async () => {
      const film = await create({ name: 'Phim & Series', parent: info.id })
      await create({ name: 'Phim Việt', parent: film.id })
      await expectRejected(create({ name: 'Phim Việt', parent: film.id }), /đã được dùng/)
    })
  })

  describe('từ khóa dành riêng', () => {
    it.each(['list', 'review', 'wiki', 'product', 'info', 'admin', 'api'])(
      'chuyên mục ở gốc không dùng được slug "%s"',
      async (slug) => {
        await expectRejected(
          create({ name: 'Thử', slug, parent: info.id }),
          /dành riêng|đã được dùng/,
        )
      },
    )

    it('nhóm lớn không dùng được từ khóa hệ thống', async () => {
      await expectRejected(
        create({ name: 'Danh sách', slug: 'list', itemRoute: 'review' }),
        /dành riêng/,
      )
    })
  })

  describe('phân quyền', () => {
    it('biên tập viên không tạo được chuyên mục', async () => {
      await expectRejected(create({ name: 'Ca sĩ', parent: info.id }, editor), /không có quyền/)
    })

    it('biên tập viên sửa được nội dung nhưng không đổi được slug hay chuyên mục cha', async () => {
      const film = await create({ name: 'Phim & Series', parent: info.id })
      const updated = await update(
        film.id,
        { name: 'Phim và Series', slug: 'doi-slug', parent: product.id, confirmUrlChange: true },
        editor,
      )
      expect(updated).toMatchObject({
        name: 'Phim và Series',
        slug: 'phim-series',
        path: 'phim-series',
      })
      expect(relId(updated.parent)).toBe(info.id)
      expect(relId(updated.createdBy)).toBe(admin.id)
      expect(relId(updated.updatedBy)).toBe(editor.id)
    })
  })

  describe('đổi URL và redirect 301', () => {
    let film: Category
    let viet: Category
    let han: Category

    beforeEach(async () => {
      film = await create({ name: 'Phim & Series', parent: info.id })
      viet = await create({ name: 'Phim Việt', parent: film.id })
      han = await create({ name: 'Phim Hàn', parent: film.id })
    })

    it('đếm đúng số URL bị ảnh hưởng (chính nó và mọi chuyên mục con)', async () => {
      const req = await createLocalReq({}, payload)
      expect(await countAffectedUrls(req, film.id)).toBe(3)
      expect(await countAffectedUrls(req, viet.id)).toBe(1)
      expect(await countAffectedUrls(req, info.id)).toBe(4)
    })

    it('chưa xác nhận thì không cho đổi URL', async () => {
      await expectRejected(update(film.id, { slug: 'phim-va-series' }), /xác nhận đổi URL/)
      expect((await get(film.id)).path).toBe('phim-series')
    })

    it('đổi slug chuyên mục cha: đổi URL và tạo redirect cho chính nó và toàn bộ chuyên mục con', async () => {
      await update(film.id, { slug: 'phim-va-series', confirmUrlChange: true })

      expect((await get(film.id)).path).toBe('phim-va-series')
      expect((await get(viet.id)).path).toBe('phim-va-series/phim-viet')
      expect((await get(han.id)).path).toBe('phim-va-series/phim-han')

      expect(await redirectTarget('/phim-series')).toBe(film.id)
      expect(await redirectTarget('/phim-series/phim-viet')).toBe(viet.id)
      expect(await redirectTarget('/phim-series/phim-han')).toBe(han.id)
    })

    it('chuyển chuyên mục con sang cha khác: tạo redirect từ URL cũ', async () => {
      const anime = await create({ name: 'Hoạt hình', parent: info.id })
      await update(viet.id, { parent: anime.id, confirmUrlChange: true })

      expect((await get(viet.id)).path).toBe('hoat-hinh/phim-viet')
      expect(await redirectTarget('/phim-series/phim-viet')).toBe(viet.id)
    })

    it('đổi rồi đổi lại: không còn redirect nào từ URL hiện tại (không vòng lặp)', async () => {
      await update(film.id, { slug: 'phim-va-series', confirmUrlChange: true })
      await update(film.id, { slug: 'phim-series', confirmUrlChange: true })

      expect(await redirectTarget('/phim-series')).toBeNull()
      expect(await redirectTarget('/phim-series/phim-viet')).toBeNull()
      expect(await redirectTarget('/phim-va-series')).toBe(film.id)
      expect(await redirectTarget('/phim-va-series/phim-viet')).toBe(viet.id)
    })

    it('đổi tên không đổi slug thì không cần xác nhận và không tạo redirect', async () => {
      await update(film.id, { name: 'Phim và Series' })
      const { totalDocs } = await payload.count({ collection: 'redirects' })
      expect(totalDocs).toBe(0)
    })
  })
})
