import { ItemTestPage, itemMetadata } from '@/components/ItemTestPage'

export const dynamic = 'force-dynamic'

type Props = { params: Promise<{ slug: string }> }

export const generateMetadata = async ({ params }: Props) =>
  itemMetadata('review', (await params).slug)

export default async function Page({ params }: Props) {
  return <ItemTestPage route="review" slug={(await params).slug} />
}
