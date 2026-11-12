import * as React from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import type { ColumnDef } from '@tanstack/react-table'
import {
  ChevronDown, CircleAlert, Clock, Columns3, Download, ListChecks,
  LoaderCircle, Plus, RefreshCw, RotateCcw, SlidersHorizontal, Trash2, XCircle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input, Label } from '@/components/ui/input'
import { AppSelect } from '@/components/ui/select'
import { AppDialog } from '@/components/ui/dialog'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { StatusBadge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { DataTable } from '@/components/shared/data-table'
import { PageHeader } from '@/components/shared/page-header'
import { LiveBadge, StatBadge, StatTile } from '@/components/shared/stat-tile'
import { Can } from '@/components/shared/can'
import { useTaskActions, useTaskSummary, useTasks } from '@/api'
import type { Task } from '@/mocks/db'
import { formatDuration } from '@/lib/format'
import { toast } from 'sonner'

export const Route = createFileRoute('/_auth/tasks/')({
  component: TaskListPage,
})

const TYPE_OPTIONS = [
  { value: 'all', label: '全部类型' },
  { value: '批处理推理', label: '批处理推理' },
  { value: 'Embedding', label: 'Embedding' },
  { value: '信息抽取', label: '信息抽取' },
  { value: '图像生成', label: '图像生成' },
  { value: '翻译', label: '翻译' },
  { value: '语音转写', label: '语音转写' },
]

const STATUS_OPTIONS = [
  { value: 'all', label: '全部状态' },
  { value: 'running', label: '运行中' },
  { value: 'failed', label: '失败' },
  { value: 'queued', label: '排队中' },
  { value: 'success', label: '已完成' },
]

const PAGE_SIZE = 10

function TaskListPage() {
  const navigate = useNavigate()
  const [draft, setDraft] = React.useState({
    keyword: '',
    status: 'all',
    type: 'all',
    from: '2026-11-01',
    to: '2026-11-08',
  })
  const [applied, setApplied] = React.useState({ keyword: '', status: 'all', type: 'all' })
  const [page, setPage] = React.useState(1)
  const [selected, setSelected] = React.useState<Record<string, boolean>>({})
  const [createOpen, setCreateOpen] = React.useState(false)
  const [cancelTarget, setCancelTarget] = React.useState<Task | null>(null)
  const [form, setForm] = React.useState({ name: '', type: '批处理推理', model: 'gpt-4o' })

  const params = { page, pageSize: PAGE_SIZE, ...applied }
  const list = useTasks(params)
  const summary = useTaskSummary()
  const { retry, cancel, create } = useTaskActions()

  const selectedIds = Object.entries(selected).filter(([, v]) => v).map(([k]) => k)
  const total = list.data?.total ?? 0

  const applySearch = () => {
    setApplied({ keyword: draft.keyword, status: draft.status, type: draft.type })
    setPage(1)
  }

  const resetFilters = () => {
    setDraft({ keyword: '', status: 'all', type: 'all', from: '2026-11-01', to: '2026-11-08' })
    setApplied({ keyword: '', status: 'all', type: 'all' })
    setPage(1)
  }

  const columns: ColumnDef<Task, unknown>[] = [
    {
      id: 'select',
      header: () => (
        <input
          id="task-select-all"
          type="checkbox"
          className="h-3.5 w-3.5 accent-[var(--brand-600)]"
          checked={selectedIds.length > 0 && selectedIds.length === (list.data?.items.length ?? 0)}
          onChange={(e) => {
            const next: Record<string, boolean> = {}
            if (e.target.checked) (list.data?.items ?? []).forEach((t) => { next[t.id] = true })
            setSelected(next)
          }}
        />
      ),
      cell: ({ row }) => (
        <input
          id={`task-select-${row.original.id}`}
          type="checkbox"
          className="h-3.5 w-3.5 accent-[var(--brand-600)]"
          checked={!!selected[row.original.id]}
          onChange={(e) => setSelected((s) => ({ ...s, [row.original.id]: e.target.checked }))}
        />
      ),
    },
    {
      accessorKey: 'id',
      header: '任务 ID',
      meta: { sortKey: 'id' },
      cell: ({ row }) => <span className="font-mono text-[11.5px] text-muted">{row.original.id}</span>,
    },
    {
      accessorKey: 'name',
      header: '任务名称',
      meta: { sortKey: 'name' },
      cell: ({ row }) => (
        <div>
          <div className="font-medium text-ink">{row.original.name}</div>
          <div className="text-[11px] text-soft">
            {row.original.model} · prod-cn-east
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'status',
      header: '状态',
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },
    { accessorKey: 'type', header: '任务类型', cell: ({ row }) => <span className="text-muted">{row.original.type}</span> },
    {
      accessorKey: 'submitter',
      header: '提交人',
      cell: ({ row }) => (
        <span className="inline-flex items-center gap-1.5 text-muted">
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-brand-50 text-[9px] font-medium text-brand-600 dark:bg-brand-500/10 dark:text-brand-400">
            {row.original.submitter.slice(0, 1)}
          </span>
          {row.original.submitter}
        </span>
      ),
    },
    {
      accessorKey: 'durationSec',
      header: '耗时',
      cell: ({ row }) => (
        <span className="font-mono text-[12px] text-muted">
          {row.original.durationSec ? formatDuration(row.original.durationSec) : '—'}
        </span>
      ),
    },
    {
      id: 'actions',
      header: '操作',
      cell: ({ row }) => (
        <div className="flex items-center gap-1.5">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => void navigate({ to: '/tasks/$id', params: { id: row.original.id } })}
          >
            详情
          </Button>
          {row.original.status === 'failed' ? (
            <Can permission="task:retry">
              <Button
                variant="soft"
                size="sm"
                onClick={() => retry.mutate(row.original.id, { onSuccess: () => toast.success('已重新入队') })}
              >
                重试
              </Button>
            </Can>
          ) : null}
          {row.original.status === 'running' || row.original.status === 'queued' ? (
            <Can permission="task:cancel">
              <Button variant="ghost" size="sm" className="text-rose-600" onClick={() => setCancelTarget(row.original)}>
                取消
              </Button>
            </Can>
          ) : null}
        </div>
      ),
    },
  ]

  return (
    <div>
      <PageHeader
        title="任务列表"
        description="统一查看、筛选和处理平台内所有 AI 执行任务。"
        actions={
          <>
            <Button variant="outline" size="sm" onClick={() => toast.success('已导出 CSV（演示）')}>
              <Download className="h-3.5 w-3.5" /> 导出
            </Button>
            <Can permission="task:retry">
              <Button size="sm" onClick={() => setCreateOpen(true)}>
                <Plus className="h-3.5 w-3.5" /> 新建任务
              </Button>
            </Can>
          </>
        }
      />

      {/* 概览统计（原型 4 卡） */}
      <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile
          icon={<ListChecks className="h-4 w-4" />}
          label="全部任务"
          value={(summary.data?.total ?? 0).toLocaleString('en-US')}
          badge={<StatBadge delta="+12.4%" tone="up" />}
        />
        <StatTile
          icon={<LoaderCircle className="h-4 w-4" />}
          label="运行中"
          value={summary.data?.running ?? 0}
          badge={<LiveBadge />}
        />
        <StatTile
          icon={<CircleAlert className="h-4 w-4" />}
          tone="rose"
          label="失败待处理"
          value={summary.data?.failed ?? 0}
          badge={
            <span className="inline-flex items-center gap-1 rounded-md bg-rose-50 px-1.5 py-0.5 text-[10px] font-medium text-rose-600 dark:bg-rose-500/10 dark:text-rose-400">
              需处理
            </span>
          }
        />
        <StatTile
          icon={<Clock className="h-4 w-4" />}
          tone="amber"
          label="排队中"
          value={summary.data?.queued ?? 0}
          badge={
            <span className="inline-flex items-center gap-1 rounded-md bg-amber-50 px-1.5 py-0.5 text-[10px] font-medium text-amber-600 dark:bg-amber-500/10 dark:text-amber-400">
              等待调度
            </span>
          }
        />
      </div>

      {/* 筛选条件（原型同款卡） */}
      <Card className="mb-4">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line px-5 py-3">
          <div className="flex items-center gap-2 text-[13px] font-semibold text-ink">
            <SlidersHorizontal className="h-3.5 w-3.5 text-soft" />
            筛选条件
          </div>
          <span className="text-[11px] text-soft">支持组合筛选，结果实时生效</span>
        </div>
        <div className="grid grid-cols-1 gap-x-4 gap-y-3 px-5 py-4 lg:grid-cols-4">
          <div>
            <label className="mb-1.5 block text-[11.5px] text-muted">任务状态</label>
            <AppSelect
              value={draft.status}
              onValueChange={(v) => setDraft((d) => ({ ...d, status: v }))}
              options={STATUS_OPTIONS}
              className="h-9"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-[11.5px] text-muted">任务类型</label>
            <AppSelect
              value={draft.type}
              onValueChange={(v) => setDraft((d) => ({ ...d, type: v }))}
              options={TYPE_OPTIONS}
              className="h-9"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-[11.5px] text-muted">提交日期</label>
            <div className="flex items-center gap-1.5">
              <input
                id="task-date-from"
                type="date"
                value={draft.from}
                onChange={(e) => setDraft((d) => ({ ...d, from: e.target.value }))}
                className="h-9 w-full rounded-lg border border-line bg-surface px-2 text-[11.5px] text-ink outline-none focus:border-brand-500"
              />
              <span className="text-[11px] text-soft">至</span>
              <input
                id="task-date-to"
                type="date"
                value={draft.to}
                onChange={(e) => setDraft((d) => ({ ...d, to: e.target.value }))}
                className="h-9 w-full rounded-lg border border-line bg-surface px-2 text-[11.5px] text-ink outline-none focus:border-brand-500"
              />
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-[11.5px] text-muted">关键字</label>
            <Input
              value={draft.keyword}
              onChange={(e) => setDraft((d) => ({ ...d, keyword: e.target.value }))}
              onKeyDown={(e) => e.key === 'Enter' && applySearch()}
              placeholder="搜索任务名称或任务 ID"
              className="h-9"
            />
          </div>
        </div>
        <div className="flex justify-end gap-2 border-t border-line px-5 py-3">
          <Button size="sm" onClick={applySearch}>
            查询
          </Button>
          <Button variant="outline" size="sm" onClick={resetFilters}>
            重置
          </Button>
        </div>
      </Card>

      {/* 任务表格（卡头工具条 + 裸表） */}
      <Card className="overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-3">
          <div className="flex items-center gap-2">
            <span className="text-[14px] font-semibold text-ink">全部任务</span>
            <span className="rounded bg-hover px-1.5 py-0.5 text-[10.5px] font-medium text-muted">
              {summary.data?.total ?? total}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            <Can permission="task:retry">
              <Button size="sm" onClick={() => setCreateOpen(true)}>
                <Plus className="h-3.5 w-3.5" /> 新建任务
              </Button>
            </Can>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                selectedIds.length
                  ? document.getElementById('batch-bar')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
                  : toast.info('请先勾选任务')
              }
            >
              批量操作
            </Button>
            <Button variant="outline" size="sm" onClick={() => toast.success('已导出 CSV（演示）')}>
              <Download className="h-3.5 w-3.5" /> 导出
            </Button>
            <Button variant="outline" size="sm" onClick={() => list.refetch()}>
              <RefreshCw className="h-3.5 w-3.5" /> 刷新
            </Button>
            <Button variant="outline" size="sm" onClick={() => toast.info('列视图配置（演示）')}>
              <Columns3 className="h-3.5 w-3.5" /> 列视图
              <ChevronDown className="h-3 w-3" />
            </Button>
          </div>
        </div>

        {/* 批量操作条 */}
        {selectedIds.length > 0 ? (
          <div
            id="batch-bar"
            className="flex flex-wrap items-center gap-2 border-b border-brand-200 bg-brand-50 px-5 py-2.5 dark:border-brand-500/20 dark:bg-brand-500/10"
          >
            <span className="text-[12.5px] text-brand-600 dark:text-brand-400">
              已选 {selectedIds.length} 项
            </span>
            <div className="ml-auto flex flex-wrap items-center gap-1.5">
              <Button
                variant="outline"
                size="sm"
                onClick={() => { selectedIds.forEach((id) => retry.mutate(id)); toast.success('批量重试已提交') }}
              >
                <RotateCcw className="h-3 w-3" /> 批量重试
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => { selectedIds.forEach((id) => cancel.mutate(id)); toast.success('批量取消已提交'); setSelected({}) }}
              >
                <XCircle className="h-3 w-3" /> 批量取消
              </Button>
              <Button variant="outline" size="sm" onClick={() => toast.success('已导出所选（演示）')}>
                <Download className="h-3 w-3" /> 导出所选
              </Button>
              <Button variant="ghost" size="sm" className="text-rose-600" onClick={() => toast.info('演示环境不支持删除')}>
                <Trash2 className="h-3 w-3" /> 删除所选
              </Button>
            </div>
          </div>
        ) : null}

        <DataTable
          bare
          columns={columns}
          data={list.data?.items ?? []}
          loading={list.isPending}
          total={total}
          page={page}
          pageSize={PAGE_SIZE}
          onPageChange={setPage}
          emptyText="没有匹配的任务"
        />
      </Card>

      {/* 新建任务 */}
      <AppDialog open={createOpen} onOpenChange={setCreateOpen} title="新建任务" description="配置任务类型与模型后提交执行">
        <div className="space-y-4 pt-2">
          <div>
            <Label>任务名称</Label>
            <Input
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="例如：年度财报摘要生成"
            />
          </div>
          <div>
            <Label>任务类型</Label>
            <AppSelect
              value={form.type}
              onValueChange={(v) => setForm((f) => ({ ...f, type: v }))}
              options={TYPE_OPTIONS.filter((t) => t.value !== 'all')}
            />
          </div>
          <div>
            <Label>模型</Label>
            <AppSelect
              value={form.model}
              onValueChange={(v) => setForm((f) => ({ ...f, model: v }))}
              options={[
                { value: 'gpt-4o', label: 'GPT-4o' },
                { value: 'claude-sonnet-4', label: 'Claude Sonnet 4' },
                { value: 'deepseek-v3', label: 'DeepSeek V3' },
              ]}
            />
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <Button variant="outline" size="sm" onClick={() => setCreateOpen(false)}>取消</Button>
            <Button
              size="sm"
              disabled={!form.name.trim()}
              onClick={() => {
                create.mutate(form, {
                  onSuccess: () => {
                    setCreateOpen(false)
                    setForm({ name: '', type: '批处理推理', model: 'gpt-4o' })
                    toast.success('任务已创建并进入排队')
                  },
                })
              }}
            >
              提交任务
            </Button>
          </div>
        </div>
      </AppDialog>

      {/* 取消确认 */}
      <ConfirmDialog
        open={!!cancelTarget}
        onOpenChange={(v) => !v && setCancelTarget(null)}
        title="确认取消任务？"
        description={`任务「${cancelTarget?.name ?? ''}」取消后需重新提交，已产生的调用费用不退回。`}
        confirmText="确认取消"
        onConfirm={() => {
          if (cancelTarget) cancel.mutate(cancelTarget.id, { onSuccess: () => toast.success('任务已取消') })
        }}
      />
    </div>
  )
}
