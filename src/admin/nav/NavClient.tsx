'use client'

import { Hamburger, Logout, useNav } from '@payloadcms/ui'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

import { Wordmark } from '@/admin/graphics/Wordmark'

export type NavGroupLinks = {
  label: string
  links: { href: string; id: string; label: string }[]
}

type Props = { groups: NavGroupLinks[]; homeHref: string; homeLabel: string }

/**
 * Giữ cấu trúc và class của menu Payload (`nav`, `nav__scroll`, `nav__header`...) để cơ chế
 * đóng/mở, ghi nhớ trạng thái và bản mobile của Payload vẫn chạy như cũ.
 */
export function NavClient({ groups, homeHref, homeLabel }: Props) {
  const { hydrated, navOpen, navRef, setNavOpen, shouldAnimate } = useNav()
  const pathname = usePathname()

  const className = [
    'nav',
    'rk-nav',
    navOpen && 'nav--nav-open',
    shouldAnimate && 'nav--nav-animate',
    hydrated && 'nav--nav-hydrated',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <aside className={className} inert={!navOpen ? true : undefined}>
      <div className="nav__scroll" ref={navRef}>
        <Link className="rk-nav__logo" href={homeHref} aria-label={homeLabel} prefetch={false}>
          <Wordmark size={26} />
        </Link>
        <nav className="nav__wrap">
          {groups.map((group) => (
            <div className="rk-nav__group" key={group.label}>
              <span className="rk-nav__group-label">{group.label}</span>
              {group.links.map((link) => {
                const active = pathname === link.href || pathname.startsWith(`${link.href}/`)
                return (
                  <Link
                    className="rk-nav__link"
                    href={link.href}
                    id={link.id}
                    key={link.id}
                    prefetch={false}
                    aria-current={active ? 'page' : undefined}
                  >
                    {link.label}
                  </Link>
                )
              })}
            </div>
          ))}
          <div className="nav__controls">
            <Logout />
          </div>
        </nav>
      </div>
      <div className="nav__header">
        <div className="nav__header-content">
          <button
            className="nav__mobile-close"
            onClick={() => setNavOpen(false)}
            tabIndex={!navOpen ? -1 : undefined}
            type="button"
          >
            <Hamburger isActive />
          </button>
        </div>
      </div>
    </aside>
  )
}
