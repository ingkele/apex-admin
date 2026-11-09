import * as React from 'react'
import { Inbox } from 'lucide-react'
import { cn } from '@/lib/utils'

/** 空状态 —— 列表无数据 / 搜索无结果时使用，可选操作按钮 */
export function EmptyState({
  icon,
  title = '暂无数据',
  description,
  action,
  className,
  compact = false,
}: {
  icon?: React.ReactNode
  title?: string
  description?: React.ReactNode
  action?: React.ReactNode
  className?: string
  compact?: boolean
}) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center',
        compact ? 'px-4 py-8' : 'px-6 py-14',
        className,
      )}
    >
      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-canvas text-soft dark:bg-slate-800">
        {icon ?? <Inbox className="h-5 w-5" />}
      </div>
      <div className="mt-3 text-[13px] font-medium text-ink">{title}</div>
      {description ? (
        <p className="mt-1 max-w-[360px] text-[11.5px] leading-relaxed text-muted">{description}</p>
      ) : null}
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  )
}
