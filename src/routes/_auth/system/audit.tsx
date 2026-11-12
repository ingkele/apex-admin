import * as React from 'react'
import { createFileRoute } from '@tanstack/react-router'
import type { ColumnDef } from '@tanstack/react-table'
import { Check, Clock, Download, FileClock, Lock, RotateCcw, Search, ShieldAlert, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { AppSelect } from '@/components/ui/select'
import { AppDialog } from '@/components/ui/dialog'
import { StatusBadge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { DataTable } from '@/components/shared/data-table'
import { PageHeader } from '@/components/shared/page-header'
import { StatTile } from '@/components/shared/stat-tile'
import { useAuditLogs, useAuditStats } from '@/api'
import type { AuditItem } from '@/mocks/db'
import { formatNumber } from '@/lib/format'
import { toast } from 'sonner'

export const Route = createFileRoute('/_auth/system/audit')({
  component: AuditPage,
})

const RANGE_OPTIONS = [
  { value: '30', label: '近 30 天' },
  { value: '7', label: '近 7 天' },
  { value: '1', label: '今天' },
  { value: '90', label: '近 90 天' },
]

const OPERATOR_OPTIONS = [
  { value: 'all', label: '全部操作人' },
  { value: '陈昊', label: '陈昊' },
  { value: '林晓', label: '林晓' },
  { value: '周敏', label: '周敏' },
  { value: '王悦', label: '王悦' },
  { value: '赵一鸣', label: '赵一鸣' },
  { value: '系统', label: '系统' },
]

const TYPE_OPTIONS = [
  { value: 'all', label: '全部类型' },
  { value: 'login', label: '登录' },
  { value: 'perm', label: '角色权限' },
  { value: 'config', label: '配置变更' },
  { value: 'key', label: '密钥' },
  { value: 'service', label: '服务操作' },
  { value: 'export', label: '导出' },
]

const RESULT_OPTIONS = [
  { value: 'all', label: '全部结果' },
  { value: 'success', label: '成功' },
  { value: 'fail', label: '失败' },
]

const RISK_LABEL: Record<string, { text: string; cls: string }> = {
  high: { text: '高', cls: 'text-rose-600 dark:text-rose-400' },
  medium: { text: '中', cls: 'text-amber-600 dark:text-amber-400' },
  low: { text: '低', cls: 'text-muted' },
}

const AVATAR_TONE = [
  'bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400',
  'bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-400',
  'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400',
  'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400',
]

function avatarTone(name: string) {
  const sum = [...name].reduce((s, ch) => s + ch.charCodeAt(0), 0)
  return AVATAR_TONE[sum % AVATAR_TONE.length]
}

function AuditPage() {
  const [draft, setDraft] = React.useState({
    keyword: '',
    operator: 'all',
    type: 'all',
    result: 'all',
    range: '30',
  })
  const [applied, setApplied] = React.useState({ keyword: '', operator: 'all', type: 'all', result: 'all' })
  const [page, setPage] = React.useState(1)
  const [detail, setDetail] = React.useState<AuditItem | null>(null)

  const params = { page, pageSize: 10, ...applied }
  const logs = useAuditLogs(params)
  const stats = useAuditStats()

  const columns: ColumnDef<AuditItem, unknown>[] = [
    {
      accessorKey: 'at',
      header: '时间 (UTC+8)',
      cell: ({ row }) => <span className="font-mono text-[11.5px] text-muted">{row.original.at}</span>,
    },
    {
      accessorKey: 'operator',
      header: '操作人',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-medium ${avatarTone(row.original.operator)}`}>
            {row.original.operator.slice(0, 1)}
          </span>
          <div>
            <div className="text-[12.5px] text-ink">{row.original.operator}</div>
            <div className="font-mono text-[10px] text-soft">{row.original.ip}</div>
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'action',
      header: '操作',
      cell: ({ row }) => <span className="text-[12.5px] text-ink">{row.original.action}</span>,
    },
    {
      accessorKey: 'target',
      header: '操作对象',
      cell: ({ row }) => <span className="block max-w-[260px] truncate text-[12px] text-muted">{row.original.target}</span>,
    },
    {
      accessorKey: 'result',
      header: '结果',
      cell: ({ row }) => (
        <span
          className={
            row.original.result === 'success'
              ? 'inline-flex items-center gap-1.5 text-[11.5px] font-medium text-emerald-600 dark:text-emerald-400'
              : 'inline-flex items-center gap-1.5 text-[11.5px] font-medium text-rose-600 dark:text-rose-400'
          }
        >
          <span className={`h-1.5 w-1.5 rounded-full ${row.original.result === 'success' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
          {row.original.result === 'success' ? '成功' : '失败'}
        </span>
      ),
    },
    {
      accessorKey: 'risk',
      header: '风险',
      cell: ({ row }) => {
        const meta = RISK_LABEL[row.original.risk] ?? RISK_LABEL.low
        return <span className={`text-[11.5px] font-medium ${meta.cls}`}>{meta.text}</span>
      },
    },
    {
      id: 'actions',
      header: '详情',
      cell: ({ row }) => (
        <Button variant="ghost" size="sm" onClick={() => setDetail(row.original)}>
          查看
        </Button>
      ),
    },
  ]

  const applySearch = () => {
    setApplied({ keyword: draft.keyword, operator: draft.operator, type: draft.type, result: draft.result })
    setPage(1)
  }

  const resetFilters = () => {
    setDraft({ keyword: '', operator: 'all', type: 'all', result: 'all', range: '30' })
    setApplied({ keyword: '', operator: 'all', type: 'all', result: 'all' })
    setPage(1)
  }

  return (
    <div>
      <PageHeader
        title="审计日志"
        description="追踪平台内所有关键操作，支持按时间、操作人与结果检索。"
        badge={<StatusBadge status="readonly" />}
        actions={
          <>
            <Button variant="outline" size="sm" onClick={() => toast.info('保留策略设置（规划中）')}>
              <Clock className="h-3.5 w-3.5" /> 保留策略
            </Button>
            <Button variant="outline" size="sm" onClick={() => toast.success('已导出日志（演示）')}>
              <Download className="h-3.5 w-3.5" /> 导出日志
            </Button>
          </>
        }
      />

      {/* 概览统计（原型 4 卡） */}
      <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile icon={<FileClock className="h-4 w-4" />} label="今日操作" value={formatNumber(stats.data?.total ?? 0)} />
        <StatTile
          icon={<ShieldAlert className="h-4 w-4" />}
          tone="rose"
          label="高风险操作"
          value={stats.data?.highRisk ?? 0}
          compare="需关注"
        />
        <StatTile
          icon={<XCircle className="h-4 w-4" />}
          tone="amber"
          label="失败操作"
          value={stats.data?.failed ?? 0}
          compare="含 1 次异常登录"
        />
        <StatTile
          icon={<Clock className="h-4 w-4" />}
          label="日志保留"
          value={`${stats.data?.retentionDays ?? '—'} 天`}
          compare="加密存储"
        />
      </div>

      {/* 筛选栏（原型 5 控件一行） */}
      <Card className="mb-4 flex flex-wrap items-end gap-3 px-4 py-3">
        <div className="w-[130px]">
          <label className="mb-1 block text-[11px] text-muted">时间范围</label>
          <AppSelect value={draft.range} onValueChange={(v) => setDraft((d) => ({ ...d, range: v }))} options={RANGE_OPTIONS} className="h-9" />
        </div>
        <div className="w-[140px]">
          <label className="mb-1 block text-[11px] text-muted">操作人</label>
          <AppSelect value={draft.operator} onValueChange={(v) => setDraft((d) => ({ ...d, operator: v }))} options={OPERATOR_OPTIONS} className="h-9" />
        </div>
        <div className="w-[130px]">
          <label className="mb-1 block text-[11px] text-muted">操作类型</label>
          <AppSelect value={draft.type} onValueChange={(v) => setDraft((d) => ({ ...d, type: v }))} options={TYPE_OPTIONS} className="h-9" />
        </div>
        <div className="w-[130px]">
          <label className="mb-1 block text-[11px] text-muted">结果</label>
          <AppSelect value={draft.result} onValueChange={(v) => setDraft((d) => ({ ...d, result: v }))} options={RESULT_OPTIONS} className="h-9" />
        </div>
        <div className="min-w-[220px] flex-1">
          <label className="mb-1 block text-[11px] text-muted">关键字</label>
          <div className="relative">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-soft" />
            <input
              id="audit-keyword"
              value={draft.keyword}
              onChange={(e) => setDraft((d) => ({ ...d, keyword: e.target.value }))}
              onKeyDown={(e) => e.key === 'Enter' && applySearch()}
              placeholder="搜索操作对象、日志 ID 或 IP…"
              className="h-9 w-full rounded-lg border border-line bg-surface pl-8 pr-3 text-[12px] text-ink outline-none placeholder:text-soft focus:border-brand-500"
            />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" onClick={applySearch}>查询</Button>
          <Button variant="outline" size="sm" onClick={resetFilters}>
            <RotateCcw className="h-3 w-3" /> 重置
          </Button>
        </div>
      </Card>

      {/* 记录表格 */}
      <Card className="overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-3">
          <div className="flex items-center gap-2">
            <span className="text-[14px] font-semibold text-ink">操作记录</span>
            <span className="rounded bg-hover px-1.5 py-0.5 text-[10.5px] font-medium text-muted">
              {logs.data?.total ?? 0} 条
            </span>
            <span className="inline-flex items-center gap-1 text-[10.5px] text-emerald-600 dark:text-emerald-400">
              <Check className="h-3 w-3" /> 已同步至审计中心
            </span>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-md bg-hover px-2 py-1 text-[10.5px] text-muted">
            <Lock className="h-3 w-3" /> 日志记录不可编辑或删除
          </span>
        </div>
        <DataTable
          bare
          columns={columns}
          data={logs.data?.items ?? []}
          loading={logs.isPending}
          total={logs.data?.total ?? 0}
          page={page}
          pageSize={10}
          onPageChange={setPage}
          emptyText="没有匹配的记录"
        />
      </Card>

      {/* 详情 */}
      <AppDialog
        open={!!detail}
        onOpenChange={(v) => !v && setDetail(null)}
        title="审计日志详情"
        width="w-[560px]"
      >
        {detail ? (
          <div className="space-y-3 pt-2">
            {[
              ['时间', detail.at],
              ['操作人', `${detail.operator}（${detail.ip}）`],
              ['操作', detail.action],
              ['操作对象', detail.target],
              ['结果', detail.result === 'success' ? '成功' : '失败'],
              ['风险等级', detail.risk === 'high' ? '高' : detail.risk === 'medium' ? '中' : '低'],
            ].map(([k, v]) => (
              <div key={k} className="flex items-start justify-between gap-4 text-[12.5px]">
                <span className="text-muted">{k}</span>
                <span className="text-right text-ink">{v}</span>
              </div>
            ))}
            <div>
              <div className="mb-1.5 text-[12.5px] text-muted">变更明细</div>
              <pre className="rounded-lg border border-line bg-canvas/60 p-3 font-mono text-[11px] leading-relaxed text-ink">
                {detail.detail}
              </pre>
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <Button variant="outline" size="sm" onClick={() => toast.success('已导出该记录（演示）')}>
                <Download className="h-3.5 w-3.5" /> 导出记录
              </Button>
              <Button size="sm" onClick={() => setDetail(null)}>关闭</Button>
            </div>
          </div>
        ) : null}
      </AppDialog>
    </div>
  )
}
