import type { PayloadRequest, ValidationFieldError } from 'payload'

import { relId } from '@/lib/relations'
import { isValidSlug } from '@/lib/slug'
import { itemUrl } from '@/lib/url'
import type { Item } from '@/payload-types'

import { availableSlugSuggestions, findItemBySlug } from './slugSuggestions'

type Result = { ok: true; url: string } | { ok: false; errors: ValidationFieldError[] }

const fail = (path: string, message: string): Result => ({ ok: false, errors: [{ path, message }] })

/**
 * Kiểm tra slug và chuyên mục của mục, trả về URL công khai.
 * Tiền tố /review hoặc /wiki lấy từ nhóm lớn gốc của chuyên mục.
 */
export async function resolveItemUrl(
  req: PayloadRequest,
  input: { id?: number | null; slug: unknown; category: unknown; attributes: Item['attributes'] },
): Promise<Result> {
  const { id, slug } = input
  if (!isValidSlug(slug)) {
    return fail('slug', 'Slug chỉ gồm chữ thường không dấu, số và dấu gạch ngang.')
  }

  const categoryId = relId(input.category)
  const category = categoryId
    ? await req.payload.findByID({
        collection: 'categories',
        id: categoryId,
        depth: 0,
        req,
        disableErrors: true,
      })
    : null
  if (!category) return fail('category', 'Hãy chọn chuyên mục cho mục này.')
  if (category.level === 0 || !category.itemRoute) {
    return fail('category', 'Hãy chọn chuyên mục hoặc chuyên mục con, không chọn nhóm lớn.')
  }

  const taken = await findItemBySlug(req, slug, id)
  if (taken) {
    const suggestions = await availableSlugSuggestions(req, slug, input.attributes, id)
    return fail(
      'slug',
      `Slug "${slug}" đã được dùng bởi mục "${taken.name}". Gợi ý: ${suggestions.join(', ')}.`,
    )
  }

  return { ok: true, url: itemUrl(category.itemRoute, slug) }
}
