'use client'

import Link from 'next/link'
import type { ReactNode } from 'react'
import type { WoodKey } from '@/lib/wood'

export function AppHeader({
  wood,
  title,
  subtitle,
  center,
  action,
}: {
  wood: WoodKey
  title: string
  subtitle: string
  center?: ReactNode
  action: { href: string; label: string }
}) {
  return (
    <header className="sticky top-4 z-50 mx-auto max-w-[1400px] px-4 sm:px-6 transition-all">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-3 rounded-none border-2 border-black bg-white px-4 py-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
        <Link href="/" className="flex min-w-0 items-center gap-3 group">
          <span
            aria-hidden
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-none border-2 border-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-transform group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:shadow-[2px_6px_0px_0px_rgba(0,0,0,1)]"
          >
            <img src="/guitar.svg" alt="Guitar Logo" className="h-6 w-6" />
          </span>
          <span className="min-w-0">
            <span className="block font-pixel text-[24px] uppercase leading-tight tracking-tight text-black">
              {title}
            </span>
            <span className="hidden truncate font-pixel text-[14px] text-muted sm:block">{subtitle}</span>
          </span>
        </Link>

        <div className="ml-auto flex items-center gap-2 lg:order-3">
          <Link
            href={action.href}
            className="rounded-none border-2 border-black bg-[#ff3366] px-3.5 py-2 font-pixel text-lg font-medium text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-transform hover:-translate-y-0.5 hover:shadow-[2px_4px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-none"
          >
            {action.label}
          </Link>
        </div>

        {center && <div className="order-4 w-full lg:order-2 lg:mx-auto lg:w-auto">{center}</div>}
      </div>
    </header>
  )
}
