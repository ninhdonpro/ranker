import {
  convertLexicalToMarkdown,
  convertMarkdownToLexical,
  editorConfigFactory,
} from '@payloadcms/richtext-lexical'
import type { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical'
import type { SanitizedConfig } from 'payload'

import type { Item } from '@/payload-types'

import { editorFullFeatures } from './editors'

/** Kiểu JSON của field rich text do Payload sinh (giống nhau cho mọi field richText). */
export type RichTextJSON = NonNullable<Item['description']>

const editorConfig = (config: SanitizedConfig) =>
  editorConfigFactory.fromFeatures({ config, features: editorFullFeatures })

/**
 * Chuyển Markdown thành nội dung Lexical theo đúng bộ tính năng của editor đầy đủ (H2/H3,
 * danh sách, trích dẫn, đậm, nghiêng, link ngoài). Dùng cho seed và cho pipeline tạo nội dung
 * sau này. Link nội bộ (tham chiếu tới mục, bảng, chuyên mục) không biểu diễn được bằng Markdown.
 */
export async function markdownToLexical(
  markdown: string,
  config: SanitizedConfig,
): Promise<RichTextJSON> {
  const state = convertMarkdownToLexical({ editorConfig: await editorConfig(config), markdown })
  return state as RichTextJSON
}

/** Chiều ngược lại, dùng khi cần xuất nội dung ra Markdown. */
export async function lexicalToMarkdown(
  data: RichTextJSON | SerializedEditorState,
  config: SanitizedConfig,
): Promise<string> {
  return convertLexicalToMarkdown({
    data: data as SerializedEditorState,
    editorConfig: await editorConfig(config),
  })
}
