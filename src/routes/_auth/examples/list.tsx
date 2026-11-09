import * as React from 'react'
import { createFileRoute } from '@tanstack/react-router'
import type { ColumnDef } from '@tanstack/react-table'
import { Filter, ListChecks, Plus, Search, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { Badge, StatusBadge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { AppDialog } from '@/components/ui/dialog'
import { Input, Label } from '@/components/ui/input'
import { Pagination } from '@/components/ui/pagination'
import { AppSelect } from '@/components/ui/select'
import { DataTable } from '@/components/shared/data-table'
import { EmptyState } from '@/components/shared/empty-state'
import { PageHeader } from '@/components/shared/page-header'
import { INITIAL_ROWS, STATUS_OPTIONS, type RecordRow } from '@/lib/example-data'
import { cn } from '@/lib/utils'

export const Route = createFileRoute('/_auth/examples/list')({
  component: Page,
})

function Page() {
  return (
    <>
      <PageHeader
        eyebrow={<span>示例 › 列表 CRUD · 搜索 + 筛选 + 分页 + 行操作</span>}
        title="列表 CRUD"
        description="一个可直接改造成业务页的标准列表：关键词搜索、状态下拉筛选、分页、行内操作与新建/删除二次确认。"
        actions={
          <Button size="sm" variant="outline" onClick={() => toast.info('示例代码位于 src/routes/_auth/examples/list.tsx')}>
            <ListChecks className="h-3.5 w-3.5" /> 查看源码位置
          </Button>
        }
      />

      <ListDemo />
    </>
  )
}

function ListDemo() {
  const [rows, setRows] = React.useState<RecordRow[]>(INITIAL_ROWS)
  const [keyword, setKeyword] = React.useState('')
  const [status, setStatus] = React.useState('all')
  const [page, setPage] = React.useState(1)
  const [pendingDelete, setPendingDelete] = React.useState<RecordRow | null>(null)
  const [createOpen, setCreateOpen] = React.useState(false)
  const [newName, setNewName] = React.useState('')
  const pageSize = 5

  const filtered = React.useMemo(() => {
    const kw = keyword.trim().toLowerCase()
    return rows.filter(
      (r) =>
        (status === 'all' || r.status === status) &&
        (!kw || r.name.toLowerCase().includes(kw) || r.id.includes(kw)),
    )
  }, [rows, keyword, status])

  const paged = React.useMemo(
    () => filtered.slice((page - 1) * pageSize, page * pageSize),
    [filtered, page],
  )

  // 筛选条件变化后回到第一页，避免落在空页
  React.useEffect(() => setPage(1), [keyword, status])

  const columns: ColumnDef<RecordRow, unknown>[] = [
    {
      accessorKey: 'name',
      header: '任务名称',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <span className="text-[12.5px] font-medium text-ink">{row.original.name}</span>
          <span className="font-mono text-[10px] text-soft">{row.original.id}</span>
        </div>
      ),
    },
    {
      accessorKey: 'type',
      header: '类型',
      cell: ({ row }) => <Badge variant="gray">{row.original.type}</Badge>,
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
    {
      accessorKey: 'createdAt',
      header: '创建时间',
      cell: ({ row }) => <span className="text-[12px] tabular-nums text-muted">{row.original.createdAt}</span>,
    },
    {
      id: 'actions',
      header: '操作',
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" onClick={() => toast.info(`查看 ${row.original.id}`)}>
            查看
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10"
            onClick={() => setPendingDelete(row.original)}
          >
            <Trash2 className="h-3.5 w-3.5" /> 删除
          </Button>
        </div>
      ),
    },
  ]

  return (
    <>
      <Card className="overflow-hidden">
        {/* 卡头工具条 */}
        <div className="flex flex-wrap items-center gap-2.5 border-b border-line px-4 py-3">
          <div className="relative w-[260px]">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-soft" />
            <Input
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="搜索任务名称或 ID…"
              className="h-8 pl-8 text-[12.5px]"
            />
          </div>
          <div className="w-[132px]">
            <AppSelect value={status} onValueChange={setStatus} options={STATUS_OPTIONS} className="h-8 text-[12.5px]" />
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setKeyword('')
              setStatus('all')
            }}
          >
            <Filter className="h-3.5 w-3.5" /> 重置
          </Button>
          <div className="ml-auto flex items-center gap-2">
            <span className="text-[11px] text-soft">
              命中 <span className="tabular-nums text-ink">{filtered.length}</span> 条
            </span>
            <Button size="sm" onClick={() => setCreateOpen(true)}>
              <Plus className="h-3.5 w-3.5" /> 新建任务
            </Button>
          </div>
        </div>

        {paged.length === 0 ? (
          <EmptyState
            title="没有匹配的任务"
            description="调整关键词或状态筛选后重试，也可以直接新建一个任务。"
            action={
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setKeyword('')
                  setStatus('all')
                }}
              >
                清空筛选
              </Button>
            }
          />
        ) : (
          <DataTable bare columns={columns} data={paged} total={filtered.length} page={page} pageSize={pageSize} />
        )}

        <div className="border-t border-line px-4 py-3">
          <Pagination page={page} pageSize={pageSize} total={filtered.length} onPageChange={setPage} />
        </div>
      </Card>

      <div className="mt-3 rounded-lg border border-line bg-canvas/50 px-4 py-2.5 text-[11px] leading-relaxed text-muted">
        本示例演示：客户端筛选 + 分页、行内操作、删除二次确认、空状态与筛选重置。真实业务页把
        <code className="mx-1 rounded bg-surface px-1 py-0.5 text-[10.5px] text-ink">rows</code>
        换成 <code className="rounded bg-surface px-1 py-0.5 text-[10.5px] text-ink">useTasks()</code> 的分页结果即可。
      </div>

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        onOpenChange={(v) => !v && setPendingDelete(null)}
        title={`确认删除「${pendingDelete?.name ?? ''}」？`}
        description="删除后执行记录与产物将一并清除，且不可恢复。"
        confirmText="确认删除"
        onConfirm={() => {
          if (!pendingDelete) return
          setRows((prev) => prev.filter((r) => r.id !== pendingDelete.id))
          toast.success('任务已删除')
          setPendingDelete(null)
        }}
      />

      <AppDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        title="新建任务"
        description="创建后进入调度队列，可在任务列表中跟踪进度。"
      >
        <div className="mt-3">
          <Label>任务名称</Label>
          <Input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="例如：合同关键信息抽取" />
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <Button size="sm" variant="outline" onClick={() => setCreateOpen(false)}>
            取消
          </Button>
          <Button
            size="sm"
            onClick={() => {
              if (!newName.trim()) {
                toast.error('请填写任务名称')
                return
              }
              setRows((prev) => [
                {
                  id: `task_${Math.random().toString(16).slice(2, 10)}`,
                  name: newName.trim(),
                  type: '文本生成',
                  status: 'queued',
                  owner: '陈昊',
                  createdAt: '11-09 16:20',
                },
                ...prev,
              ])
              setNewName('')
              setCreateOpen(false)
              toast.success('任务已创建')
            }}
          >
            创建任务
          </Button>
        </div>
      </AppDialog>
    </>
  )
}
