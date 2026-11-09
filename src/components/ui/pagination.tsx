import * as React from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

/** 分页器 —— 页码窗口带省略号，服务端分页直接受控 */
export function Pagination({
  page,
  pageSize,
  total,
  onPageChange,
  className,
}: {
  page: number
  pageSize: number
  total: number
  onPageChange: (page: number) => void
  className?: string
}) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const pages = React.useMemo(() => {
    const set = new Set<number>([1, totalPages, page, page - 1, page + 1])
    const list = [...set].filter((p) => p >= 1 && p <= totalPages).sort((a, b) => a - b)
    const out: (number | 'gap')[] = []
    list.forEach((p, i) => {
      if (i > 0 && p - list[i - 1] > 1) out.push('gap')
      out.push(p)
    })
    return out
  }, [page, totalPages])

  const btn =
    'flex h-7 min-w-7 items-center justify-center rounded-md px-2 text-[12px] transition-colors disabled:cursor-not-allowed disabled:opacity-40'

  return (
    <div className={cn('flex flex-wrap items-center justify-between gap-3', className)}>
      <span className="text-[11.5px] text-muted">
        共 <span className="tabular-nums text-ink">{total.toLocaleString('en-US')}</span> 条 · 每页 {pageSize} 条
      </span>
      <div className="flex items-center gap-1">
        <button
          type="button"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          className={cn(btn, 'border border-line text-muted hover:bg-hover hover:text-ink')}
        >
          <ChevronLeft className="h-3.5 w-3.5" />
        </button>
        {pages.map((p, i) =>
          p === 'gap' ? (
            <span key={`gap-${i}`} className="px-1 text-[12px] text-soft">
              …
            </span>
          ) : (
            <button
              key={p}
              type="button"
              onClick={() => onPageChange(p)}
              className={cn(
                btn,
                p === page
                  ? 'bg-brand-600 font-medium text-white'
                  : 'border border-line text-muted hover:bg-hover hover:text-ink',
              )}
            >
              {p}
            </button>
          ),
        )}
        <button
          type="button"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          className={cn(btn, 'border border-line text-muted hover:bg-hover hover:text-ink')}
        >
          <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  )
}
