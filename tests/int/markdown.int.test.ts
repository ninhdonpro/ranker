import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import type { Payload } from 'payload'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

import { RichText } from '@/components/RichText'
import { lexicalToMarkdown, markdownToLexical } from '@/lexical/markdown'

import { getTestPayload } from './helpers'

let payload: Payload

const MARKDOWN = `Chuyển thể từ tiểu thuyết của **Nguyễn Nhật Ánh**, *Mắt Biếc* là câu chuyện về Ngạn.

## Nội dung chính

- Ngạn và Hà Lan lớn lên ở làng Đo Đo
- Hà Lan lên thành phố học

### Âm nhạc

> Có chàng trai viết lên cây

1. Bối cảnh Quảng Nam
2. Cảnh trường học ở Huế

Xem thêm trên [trang của Galaxy](https://www.galaxystudio.vn/).`

describe('Markdown → Lexical (cho pipeline tạo nội dung sau này)', () => {
  beforeAll(async () => {
    payload = await getTestPayload()
  })
  afterAll(async () => {
    await payload.destroy()
  })

  it('chuyển Markdown thành JSON Lexical đúng các loại khối của editor', async () => {
    const data = await markdownToLexical(MARKDOWN, payload.config)
    const types = data.root.children.map((node) =>
      node.type === 'heading' ? `heading:${(node as { tag?: string }).tag}` : node.type,
    )
    expect(types).toEqual([
      'paragraph',
      'heading:h2',
      'list',
      'heading:h3',
      'quote',
      'list',
      'paragraph',
    ])
  })

  it('nội dung chuyển từ Markdown render ra HTML phía server đầy đủ', async () => {
    const data = await markdownToLexical(MARKDOWN, payload.config)
    const html = renderToStaticMarkup(createElement(RichText, { data }))
    expect(html).toContain('<h2>Nội dung chính</h2>')
    expect(html).toContain('<h3>Âm nhạc</h3>')
    expect(html).toContain('<strong>Nguyễn Nhật Ánh</strong>')
    expect(html).toContain('<li')
    expect(html).toContain('<blockquote>')
    expect(html).toContain('href="https://www.galaxystudio.vn/"')
  })

  it('chuyển ngược ra Markdown giữ được cấu trúc', async () => {
    const data = await markdownToLexical(MARKDOWN, payload.config)
    const markdown = await lexicalToMarkdown(data, payload.config)
    expect(markdown).toContain('## Nội dung chính')
    expect(markdown).toContain('- Ngạn và Hà Lan lớn lên ở làng Đo Đo')
  })
})
