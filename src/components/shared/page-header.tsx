import * as React from 'react'
import { cn } from '@/lib/utils'

/** 页头：可选眉标（日期/环境行）+ 标题 + 描述 + 右侧操作区（原型每页顶部同款结构） */
export function PageHeader({
  title,
  eyebrow,
  badge,
  description,
  actions,
  className,
}: {
  title: string
  eyebrow?: React.ReactNode
  /** 标题旁的小徽章（如「只读」） */
  badge?: React.ReactNode
  description?: React.ReactNode
  actions?: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn('mb-5 flex flex-wrap items-start justify-between gap-3', className)}>
      <div>
        {eyebrow ? <div className="mb-2 text-[11.5px] text-muted">{eyebrow}</div> : null}
        <div className="flex items-center gap-2">
          <h1 className="text-[24px] font-semibold tracking-tight text-ink">{title}</h1>
          {badge}
        </div>
        {description ? (
          <p className="mt-1.5 text-[12.5px] text-muted">{description}</p>
        ) : null}
      </div>
      {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
    </div>
  )
}
