import { rm } from 'node:fs/promises'
import path from 'node:path'

import type { Payload } from 'payload'
import sharp from 'sharp'
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'

import { relId } from '@/lib/relations'
import type { User } from '@/payload-types'

import { expectRejected } from './expect'
import { clearCollection, createStaff, getTestPayload } from './helpers'

type Staff = User & { collection: 'users' }

let payload: Payload
let admin: Staff
let editor: Staff

const jpeg = async (name = 'poster-mat-biec.jpg') => {
  const data = await sharp({
    create: { width: 1600, height: 900, channels: 3, background: '#E5262B' },
  })
    .jpeg()
    .toBuffer()
  return { data, mimetype: 'image/jpeg', name, size: data.length }
}

const upload = async (alt: string, user: Staff = editor, file?: Awaited<ReturnType<typeof jpeg>>) =>
  payload.create({
    collection: 'media',
    data: { alt },
    file: file ?? (await jpeg()),
    user,
    overrideAccess: false,
  })

describe('Media', () => {
  beforeAll(async () => {
    payload = await getTestPayload()
    ;({ admin, editor } = await createStaff(payload))
  })
  afterAll(async () => {
    // Khi chạy test, storage R2 tắt nên file nằm ở thư mục local; dọn sau khi chạy.
    await rm(path.resolve(process.cwd(), 'media'), { recursive: true, force: true })
    await payload.destroy()
  })
  beforeEach(async () => {
    await clearCollection(payload, 'media')
  })

  it('chuyển ảnh sang webp và sinh đủ các cỡ ảnh', async () => {
    const doc = await upload('Poster phim Mắt Biếc (2019)')
    expect(doc.mimeType).toBe('image/webp')
    expect(doc.filename).toMatch(/\.webp$/)
    expect(doc.sizes?.thumb).toMatchObject({ width: 176, height: 176 })
    expect(doc.sizes?.card).toMatchObject({ width: 960, height: 540 })
    expect(doc.sizes?.og).toMatchObject({ width: 1200, height: 630 })
    expect(relId(doc.createdBy)).toBe(editor.id)
  })

  it('bắt buộc alt text đủ dài', async () => {
    await expectRejected(upload(''), /Alt text|alt/i)
    await expectRejected(upload('ảnh'), /ít nhất 5 ký tự/)
  })

  it('alt text không được là tên file', async () => {
    await expectRejected(upload('IMG_2024.jpg'), /không được là tên file/)
    await expectRejected(
      upload('poster-mat-biec', editor, await jpeg('poster-mat-biec.jpg')),
      /không được là tên file/,
    )
  })

  it('chỉ nhận file ảnh', async () => {
    const data = Buffer.from('không phải ảnh')
    await expectRejected(
      upload('Tài liệu văn bản', editor, {
        data,
        mimetype: 'text/plain',
        name: 'a.txt',
        size: data.length,
      }),
      /./,
    )
  })

  it('biên tập viên upload được nhưng không xóa được ảnh; admin xóa được', async () => {
    const doc = await upload('Poster phim Mắt Biếc (2019)')
    await expectRejected(
      payload.delete({ collection: 'media', id: doc.id, user: editor, overrideAccess: false }),
      /không có quyền/,
    )
    await payload.delete({ collection: 'media', id: doc.id, user: admin, overrideAccess: false })
  })
})
