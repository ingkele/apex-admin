import * as React from 'react'
import { cn } from '@/lib/utils'

/**
 * 统计卡（原型 .dash-card 统计卡同款）
 * 结构：图标块 + 右上徽章 / 标题 / 大数字 + 对照小字 / footer 变体
 * footer 由调用方传入（迷你柱状图 / 进度条 / 警示条 / 三段分栏）
 */
export function StatTile({
  icon,
  tone = 'brand',
  label,
  value,
  compare,
  badge,
  footer,
  className,
}: {
  icon: React.ReactNode
  tone?: 'brand' | 'green' | 'rose' | 'amber'
  label: string
  value: React.ReactNode
  compare?: React.ReactNode
  badge?: React.ReactNode
  footer?: React.ReactNode
  className?: string
}) {
  const toneClass = {
    brand: 'bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400',
    green: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400',
    rose: 'bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400',
    amber: 'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400',
  }[tone]

  return (
    <div className={cn('h-full rounded-xl border border-line bg-surface p-5 shadow-card', className)}>
      <div className="flex items-start justify-between">
        <div className={cn('flex h-9 w-9 items-center justify-center rounded-lg', toneClass)}>{icon}</div>
        {badge ? <div className="mr-7 mt-1">{badge}</div> : null}
      </div>
      <div className="mt-4 text-[12px] font-medium text-muted">{label}</div>
      <div className="mt-1 flex items-end gap-2">
        <span className="text-[30px] font-semibold leading-none tracking-tight tabular-nums text-ink">{value}</span>
        {compare ? <span className="mb-0.5 text-[11px] text-soft">{compare}</span> : null}
      </div>
      {footer}
    </div>
  )
}

type MiniTone = 'brand' | 'green' | 'rose' | 'amber' | 'slate'

const MINI_TONE: Record<MiniTone, { icon: string; box: string; unit: string }> = {
  brand: { icon: 'text-brand-500', box: 'bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400', unit: 'text-brand-600 dark:text-brand-400' },
  green: { icon: 'text-emerald-500', box: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400', unit: 'text-emerald-600 dark:text-emerald-400' },
  rose: { icon: 'text-rose-500', box: 'bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400', unit: 'text-rose-500 dark:text-rose-400' },
  amber: { icon: 'text-amber-500', box: 'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400', unit: 'text-amber-600 dark:text-amber-400' },
  slate: { icon: 'text-muted', box: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300', unit: 'text-soft' },
}

/**
 * 紧凑统计卡（列表/日志类页面顶部 4 连卡，原型同款）
 * 结构：标签 + 右上图标 / 大数字 + 小字注释
 */
export function MiniStat({
  label,
  icon,
  tone = 'brand',
  boxed = false,
  value,
  unit,
  dot = false,
  size = 'md',
  className,
}: {
  label: string
  icon: React.ReactNode
  tone?: MiniTone
  /** 图标加浅色底块（服务列表卡用） */
  boxed?: boolean
  value: React.ReactNode
  unit?: React.ReactNode
  /** 注释前带状态圆点（"● 全部实例就绪"） */
  dot?: boolean
  size?: 'md' | 'lg'
  className?: string
}) {
  const t = MINI_TONE[tone]
  return (
    <div className={cn('rounded-xl border border-line bg-surface px-4 py-3.5 shadow-card', className)}>
      <div className="flex items-center justify-between gap-2">
        <span className="text-[11px] font-medium text-muted">{label}</span>
        {boxed ? (
          <span className={cn('flex h-7 w-7 items-center justify-center rounded-lg', t.box)}>{icon}</span>
        ) : (
          <span className={cn('flex items-center', t.icon)}>{icon}</span>
        )}
      </div>
      <div className="mt-2 flex items-end gap-2">
        <span
          className={cn(
            'font-semibold leading-none tabular-nums text-ink',
            size === 'lg' ? 'text-[24px]' : 'text-[20px]',
          )}
        >
          {value}
        </span>
        {unit ? (
          <span className={cn('mb-0.5 flex items-center gap-1 text-[10px] font-normal', t.unit)}>
            {dot ? <span className={cn('h-1.5 w-1.5 rounded-full', tone === 'green' ? 'bg-emerald-500' : 'bg-current')} /> : null}
            {unit}
          </span>
        ) : null}
      </div>
    </div>
  )
}

/** 右上角趋势徽章（+12.4% / -22.1%） */
export function StatBadge({
  delta,
  tone,
}: {
  delta: string
  tone: 'up' | 'down'
}) {
  const isGood = tone === 'up'
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-medium',
        isGood
          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400'
          : 'bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-300',
      )}
    >
      <svg viewBox="0 0 24 24" className="h-[11px] w-[11px]" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
        {isGood ? <path d="M7 17 17 7M9 7h8v8" /> : <path d="M7 7l10 10M17 9v8H9" />}
      </svg>
      {delta}
    </span>
  )
}

/** 实时脉冲徽章（运行中任务卡） */
export function LiveBadge({ label = '实时' }: { label?: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-md bg-brand-50 px-2 py-1 text-[10px] font-medium text-brand-700 dark:bg-brand-500/10 dark:text-brand-400">
      <span className="relative flex h-1.5 w-1.5">
        <span className="absolute inset-0 animate-ping rounded-full bg-brand-500 opacity-40" />
        <span className="relative h-1.5 w-1.5 rounded-full bg-brand-500" />
      </span>
      {label}
    </span>
  )
}

/** 迷你柱状图（今日任务数卡 footer） */
export function MiniBars({ bars }: { bars: number[] }) {
  const max = Math.max(...bars, 1)
  const shades = [
    'bg-brand-100 dark:bg-brand-500/15',
    'bg-brand-100 dark:bg-brand-500/15',
    'bg-brand-200 dark:bg-brand-500/25',
    'bg-brand-200 dark:bg-brand-500/25',
    'bg-brand-300 dark:bg-brand-500/35',
    'bg-brand-400',
    'bg-brand-500',
  ]
  return (
    <div className="mt-4 flex h-8 items-end gap-1">
      {bars.map((v, i) => (
        <span
          key={i}
          className={cn('w-full rounded-sm', shades[Math.min(i, shades.length - 1)])}
          style={{ height: `${Math.round((v / max) * 100)}%` }}
        />
      ))}
    </div>
  )
}
