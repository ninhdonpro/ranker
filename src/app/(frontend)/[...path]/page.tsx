import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { RichText } from '@/components/RichText'
import { getPayloadClient } from '@/lib/payload'
import { getSeoMeta } from '@/lib/seo'
import { categoryUrl } from '@/lib/url'

export const dynamic = 'force-dynamic'

type Props = { params: Promise<{ path: string[] }> }

async function getCategory(segments: string[]) {
  const payload = await getPayloadClient()
  const { docs } = await payload.find({
    collection: 'categories',
    where: { path: { equals: segments.map(decodeURIComponent).join('/') } },
    depth: 1,
    limit: 1,
  })
  return docs[0] ?? null
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const category = await getCategory((await params).path)
  if (!category) return {}
  return getSeoMeta({
    meta: category.meta,
    heading: category.name,
    descriptions: [category.description, category.about],
  })
}

/** Trang kiểm tra Chuyên mục và nhóm lớn (/info, /phim-series, /phim-series/phim-viet). */
export default async function CategoryPage({ params }: Props) {
  const category = await getCategory((await params).path)
  if (!category) notFound()
  const payload = await getPayloadClient()
  const [children, lists] = await Promise.all([
    payload.find({
      collection: 'categories',
      where: { parent: { equals: category.id } },
      sort: '_order',
      depth: 0,
      limit: 100,
    }),
    payload.find({
      collection: 'lists',
      where: { and: [{ category: { equals: category.id } }, { _status: { equals: 'published' } }] },
      depth: 0,
      limit: 100,
    }),
  ])

  return (
    <main>
      <h1>{category.name}</h1>
      {category.description ? <p>{category.description}</p> : null}
      {children.docs.length ? (
        <ul>
          {children.docs.map((child) => (
            <li key={child.id}>
              <a href={categoryUrl(child.path ?? '')}>{child.name}</a>
            </li>
          ))}
        </ul>
      ) : null}
      {lists.docs.length ? (
        <ul>
          {lists.docs.map((list) => (
            <li key={list.id}>
              <a href={list.url ?? '#'}>{list.title}</a>
            </li>
          ))}
        </ul>
      ) : null}
      <RichText data={category.about} />
    </main>
  )
}
