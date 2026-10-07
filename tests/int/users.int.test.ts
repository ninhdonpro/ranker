import type { Payload } from 'payload'
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'

import { expectRejected } from './expect'
import { clearCollection, getTestPayload } from './helpers'

let payload: Payload

const newUser = (email: string, role: 'admin' | 'editor' = 'editor') =>
  payload.create({
    collection: 'users',
    data: { email, password: 'mat-khau-test-123', displayName: email, role },
  })

describe('Người dùng và phân quyền', () => {
  beforeAll(async () => {
    payload = await getTestPayload()
  })
  afterAll(async () => {
    await payload.destroy()
  })
  beforeEach(async () => {
    await clearCollection(payload, 'users')
  })

  it('tài khoản đầu tiên luôn là admin, các tài khoản sau giữ vai trò được chọn', async () => {
    const first = await newUser('dau-tien@ranker.test', 'editor')
    const second = await newUser('thu-hai@ranker.test', 'editor')
    expect(first.role).toBe('admin')
    expect(second.role).toBe('editor')
  })

  it('biên tập viên không tự nâng vai trò của mình', async () => {
    await newUser('admin@ranker.test')
    const editor = await newUser('bien-tap@ranker.test')
    const updated = await payload.update({
      collection: 'users',
      id: editor.id,
      data: { role: 'admin' },
      user: { ...editor, collection: 'users' },
      overrideAccess: false,
    })
    expect(updated.role).toBe('editor')
  })

  it('biên tập viên xem được danh sách nhân sự nhưng không sửa được tài khoản khác', async () => {
    const admin = await newUser('admin@ranker.test', 'admin')
    const editor = await newUser('bien-tap@ranker.test')
    const res = await payload.find({
      collection: 'users',
      user: { ...editor, collection: 'users' },
      overrideAccess: false,
    })
    expect(res.docs.map((u) => u.id).sort()).toEqual([admin.id, editor.id].sort())
    await expectRejected(
      payload.update({
        collection: 'users',
        id: admin.id,
        data: { displayName: 'Đổi tên' },
        user: { ...editor, collection: 'users' },
        overrideAccess: false,
      }),
      /không có quyền/,
    )
  })

  it('không xóa hay hạ vai trò admin cuối cùng', async () => {
    const admin = await newUser('admin@ranker.test', 'admin')
    await expect(payload.delete({ collection: 'users', id: admin.id })).rejects.toThrow(
      /ít nhất một tài khoản Admin/,
    )
    await expect(
      payload.update({ collection: 'users', id: admin.id, data: { role: 'editor' } }),
    ).rejects.toThrow(/ít nhất một tài khoản Admin/)
  })
})
