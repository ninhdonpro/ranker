import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { RichText } from '@/components/RichText'
import { getPayloadClient } from '@/lib/payload'
import { getRankedEntries } from '@/lib/ranking'
import { getSeoMeta } from '@/lib/seo'

// Trang đọc dữ liệu lúc request: build không cần kết nối DB.
export const dynamic = 'force-dynamic'

type Props = { params: Promise<{ slug: string }> }

async function getList(slug: string) {
  const payload = await getPayloadClient()
  const { docs } = await payload.find({
    collection: 'lists',
    where: { and: [{ slug: { equals: slug } }, { _status: { equals: 'published' } }] },
    depth: 2,
    limit: 1,
  })
  return docs[0] ?? null
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const list = await getList((await params).slug)
  if (!list) return {}
  return getSeoMeta({ meta: list.meta, heading: list.title, descriptions: [list.intro] })
}

/** Trang kiểm tra Bảng xếp hạng: nội dung render phía server, chưa có giao diện. */
export default async function ListPage({ params }: Props) {
  const list = await getList((await params).slug)
  if (!list) notFound()
  const payload = await getPayloadClient()
  const entries = await getRankedEntries(payload, list, { depth: 2, publishedItemsOnly: true })

  return (
    <main>
      <h1>{list.title}</h1>
      {list.rules ? <p>{list.rules}</p> : null}
      <RichText data={list.intro} />
      <ol>
        {entries.map(({ rank, entry }) =>
          typeof entry.item === 'object' ? (
            <li key={entry.id} id={`hang-${rank}`}>
              <h2>
                <a href={entry.item.url ?? '#'}>{entry.item.name}</a>
              </h2>
              <RichText data={entry.blurb} />
            </li>
          ) : null,
        )}
      </ol>
    </main>
  )
}
