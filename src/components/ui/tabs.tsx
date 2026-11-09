import * as React from 'react'
import { Tabs } from '@base-ui/react/tabs'
import { cn } from '@/lib/utils'

/** 选项卡 —— Base UI Tabs 底层 */
export function AppTabs({
  value,
  onValueChange,
  tabs,
  children,
  className,
}: {
  value: string
  onValueChange: (value: string) => void
  tabs: { value: string; label: React.ReactNode }[]
  children: React.ReactNode
  className?: string
}) {
  return (
    <Tabs.Root value={value} onValueChange={(v) => onValueChange(String(v))}>
      <Tabs.List
        className={cn(
          'flex items-center gap-1 border-b border-line px-1',
          className,
        )}
      >
        {tabs.map((t) => (
          <Tabs.Tab
            key={t.value}
            value={t.value}
            className={cn(
              'relative -mb-px cursor-pointer border-b-2 border-transparent px-3.5 py-2.5 text-[13px] font-medium outline-none transition-colors',
              'text-muted hover:text-ink data-[selected]:border-brand-600 data-[selected]:text-brand-600',
            )}
          >
            {t.label}
          </Tabs.Tab>
        ))}
      </Tabs.List>
      {children}
    </Tabs.Root>
  )
}

export function AppTabPanel({
  value,
  children,
  className,
}: {
  value: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <Tabs.Panel value={value} className={cn('pt-4', className)}>
      {children}
    </Tabs.Panel>
  )
}
