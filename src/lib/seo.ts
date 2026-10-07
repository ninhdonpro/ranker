import { convertLexicalToPlaintext } from '@payloadcms/richtext-lexical/plaintext'
import type { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical'

const SITE_NAME = 'Ranker.vn'
const DESCRIPTION_LENGTH = 155

type SeoSource = {
  meta?: { title?: null | string; description?: null | string } | null
  /** Tên (mục, chuyên mục) hoặc tiêu đề (bảng). */
  heading: string
  /** Các nguồn mô tả theo thứ tự ưu tiên: chuỗi thường hoặc nội dung Lexical. */
  descriptions: (SerializedEditorState | null | string | undefined)[]
}

const truncate = (text: string, max: number) => {
  const clean = text.replace(/\s+/g, ' ').trim()
  if (clean.length <= max) return clean
  const cut = clean.slice(0, max - 1)
  return `${cut.slice(0, cut.lastIndexOf(' ') > 0 ? cut.lastIndexOf(' ') : cut.length)}…`
}

/**
 * Tiêu đề và mô tả SEO của một trang công khai. Biên tập viên để trống thì dùng giá trị mặc
 * định tính lúc render (không ghi vào DB), nên mặc định luôn theo nội dung mới nhất.
 */
export function getSeoMeta({ meta, heading, descriptions }: SeoSource) {
  const title = meta?.title?.trim() || `${heading} | ${SITE_NAME}`
  let description = meta?.description?.trim() || ''
  for (const source of descriptions) {
    if (description) break
    if (!source) continue
    const text = typeof source === 'string' ? source : convertLexicalToPlaintext({ data: source })
    if (text.trim()) description = truncate(text, DESCRIPTION_LENGTH)
  }
  return { title, description }
}
