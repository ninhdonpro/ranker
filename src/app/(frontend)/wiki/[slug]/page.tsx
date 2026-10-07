import { ItemTestPage, itemMetadata } from '@/components/ItemTestPage'

export const dynamic = 'force-dynamic'

type Props = { params: Promise<{ slug: string }> }

export const generateMetadata = async ({ params }: Props) =>
  itemMetadata('wiki', (await params).slug)

export default async function Page({ params }: Props) {
  return <ItemTestPage route="wiki" slug={(await params).slug} />
}
