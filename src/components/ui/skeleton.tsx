import * as React from 'react'
import { cn } from '@/lib/utils'

/** 骨架屏 —— 加载占位，尺寸由 className 控制 */
export function Skeleton({ className }: { className?: string }) {
  return <div className={cn('animate-pulse rounded-md bg-canvas dark:bg-slate-800', className)} />
}

/** 表格骨架：按行数铺开，列宽可配 */
export function TableSkeleton({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <div className="space-y-2.5 p-4">
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="flex items-center gap-4">
          {Array.from({ length: cols }).map((__, c) => (
            <Skeleton
              key={c}
              className={cn('h-4', c === 0 ? 'w-[22%]' : c === cols - 1 ? 'w-[12%]' : 'flex-1')}
            />
          ))}
        </div>
      ))}
    </div>
  )
}
