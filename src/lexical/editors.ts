import {
  BlockquoteFeature,
  BoldFeature,
  FixedToolbarFeature,
  HeadingFeature,
  InlineToolbarFeature,
  ItalicFeature,
  LinkFeature,
  lexicalEditor,
  OrderedListFeature,
  ParagraphFeature,
  UnorderedListFeature,
  UploadFeature,
  type LexicalEditorProps,
} from '@payloadcms/richtext-lexical'
import type { CollectionSlug } from 'payload'

/** Collection được phép làm đích của link nội bộ (link lưu tham chiếu, đổi slug không gãy). */
const INTERNAL_LINK_COLLECTIONS: CollectionSlug[] = ['lists', 'items', 'categories']

/**
 * Link ngoài có thêm thuộc tính `rel`: `sponsored` cho link affiliate/tài trợ, `nofollow` cho
 * link không muốn truyền uy tín (theo hướng dẫn của Google). Link nội bộ không cần.
 */
const linkFeature = () =>
  LinkFeature({
    enabledCollections: INTERNAL_LINK_COLLECTIONS,
    fields: ({ defaultFields }) => [
      ...defaultFields,
      {
        name: 'rel',
        label: 'Thuộc tính rel',
        type: 'select',
        hasMany: true,
        options: [
          { value: 'sponsored', label: 'sponsored (affiliate, tài trợ)' },
          { value: 'nofollow', label: 'nofollow' },
        ],
        admin: { condition: (_, siblingData) => siblingData?.linkType === 'custom' },
      },
    ],
  })

/**
 * Bộ tính năng của editor đầy đủ cho nội dung dài (giới thiệu bảng, mô tả mục, giới thiệu
 * chuyên mục). H1 dành cho tiêu đề trang nên chỉ bật H2/H3. Menu `/` có sẵn. Ảnh chèn từ Media.
 */
export const editorFullFeatures: NonNullable<LexicalEditorProps['features']> = () => [
  ParagraphFeature(),
  HeadingFeature({ enabledHeadingSizes: ['h2', 'h3'] }),
  BoldFeature(),
  ItalicFeature(),
  UnorderedListFeature(),
  OrderedListFeature(),
  BlockquoteFeature(),
  linkFeature(),
  UploadFeature({ enabledCollections: ['media'] }),
  FixedToolbarFeature(),
  InlineToolbarFeature(),
]

export const editorFull = () => lexicalEditor({ features: editorFullFeatures })

/** Editor gọn cho mô tả theo ngữ cảnh của suất tham gia: đoạn văn, đậm, nghiêng, link. */
export const editorCompact = () =>
  lexicalEditor({
    features: () => [
      ParagraphFeature(),
      BoldFeature(),
      ItalicFeature(),
      linkFeature(),
      InlineToolbarFeature(),
    ],
  })
