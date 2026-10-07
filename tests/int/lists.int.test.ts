import type { Payload } from 'payload'
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'

import { ENTRY_ORDER_FIELD, getRankedEntries } from '@/lib/ranking'
import { relId } from '@/lib/relations'
import type { Category, Item, List, User } from '@/payload-types'

import { expectRejected } from './expect'
import { clearContent, createStaff, getTestPayload } from './helpers'

type Staff = User & { collection: 'users' }
type ListInput = Partial<List> & { confirmUrlChange?: boolean }

let payload: Payload
let admin: Staff
let editor: Staff
let film: Category
let info: Category

const as = { user: undefined as unknown as Staff, overrideAccess: false }

const createList = (data: ListInput, draft = false) =>
  payload.create({
    collection: 'lists',
    data: { _status: draft ? 'draft' : 'published', category: film.id, ...data } as List,
    draft,
    ...as,
  })

const updateList = (id: number, data: ListInput, draft = false) =>
  payload.update({
    collection: 'lists',
    id,
    data: { _status: draft ? 'draft' : 'published', ...data },
    draft,
    ...as,
  })

const createItem = (name: string) =>
  payload.create({
    collection: 'items',
    data: { name, category: film.id, _status: 'published' } as Item,
    ...as,
  })

const addEntry = (list: number, item: number) =>
  payload.create({ collection: 'entries', data: { list, item }, ...as })

describe('Bảng xếp hạng và suất tham gia', () => {
  beforeAll(async () => {
    payload = await getTestPayload()
    ;({ admin, editor } = await createStaff(payload))
    as.user = editor
    await clearContent(payload)
    info = await payload.create({
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
  beforeEach(async () => {
    await clearContent(payload, 'items')
  })

  describe('bảng', () => {
    it('sinh slug và URL /list/...; tác giả mặc định là người tạo', async () => {
      const list = await createList({ title: 'Phim Việt Hay Nhất Mọi Thời Đại' })
      expect(list).toMatchObject({
        slug: 'phim-viet-hay-nhat-moi-thoi-dai',
        url: '/list/phim-viet-hay-nhat-moi-thoi-dai',
        listType: 'permanent',
        rankingMode: 'manual',
      })
      expect(relId(list.createdBy)).toBe(editor.id)
    })

    it('slug trùng thì tự thêm -2', async () => {
      await createList({ title: 'Top 10 Điện Thoại' })
      expect((await createList({ title: 'Top 10 Điện Thoại' })).slug).toBe('top-10-dien-thoai-2')
    })

    it('bảng sự kiện cần ngày bắt đầu, kết thúc và kết thúc phải sau bắt đầu', async () => {
      await expectRejected(
        createList({ title: 'Giải Thưởng 2026', listType: 'event' }),
        /ngày bắt đầu/,
      )
      await expectRejected(
        createList({
          title: 'Giải Thưởng 2026',
          listType: 'event',
          startsAt: '2026-12-31T00:00:00.000Z',
          endsAt: '2026-12-01T00:00:00.000Z',
        }),
        /phải sau ngày bắt đầu/,
      )
      const ok = await createList({
        title: 'Giải Thưởng 2026',
        listType: 'event',
        startsAt: '2026-12-01T00:00:00.000Z',
        endsAt: '2026-12-31T00:00:00.000Z',
      })
      expect(ok.listType).toBe('event')
    })

    it('không chọn nhóm lớn làm chuyên mục', async () => {
      await expectRejected(
        createList({ title: 'Bảng Lỗi', category: info.id }),
        /không chọn nhóm lớn/,
      )
    })

    it('đổi slug bảng đã đăng: cần xác nhận khi đăng, tạo redirect 301', async () => {
      const list = await createList({ title: 'Phim Hay' })
      await updateList(list.id, { slug: 'phim-hay-nhat' }, true)
      await expectRejected(updateList(list.id, { slug: 'phim-hay-nhat' }), /xác nhận đổi URL/)
      await updateList(list.id, { slug: 'phim-hay-nhat', confirmUrlChange: true })
      const { docs } = await payload.find({
        collection: 'redirects',
        where: { from: { equals: '/list/phim-hay' } },
      })
      expect(relId(docs[0]?.to?.reference?.value)).toBe(list.id)
    })

    it('không xóa trực tiếp được bảng (kể cả admin)', async () => {
      const list = await createList({ title: 'Bảng Thử' })
      await expectRejected(
        payload.delete({ collection: 'lists', id: list.id, ...as }),
        /không có quyền/,
      )
      // Nút xóa mặc định bị tắt cho cả admin: phải qua luồng gõ tên để xác nhận.
      await expectRejected(
        payload.delete({ collection: 'lists', id: list.id, user: admin, overrideAccess: false }),
        /không có quyền/,
      )
    })
  })

  describe('suất tham gia', () => {
    it('ghi người tạo, xếp theo thứ tự thêm vào, và mục thấy được các bảng chứa nó', async () => {
      const list = await createList({ title: 'Phim Việt Hay Nhất' })
      const other = await createList({ title: 'Phim Chuyển Thể Hay Nhất' })
      const boGia = await createItem('Bố Già')
      const matBiec = await createItem('Mắt Biếc')
      const first = await addEntry(list.id, boGia.id)
      await addEntry(list.id, matBiec.id)
      await addEntry(other.id, matBiec.id)

      expect(relId(first.createdBy)).toBe(editor.id)
      const ranked = await getRankedEntries(payload, list)
      expect(ranked.map((r) => [r.rank, relId(r.entry.item)])).toEqual([
        [1, boGia.id],
        [2, matBiec.id],
      ])

      const withJoin = await payload.findByID({ collection: 'items', id: matBiec.id, depth: 1 })
      const lists = (withJoin.appearsIn?.docs ?? []).map((e) =>
        typeof e === 'object' ? relId(e.list) : null,
      )
      expect(lists.sort()).toEqual([list.id, other.id].sort())
    })

    it('đổi thứ tự (khóa sắp xếp) thì thứ hạng đổi theo', async () => {
      const list = await createList({ title: 'Phim Việt Hay Nhất' })
      const a = await addEntry(list.id, (await createItem('Bố Già')).id)
      const b = await addEntry(list.id, (await createItem('Mắt Biếc')).id)
      // Đưa a xuống sau b: khóa lớn hơn khóa của b (Payload dùng fractional index base-36).
      const keyB = b[ENTRY_ORDER_FIELD] as string
      await payload.update({
        collection: 'entries',
        id: a.id,
        data: { [ENTRY_ORDER_FIELD]: `${keyB}5` },
      })
      const ranked = await getRankedEntries(payload, list)
      expect(ranked.map((r) => r.entry.id)).toEqual([b.id, a.id])
    })

    it('chặn thêm cùng một mục vào một bảng lần hai', async () => {
      const list = await createList({ title: 'Phim Việt Hay Nhất' })
      const item = await createItem('Bố Già')
      await addEntry(list.id, item.id)
      await expectRejected(addEntry(list.id, item.id), /Mục "Bố Già" đã có trong bảng này/)
    })

    it('không đổi được mục hoặc bảng của suất đã tạo', async () => {
      const list = await createList({ title: 'Phim Việt Hay Nhất' })
      const entry = await addEntry(list.id, (await createItem('Bố Già')).id)
      const other = await createItem('Mắt Biếc')
      await expectRejected(
        payload.update({ collection: 'entries', id: entry.id, data: { item: other.id }, ...as }),
        /Không đổi được mục hoặc bảng/,
      )
    })

    it('mô tả theo ngữ cảnh lưu dạng Lexical JSON', async () => {
      const list = await createList({ title: 'Phim Việt Hay Nhất' })
      const entry = await payload.create({
        collection: 'entries',
        data: {
          list: list.id,
          item: (await createItem('Mắt Biếc')).id,
          blurb: {
            root: {
              type: 'root',
              version: 1,
              direction: 'ltr',
              format: '',
              indent: 0,
              children: [
                {
                  type: 'paragraph',
                  version: 1,
                  direction: 'ltr',
                  format: '',
                  indent: 0,
                  children: [
                    {
                      type: 'text',
                      version: 1,
                      text: 'Nhạc phim da diết.',
                      format: 0,
                      mode: 'normal',
                      style: '',
                      detail: 0,
                    },
                  ],
                },
              ],
            },
          },
        },
        ...as,
      })
      expect(JSON.stringify(entry.blurb)).toContain('Nhạc phim da diết.')
    })
  })
})
