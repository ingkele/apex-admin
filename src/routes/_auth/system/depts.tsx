import * as React from 'react'
import { createFileRoute } from '@tanstack/react-router'
import {
  Building2, ChevronRight, Network, Pencil, Plus, Search, UserRound, Users,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input, Label } from '@/components/ui/input'
import { AppSelect } from '@/components/ui/select'
import { AppDialog } from '@/components/ui/dialog'
import { PageHeader } from '@/components/shared/page-header'
import { MiniStat } from '@/components/shared/stat-tile'
import { Can } from '@/components/shared/can'
import { useCreateDept, useDepts } from '@/api'
import type { DeptNode } from '@/mocks/db'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

export const Route = createFileRoute('/_auth/system/depts')({
  component: DeptsPage,
})

interface Row {
  node: DeptNode
  depth: number
  hasChildren: boolean
}

function buildRows(nodes: DeptNode[], expanded: Set<string>, keyword: string, status: string): Row[] {
  const kw = keyword.trim().toLowerCase()
  const match = (n: DeptNode) =>
    (!kw || n.name.toLowerCase().includes(kw) || n.owner.toLowerCase().includes(kw)) &&
    (status === 'all' || n.status === status)

  const walk = (parentId: string | null, depth: number): Row[] =>
    nodes
      .filter((n) => n.parentId === parentId)
      .sort((a, b) => a.sort - b.sort)
      .flatMap((node) => {
        const kids = walk(node.id, depth + 1)
        const self: Row[] = match(node) ? [{ node, depth, hasChildren: kids.length > 0 }] : []
        const childRows = kw || expanded.has(node.id) ? kids : []
        return [...self, ...childRows]
      })
  return walk(null, 0)
}

/** 头像取名字末两字（与用户管理页一致） */
function initials(name: string) {
  return name.slice(-2)
}

function DeptsPage() {
  const depts = useDepts()
  const create = useCreateDept()
  const [keyword, setKeyword] = React.useState('')
  const [status, setStatus] = React.useState('all')
  const [expanded, setExpanded] = React.useState<Set<string>>(new Set(['d_root', 'd_platform', 'd_ai']))
  const [open, setOpen] = React.useState(false)
  const [form, setForm] = React.useState({ name: '', parentId: 'd_root', owner: '', members: '0', sort: '99', desc: '' })

  const items = depts.data?.items ?? []
  const stats = depts.data?.stats
  const rows = buildRows(items, expanded, keyword, status)
  const byId = React.useMemo(() => new Map(items.map((d) => [d.id, d])), [items])

  const toggleNode = (id: string) =>
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })

  const submit = () => {
    if (!form.name.trim()) {
      toast.error('请填写部门名称')
      return
    }
    create.mutate(
      {
        name: form.name.trim(),
        parentId: form.parentId || null,
        owner: form.owner.trim() || undefined,
        members: Number(form.members) || 0,
        sort: Number(form.sort) || 99,
        desc: form.desc.trim() || undefined,
      },
      {
        onSuccess: () => {
          toast.success('部门已创建')
          setOpen(false)
          setForm({ name: '', parentId: 'd_root', owner: '', members: '0', sort: '99', desc: '' })
        },
        onError: (e) => toast.error(e.message),
      },
    )
  }

  return (
    <div>
      <PageHeader
        title="部门管理"
        description="维护组织架构层级、部门负责人与成员归属，部门信息用于任务成本分摊与权限范围。"
        actions={
          <Can permission="dept:manage">
            <Button size="sm" onClick={() => setOpen(true)}>
              <Plus className="h-3.5 w-3.5" /> 新增部门
            </Button>
          </Can>
        }
      />

      <div className="mb-5 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <MiniStat boxed size="lg" icon={<Network className="h-4 w-4" />} tone="brand" label="部门总数" value={String(stats?.total ?? items.length)} unit="个" />
        <MiniStat boxed size="lg" icon={<Users className="h-4 w-4" />} tone="green" label="在册成员" value={String(stats?.members ?? 48)} unit="人" />
        <MiniStat boxed size="lg" icon={<Building2 className="h-4 w-4" />} tone="brand" label="启用中" value={String(stats?.active ?? 9)} unit="个" />
        <MiniStat boxed size="lg" icon={<Building2 className="h-4 w-4" />} tone="slate" label="已停用" value={String(stats?.disabled ?? 1)} unit="个" />
      </div>

      <div className="overflow-hidden rounded-xl border border-line bg-surface">
        <div className="flex flex-wrap items-center gap-2 border-b border-line px-5 py-3.5">
          <div className="relative w-[240px]">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-soft" />
            <Input
              placeholder="搜索部门名称 / 负责人"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className="h-8 pl-8 text-[12px]"
            />
          </div>
          <AppSelect
            value={status}
            onValueChange={setStatus}
            className="h-8 w-[130px] text-[12px]"
            options={[
              { value: 'all', label: '全部状态' },
              { value: 'active', label: '启用中' },
              { value: 'disabled', label: '已停用' },
            ]}
          />
          <span className="ml-auto text-[11px] text-soft">组织架构变更次日 00:00 生效于账单口径</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-line bg-canvas/60">
                {['部门名称', '负责人', '成员数', '上级部门', '状态', '排序', '操作'].map((h) => (
                  <th key={h} className="px-4 py-3 text-[11.5px] font-medium text-muted whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-[13px] text-soft">没有匹配的部门</td>
                </tr>
              ) : (
                rows.map(({ node, depth, hasChildren }) => {
                  const parent = node.parentId ? byId.get(node.parentId) : undefined
                  return (
                    <tr key={node.id} className="border-b border-line last:border-0 transition-colors hover:bg-hover/60">
                      <td className="td-py px-4 text-[13px] text-ink">
                        <div className="flex items-center gap-1.5" style={{ paddingLeft: depth * 18 }}>
                          {hasChildren ? (
                            <button
                              type="button"
                              onClick={() => toggleNode(node.id)}
                              className="rounded p-0.5 text-soft transition hover:bg-hover hover:text-ink"
                            >
                              <ChevronRight className={cn('h-3.5 w-3.5 transition-transform', expanded.has(node.id) && 'rotate-90')} />
                            </button>
                          ) : (
                            <span className="w-[18px]" />
                          )}
                          <Building2 className="h-3.5 w-3.5 shrink-0 text-soft" />
                          <div className="min-w-0">
                            <div className="font-medium">{node.name}</div>
                            {node.desc ? <div className="text-[10.5px] text-soft">{node.desc}</div> : null}
                          </div>
                        </div>
                      </td>
                      <td className="td-py px-4">
                        <div className="flex items-center gap-2">
                          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-brand-700 text-[10px] font-medium text-white">
                            {initials(node.owner)}
                          </span>
                          <span className="text-[12.5px] text-ink">{node.owner}</span>
                        </div>
                      </td>
                      <td className="td-py px-4">
                        <span className="inline-flex items-center gap-1.5 rounded-md bg-canvas px-2 py-1 text-[11.5px] tabular-nums text-ink">
                          <UserRound className="h-3 w-3 text-soft" /> {node.members}
                        </span>
                      </td>
                      <td className="td-py px-4 text-[12px] text-muted">{parent?.name ?? '—'}</td>
                      <td className="td-py px-4">
                        <span
                          className={cn(
                            'inline-flex items-center gap-1.5 text-[11.5px]',
                            node.status === 'active' ? 'text-emerald-600' : 'text-soft',
                          )}
                        >
                          <span className={cn('h-1.5 w-1.5 rounded-full', node.status === 'active' ? 'bg-emerald-500' : 'bg-slate-400')} />
                          {node.status === 'active' ? '启用中' : '已停用'}
                        </span>
                      </td>
                      <td className="td-py px-4 text-[12px] tabular-nums text-muted">{node.sort}</td>
                      <td className="td-py px-4">
                        <div className="flex items-center gap-3 text-[11.5px]">
                          <button
                            type="button"
                            onClick={() => {
                              setForm({ name: '', parentId: node.id, owner: '', members: '0', sort: '99', desc: '' })
                              setOpen(true)
                            }}
                            className="text-brand-600 hover:text-brand-700"
                          >
                            新增下级
                          </button>
                          <button type="button" className="inline-flex items-center gap-1 text-muted hover:text-ink">
                            <Pencil className="h-3 w-3" /> 编辑
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="border-t border-line px-5 py-3 text-[11px] text-soft">
          共 {rows.length} 行 · 部门成员数取自用户管理中的归属统计，停用部门不会移除成员
        </div>
      </div>

      <AppDialog open={open} onOpenChange={setOpen} title="新增部门" description="上级部门决定层级，排序值越小越靠前。" width="w-[520px]">
        <div className="grid grid-cols-2 gap-x-4 gap-y-4">
          <div>
            <Label>部门名称 <span className="text-rose-500">*</span></Label>
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="例如：成本分析组" />
          </div>
          <div>
            <Label>上级部门</Label>
            <AppSelect
              value={form.parentId}
              onValueChange={(v) => setForm({ ...form, parentId: v })}
              options={[{ value: '', label: '顶级（无上级）' }, ...items.map((d) => ({ value: d.id, label: d.name }))]}
            />
          </div>
          <div>
            <Label>负责人</Label>
            <Input value={form.owner} onChange={(e) => setForm({ ...form, owner: e.target.value })} placeholder="姓名" />
          </div>
          <div>
            <Label>排序</Label>
            <Input type="number" value={form.sort} onChange={(e) => setForm({ ...form, sort: e.target.value })} />
          </div>
          <div className="col-span-2">
            <Label>部门说明</Label>
            <Input value={form.desc} onChange={(e) => setForm({ ...form, desc: e.target.value })} placeholder="可选，简要说明职责范围" />
          </div>
        </div>
        <div className="mt-5 flex items-center justify-end gap-2">
          <Button variant="outline" size="sm" onClick={() => setOpen(false)}>取消</Button>
          <Button size="sm" disabled={create.isPending} onClick={submit}>确认新增</Button>
        </div>
      </AppDialog>
    </div>
  )
}
