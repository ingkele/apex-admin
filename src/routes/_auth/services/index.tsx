import * as React from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import type { ColumnDef } from '@tanstack/react-table'
import {
  Activity, Blocks, Boxes, CircleCheck, Cpu, Database, Network, PackageSearch,
  ReceiptText, RefreshCw, RotateCcw, Route as RouteIcon, Search, TriangleAlert, Workflow,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { AppSelect } from '@/components/ui/select'
import { AppSwitch } from '@/components/ui/switch'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { StatusBadge } from '@/components/ui/badge'
import { DataTable } from '@/components/shared/data-table'
import { PageHeader } from '@/components/shared/page-header'
import { MiniStat } from '@/components/shared/stat-tile'
import { Can } from '@/components/shared/can'
import { useRestartService, useServices } from '@/api'
import type { ServiceItem } from '@/mocks/db'
import { toast } from 'sonner'

export const Route = createFileRoute('/_auth/services/')({
  component: ServiceListPage,
})

/** 服务图标 + 配色（原型每种服务固定色） */
const SERVICE_ICON: Record<string, { icon: LucideIcon; cls: string }> = {
  route: { icon: RouteIcon, cls: 'bg-blue-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400' },
  cpu: { icon: Cpu, cls: 'bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-400' },
  workflow: { icon: Workflow, cls: 'bg-cyan-50 text-cyan-600 dark:bg-cyan-500/10 dark:text-cyan-400' },
  blocks: { icon: Blocks, cls: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400' },
  database: { icon: Database, cls: 'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400' },
  'receipt-text': { icon: ReceiptText, cls: 'bg-pink-50 text-pink-600 dark:bg-pink-500/10 dark:text-pink-400' },
  activity: { icon: Activity, cls: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400' },
  'package-search': { icon: PackageSearch, cls: 'bg-slate-100 text-slate-600 dark:bg-slate-500/10 dark:text-slate-300' },
}

function ServiceListPage() {
  const navigate = useNavigate()
  const services = useServices()
  const restart = useRestartService()
  const [autoRefresh, setAutoRefresh] = React.useState(true)
  const [keyword, setKeyword] = React.useState('')
  const [ns, setNs] = React.useState('all')
  const [restartTarget, setRestartTarget] = React.useState<ServiceItem | null>(null)
  const [lastSync, setLastSync] = React.useState(() => new Date().toLocaleTimeString('zh-CN', { hour12: false }))

  React.useEffect(() => {
    if (!autoRefresh) return
    const timer = setInterval(() => {
      void services.refetch()
      setLastSync(new Date().toLocaleTimeString('zh-CN', { hour12: false }))
    }, 30_000)
    return () => clearInterval(timer)
  }, [autoRefresh, services])

  const all = services.data ?? []
  const data = all.filter((s) => {
    const kw = keyword.trim().toLowerCase()
    const okKw = !kw || s.name.toLowerCase().includes(kw) || s.version.toLowerCase().includes(kw)
    return okKw && (ns === 'all' || s.ns === ns)
  })
  const healthy = all.filter((s) => s.health === 'healthy').length
  const abnormal = all.length - healthy

  const columns: ColumnDef<ServiceItem, unknown>[] = [
    {
      accessorKey: 'name',
      header: '服务名称',
      cell: ({ row }) => {
        const meta = SERVICE_ICON[row.original.icon] ?? SERVICE_ICON.activity
        const Icon = meta.icon
        return (
          <div className="flex items-center gap-2.5">
            <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${meta.cls}`}>
              <Icon className="h-3.5 w-3.5" />
            </span>
            <div>
              <div className="font-mono text-[12px] font-medium text-ink">{row.original.name}</div>
              <div className="text-[10.5px] text-soft">{row.original.desc}</div>
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: 'version',
      header: '版本',
      cell: ({ row }) => (
        <span className="rounded border border-line bg-canvas px-1.5 py-0.5 font-mono text-[10.5px] text-muted">
          {row.original.version}
        </span>
      ),
    },
    {
      accessorKey: 'instances',
      header: '实例数',
      cell: ({ row }) => (
        <span className="font-mono text-[12px] text-ink">
          {row.original.instances[0]}
          <span className="text-[10.5px] text-soft"> / {row.original.instances[1]}</span>
        </span>
      ),
    },
    {
      accessorKey: 'health',
      header: '健康状态',
      cell: ({ row }) => <StatusBadge status={row.original.health} />,
    },
    {
      accessorKey: 'cpu',
      header: 'CPU 占用',
      cell: ({ row }) => <Meter value={row.original.cpu} tone={row.original.cpu > 75 ? 'amber' : 'green'} />,
    },
    {
      accessorKey: 'memory',
      header: '内存占用',
      cell: ({ row }) => <Meter value={row.original.memory} tone={row.original.memory > 75 ? 'amber' : 'brand'} />,
    },
    {
      accessorKey: 'uptime',
      header: '运行时长',
      cell: ({ row }) => <span className="font-mono text-[11px] text-muted">{row.original.uptime}</span>,
    },
    {
      id: 'actions',
      header: '操作',
      cell: ({ row }) => (
        <div className="flex items-center justify-end gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => void navigate({ to: '/services/logs', search: { service: row.original.name } })}
          >
            查看日志
          </Button>
          <Can permission="service:restart">
            <Button
              variant="ghost"
              size="sm"
              className="text-rose-600 dark:text-rose-400"
              onClick={() => setRestartTarget(row.original)}
            >
              <RotateCcw className="h-3 w-3" /> 重启
            </Button>
          </Can>
        </div>
      ),
    },
  ]

  return (
    <div>
      <PageHeader
        title="服务列表"
        description="监控平台核心服务的运行状态、资源占用与版本信息。"
        actions={
          <>
            <Button variant="outline" size="sm" onClick={() => toast.info('服务拓扑视图即将上线')}>
              <Network className="h-3.5 w-3.5" /> 服务拓扑
            </Button>
            <Button
              size="sm"
              onClick={() => {
                void services.refetch()
                setLastSync(new Date().toLocaleTimeString('zh-CN', { hour12: false }))
              }}
            >
              <RefreshCw className="h-3.5 w-3.5" /> 刷新状态
            </Button>
          </>
        }
      />

      {/* 4 张概览卡 */}
      <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MiniStat
          label="服务总数"
          tone="slate"
          boxed
          icon={<Boxes className="h-3.5 w-3.5" />}
          value={all.length || '—'}
          unit="6 个命名空间"
          size="lg"
        />
        <MiniStat
          label="健康服务"
          tone="green"
          boxed
          icon={<CircleCheck className="h-3.5 w-3.5" />}
          value={healthy || '—'}
          unit="全部实例就绪"
          dot
          size="lg"
        />
        <MiniStat
          label="告警 / 维护"
          tone="amber"
          boxed
          icon={<TriangleAlert className="h-3.5 w-3.5" />}
          value={abnormal}
          unit="需关注"
          size="lg"
        />
        <MiniStat
          label="平均可用性"
          tone="brand"
          boxed
          icon={<Activity className="h-3.5 w-3.5" />}
          value={
            <>
              99.98<span className="text-[13px]">%</span>
            </>
          }
          unit="近 30 天"
          size="lg"
        />
      </div>

      <Card className="overflow-hidden">
        <div className="flex flex-wrap items-center gap-3 border-b border-line px-5 py-3.5">
          <div className="flex h-8 w-[250px] items-center gap-2 rounded-lg border border-line bg-canvas/60 px-2.5 focus-within:border-brand-300 focus-within:bg-surface">
            <Search className="h-3.5 w-3.5 shrink-0 text-soft" />
            <input
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="搜索服务名称或版本…"
              className="h-full min-w-0 flex-1 bg-transparent text-[12px] text-ink outline-none placeholder:text-soft"
            />
          </div>
          <AppSelect
            value={ns}
            onValueChange={setNs}
            className="h-8 w-[160px] text-[12px]"
            options={[
              { value: 'all', label: '全部命名空间' },
              { value: 'prod', label: 'prod' },
              { value: 'observability', label: 'observability' },
            ]}
          />
          <div className="ml-auto flex items-center gap-3">
            <span className="flex items-center gap-1.5 text-[11px] text-muted">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inset-0 animate-ping rounded-full bg-emerald-500 opacity-50" />
                <span className="relative h-1.5 w-1.5 rounded-full bg-emerald-500" />
              </span>
              实时状态 · 30s
            </span>
            <span className="h-4 w-px bg-line" />
            <span className="flex items-center gap-2 text-[11.5px] text-muted">
              自动刷新
              <AppSwitch checked={autoRefresh} onCheckedChange={setAutoRefresh} />
            </span>
            <span className="font-mono text-[10.5px] text-soft">最后同步 {lastSync}</span>
          </div>
        </div>

        <DataTable bare columns={columns} data={data} loading={services.isPending} emptyText="没有匹配的服务" />
      </Card>

      <ConfirmDialog
        open={!!restartTarget}
        onOpenChange={(v) => !v && setRestartTarget(null)}
        title="高风险操作 · 重启服务"
        description={`将对「${restartTarget?.name ?? ''}」执行滚动重启（${restartTarget?.instances[1] ?? 0} 个实例），期间该服务可能出现秒级抖动。`}
        confirmText="确认重启"
        onConfirm={() => {
          if (restartTarget) restart.mutate(restartTarget.id, { onSuccess: () => toast.success('滚动重启已下发') })
        }}
      />
    </div>
  )
}

const METER_TONE = {
  green: 'bg-emerald-500',
  amber: 'bg-amber-500',
  brand: 'bg-brand-500',
} as const

function Meter({ value, tone = 'brand' }: { value: number; tone?: keyof typeof METER_TONE }) {
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-16 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
        <div className={`h-full rounded-full ${METER_TONE[tone]}`} style={{ width: `${value}%` }} />
      </div>
      <span className="font-mono text-[10.5px] text-muted">{value}%</span>
    </div>
  )
}
