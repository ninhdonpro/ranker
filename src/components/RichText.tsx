import type { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical'
import {
  RichText as PayloadRichText,
  type JSXConvertersFunction,
} from '@payloadcms/richtext-lexical/react'
import type { SerializedLinkNode } from '@payloadcms/richtext-lexical'

import { docUrl } from '@/lib/url'

type LinkFields = SerializedLinkNode['fields'] & { rel?: string[] | null }

/** URL của link nội bộ: đọc từ tài liệu đích (đã populate), nên đổi slug không làm gãy link. */
function internalHref(node: SerializedLinkNode): string {
  const doc = node.fields.doc as Parameters<typeof docUrl>[0] | undefined
  if (!doc || typeof doc.value !== 'object' || doc.value === null) return '#'
  return docUrl(doc) ?? '#'
}

const converters: JSXConvertersFunction = ({ defaultConverters }) => ({
  ...defaultConverters,
  link: ({ node, nodesToJSX }) => {
    const fields = node.fields as LinkFields
    const internal = fields.linkType === 'internal'
    const rel = [
      ...(internal ? [] : (fields.rel ?? [])),
      ...(fields.newTab ? ['noopener', 'noreferrer'] : []),
    ]
    return (
      <a
        href={internal ? internalHref(node) : (fields.url ?? '#')}
        rel={rel.length ? rel.join(' ') : undefined}
        target={fields.newTab ? '_blank' : undefined}
      >
        {nodesToJSX({ nodes: node.children })}
      </a>
    )
  },
})

/**
 * Render nội dung Lexical phía server (Server Component) để Google đọc được đầy đủ.
 * Tài liệu chứa nội dung cần được lấy với `depth` ≥ 1 để link nội bộ và ảnh được populate.
 */
export function RichText({ data }: { data: SerializedEditorState | null | undefined }) {
  if (!data) return null
  return <PayloadRichText data={data} converters={converters} disableContainer />
}
