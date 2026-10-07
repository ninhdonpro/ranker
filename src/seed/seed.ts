import type { Payload } from 'payload'
import sharp from 'sharp'

import { markdownToLexical } from '@/lexical/markdown'
import type { Category, Item, List, User } from '@/payload-types'

import {
  CATEGORIES,
  FILM_CATEGORY,
  GROUPS,
  OTHER_LISTS,
  type SeedAttributes,
  type SeedItem,
} from './data/catalog'
import { FILMS } from './data/films'
import { FILM_LIST_INTRO, MAT_BIEC_DESCRIPTION } from './data/longform'

type Options = { withImages?: boolean; log?: (message: string) => void }

/** Màu `cat-*` trong docs/design.md, dùng cho ảnh minh họa khi seed có ảnh. */
const CATEGORY_HEX: Record<string, string> = {
  tech: '#1F4E79',
  food: '#9A3412',
  beauty: '#9D174D',
  finance: '#065F46',
  travel: '#155E75',
  film: '#5B21B6',
  music: '#86198F',
  education: '#854D0E',
}

const SEED_IMAGE_PREFIX = 'seed-'

/** Nội dung do seed tạo bị xóa và tạo lại mỗi lần chạy (thứ tự an toàn với khóa ngoại). */
const CONTENT = ['entries', 'lists', 'items', 'categories', 'redirects'] as const

async function ensureStaff(payload: Payload): Promise<{ admin: User; editor: User }> {
  const accounts = [
    {
      email: process.env.SEED_ADMIN_EMAIL,
      password: process.env.SEED_ADMIN_PASSWORD,
      role: 'admin' as const,
      displayName: 'Quản trị viên',
    },
    {
      email: process.env.SEED_EDITOR_EMAIL,
      password: process.env.SEED_EDITOR_PASSWORD,
      role: 'editor' as const,
      displayName: 'Minh Anh',
    },
  ]
  const result: User[] = []
  for (const account of accounts) {
    if (!account.email || !account.password) {
      throw new Error(
        'Thiếu SEED_ADMIN_EMAIL/PASSWORD hoặc SEED_EDITOR_EMAIL/PASSWORD trong .env.local',
      )
    }
    const { docs } = await payload.find({
      collection: 'users',
      where: { email: { equals: account.email } },
      limit: 1,
    })
    result.push(
      docs[0] ??
        (await payload.create({
          collection: 'users',
          data: {
            email: account.email,
            password: account.password,
            role: account.role,
            displayName: account.displayName,
          },
        })),
    )
  }
  return { admin: result[0], editor: result[1] }
}

/** Ảnh minh họa đơn giản (nền màu chuyên mục + tên mục) để thử luồng ảnh trên R2. */
async function placeholderImage(name: string, hex: string) {
  const escaped = name.replace(/[&<>"]/g, (c) => `&#${c.charCodeAt(0)};`)
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="675"><rect width="100%" height="100%" fill="${hex}"/><text x="50%" y="50%" fill="#ffffff" font-family="Arial, sans-serif" font-size="72" font-weight="700" text-anchor="middle" dominant-baseline="middle">${escaped}</text></svg>`
  return sharp(Buffer.from(svg)).jpeg({ quality: 85 }).toBuffer()
}

export async function seed(payload: Payload, { withImages = false, log = () => {} }: Options = {}) {
  const { editor } = await ensureStaff(payload)
  const by = { createdBy: editor.id, updatedBy: editor.id }
  const md = (markdown: string) => markdownToLexical(markdown, payload.config)

  log('Xóa nội dung mẫu cũ…')
  for (const collection of CONTENT) {
    await payload.delete({ collection, where: { id: { exists: true } }, overrideAccess: true })
  }
  if (withImages) {
    await payload.delete({
      collection: 'media',
      where: { filename: { like: SEED_IMAGE_PREFIX } },
      overrideAccess: true,
    })
  }

  // --- Chuyên mục ----------------------------------------------------------
  log('Tạo chuyên mục…')
  const categoryByPath = new Map<string, Category>()
  const colorByPath = new Map<string, string>()
  for (const group of GROUPS) {
    const doc = await payload.create({
      collection: 'categories',
      data: {
        name: group.name,
        slug: group.slug,
        itemRoute: group.itemRoute,
        description: group.description,
        ...by,
      } as Category,
    })
    categoryByPath.set(doc.path as string, doc)
  }
  for (const cat of CATEGORIES) {
    const isFilm = cat.name === 'Phim & Series'
    const parent = categoryByPath.get(cat.group) as Category
    const doc = await payload.create({
      collection: 'categories',
      data: {
        name: cat.name,
        parent: parent.id,
        icon: cat.icon,
        color: cat.color,
        ...(isFilm
          ? {
              description: FILM_CATEGORY.description,
              about: await md(FILM_CATEGORY.about),
              faq: FILM_CATEGORY.faq,
            }
          : {}),
        ...by,
      } as Category,
    })
    categoryByPath.set(doc.path as string, doc)
    colorByPath.set(doc.path as string, CATEGORY_HEX[cat.color])
    for (const sub of cat.subs) {
      const child = await payload.create({
        collection: 'categories',
        data: { name: sub, parent: doc.id, ...by } as Category,
      })
      categoryByPath.set(child.path as string, child)
      colorByPath.set(child.path as string, CATEGORY_HEX[cat.color])
    }
  }
  const category = (path: string) => {
    const doc = categoryByPath.get(path)
    if (!doc) throw new Error(`Seed: không có chuyên mục "${path}"`)
    return doc
  }

  // --- Mục (mỗi mục chỉ tạo một lần, nhận diện theo tên + năm) --------------
  const itemByKey = new Map<string, Item>()
  const yearOf = (attributes?: SeedAttributes) =>
    attributes && 'year' in attributes ? (attributes.year ?? '') : ''

  async function getOrCreateItem(
    seedItem: SeedItem & { description?: string; facts?: Item['facts'] },
    categoryPath: string,
    attributes?: Item['attributes'],
  ) {
    const key = `${seedItem.name}|${yearOf(seedItem.attributes)}`
    const existing = itemByKey.get(key)
    if (existing) return existing
    let image: number | undefined
    if (withImages) {
      const data = await placeholderImage(seedItem.name, colorByPath.get(categoryPath) ?? '#111114')
      const media = await payload.create({
        collection: 'media',
        data: { alt: `Ảnh minh họa ${seedItem.name}`, ...by },
        file: {
          data,
          mimetype: 'image/jpeg',
          name: `${SEED_IMAGE_PREFIX}${itemByKey.size + 1}.jpg`,
          size: data.length,
        },
      })
      image = media.id
    }
    const doc = await payload.create({
      collection: 'items',
      data: {
        name: seedItem.name,
        summary: seedItem.summary,
        category: category(categoryPath).id,
        attributes: attributes ?? (seedItem.attributes ? [seedItem.attributes] : undefined),
        facts: seedItem.facts,
        description: seedItem.description ? await md(seedItem.description) : undefined,
        image,
        _status: 'published',
        ...by,
      } as Item,
    })
    itemByKey.set(key, doc)
    return doc
  }

  async function createList(data: Partial<List>, entries: { item: Item; blurb?: string }[]) {
    const list = await payload.create({
      collection: 'lists',
      data: { author: editor.id, _status: 'published', ...by, ...data } as List,
    })
    for (const entry of entries) {
      await payload.create({
        collection: 'entries',
        data: {
          list: list.id,
          item: entry.item.id,
          blurb: entry.blurb ? await md(entry.blurb) : undefined,
          ...by,
        },
      })
    }
    return list
  }

  // --- Bảng chính: Phim Việt Hay Nhất Mọi Thời Đại (post.html) ---------------
  log('Tạo bảng Phim Việt Hay Nhất Mọi Thời Đại và 20 phim…')
  const filmEntries = []
  for (const film of FILMS) {
    const summary = film.why.split(/(?<=\.)\s/)[0]
    const item = await getOrCreateItem(
      {
        name: film.name,
        summary,
        attributes: { blockType: 'creativeWork', workType: 'movie', year: film.year },
        description: film.name === 'Mắt Biếc' ? MAT_BIEC_DESCRIPTION : undefined,
        facts: film.facts,
      },
      'phim-series/phim-viet',
      [
        {
          blockType: 'creativeWork',
          workType: 'movie',
          year: film.year,
          creators: film.creators,
          cast: film.cast,
          genres: film.genres,
          durationMinutes: film.durationMinutes,
        },
      ],
    )
    filmEntries.push({ item, blurb: film.why })
  }
  await createList(
    {
      title: 'Phim Việt Hay Nhất Mọi Thời Đại',
      slug: 'phim-viet-hay-nhat-moi-thoi-dai',
      category: category('phim-series/phim-viet').id,
      rules: 'Vote phim Việt bạn thấy hay nhất · không tính phim ra rạp dưới 30 ngày',
      itemNoun: 'phim',
      intro: await md(FILM_LIST_INTRO),
      meta: {
        title: 'Phim Việt Hay Nhất Mọi Thời Đại, Xếp Hạng Bởi Khán Giả (2026) | Ranker.vn',
        description:
          '120 phim Việt hay nhất mọi thời đại do 18.902 khán giả bình chọn: Bố Già, Mắt Biếc, Hai Phượng… Thứ hạng cập nhật theo thời gian thực. Vote cho phim bạn yêu thích.',
      },
    },
    filmEntries,
  )

  // --- Các bảng khác (homepage.html, category.html) --------------------------
  log(`Tạo ${OTHER_LISTS.length} bảng khác…`)
  for (const list of OTHER_LISTS) {
    const entries = []
    for (const seedItem of list.items)
      entries.push({ item: await getOrCreateItem(seedItem, list.category) })
    await createList(
      { title: list.title, category: category(list.category).id, itemNoun: list.itemNoun },
      entries,
    )
  }

  const counts = {
    categories: categoryByPath.size,
    items: itemByKey.size,
    lists: 1 + OTHER_LISTS.length,
  }
  log(`Xong: ${counts.categories} chuyên mục, ${counts.items} mục, ${counts.lists} bảng.`)
  return counts
}
