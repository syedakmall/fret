'use client'

import type { ReactNode } from 'react'

export function Card({
  children,
  className = '',
  as: Tag = 'section',
}: {
  children: ReactNode
  className?: string
  as?: 'section' | 'div' | 'aside'
}) {
  return (
    <Tag
      className={`rounded-none border-2 border-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] ${className}`}
    >
      {children}
    </Tag>
  )
}

export function CardHeader({
  title,
  subtitle,
  action,
}: {
  title: string
  subtitle?: string
  action?: ReactNode
}) {
  return (
    <header className="flex flex-wrap items-center justify-between gap-3 border-b border-hairline px-5 py-4">
      <div>
        <h2 className="font-pixel text-xl uppercase tracking-widest text-black">{title}</h2>
        {subtitle && <p className="mt-0.5 font-pixel text-base text-muted">{subtitle}</p>}
      </div>
      {action}
    </header>
  )
}

export function SectionLabel({ children, hint }: { children: ReactNode; hint?: string }) {
  return (
    <div className="mb-2 flex items-baseline justify-between gap-2">
      <span className="font-pixel text-[18px] uppercase tracking-widest text-black">
        {children}
      </span>
      {hint && <span className="text-[11px] text-muted/80">{hint}</span>}
    </div>
  )
}

export function Field({
  label,
  hint,
  children,
}: {
  label: string
  hint?: string
  children: ReactNode
}) {
  return (
    <label className="block">
      <SectionLabel hint={hint}>{label}</SectionLabel>
      {children}
    </label>
  )
}

export function Select({
  value,
  onChange,
  children,
  ariaLabel,
}: {
  value: string
  onChange: (value: string) => void
  children: ReactNode
  ariaLabel?: string
}) {
  return (
    <div className="relative">
      <select
        value={value}
        aria-label={ariaLabel}
        onChange={(event) => onChange(event.target.value)}
        className="w-full cursor-pointer appearance-none rounded-lg border border-hairline bg-surface px-3 py-2.5 pr-9 text-sm text-ink transition-colors hover:border-orange-500 focus:border-orange-500 focus:outline-none"
      >
        {children}
      </select>
      <span
        aria-hidden
        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted"
      >
        ▾
      </span>
    </div>
  )
}

/** Primary view switch — large, obvious, one choice at a time. */
export function Tabs<T extends string>({
  options,
  value,
  onChange,
  ariaLabel,
}: {
  options: { value: T; label: string }[]
  value: T
  onChange: (value: T) => void
  ariaLabel?: string
}) {
  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className="inline-flex w-full gap-1 rounded-lg border border-hairline bg-sand-soft p-1 sm:w-auto"
    >
      {options.map((option) => {
        const selected = option.value === value
        return (
          <button
            key={option.value}
            role="tab"
            type="button"
            aria-selected={selected}
            onClick={() => onChange(option.value)}
            className={`flex-1 whitespace-nowrap rounded-[7px] px-4 py-2 text-sm font-medium transition-all sm:flex-none ${
              selected
                ? 'bg-raised text-orange-700 shadow-sm ring-1 ring-orange-500/20'
                : 'text-muted hover:text-ink'
            }`}
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
}

export function Segmented<T extends string | number>({
  options,
  value,
  onChange,
  ariaLabel,
}: {
  options: { value: T; label: string; title?: string }[]
  value: T
  onChange: (value: T) => void
  ariaLabel?: string
}) {
  return (
    <div
      role="group"
      aria-label={ariaLabel}
      className="flex gap-1 rounded-lg border border-hairline bg-sand-soft p-1 shadow-inner"
    >
      {options.map((option) => {
        const selected = option.value === value
        return (
          <button
            key={String(option.value)}
            type="button"
            title={option.title}
            aria-pressed={selected}
            onClick={() => onChange(option.value)}
            className={`flex-1 rounded-[5px] px-2 py-1.5 text-xs font-medium transition-colors ${
              selected ? 'bg-surface text-orange-700 shadow-sm ring-1 ring-black/5' : 'text-muted hover:text-ink'
            }`}
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
}

export function Toggle({
  label,
  description,
  checked,
  onChange,
  disabled,
}: {
  label: string
  description?: string
  checked: boolean
  onChange: (checked: boolean) => void
  disabled?: boolean
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`group flex w-full items-center justify-between gap-3 rounded-lg border px-3 py-2.5 text-left transition-colors ${
        checked ? 'border-orange-500/30 bg-orange-50/50' : 'border-hairline bg-surface hover:border-slate/40'
      } ${disabled ? 'cursor-not-allowed opacity-45' : ''}`}
    >
      <span className="min-w-0">
        <span className={`block truncate text-sm font-medium transition-colors ${checked ? 'text-orange-700' : 'text-orange-700 group-hover:text-orange-700'}`}>{label}</span>
        {description && <span className={`block truncate text-xs transition-colors ${checked ? 'text-orange-600/80' : 'text-muted'}`}>{description}</span>}
      </span>
      <span
        aria-hidden
        className={`relative h-5 w-9 shrink-0 rounded-full transition-colors ${
          checked ? 'bg-orange-500' : 'bg-sand'
        }`}
      >
        <span
          className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-all ${
            checked ? 'left-4.5' : 'left-0.5'
          }`}
        />
      </span>
    </button>
  )
}

export function Badge({
  tone = 'sand',
  children,
}: {
  tone?: 'sand' | 'sage' | 'slate'
  children: ReactNode
}) {
  const tones = {
    sand: 'bg-sand-soft text-slate-deep',
    sage: 'bg-ink text-white',
    slate: 'bg-slate text-white',
  }
  return (
    <span className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${tones[tone]}`}>
      {children}
    </span>
  )
}

export function Kbd({ children }: { children: ReactNode }) {
  return (
    <kbd className="rounded border border-hairline bg-surface px-1.5 py-0.5 font-mono text-[11px] text-slate">
      {children}
    </kbd>
  )
}

export function IconButton({
  label,
  onClick,
  children,
  disabled,
}: {
  label: string
  onClick: () => void
  children: ReactNode
  disabled?: boolean
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      disabled={disabled}
      className="grid h-8 w-8 place-items-center rounded-lg border border-hairline bg-surface text-slate transition-colors hover:border-orange-500 hover:text-orange-500 disabled:opacity-40"
    >
      {children}
    </button>
  )
}
