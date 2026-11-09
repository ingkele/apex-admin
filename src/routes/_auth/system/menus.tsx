import * as React from 'react'
import { createFileRoute } from '@tanstack/react-router'
import {
  ChevronRight, Folder, FolderTree, Info, LayoutGrid, ListChecks, MousePointerClick,
  Pencil, Plus, Search, Trash2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input, Label } from '@/components/ui/input'
import { AppSelect } from '@/components/ui/select'
import { AppSwitch } from '@/components/ui/switch'
import { AppDialog } from '@/components/ui/dialog'
import { PageHeader } from '@/components/shared/page-header'
import { MiniStat } from '@/components/shared/stat-tile'
import { Can, useCan } from '@/components/shared/can'
import { useCreateMenu, useDeleteMenu, useSystemMenus, useToggleMenuStatus } from '@/api'
import type { MenuNode, MenuType } from '@/mocks/db'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

export const Route = createFileRoute('/_auth/system/menus')({
  component: MenusPage,
})

const TYPE_META: Record<MenuType, { label: string; className: string; icon: typeof Folder }> = {
  dir: { label: '目录', className: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300', icon: Folder },
  menu: { label: '菜单', className: 'bg-blue-50 text-brand-700 dark:bg-brand-500/15 dark:text-brand-300', icon: LayoutGrid },
  button: { label: '按钮', className: 'bg-violet-50 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300', icon: MousePointerClick },
}

interface Row {
  node: MenuNode
  depth: number
  hasChildren: boolean
}

/** 把扁平菜单按 parentId 组装成带缩进的可见行（受展开状态与筛选影响） */
function buildRows(nodes: MenuNode[], expanded: Set<string>, keyword: string, type: string): Row[] {
  const kw = keyword.trim().toLowerCase()
  const match = (n: MenuNode) =>
    (!kw || n.name.toLowerCase().includes(kw) || (n.perm ?? '').toLowerCase().includes(kw) || (n.path ?? '').includes(kw)) &&
    (type === 'all' || n.type === type)

  const walk = (parentId: string | null, depth: number): Row[] => {
    const children = nodes
      .filter((n) => n.parentId === parentId)
      .sort((a, b) => a.sort - b.sort)
    return children.flatMap((node) => {
      const kids = walk(node.id, depth + 1)
      const self: Row[] = match(node) ? [{ node, depth, hasChildren: kids.length > 0 }] : []
      // 搜索时自动展开所有命中分支；非搜索态按展开状态渲染
      const childRows = kw || expanded.has(node.id) ? kids : []
      return [...self, ...childRows]
    })
  }
  return walk(null, 0)
}

function MenusPage() {
  const menus = useSystemMenus()
  const create = useCreateMenu()
  const toggle = useToggleMenuStatus()
  const remove = useDeleteMenu()
  const canManage = useCan('menu:manage')

  const [keyword, setKeyword] = React.useState('')
  const [type, setType] = React.useState('all')
  const [expanded, setExpanded] = React.useState<Set<string>>(new Set(['m_dash', 'm_task', 'm_svc', 'm_model', 'm_sys']))
  const [open, setOpen] = React.useState(false)
  const [form, setForm] = React.useState({ name: '', type: 'menu', parentId: 'm_sys', perm: '', path: '', component: '', sort: '99', remark: '' })

  const items = menus.data?.items ?? []
  const stats = menus.data?.stats
  const rows = buildRows(items, expanded, keyword, type)

  const toggleNode = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const submit = () => {
    if (!form.name.trim()) {
      toast.error('请填写菜单名称')
      return
    }
    create.mutate(
      {
        name: form.name.trim(),
        type: form.type as MenuType,
        parentId: form.parentId || null,
        perm: form.perm.trim() || undefined,
        path: form.path.trim() || undefined,
        component: form.component.trim() || undefined,
        sort: Number(form.sort) || 99,
        remark: form.remark.trim() || undefined,
      },
      {
        onSuccess: () => {
          toast.success('菜单已创建', { description: '已同步到侧边栏导航' })
          setOpen(false)
          setForm({ name: '', type: 'menu', parentId: 'm_sys', perm: '', path: '', component: '', sort: '99', remark: '' })
        },
        onError: (e) => toast.error(e.message),
      },
    )
  }

  return (
    <div>
      <PageHeader
        title="菜单管理"
        description="维护侧边栏菜单结构、路由地址与按钮级权限标识，变更保存后对全部角色生效。"
        actions={
          <Can permission="menu:manage">
            <Button size="sm" onClick={() => setOpen(true)}>
              <Plus className="h-3.5 w-3.5" /> 新增菜单
            </Button>
          </Can>
        }
      />

      <div className="mb-5 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <MiniStat boxed size="lg" icon={<FolderTree className="h-4 w-4" />} tone="brand" label="菜单总数" value={String(stats?.total ?? items.length)} unit="项" />
        <MiniStat boxed size="lg" icon={<Folder className="h-4 w-4" />} tone="slate" label="目录" value={String(stats?.dirs ?? 5)} unit="个" />
        <MiniStat boxed size="lg" icon={<LayoutGrid className="h-4 w-4" />} tone="green" label="菜单页面" value={String(stats?.menus ?? 12)} unit="个" />
        <MiniStat boxed size="lg" icon={<MousePointerClick className="h-4 w-4" />} tone="brand" label="按钮权限" value={String(stats?.buttons ?? 12)} unit="项" />
      </div>

      {/* 说明条 */}
      <div className="mb-5 flex items-start gap-2 rounded-xl border border-blue-200 bg-blue-50/60 px-4 py-3 dark:border-brand-500/20 dark:bg-brand-500/5">
        <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand-600" />
        <p className="text-[11.5px] leading-5 text-brand-800/80 dark:text-brand-300/80">
          菜单结构决定侧边栏渲染与路由守卫。标记为「隐藏」的菜单不会出现在导航中，但仍可通过 URL 直接访问；
          按钮权限仅参与 <span className="font-mono">{"<Can>"}</span> 显隐判断，不产生路由。
        </p>
      </div>

      <div className="overflow-hidden rounded-xl border border-line bg-surface">
        {/* 工具条 */}
        <div className="flex flex-wrap items-center gap-2 border-b border-line px-5 py-3.5">
          <div className="relative w-[240px]">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-soft" />
            <Input
              placeholder="搜索名称 / 权限标识 / 路由"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className="h-8 pl-8 text-[12px]"
            />
          </div>
          <AppSelect
            value={type}
            onValueChange={setType}
            className="h-8 w-[130px] text-[12px]"
            options={[
              { value: 'all', label: '全部类型' },
              { value: 'dir', label: '目录' },
              { value: 'menu', label: '菜单' },
              { value: 'button', label: '按钮' },
            ]}
          />
          <span className="ml-auto flex items-center gap-3 text-[11px] text-soft">
            <span className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              已启用 {stats ? stats.total - stats.hidden : '—'} 项
            </span>
            <span>隐藏 {stats?.hidden ?? 0} 项</span>
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-line bg-canvas/60">
                {['菜单名称', '类型', '权限标识', '路由地址', '页面组件', '排序', '状态', '操作'].map((h) => (
                  <th key={h} className="px-4 py-3 text-[11.5px] font-medium text-muted whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-[13px] text-soft">没有匹配的菜单</td>
                </tr>
              ) : (
                rows.map(({ node, depth, hasChildren }) => {
                  const meta = TYPE_META[node.type]
                  const Icon = meta.icon
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
                              <ChevronRight
                                className={cn('h-3.5 w-3.5 transition-transform', expanded.has(node.id) && 'rotate-90')}
                              />
                            </button>
                          ) : (
                            <span className="w-[18px]" />
                          )}
                          <Icon className="h-3.5 w-3.5 shrink-0 text-soft" />
                          <span className={cn('font-medium', node.type === 'button' && 'font-normal text-muted')}>{node.name}</span>
                        </div>
                      </td>
                      <td className="td-py px-4">
                        <span className={cn('inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10.5px] font-medium', meta.className)}>
                          {meta.label}
                        </span>
                      </td>
                      <td className="td-py px-4 font-mono text-[11.5px] text-muted">{node.perm ?? '—'}</td>
                      <td className="td-py px-4 font-mono text-[11.5px] text-muted">{node.path ?? '—'}</td>
                      <td className="td-py px-4 font-mono text-[11px] text-soft">{node.component ?? '—'}</td>
                      <td className="td-py px-4 text-[12px] tabular-nums text-muted">{node.sort}</td>
                      <td className="td-py px-4">
                        <div className="flex items-center gap-2">
                          <AppSwitch
                            checked={node.status === 'active'}
                            disabled={!canManage}
                            onCheckedChange={() =>
                              toggle.mutate(node.id, {
                                onSuccess: () => toast.success(node.status === 'active' ? '已隐藏该菜单' : '已启用该菜单'),
                              })
                            }
                          />
                          <span className={cn('text-[11.5px]', node.status === 'active' ? 'text-emerald-600' : 'text-soft')}>
                            {node.status === 'active' ? '启用' : '隐藏'}
                          </span>
                        </div>
                      </td>
                      <td className="td-py px-4">
                        <div className="flex items-center gap-3 text-[11.5px]">
                          <button
                            type="button"
                            onClick={() => {
                              setForm({ name: '', type: 'menu', parentId: node.id, perm: '', path: '', component: '', sort: '99', remark: '' })
                              setOpen(true)
                            }}
                            className="text-brand-600 hover:text-brand-700"
                          >
                            新增下级
                          </button>
                          <button type="button" className="inline-flex items-center gap-1 text-muted hover:text-ink">
                            <Pencil className="h-3 w-3" /> 修改
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              remove.mutate(node.id, {
                                onSuccess: () => toast.success('菜单已删除'),
                                onError: (e) => toast.error(e.message),
                              })
                            }
                            className="inline-flex items-center gap-1 text-rose-600 hover:text-rose-700"
                          >
                            <Trash2 className="h-3 w-3" /> 删除
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

        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-line px-5 py-3 text-[11px] text-soft">
          <span className="flex items-center gap-1.5">
            <ListChecks className="h-3 w-3" />
            共 {rows.length} 行 · 排序值越小越靠前，同级按排序值升序渲染
          </span>
          <span>最后同步：今天 08:34</span>
        </div>
      </div>

      <AppDialog
        open={open}
        onOpenChange={setOpen}
        title="新增菜单"
        description="目录与菜单会渲染到侧边栏，按钮仅作为权限标识使用。"
        width="w-[560px]"
      >
        <div className="grid grid-cols-2 gap-x-4 gap-y-4">
          <div>
            <Label>菜单名称 <span className="text-rose-500">*</span></Label>
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="例如：成本分析" />
          </div>
          <div>
            <Label>类型</Label>
            <AppSelect
              value={form.type}
              onValueChange={(v) => setForm({ ...form, type: v })}
              options={[
                { value: 'dir', label: '目录' },
                { value: 'menu', label: '菜单' },
                { value: 'button', label: '按钮' },
              ]}
            />
          </div>
          <div>
            <Label>上级菜单</Label>
            <AppSelect
              value={form.parentId}
              onValueChange={(v) => setForm({ ...form, parentId: v })}
              options={[
                { value: '', label: '顶级（无上级）' },
                ...items.filter((m) => m.type !== 'button').map((m) => ({ value: m.id, label: m.name })),
              ]}
            />
          </div>
          <div>
            <Label>排序</Label>
            <Input type="number" value={form.sort} onChange={(e) => setForm({ ...form, sort: e.target.value })} />
          </div>
          <div>
            <Label>权限标识</Label>
            <Input value={form.perm} onChange={(e) => setForm({ ...form, perm: e.target.value })} placeholder="cost:view" className="font-mono" />
          </div>
          <div>
            <Label>路由地址</Label>
            <Input value={form.path} onChange={(e) => setForm({ ...form, path: e.target.value })} placeholder="/cost" className="font-mono" />
          </div>
          <div className="col-span-2">
            <Label>页面组件</Label>
            <Input value={form.component} onChange={(e) => setForm({ ...form, component: e.target.value })} placeholder="cost/index" className="font-mono" />
          </div>
          <div className="col-span-2">
            <Label>备注</Label>
            <Input value={form.remark} onChange={(e) => setForm({ ...form, remark: e.target.value })} placeholder="可选，便于团队理解用途" />
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
