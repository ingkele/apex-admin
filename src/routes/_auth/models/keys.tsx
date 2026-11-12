import * as React from 'react'
import { createFileRoute } from '@tanstack/react-router'
import type { ColumnDef } from '@tanstack/react-table'
import {
  BarChart3, Copy, KeyRound, Lock, Plus, RefreshCw, Search, ShieldAlert, ShieldOff, Flame,
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
import { StatBadge, StatTile } from '@/components/shared/stat-tile'
import { Can } from '@/components/shared/can'
import { useApiKeys, useKeyActions } from '@/api'
import type { ApiKeyItem } from '@/mocks/db'
import { formatCompact, formatRelative } from '@/lib/format'
import { toast } from 'sonner'

export const Route = createFileRoute('/_auth/models/keys')({
  component: ApiKeysPage,
})

const STATUS_OPTIONS = [
  { value: 'all', label: '全部状态' },
  { value: 'active', label: '活跃' },
  { value: 'revoked', label: '已撤销' },
]

/** 密钥图标底色（按环境区分，对应原型彩色方块） */
const ENV_ICON = {
  prod: 'bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400',
  staging: 'bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-400',
  dev: 'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400',
}

function ApiKeysPage() {
  const keys = useApiKeys()
  const { create, revoke } = useKeyActions()
  const [createOpen, setCreateOpen] = React.useState(false)
  const [name, setName] = React.useState('')
  const [secret, setSecret] = React.useState<string | null>(null)
  const [revokeTarget, setRevokeTarget] = React.useState<ApiKeyItem | null>(null)
  const [keyword, setKeyword] = React.useState('')
  const [statusFilter, setStatusFilter] = React.useState('all')

  const all = keys.data ?? []
  const data = all.filter((k) => {
    const okStatus = statusFilter === 'all' || k.status === statusFilter
    const kw = keyword.trim().toLowerCase()
    const okKw = !kw || k.name.toLowerCase().includes(kw) || k.maskedKey.toLowerCase().includes(kw)
    return okStatus && okKw
  })

  const activeCount = all.filter((k) => k.status === 'active').length
  const callsMonth = all.reduce((s, k) => s + k.callsMonth, 0)
  const expiring = all.filter((k) => k.status === 'active' && (k.expiresInDays ?? 999) <= 30)
  const latest = [...all].sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0]

  const columns: ColumnDef<ApiKeyItem, unknown>[] = [
    {
      accessorKey: 'name',
      header: '名称',
      cell: ({ row }) => (
        <div className="flex items-center gap-2.5">
          <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md ${ENV_ICON[row.original.env]}`}>
            <KeyRound className="h-3.5 w-3.5" />
          </span>
          <div>
            <div className="font-medium text-ink">{row.original.name}</div>
            <div className="text-[11px] text-soft">
              {row.original.env} · 由 {row.original.owner} 创建
            </div>
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'maskedKey',
      header: 'API Key',
      cell: ({ row }) => (
        <span className="inline-flex items-center gap-1.5 font-mono text-[11.5px] text-muted">
          {row.original.maskedKey}
          <button
            type="button"
            title="复制（演示）"
            onClick={() => toast.info('明文仅在创建时可见')}
            className="rounded p-0.5 text-soft transition hover:text-ink"
          >
            <Copy className="h-3 w-3" />
          </button>
        </span>
      ),
    },
    { accessorKey: 'createdAt', header: '创建时间', cell: ({ row }) => <span className="text-[12px] text-muted">{row.original.createdAt}</span> },
    {
      accessorKey: 'status',
      header: '状态',
      cell: ({ row }) =>
        row.original.status === 'active' && row.original.expiresInDays ? (
          <span className="inline-flex items-center gap-1 text-[11.5px] font-medium text-amber-600 dark:text-amber-400">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
            {row.original.expiresInDays} 天后过期
          </span>
        ) : (
          <StatusBadge status={row.original.status} />
        ),
    },
    {
      accessorKey: 'callsMonth',
      header: '本月调用量',
      meta: { sortKey: 'callsMonth' },
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <span className="w-12 text-[12px] text-ink">{formatCompact(row.original.callsMonth)}</span>
          <span className="hidden h-1 w-16 overflow-hidden rounded-full bg-hover lg:block">
            <span
              className="block h-full rounded-full bg-brand-500"
              style={{ width: `${Math.round((row.original.callsMonth / Math.max(callsMonth, 1)) * 100)}%` }}
            />
          </span>
        </div>
      ),
    },
    {
      accessorKey: 'lastUsedAt',
      header: '最后使用',
      cell: ({ row }) => (
        <span className="text-[12px] text-soft">
          {row.original.lastUsedAt.includes('前') || row.original.lastUsedAt === '—'
            ? row.original.lastUsedAt
            : formatRelative(row.original.lastUsedAt)}
        </span>
      ),
    },
    {
      id: 'actions',
      header: '操作',
      cell: ({ row }) => (
        <div className="flex items-center gap-1.5">
          <Button variant="ghost" size="sm" onClick={() => toast.info('用量详情（规划中）')}>
            <BarChart3 className="h-3 w-3" /> 用量
          </Button>
          {row.original.status === 'active' ? (
            <Can permission="key:manage">
              <Button variant="ghost" size="sm" onClick={() => toast.success('已轮换（演示）')}>
                <RefreshCw className="h-3 w-3" /> 轮换
              </Button>
              <Button variant="ghost" size="sm" className="text-rose-600" onClick={() => setRevokeTarget(row.original)}>
                <ShieldOff className="h-3 w-3" /> 撤销
              </Button>
            </Can>
          ) : (
            <span className="text-[11.5px] text-soft">不可用</span>
          )}
        </div>
      ),
    },
  ]

  return (
    <div>
      <PageHeader
        title="API Key 管理"
        description="为应用与数据管道签发访问凭证，控制调用范围与生命周期。"
        actions={
          <>
            <Button variant="outline" size="sm" onClick={() => toast.info('轮换策略设置（规划中）')}>
              轮换策略
            </Button>
            <Can permission="key:manage">
              <Button size="sm" onClick={() => { setName(''); setSecret(null); setCreateOpen(true) }}>
                <Plus className="h-3.5 w-3.5" /> 创建 API Key
              </Button>
            </Can>
          </>
        }
      />

      {/* 安全提示条（原型同款） */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-200 bg-amber-50 px-5 py-3.5 dark:border-amber-500/25 dark:bg-amber-500/10">
        <div className="flex items-start gap-2.5">
          <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
          <div>
            <div className="text-[12.5px] font-medium text-amber-800 dark:text-amber-300">密钥安全提示</div>
            <div className="mt-0.5 text-[11.5px] text-amber-700/90 dark:text-amber-300/80">
              完整密钥仅在创建时展示一次，请立即保存在安全的密钥管理系统中，切勿提交到代码仓库或分享给未授权成员。
            </div>
          </div>
        </div>
        <Button variant="ghost" size="sm" className="text-amber-700 dark:text-amber-300" onClick={() => toast.info('跳转审计日志（演示）')}>
          查看审计记录
        </Button>
      </div>

      {/* 概览统计（原型 4 卡） */}
      <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile
          icon={<KeyRound className="h-4 w-4" />}
          label="活跃密钥"
          value={`${activeCount}/${all.length}`}
          compare="含已撤销"
        />
        <StatTile
          icon={<BarChart3 className="h-4 w-4" />}
          tone="green"
          label="本月调用量"
          value={formatCompact(callsMonth)}
          badge={<StatBadge delta="+18.2%" tone="up" />}
        />
        <StatTile
          icon={<Flame className="h-4 w-4" />}
          tone="amber"
          label="即将过期"
          value={expiring.length}
          compare="30 天内"
        />
        <StatTile
          icon={<RefreshCw className="h-4 w-4" />}
          label="最近创建"
          value={<span className="text-[15px] leading-tight">{latest?.name ?? '—'}</span>}
          compare={latest ? formatRelative(latest.createdAt) : undefined}
        />
      </div>

      {/* 工具栏 */}
      <Card className="mb-4 flex flex-wrap items-center justify-between gap-3 px-4 py-3">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-soft" />
            <input
              id="key-keyword"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="搜索密钥名称或 Key ID…"
              className="h-9 w-[260px] rounded-lg border border-line bg-surface pl-8 pr-3 text-[12px] text-ink outline-none placeholder:text-soft focus:border-brand-500"
            />
          </div>
          <div className="w-[130px]">
            <AppSelect value={statusFilter} onValueChange={setStatusFilter} options={STATUS_OPTIONS} className="h-9" />
          </div>
        </div>
        <span className="inline-flex items-center gap-1.5 text-[11px] text-soft">
          <Lock className="h-3 w-3" />
          密钥使用 AES-256 加密存储
        </span>
      </Card>

      <Card className="overflow-hidden">
        <DataTable bare columns={columns} data={data} loading={keys.isPending} emptyText="暂无密钥" />
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-line px-5 py-3">
          <span className="text-[11.5px] text-soft">
            共 {all.length} 个密钥 · 密钥操作均写入审计日志
          </span>
          <Button variant="ghost" size="sm" onClick={() => toast.info('查看密钥审计（演示）')}>
            查看密钥审计 →
          </Button>
        </div>
      </Card>

      {/* 创建密钥 */}
      <AppDialog
        open={createOpen}
        onOpenChange={(v) => {
          setCreateOpen(v)
          if (!v) setSecret(null)
        }}
        title={secret ? '密钥已生成' : '创建 API Key'}
        description={secret ? '明文仅此一次可见，请立即复制保存' : '为应用或流水线创建独立密钥'}
      >
        {secret ? (
          <div className="space-y-4 pt-2">
            <div className="rounded-lg border border-brand-200 bg-brand-50 p-3.5 font-mono text-[12px] break-all text-brand-700 dark:border-brand-500/20 dark:bg-brand-500/10 dark:text-brand-300">
              {secret}
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => { void navigator.clipboard?.writeText(secret); toast.success('已复制') }}>
                <Copy className="h-3.5 w-3.5" /> 复制
              </Button>
              <Button size="sm" onClick={() => { setCreateOpen(false); setSecret(null) }}>
                完成并关闭
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4 pt-2">
            <div>
              <Label>密钥名称</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="例如：生产数据管道" />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => setCreateOpen(false)}>取消</Button>
              <Button
                size="sm"
                disabled={!name.trim() || create.isPending}
                onClick={() =>
                  create.mutate({ name }, {
                    onSuccess: (res) => setSecret(res.secret),
                  })
                }
              >
                生成密钥
              </Button>
            </div>
          </div>
        )}
      </AppDialog>

      {/* 撤销确认 */}
      <ConfirmDialog
        open={!!revokeTarget}
        onOpenChange={(v) => !v && setRevokeTarget(null)}
        title="确认撤销此 API Key？"
        description={`「${revokeTarget?.name ?? ''}」撤销后使用该密钥的调用将立即失败（401），且不可恢复。`}
        confirmText="确认撤销"
        onConfirm={() => {
          if (revokeTarget) revoke.mutate(revokeTarget.id, { onSuccess: () => toast.success('密钥已撤销') })
        }}
      />
    </div>
  )
}
