import type { I18nClient } from '@payloadcms/translations'
import { formatDate } from '@payloadcms/ui/shared'
import Link from 'next/link'
import type { Payload, TypedUser } from 'payload'
import { formatAdminURL } from 'payload/shared'
import type { ReactNode } from 'react'

import { getCategoryIndex, getThumbUrl } from '@/admin/cells/data'
import type { RankerTranslationKeys, RankerTranslations } from '@/admin/translations'

import { getDashboardData, type DashboardRow } from './data'
import { BoxIcon, EditIcon, ImageIcon, LinkIcon, ListIcon, PlusIcon } from './icons'

type Props = {
  i18n: I18nClient<RankerTranslations, RankerTranslationKeys>
  payload: Payload
  user?: TypedUser | null
}

/** Giờ hiện tại theo múi giờ Việt Nam (server chạy UTC) để chào theo buổi. */
const TIME_ZONE = 'Asia/Ho_Chi_Minh'

function greetingKey(now: Date): RankerTranslationKeys {
  const hour = Number(
    new Intl.DateTimeFormat('en-GB', {
      hour: 'numeric',
      hourCycle: 'h23',
      timeZone: TIME_ZONE,
    }).format(now),
  )
  if (hour < 11) return 'ranker:dashGreetingMorning'
  if (hour < 18) return 'ranker:dashGreetingAfternoon'
  return 'ranker:dashGreetingEvening'
}

/** "5 phút trước", "hôm qua"... theo ngôn ngữ giao diện; dưới 1 phút trả về null (hiện "Vừa xong"). */
function timeAgo(date: string, now: Date, language: string) {
  const rtf = new Intl.RelativeTimeFormat(language, { numeric: 'auto' })
  const seconds = Math.round((new Date(date).getTime() - now.getTime()) / 1000)
  const units: [Intl.RelativeTimeFormatUnit, number][] = [
    ['day', 86400],
    ['hour', 3600],
    ['minute', 60],
  ]
  for (const [unit, size] of units) {
    if (Math.abs(seconds) >= size) return rtf.format(Math.round(seconds / size), unit)
  }
  return null
}

function initials(name: string) {
  const words = name.trim().split(/\s+/)
  return ((words[0]?.[0] ?? '') + (words.length > 1 ? (words.at(-1)?.[0] ?? '') : '')).toUpperCase()
}

function StatCard(props: {
  href: string
  label: string
  value: number
  icon: ReactNode
  footer: ReactNode
  attention?: boolean
}) {
  return (
    <Link
      href={props.href}
      className={`rk-stat-card${props.attention ? ' rk-stat-card--attention' : ''}`}
      prefetch={false}
    >
      <span className="rk-stat-card__top">
        <span className="rk-stat-card__label">{props.label}</span>
        <span className="rk-stat-card__icon">{props.icon}</span>
      </span>
      <span className="rk-stat-card__value">{props.value.toLocaleString('vi-VN')}</span>
      <span className="rk-stat-card__footer">{props.footer}</span>
    </Link>
  )
}

/**
 * Dashboard admin (admin.components.beforeDashboard), theo mockup `#admin` trong docs/design.html:
 * lời chào + việc cần làm, thẻ số liệu, khối "Cần xử lý" và "Hoạt động gần đây".
 */
export async function Dashboard({ i18n, payload, user }: Props) {
  if (!user) return null
  const t = i18n.t
  const now = new Date()
  const adminRoute = payload.config.routes.admin
  const url = (path: `/${string}`) => formatAdminURL({ adminRoute, path })

  const data = await getDashboardData(payload, user, { now })

  const userIds = [...new Set(data.activity.map((a) => a.userId).filter((id) => id !== null))]
  const [categories, thumbs, users] = await Promise.all([
    getCategoryIndex(payload),
    Promise.all(data.pending.map((row) => getThumbUrl(payload, row.imageId))),
    userIds.length
      ? payload.find({
          collection: 'users',
          where: { id: { in: userIds } },
          depth: 0,
          limit: userIds.length,
          pagination: false,
          select: { displayName: true, email: true },
          user,
          overrideAccess: false,
        })
      : Promise.resolve({ docs: [] }),
  ])
  const userName = new Map(users.docs.map((u) => [u.id, u.displayName || u.email]))
  const myName = user.displayName || user.email

  const docHref = (row: { collection: string; id: number }) =>
    url(`/collections/${row.collection}/${row.id}`)
  const typeLabel = (row: DashboardRow) =>
    t(row.collection === 'lists' ? 'ranker:dashTypeList' : 'ranker:dashTypeItem')

  const trend = (count: number) => (
    <>
      <b>+{count.toLocaleString('vi-VN')}</b> {t('ranker:dashTrend')}
    </>
  )

  return (
    <section className="rk-dash">
      <header className="rk-dash__head">
        <div>
          <h1 className="rk-dash__title">{t(greetingKey(now), { name: myName })}</h1>
          <p className="rk-dash__summary">
            {formatDate({ date: now, i18n, pattern: 'EEEE, dd/MM/yyyy', timezone: TIME_ZONE })}
            {' · '}
            {data.stats.pending > 0 ? (
              <>
                {t('ranker:dashPendingBefore')}{' '}
                <b>{t('ranker:dashPendingCount', { count: data.stats.pending })}</b>{' '}
                {t('ranker:dashPendingAfter')}
              </>
            ) : (
              t('ranker:dashPendingNone')
            )}
          </p>
        </div>
        <div className="rk-dash__actions">
          <Link
            className="btn btn--style-primary btn--size-medium rk-btn-sm"
            href={url('/collections/lists/create')}
            prefetch={false}
          >
            <PlusIcon />
            {t('ranker:dashCreateList')}
          </Link>
          <Link
            className="btn btn--style-secondary btn--size-medium rk-btn-sm"
            href={url('/collections/items/create')}
            prefetch={false}
          >
            <PlusIcon />
            {t('ranker:dashCreateItem')}
          </Link>
        </div>
      </header>

      <div className="rk-stat-cards">
        <StatCard
          href={url('/collections/lists')}
          label={t('ranker:dashStatLists')}
          value={data.stats.lists.total}
          icon={<ListIcon />}
          footer={trend(data.stats.lists.lastWeek)}
        />
        <StatCard
          href={url('/collections/items')}
          label={t('ranker:dashStatItems')}
          value={data.stats.items.total}
          icon={<BoxIcon />}
          footer={trend(data.stats.items.lastWeek)}
        />
        <StatCard
          href={url('/collections/entries')}
          label={t('ranker:dashStatEntries')}
          value={data.stats.entries.total}
          icon={<LinkIcon />}
          footer={trend(data.stats.entries.lastWeek)}
        />
        <StatCard
          href="#rk-dash-todo"
          label={t('ranker:dashStatPending')}
          value={data.stats.pending}
          icon={<EditIcon />}
          footer={t('ranker:dashStatPendingHint')}
          attention={data.stats.pending > 0}
        />
      </div>

      <div className="rk-dash__grid">
        <section className="rk-dash-panel" id="rk-dash-todo" aria-labelledby="rk-dash-todo-title">
          <div className="rk-dash-panel__head">
            <h2 id="rk-dash-todo-title">
              {t('ranker:dashTodoTitle')}
              {data.stats.pending > 0 && (
                <span className="rk-dash-panel__count">{data.stats.pending}</span>
              )}
            </h2>
          </div>
          {data.pending.length === 0 ? (
            <div className="rk-empty">
              <b>{t('ranker:dashTodoEmpty')}</b>
              <p>{t('ranker:dashTodoEmptyHint')}</p>
            </div>
          ) : (
            data.pending.map((row, index) => {
              const category = row.categoryId ? categories.get(row.categoryId) : undefined
              const thumb = thumbs[index]
              return (
                <Link
                  key={`${row.collection}-${row.id}`}
                  className="rk-dash-row"
                  href={docHref(row)}
                  prefetch={false}
                >
                  <span className="rk-thumb">
                    {thumb ? (
                      // eslint-disable-next-line @next/next/no-img-element -- ảnh 40px từ R2
                      <img src={thumb} alt="" loading="lazy" width={40} height={40} />
                    ) : (
                      <ImageIcon />
                    )}
                  </span>
                  <span className="rk-dash-row__body">
                    <span className="rk-dash-row__name">
                      {row.title || t('ranker:dashUntitled')}
                    </span>
                    <span className="rk-dash-row__meta">
                      {typeLabel(row)}
                      {category && (
                        <>
                          {' · '}
                          <i
                            className="rk-dot"
                            style={
                              category.color
                                ? { background: `var(--rk-cat-${category.color})` }
                                : undefined
                            }
                          />
                          {category.name}
                        </>
                      )}
                    </span>
                  </span>
                  <span className={`rk-status rk-status--${row.status}`}>
                    {t(row.status === 'changed' ? 'ranker:statusChanged' : 'ranker:statusDraft')}
                  </span>
                  <time dateTime={row.updatedAt}>
                    {timeAgo(row.updatedAt, now, i18n.language) ?? t('ranker:dashJustNow')}
                  </time>
                </Link>
              )
            })
          )}
        </section>

        <section className="rk-dash-panel" aria-labelledby="rk-dash-activity-title">
          <div className="rk-dash-panel__head">
            <h2 id="rk-dash-activity-title">{t('ranker:dashActivityTitle')}</h2>
          </div>
          {data.activity.length === 0 ? (
            <div className="rk-empty">
              <b>{t('ranker:dashActivityEmpty')}</b>
            </div>
          ) : (
            <ol className="rk-activity">
              {data.activity.map((item) => {
                const name =
                  (item.userId && userName.get(item.userId)) || t('ranker:dashActivitySomeone')
                return (
                  <li key={`${item.collection}-${item.id}-${item.updatedAt}`}>
                    <span className="rk-activity__avatar" aria-hidden="true">
                      {initials(name)}
                    </span>
                    <div>
                      <p>
                        <b>{name}</b>{' '}
                        {t(
                          item.published
                            ? 'ranker:dashActivityPublished'
                            : 'ranker:dashActivityEdited',
                        )}{' '}
                        <Link href={docHref(item)} prefetch={false}>
                          {item.title || t('ranker:dashUntitled')}
                        </Link>
                      </p>
                      <time dateTime={item.updatedAt}>
                        {timeAgo(item.updatedAt, now, i18n.language) ?? t('ranker:dashJustNow')}
                      </time>
                    </div>
                  </li>
                )
              })}
            </ol>
          )}
        </section>
      </div>
    </section>
  )
}
