import * as React from 'react'
import { createFileRoute } from '@tanstack/react-router'
import type { ColumnDef } from '@tanstack/react-table'
import { Check, CheckCircle2, Plus, RefreshCw, RotateCcw, Save, Search, Star, Wifi, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input, Label } from '@/components/ui/input'
import { AppDialog } from '@/components/ui/dialog'
import { AppSwitch } from '@/components/ui/switch'
import { AppSelect } from '@/components/ui/select'
import { Card } from '@/components/ui/card'
import { DataTable } from '@/components/shared/data-table'
import { PageHeader } from '@/components/shared/page-header'
import { StatBadge, StatTile } from '@/components/shared/stat-tile'
import { Can } from '@/components/shared/can'
import { useModelActions, useModels } from '@/api'
import type { ModelItem } from '@/mocks/db'
import { formatCompact, formatNumber } from '@/lib/format'
import { toast } from 'sonner'

export const Route = createFileRoute('/_auth/models/')({
  component: ModelsPage,
})

const PROVIDER_ICON: Record<string, string> = {
  OpenAI: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400',
  Anthropic: 'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400',
  '阿里云百炼': 'bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-400',
  DeepSeek: 'bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400',
  'Google Cloud': 'bg-sky-50 text-sky-600 dark:bg-sky-500/10 dark:text-sky-400',
  '内部部署': 'bg-slate-100 text-slate-700 dark:bg-slate-500/10 dark:text-slate-300',
  'Black Forest': 'bg-slate-100 text-slate-700 dark:bg-slate-500/10 dark:text-slate-300',
}

function providerShort(provider: string) {
  const map: Record<string, string> = {
    OpenAI: 'OA', Anthropic: 'AN', '阿里云百炼': 'QW', DeepSeek: 'DS',
    'Google Cloud': 'GM', '内部部署': 'AX', 'Black Forest': 'FL',
  }
  return map[provider] ?? provider.slice(0, 2).toUpperCase()
}

function ModelsPage() {
  const models = useModels()
  const { setDefault, test, saveParams, sync, toggle } = useModelActions()
  const [keyword, setKeyword] = React.useState('')
  const [provider, setProvider] = React.useState('all')
  const [paramsTarget, setParamsTarget] = React.useState<ModelItem | null>(null)
  const [params, setParams] = React.useState({ temperature: 0.7, maxTokens: 4096, topP: 1 })
  const [addOpen, setAddOpen] = React.useState(false)
  const [addForm, setAddForm] = React.useState({ name: '', modelId: '', provider: 'OpenAI' })

  const all = models.data ?? []
  const data = all.filter((m) => {
    const kw = keyword.trim().toLowerCase()
    const okKw = !kw || m.name.toLowerCase().includes(kw) || m.modelId.toLowerCase().includes(kw) || m.provider.toLowerCase().includes(kw)
    return okKw && (provider === 'all' || m.provider === provider)
  })
  const enabled = all.filter((m) => m.status === 'enabled').length
  const callsToday = all.reduce((sum, m) => sum + m.callsToday, 0)
  const defaultModel = all.find((m) => m.isDefault)
  const providers = Array.from(new Set(all.map((m) => m.provider)))

  const columns: ColumnDef<ModelItem, unknown>[] = [
    {
      accessorKey: 'name',
      header: '模型',
      cell: ({ row }) => (
        <div className="flex items-center gap-2.5">
          <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-[10px] font-bold ${PROVIDER_ICON[row.original.provider] ?? 'bg-slate-100 text-slate-600'}`}>
            {providerShort(row.original.provider)}
          </span>
          <div>
            <div className="font-medium text-ink">{row.original.name}</div>
            <div className="font-mono text-[10.5px] text-soft">{row.original.modelId}</div>
          </div>
        </div>
      ),
    },
    { accessorKey: 'provider', header: '提供方', cell: ({ row }) => <span className="text-muted">{row.original.provider}</span> },
    {
      accessorKey: 'status',
      header: '状态',
      cell: ({ row }) => (
        <span className="inline-flex items-center gap-2">
          <AppSwitch
            checked={row.original.status === 'enabled'}
            onCheckedChange={(v) =>
              toggle.mutate(
                { id: row.original.id, enabled: v },
                { onSuccess: () => toast.success(v ? '模型已启用' : '模型已停用') },
              )
            }
          />
          <span className={row.original.status === 'enabled' ? 'text-[11.5px] text-emerald-600 dark:text-emerald-400' : 'text-[11.5px] text-soft'}>
            {row.original.status === 'enabled' ? '启用' : '停用'}
          </span>
        </span>
      ),
    },
    {
      id: 'default',
      header: '默认',
      cell: ({ row }) =>
        row.original.isDefault ? (
          <span className="inline-flex items-center gap-1 text-[11.5px] font-medium text-amber-600 dark:text-amber-400">
            <Star className="h-3 w-3 fill-current" /> 默认
          </span>
        ) : (
          <button
            type="button"
            onClick={() => setDefault.mutate(row.original.id, { onSuccess: () => toast.success('已设为默认模型') })}
            className="text-[11.5px] text-soft transition hover:text-brand-600"
          >
            设为默认
          </button>
        ),
    },
    {
      accessorKey: 'contextWindow',
      header: '上下文窗口',
      cell: ({ row }) => (
        <span className="text-[12px] text-muted">
          {row.original.contextWindow ? formatNumber(row.original.contextWindow) : '—'}
        </span>
      ),
    },
    {
      accessorKey: 'callsToday',
      header: '今日调用',
      meta: { sortKey: 'callsToday' },
      cell: ({ row }) => <span className="text-[12px] text-ink">{formatCompact(row.original.callsToday)}</span>,
    },
    { accessorKey: 'updatedAt', header: '最后更新', cell: ({ row }) => <span className="text-[12px] text-soft">{row.original.updatedAt}</span> },
    {
      id: 'actions',
      header: '操作',
      cell: ({ row }) => (
        <div className="flex items-center gap-1.5">
          <Can permission="model:manage">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setParamsTarget(row.original)
                setParams(row.original.params)
              }}
            >
              参数
            </Button>
          </Can>
          <Button
            variant="ghost"
            size="sm"
            onClick={() =>
              test.mutate(row.original.id, {
                onSuccess: (r) => toast.success(`连接正常（${r.latencyMs}ms）`),
                onError: () => toast.error('连接失败'),
              })
            }
          >
            <Wifi className="h-3 w-3" /> 测试连接
          </Button>
        </div>
      ),
    },
  ]

  return (
    <div>
      <PageHeader
        title="模型配置"
        description="管理平台模型提供方、启用状态与全局推理参数。"
        actions={
          <>
            <Button variant="outline" size="sm" onClick={() => sync.mutate(undefined, { onSuccess: () => toast.success('模型列表已同步') })}>
              <RefreshCw className="h-3.5 w-3.5" /> 同步模型列表
            </Button>
            <Can permission="model:manage">
              <Button size="sm" onClick={() => setAddOpen(true)}>
                <Plus className="h-3.5 w-3.5" /> 接入模型
              </Button>
            </Can>
          </>
        }
      />

      {/* 概览统计（原型 4 卡） */}
      <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile icon={<Wifi className="h-4 w-4" />} label="已接入模型" value={all.length || '—'} />
        <StatTile
          icon={<CheckCircle2 className="h-4 w-4" />}
          tone="green"
          label="启用中"
          value={`${enabled}/${all.length}`}
        />
        <StatTile
          icon={<Zap className="h-4 w-4" />}
          label="今日模型调用"
          value={formatCompact(callsToday)}
          badge={<StatBadge delta="+8.4%" tone="up" />}
        />
        <StatTile
          icon={<Star className="h-4 w-4" />}
          tone="amber"
          label="全局默认模型"
          value={<span className="text-[17px] leading-tight">{defaultModel?.name ?? '未设置'}</span>}
          compare={defaultModel ? '推荐' : undefined}
        />
      </div>

      {/* 工具栏 */}
      <Card className="mb-4 flex flex-wrap items-center justify-between gap-3 px-4 py-3">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-soft" />
            <input
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="搜索模型名称或提供方…"
              className="h-9 w-[240px] rounded-lg border border-line bg-surface pl-8 pr-3 text-[12px] text-ink outline-none placeholder:text-soft focus:border-brand-500"
            />
          </div>
          <div className="w-[150px]">
            <AppSelect
              value={provider}
              onValueChange={setProvider}
              className="h-9"
              options={[{ value: 'all', label: '全部提供方' }, ...providers.map((p) => ({ value: p, label: p }))]}
            />
          </div>
          <span className="hidden text-[11px] text-soft lg:inline">参数修改将作用于所有新创建的任务</span>
        </div>
        <span className="inline-flex items-center gap-1.5 text-[11px] text-emerald-600 dark:text-emerald-400">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          连接测试正常
        </span>
      </Card>

      <Card className="overflow-hidden">
        <DataTable bare columns={columns} data={data} loading={models.isPending} emptyText="尚未接入模型" />
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-line px-5 py-3">
          <span className="text-[11.5px] text-soft">共 {all.length} 个模型 · 密钥托管于 HashiCorp Vault</span>
          <span className="inline-flex items-center gap-1 text-[11px] text-soft">
            <Check className="h-3 w-3 text-emerald-500" /> 凭证均已加密
          </span>
        </div>
      </Card>

      {/* 模型参数 */}
      <AppDialog
        open={!!paramsTarget}
        onOpenChange={(v) => !v && setParamsTarget(null)}
        title="模型参数"
        description={`${paramsTarget?.name ?? ''} · ${paramsTarget?.modelId ?? ''}`}
      >
        <div className="space-y-4 pt-2">
          <div>
            <Label>temperature（0 ~ 2）</Label>
            <Input
              type="number"
              step="0.1"
              value={params.temperature}
              onChange={(e) => setParams((p) => ({ ...p, temperature: Number(e.target.value) }))}
            />
          </div>
          <div>
            <Label>maxTokens</Label>
            <Input
              type="number"
              value={params.maxTokens}
              onChange={(e) => setParams((p) => ({ ...p, maxTokens: Number(e.target.value) }))}
            />
          </div>
          <div>
            <Label>topP（0 ~ 1）</Label>
            <Input
              type="number"
              step="0.05"
              value={params.topP}
              onChange={(e) => setParams((p) => ({ ...p, topP: Number(e.target.value) }))}
            />
          </div>
          <div className="flex justify-between pt-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setParams({ temperature: 0.7, maxTokens: 4096, topP: 1 })}
            >
              <RotateCcw className="h-3.5 w-3.5" /> 恢复默认
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setParamsTarget(null)}>取消</Button>
              <Button
                size="sm"
                onClick={() => {
                  if (paramsTarget) {
                    saveParams.mutate({ id: paramsTarget.id, params }, {
                      onSuccess: () => {
                        setParamsTarget(null)
                        toast.success('参数已保存')
                      },
                    })
                  }
                }}
              >
                <Save className="h-3.5 w-3.5" /> 保存参数
              </Button>
            </div>
          </div>
        </div>
      </AppDialog>

      {/* 接入模型 */}
      <AppDialog open={addOpen} onOpenChange={setAddOpen} title="接入模型" description="填写提供方与模型 ID，测试连接后添加">
        <div className="space-y-4 pt-2">
          <div>
            <Label>显示名称</Label>
            <Input value={addForm.name} onChange={(e) => setAddForm((f) => ({ ...f, name: e.target.value }))} placeholder="例如：GPT-4o mini" />
          </div>
          <div>
            <Label>模型 ID</Label>
            <Input value={addForm.modelId} onChange={(e) => setAddForm((f) => ({ ...f, modelId: e.target.value }))} placeholder="例如：gpt-4o-mini" />
          </div>
          <div>
            <Label>提供方</Label>
            <Input value={addForm.provider} onChange={(e) => setAddForm((f) => ({ ...f, provider: e.target.value }))} />
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <Button variant="outline" size="sm" onClick={() => setAddOpen(false)}>取消</Button>
            <Button
              size="sm"
              disabled={!addForm.name.trim() || !addForm.modelId.trim()}
              onClick={() => {
                setAddOpen(false)
                setAddForm({ name: '', modelId: '', provider: 'OpenAI' })
                toast.success('模型已接入（演示）')
              }}
            >
              连接并添加
            </Button>
          </div>
        </div>
      </AppDialog>
    </div>
  )
}
