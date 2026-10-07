import { createLocalReq, type Payload } from 'payload'
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'

import { getDeleteImpact, safeDelete, type SafeDeleteCollection } from '@/lib/deletion'
import type { Category, Item, List, User } from '@/payload-types'

import { expectRejected } from './expect'
import { clearContent, createStaff, getTestPayload } from './helpers'

type Staff = User & { collection: 'users' }

let payload: Payload
let admin: Staff
let editor: Staff
let info: Category
let film: Category

const reqAs = (user: Staff) => createLocalReq({ user }, payload)

const remove = async (user: Staff, collection: SafeDeleteCollection, id: number, name: string) =>
  safeDelete(await reqAs(user), collection, id, name)

const createItem = (name: string) =>
  payload.create({
    collection: 'items',
    data: { name, category: film.id, _status: 'published' } as Item,
  })
const createList = (title: string) =>
  payload.create({
    collection: 'lists',
    data: { title, category: film.id, _status: 'published' } as List,
  })
const addEntry = (list: number, item: number) =>
  payload.create({ collection: 'entries', data: { list, item } })

describe('Xóa an toàn (gõ tên để xác nhận)', () => {
  beforeAll(async () => {
    payload = await getTestPayload()
    ;({ admin, editor } = await createStaff(payload))
  })
  afterAll(async () => {
    await payload.destroy()
  })
  beforeEach(async () => {
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

  it('chỉ admin được xóa; gõ sai tên thì không xóa gì', async () => {
    const item = await createItem('Mắt Biếc')
    await expectRejected(remove(editor, 'items', item.id, 'Mắt Biếc'), /Chỉ Admin/)
    await expectRejected(remove(admin, 'items', item.id, 'Mat Biec'), /không khớp/)
    expect(await payload.findByID({ collection: 'items', id: item.id })).toBeTruthy()
  })

  it('xóa mục: thấy trước các bảng chứa mục; sau khi xóa, suất bị gỡ, bảng vẫn còn', async () => {
    const item = await createItem('Mắt Biếc')
    const other = await createItem('Bố Già')
    const listA = await createList('Phim Việt Hay Nhất')
    const listB = await createList('Phim Chuyển Thể Hay Nhất')
    await addEntry(listA.id, item.id)
    await addEntry(listB.id, item.id)
    await addEntry(listA.id, other.id)

    const impact = await getDeleteImpact(await reqAs(admin), 'items', item.id)
    expect(impact?.listsContaining?.map((l) => l.title).sort()).toEqual([
      'Phim Chuyển Thể Hay Nhất',
      'Phim Việt Hay Nhất',
    ])

    await remove(admin, 'items', item.id, 'Mắt Biếc')

    const entries = await payload.find({ collection: 'entries', depth: 0 })
    expect(entries.docs.map((e) => e.item)).toEqual([other.id])
    expect(await payload.count({ collection: 'lists' })).toMatchObject({ totalDocs: 2 })
  })

  it('xóa mục cũng xóa redirect trỏ tới mục đó', async () => {
    const item = await createItem('Mắt Biếc')
    await payload.update({
      collection: 'items',
      id: item.id,
      data: {
        slug: 'mat-biec-2019',
        _status: 'published',
        confirmUrlChange: true,
      } as Partial<Item>,
    })
    expect((await payload.count({ collection: 'redirects' })).totalDocs).toBe(1)
    await remove(admin, 'items', item.id, 'Mắt Biếc')
    expect((await payload.count({ collection: 'redirects' })).totalDocs).toBe(0)
  })

  it('xóa bảng: báo số mục; sau khi xóa, suất bị gỡ, mục vẫn còn', async () => {
    const list = await createList('Phim Việt Hay Nhất')
    const item = await createItem('Mắt Biếc')
    await addEntry(list.id, item.id)
    expect((await getDeleteImpact(await reqAs(admin), 'lists', list.id))?.entryCount).toBe(1)

    await remove(admin, 'lists', list.id, 'Phim Việt Hay Nhất')
    expect((await payload.count({ collection: 'entries' })).totalDocs).toBe(0)
    expect(await payload.findByID({ collection: 'items', id: item.id })).toBeTruthy()
  })

  it('chặn xóa chuyên mục còn chuyên mục con, bảng hoặc mục', async () => {
    await payload.create({
      collection: 'categories',
      data: { name: 'Phim Việt', parent: film.id } as Category,
    })
    await createList('Phim Hay')
    await createItem('Mắt Biếc')

    const impact = await getDeleteImpact(await reqAs(admin), 'categories', film.id)
    expect(impact).toMatchObject({
      blocked: true,
      children: { total: 1 },
      lists: { total: 1 },
      items: { total: 1 },
    })
    await expectRejected(remove(admin, 'categories', film.id, 'Phim & Series'), /chuyển chúng sang/)
  })

  it('xóa được chuyên mục trống', async () => {
    const empty = await payload.create({
      collection: 'categories',
      data: { name: 'Ca sĩ', parent: info.id } as Category,
    })
    await remove(admin, 'categories', empty.id, 'Ca sĩ')
    expect(
      await payload.findByID({ collection: 'categories', id: empty.id, disableErrors: true }),
    ).toBeNull()
  })
})
