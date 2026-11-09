import * as React from 'react'
import { cn } from '@/lib/utils'

/** 统计卡：图标 + 标签 + 数值 + 辅助说明（原型统计卡同款） */
export function StatCard({
  icon,
  label,
  value,
  hint,
  tone = 'brand',
  className,
}: {
  icon: React.ReactNode
  label: string
  value: React.ReactNode
  hint?: React.ReactNode
  tone?: 'brand' | 'green' | 'red' | 'amber'
  className?: string
}) {
  const toneClass = {
    brand: 'bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400',
    green: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400',
    red: 'bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400',
    amber: 'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400',
  }[tone]

  return (
    <div className={cn('rounded-xl border border-line bg-surface p-5', className)}>
      <div className="flex items-center gap-3">
        <div className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-lg', toneClass)}>
          {icon}
        </div>
        <div className="min-w-0">
          <div className="text-[12px] text-muted">{label}</div>
          <div className="mt-0.5 text-[22px] font-semibold leading-none text-ink">{value}</div>
        </div>
      </div>
      {hint ? <div className="mt-2.5 text-[11.5px] text-soft">{hint}</div> : null}
    </div>
  )
}
