import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { RichText } from '@/components/RichText'
import { getPayloadClient } from '@/lib/payload'
import { getSeoMeta } from '@/lib/seo'
import type { ItemRoute } from '@/lib/url'

async function getItem(route: ItemRoute, slug: string) {
  const payload = await getPayloadClient()
  const { docs } = await payload.find({
    collection: 'items',
    where: { and: [{ slug: { equals: slug } }, { _status: { equals: 'published' } }] },
    depth: 2,
    limit: 1,
  })
  const item = docs[0]
  // /review/x và /wiki/x không dùng lẫn nhau: tiền tố phải khớp nhóm lớn của mục.
  return item && item.url === `/${route}/${slug}` ? item : null
}

export async function itemMetadata(route: ItemRoute, slug: string): Promise<Metadata> {
  const item = await getItem(route, slug)
  if (!item) return {}
  return getSeoMeta({
    meta: item.meta,
    heading: item.name,
    descriptions: [item.summary, item.description],
  })
}

/** Trang kiểm tra Mục (dùng chung cho /review và /wiki): nội dung render phía server. */
export async function ItemTestPage({ route, slug }: { route: ItemRoute; slug: string }) {
  const item = await getItem(route, slug)
  if (!item) notFound()
  const lists = (item.appearsIn?.docs ?? []).flatMap((entry) =>
    typeof entry === 'object' &&
    typeof entry.list === 'object' &&
    entry.list._status === 'published'
      ? [entry.list]
      : [],
  )

  return (
    <main>
      <h1>{item.name}</h1>
      {item.summary ? <p>{item.summary}</p> : null}
      <RichText data={item.description} />
      {item.facts?.length ? (
        <dl>
          {item.facts.map((fact) => (
            <div key={fact.id}>
              <dt>{fact.label}</dt>
              <dd>{fact.value}</dd>
            </div>
          ))}
        </dl>
      ) : null}
      {lists.length ? (
        <ul>
          {lists.map((list) => (
            <li key={list.id}>
              <a href={list.url ?? '#'}>{list.title}</a>
            </li>
          ))}
        </ul>
      ) : null}
    </main>
  )
}
