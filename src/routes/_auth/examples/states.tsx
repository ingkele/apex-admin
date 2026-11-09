import * as React from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { Check, CircleAlert, ListChecks, LoaderCircle, Plus, ServerCrash } from 'lucide-react'
import { toast } from 'sonner'
import { StatusBadge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardTitle } from '@/components/ui/card'
import { TableSkeleton } from '@/components/ui/skeleton'
import { DataTable } from '@/components/shared/data-table'
import { EmptyState } from '@/components/shared/empty-state'
import { ErrorState } from '@/components/shared/error-state'
import { PageHeader } from '@/components/shared/page-header'
import { INITIAL_ROWS } from '@/lib/example-data'
import { cn } from '@/lib/utils'

export const Route = createFileRoute('/_auth/examples/states')({
  component: Page,
})

function Page() {
  return (
    <>
      <PageHeader
        eyebrow={<span>示例 › 状态占位 · 加载中 / 就绪 / 空数据 / 异常</span>}
        title="状态占位"
        description="同内容区的四种状态可手动切换，用于核对列表页在各类请求结果下的表现。"
      />

      <StatesDemo />
    </>
  )
}

function StatesDemo() {
  const [state, setState] = React.useState<'loading' | 'empty' | 'error' | 'ready'>('loading')

  React.useEffect(() => {
    if (state !== 'loading') return
    const t = setTimeout(() => setState('ready'), 1500)
    return () => clearTimeout(t)
  }, [state])

  return (
    <Card className="overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-3.5">
        <div>
          <CardTitle>列表页四种状态</CardTitle>
          <p className="mt-0.5 text-[10.5px] text-muted">加载中自动切换到就绪，可手动切到空 / 错误态查看</p>
        </div>
        <div className="flex items-center gap-1 rounded-lg border border-line p-1">
          {(
            [
              { value: 'loading', label: '加载中', icon: LoaderCircle },
              { value: 'ready', label: '就绪', icon: Check },
              { value: 'empty', label: '空数据', icon: ListChecks },
              { value: 'error', label: '异常', icon: CircleAlert },
            ] as const
          ).map((s) => (
            <button
              key={s.value}
              type="button"
              onClick={() => setState(s.value)}
              className={cn(
                'flex items-center gap-1 rounded-md px-2.5 py-1 text-[11.5px] transition-colors',
                state === s.value ? 'bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-300' : 'text-muted hover:text-ink',
              )}
            >
              <s.icon className={cn('h-3 w-3', s.value === 'loading' && state === 'loading' && 'animate-spin')} />
              {s.label}
            </button>
          ))}
        </div>
      </div>

      <div className="min-h-[280px]">
        {state === 'loading' ? <TableSkeleton rows={6} cols={5} /> : null}

        {state === 'empty' ? (
          <EmptyState
            title="暂无任务记录"
            description="当前筛选条件下没有数据。可以调整筛选条件，或新建一个任务开始使用。"
            action={
              <Button size="sm" onClick={() => toast.info('跳转新建任务')}>
                <Plus className="h-3.5 w-3.5" /> 新建任务
              </Button>
            }
          />
        ) : null}

        {state === 'error' ? (
          <ErrorState
            bare
            code="500"
            tone="rose"
            icon={<ServerCrash className="h-5 w-5" />}
            title="列表加载失败"
            description="请求任务列表时服务端返回异常，本次请求已被记录。"
            retryText="重新加载"
            onRetry={() => {
              setState('loading')
              toast.success('已重新发起请求')
            }}
          />
        ) : null}

        {state === 'ready' ? (
          <DataTable
            bare
            columns={[
              {
                accessorKey: 'name',
                header: '任务名称',
                cell: ({ row }) => <span className="text-[12.5px] font-medium text-ink">{row.original.name}</span>,
              },
              {
                accessorKey: 'status',
                header: '状态',
                cell: ({ row }) => <StatusBadge status={row.original.status} />,
              },
              {
                accessorKey: 'owner',
                header: '提交人',
                cell: ({ row }) => <span className="text-[12px] text-muted">{row.original.owner}</span>,
              },
            ]}
            data={INITIAL_ROWS.slice(0, 4)}
            total={4}
          />
        ) : null}
      </div>
    </Card>
  )
}
