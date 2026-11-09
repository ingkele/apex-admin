import * as React from 'react'
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
} from '@tanstack/react-table'
import { ChevronDown, ChevronLeft, ChevronRight, ChevronUp, Inbox } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export interface DataTableProps<T> {
  columns: ColumnDef<T, unknown>[]
  data: T[]
  loading?: boolean
  /** 服务端排序字段回调（列 meta.sortKey 触发） */
  onSortChange?: (sort: string, order: 'asc' | 'desc') => void
  /** 服务端分页 */
  total?: number
  page?: number
  pageSize?: number
  onPageChange?: (page: number) => void
  emptyText?: string
  /** 去掉外层边框与圆角，供「卡头 + 表格」组合使用 */
  bare?: boolean
}

declare module '@tanstack/react-table' {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface ColumnMeta<TData, TValue> {
    sortKey?: string
  }
}

/** 数据表格 —— TanStack Table v8 封装，密度由 --td-py 驱动 */
export function DataTable<T>({
  columns,
  data,
  loading,
  onSortChange,
  total = 0,
  page = 1,
  pageSize = 10,
  onPageChange,
  emptyText = '暂无数据',
  bare = false,
}: DataTableProps<T>) {
  const [sorting, setSorting] = React.useState<SortingState>([])

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualSorting: true,
    manualPagination: true,
    state: { sorting },
    onSortingChange: (updater) => {
      const next = typeof updater === 'function' ? updater(sorting) : updater
      setSorting(next)
      const s = next[0]
      if (s && onSortChange) {
        const col = table.getColumn(s.id)
        onSortChange(col?.columnDef.meta?.sortKey ?? s.id, s.desc ? 'desc' : 'asc')
      }
    },
  })

  const totalPages = Math.max(1, Math.ceil(total / pageSize))

  return (
    <div className={cn('overflow-hidden', !bare && 'rounded-xl border border-line bg-surface')}>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left">
          <thead>
            {table.getHeaderGroups().map((hg) => (
              <tr key={hg.id} className="border-b border-line bg-canvas/60">
                {hg.headers.map((header) => {
                  const sorted = header.column.getIsSorted()
                  return (
                    <th
                      key={header.id}
                      className={cn(
                        'px-4 py-3 text-[11.5px] font-medium text-muted',
                        header.column.getCanSort() && 'cursor-pointer select-none hover:text-ink',
                      )}
                      onClick={header.column.getToggleSortingHandler()}
                    >
                      <span className="inline-flex items-center gap-1">
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {sorted === 'asc' ? <ChevronUp className="h-3 w-3" /> : null}
                        {sorted === 'desc' ? <ChevronDown className="h-3 w-3" /> : null}
                      </span>
                    </th>
                  )
                })}
              </tr>
            ))}
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-10 text-center text-[13px] text-soft">
                  加载中…
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-12 text-center">
                  <div className="flex flex-col items-center gap-2 text-soft">
                    <Inbox className="h-8 w-8" />
                    <div className="text-[13px]">{emptyText}</div>
                  </div>
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => (
                <tr key={row.id} className="border-b border-line last:border-0 transition-colors hover:bg-hover/60">
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="td-py px-4 text-[13px] text-ink">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {onPageChange ? (
        <div className="flex items-center justify-between border-t border-line px-4 py-3">
          <div className="text-[12px] text-soft">
            共 {total} 条 · 第 {page}/{totalPages} 页
          </div>
          <div className="flex items-center gap-1.5">
            <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
              <ChevronLeft className="h-3.5 w-3.5" /> 上一页
            </Button>
            <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => onPageChange(page + 1)}>
              下一页 <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  )
}
