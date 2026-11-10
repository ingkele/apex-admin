import * as React from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { toast } from 'sonner'
import { Bookmark, BookmarkCheck, Eye, Filter } from 'lucide-react'
import { StatusBadge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { DemoBlock } from '@/components/shared/demo-block'
import { PageHeader } from '@/components/shared/page-header'
import { INITIAL_ROWS } from '@/lib/example-data'
import { cn } from '@/lib/utils'

export const Route = createFileRoute('/_auth/examples/vxe-table/viewed')({
  component: Page,
})

function Page() {
  return (
    <>
      <PageHeader
        eyebrow={<span>示例 › Vxe 表格 › 行标记 · 看过/收藏留痕</span>}
        title="行标记"
        description="行级标记能力：点行记录「已查看」，书签图标收藏；支持只看标记行与最近查看倒序。"
      />
      <ViewedTable />
    </>
  )
}

function ViewedTable() {
  const [viewed, setViewed] = React.useState<Map<string, number>>(new Map([['task_2b7e04dd', Date.now() - 60_000]]))
  const [bookmarked, setBookmarked] = React.useState<Set<string>>(new Set(['task_8f1c90ab']))
  const [onlyMarked, setOnlyMarked] = React.useState(false)

  const markViewed = (id: string) =>
    setViewed((m) => {
      const next = new Map(m)
      next.set(id, Date.now())
      return next
    })

  const toggleBookmark = (id: string) =>
    setBookmarked((s) => {
      const next = new Set(s)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })

  const rows = INITIAL_ROWS.filter((r) => !onlyMarked || viewed.has(r.id) || bookmarked.has(r.id))

  /** 最近查看倒序（取前 3 条） */
  const recent = [...viewed.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([id]) => INITIAL_ROWS.find((r) => r.id === id)?.name ?? id)

  return (
    <DemoBlock
      id="vxe-viewed"
      title="任务列表（行标记）"
      desc="点行标为已查看（自动记录时间），点书签图标收藏/取消；右上可只看标记行"
      code={`// 两套标记独立维护：
const [viewed, setViewed] = useState<Map<string, number>>()   // id → 查看时间戳
const [bookmarked, setBookmarked] = useState<Set<string>>()   // 收藏 id 集合
// 只看标记行：viewed.has(id) || bookmarked.has(id)
// 最近查看：按时间戳倒序取前 N 条`}
    >
      <div className="mb-3 flex items-center gap-3">
        <span className="flex items-center gap-1.5 text-[10.5px] text-soft">
          <Eye className="h-3.5 w-3.5" /> 已查看 {viewed.size} 行
        </span>
        <span className="flex items-center gap-1.5 text-[10.5px] text-soft">
          <BookmarkCheck className="h-3.5 w-3.5 text-brand-600" /> 收藏 {bookmarked.size} 行
        </span>
        <Button
          size="sm"
          variant={onlyMarked ? 'soft' : 'outline'}
          className="ml-auto h-7"
          onClick={() => setOnlyMarked((v) => !v)}
        >
          <Filter className="h-3 w-3" /> {onlyMarked ? '显示全部' : '只看标记行'}
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="h-7"
          disabled={viewed.size === 0 && bookmarked.size === 0}
          onClick={() => {
            setViewed(new Map())
            setBookmarked(new Set())
            toast.info('已清除全部标记')
          }}
        >
          清除标记
        </Button>
      </div>

      {recent.length > 0 ? (
        <div className="mb-3 flex flex-wrap items-center gap-2 rounded-lg bg-canvas/50 px-3 py-2">
          <span className="text-[10.5px] text-soft">最近查看：</span>
          {recent.map((name) => (
            <span key={name} className="rounded-full bg-surface px-2.5 py-0.5 text-[10.5px] text-muted shadow-sm">
              {name}
            </span>
          ))}
        </div>
      ) : null}

      <div className="overflow-hidden rounded-lg border border-line">
        <table className="w-full text-[11.5px]">
          <thead>
            <tr className="border-b border-line bg-canvas/50 text-left text-soft">
              <th className="w-10 px-3 py-2.5" />
              {['ID', '任务', '类型', '状态', '负责人', '创建时间', '标记'].map((h, i) => (
                <th key={h} className={cn('px-4 py-2.5 font-medium', i > 0 && 'border-l border-line')}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const isViewed = viewed.has(row.id)
              const isBooked = bookmarked.has(row.id)
              return (
                <tr
                  key={row.id}
                  onClick={() => markViewed(row.id)}
                  className={cn(
                    'cursor-pointer border-b border-line/60 last:border-0 transition-colors',
                    isViewed ? 'bg-brand-50/40 dark:bg-brand-500/10' : 'hover:bg-hover/50',
                  )}
                >
                  <td className="px-3 py-2.5">
                    {isViewed ? (
                      <Eye className="h-3.5 w-3.5 text-brand-600" aria-label="已查看" />
                    ) : (
                      <span className="block h-3.5 w-3.5" />
                    )}
                  </td>
                  <td className="px-4 py-2.5 font-mono text-[10.5px] text-soft">{row.id}</td>
                  <td className={cn('border-l border-line px-4 py-2.5', isViewed ? 'text-muted line-through decoration-soft' : 'font-medium text-ink')}>
                    {row.name}
                  </td>
                  <td className="border-l border-line px-4 py-2.5 text-muted">{row.type}</td>
                  <td className="border-l border-line px-4 py-2.5"><StatusBadge status={row.status} /></td>
                  <td className="border-l border-line px-4 py-2.5 text-muted">{row.owner}</td>
                  <td className="border-l border-line px-4 py-2.5 text-muted">{row.createdAt}</td>
                  <td className="border-l border-line px-4 py-2.5">
                    <button
                      type="button"
                      aria-label={isBooked ? `取消收藏 ${row.name}` : `收藏 ${row.name}`}
                      onClick={(e) => {
                        e.stopPropagation()
                        toggleBookmark(row.id)
                      }}
                      className="text-soft transition-colors hover:text-brand-600"
                    >
                      {isBooked ? (
                        <BookmarkCheck className="h-4 w-4 text-brand-600" />
                      ) : (
                        <Bookmark className="h-4 w-4" />
                      )}
                    </button>
                  </td>
                </tr>
              )
            })}
            {rows.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-10 text-center text-muted">
                  还没有标记行，点行或书签图标做第一个标记
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </DemoBlock>
  )
}
