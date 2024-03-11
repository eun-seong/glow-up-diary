'use client'

import clsx from 'clsx'
import dayjs from 'dayjs'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'

const LINK_STYLE = 'hover:bg-grey10 py-2 px-4 rounded-xl relative'

const linkes = [
  {
    title: 'Daily Glow Up',
    hover: '💫',
    href: `/daily/${dayjs().format('YYYY-MM-DD')}`,
  },
  {
    title: 'Posts',
    hover: '🔥',
    href: `/posts`,
  },
  {
    title: 'About',
    hover: '😎',
    href: `/about`,
  },
]

export default function Header() {
  const pathname = usePathname()
  const [hovered, setHovered] = useState<number | null>(null)
  const [current, setCurrent] = useState<number | null>(null)

  const handleLeave = () => {
    setHovered(null)
  }

  const handleHover = (idx: number) => {
    setHovered(idx)
  }

  useEffect(() => {
    const currentLink = linkes.findIndex((link) =>
      link.href.startsWith(pathname),
    )
    if (pathname === '/') {
      setCurrent(null)
    } else if (currentLink != -1) {
      setCurrent(currentLink)
    }
  }, [pathname])

  return (
    <header className="w-full h-header border-b border-b-grey60 text-grey80">
      <div className="h-full min-h-header flex justify-between max-w-header px-11 items-center mx-auto">
        <Link
          href={'/'}
          className={clsx(
            'font-bold text-xl hover:text-black transition-all py-2 px-4',
          )}
        >
          DEV.EUN
        </Link>
        <ul className="flex gap-10 items-center">
          {linkes.map(({ href, title, hover }, idx) => (
            <Link
              key={href}
              href={href}
              className={clsx(LINK_STYLE, idx === current && 'bg-grey10')}
              onMouseEnter={() => handleHover(idx)}
              onMouseLeave={() => handleLeave()}
            >
              <span
                className={clsx(
                  idx === hovered && 'opacity-0',
                  'transition-opacity',
                )}
              >
                {title}
              </span>
              <span
                className={clsx(
                  'absolute top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] transition-opacity',
                  idx !== hovered && 'opacity-0',
                )}
              >
                {hover}
              </span>
            </Link>
          ))}
        </ul>
      </div>
    </header>
  )
}
