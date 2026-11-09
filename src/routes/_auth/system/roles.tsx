import * as React from 'react'
import { createFileRoute } from '@tanstack/react-router'
import {
  ArrowUpRight, BrainCircuit, Crown, Eye, Grid3x3, Lock, MousePointerClick,
  Plus, RotateCcw, Save, ScanEye, ServerCog, ShieldCheck,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input, Label } from '@/components/ui/input'
import { AppDialog } from '@/components/ui/dialog'
import { PageHeader } from '@/components/shared/page-header'
import { Can } from '@/components/shared/can'
import { useRoles, useSaveRolePermissions } from '@/api'
import {
  PERMISSIONS, PERMISSION_GROUPS, PERMISSION_HINTS,
  type PermissionCode,
} from '@/app.config'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

export const Route = createFileRoute('/_auth/system/roles')({
  component: RolesPage,
})

const ROLE_ICON = {
  crown: Crown,
  server: ServerCog,
  brain: BrainCircuit,
  scan: ScanEye,
  eye: Eye,
}

const ROLE_TONE: Record<string, string> = {
  brand: 'bg-blue-100 text-brand-700 dark:bg-brand-500/15 dark:text-brand-300',
  cyan: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-500/15 dark:text-cyan-300',
  violet: 'bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300',
  amber: 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300',
  slate: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300',
}

const ALL_CODES = PERMISSION_GROUPS.flatMap((g) => g.codes)

/** 各角色初始授权（演示数据，保存后只作用于当前会话） */
const INITIAL_GRANTS: Record<string, PermissionCode[]> = {
  role_admin: ALL_CODES,
  role_ops: [
    'dashboard:view', 'task:view', 'task:detail', 'service:view', 'service:log',
    'model:view', 'key:view', 'dept:view', 'audit:view', 'setting:view',
    'task:retry', 'task:cancel', 'service:restart', 'service:stop', 'menu:view',
  ],
  role_ml: [
    'dashboard:view', 'task:view', 'task:detail', 'service:view', 'service:log',
    'model:view', 'key:view', 'dict:view',
    'model:manage', 'key:manage', 'task:retry', 'menu:view', 'dept:view',
  ],
  role_audit: [
    'dashboard:view', 'task:view', 'task:detail', 'service:view', 'audit:view', 'setting:view',
    'menu:view', 'dept:view', 'dict:view',
  ],
  role_guest: ['dashboard:view', 'task:view', 'service:view', 'dept:view', 'dict:view'],
}

function RolesPage() {
  const roles = useRoles()
  const save = useSaveRolePermissions()
  const [selectedId, setSelectedId] = React.useState('role_admin')
  const [grants, setGrants] = React.useState<Record<string, PermissionCode[]>>(INITIAL_GRANTS)
  const [createOpen, setCreateOpen] = React.useState(false)
  const [newRole, setNewRole] = React.useState({ name: '', desc: '' })

  const list = roles.data ?? []
  const selected = list.find((r) => r.id === selectedId)
  const current = grants[selectedId] ?? []
  const totalCodes = ALL_CODES.length

  const toggle = (code: PermissionCode) => {
    setGrants((g) => {
      const cur = g[selectedId] ?? []
      return { ...g, [selectedId]: cur.includes(code) ? cur.filter((c) => c !== code) : [...cur, code] }
    })
  }

  const toggleGroup = (codes: PermissionCode[], on: boolean) => {
    setGrants((g) => {
      const cur = new Set(g[selectedId] ?? [])
      codes.forEach((c) => (on ? cur.add(c) : cur.delete(c)))
      return { ...g, [selectedId]: ALL_CODES.filter((c) => cur.has(c)) }
    })
  }

  return (
    <div>
      <PageHeader
        title="角色权限"
        description="配置不同角色可访问的菜单与可执行操作，遵循最小权限原则。"
        actions={
          <>
            <Button variant="outline" size="sm" onClick={() => setCreateOpen(true)}>
              <Plus className="h-3.5 w-3.5" /> 新建角色
            </Button>
            <Can permission="role:manage">
              <Button
                size="sm"
                onClick={() => save.mutate({ id: selectedId, permissions: current }, { onSuccess: () => toast.success('权限已保存') })}
              >
                <Save className="h-3.5 w-3.5" /> 保存权限
              </Button>
            </Can>
          </>
        }
      />

      {/* 提示条 */}
      <div className="mb-4 flex flex-wrap items-center gap-2.5 rounded-xl border border-brand-100 bg-brand-50/60 px-4 py-2.5 dark:border-brand-500/20 dark:bg-brand-500/5">
        <ShieldCheck className="h-4 w-4 shrink-0 text-brand-600 dark:text-brand-400" />
        <p className="text-[11.5px] text-brand-800/80 dark:text-brand-300/80">
          权限变更保存后即时生效，但不会中断当前已登录会话。所有权限修改均记录审计日志。
        </p>
        <a
          href="/system/audit"
          className="ml-auto flex shrink-0 items-center gap-1 text-[11px] font-medium text-brand-700 hover:text-brand-800 dark:text-brand-400"
        >
          查看权限变更记录 <ArrowUpRight className="h-3 w-3" />
        </a>
      </div>

      <div className="grid grid-cols-12 gap-5">
        {/* 角色列表 */}
        <section className="col-span-12 overflow-hidden rounded-xl border border-line bg-surface shadow-card xl:col-span-3">
          <div className="flex items-center justify-between border-b border-line px-4 py-3.5">
            <div>
              <h2 className="text-[13px] font-semibold text-ink">角色列表</h2>
              <p className="mt-0.5 text-[10.5px] text-muted">共 {list.length} 个角色</p>
            </div>
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-muted dark:bg-slate-800">
              {list.length}
            </span>
          </div>

          <div className="space-y-1 p-2">
            {list.map((r) => {
              const Icon = ROLE_ICON[r.icon] ?? Crown
              const active = selectedId === r.id
              const granted = (grants[r.id] ?? []).length
              return (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setSelectedId(r.id)}
                  className={cn(
                    'w-full rounded-lg border px-3 py-2.5 text-left transition',
                    active
                      ? 'border-brand-200 bg-brand-50/70 dark:border-brand-500/25 dark:bg-brand-500/10'
                      : 'border-transparent hover:border-line hover:bg-hover',
                  )}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="flex items-center gap-2 text-[12px] font-medium text-ink">
                      <span className={cn('flex h-6 w-6 items-center justify-center rounded-md', ROLE_TONE[r.tone])}>
                        <Icon className="h-3 w-3" />
                      </span>
                      {r.name}
                    </span>
                    {r.builtin ? (
                      <Lock className="h-3 w-3 text-soft" />
                    ) : (
                      <span className="rounded bg-brand-50 px-1.5 py-0.5 text-[9px] font-medium text-brand-700 dark:bg-brand-500/10 dark:text-brand-300">
                        自定义
                      </span>
                    )}
                  </div>
                  <div className="mt-1.5 flex items-center justify-between pl-8 text-[10px] text-soft">
                    <span>{granted >= totalCodes ? '全部权限' : `${granted} 项权限`}</span>
                    <span>{r.members} 位成员</span>
                  </div>
                </button>
              )
            })}
          </div>

          <div className="border-t border-line p-3">
            <button
              type="button"
              onClick={() => setCreateOpen(true)}
              className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-line py-2 text-[11px] font-medium text-soft transition hover:border-brand-200 hover:text-brand-600"
            >
              <Plus className="h-3 w-3" /> 创建自定义角色
            </button>
          </div>
        </section>

        {/* 权限矩阵 */}
        <section className="col-span-12 overflow-hidden rounded-xl border border-line bg-surface shadow-card xl:col-span-9">
          <div className="flex flex-wrap items-start justify-between gap-3 border-b border-line px-5 py-4">
            <div className="flex items-start gap-3">
              <span className={cn('flex h-9 w-9 items-center justify-center rounded-lg', ROLE_TONE[selected?.tone ?? 'brand'])}>
                {(() => {
                  const Icon = ROLE_ICON[selected?.icon ?? 'crown'] ?? Crown
                  return <Icon className="h-4 w-4" />
                })()}
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-[14px] font-semibold text-ink">{selected?.name ?? '角色'}</h2>
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[9.5px] font-medium text-muted dark:bg-slate-800">
                    {selected?.builtin ? '内置角色' : '自定义角色'}
                  </span>
                </div>
                <p className="mt-1 max-w-[560px] text-[11px] leading-4 text-muted">
                  {selected?.desc ?? ''}
                  {selected ? ` 修改将影响全部 ${selected.members} 位成员。` : ''}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="rounded-lg border border-line bg-canvas/60 px-3 py-2 text-center">
                <div className="text-[10px] text-soft">已选权限</div>
                <div className="mt-0.5 font-mono text-[12.5px] font-semibold text-ink">
                  {current.length}
                  <span className="text-[10px] font-normal text-soft"> / {totalCodes}</span>
                </div>
              </div>
              <Button variant="outline" size="sm" className="h-8 text-[11px]" onClick={() => setGrants(INITIAL_GRANTS)}>
                <RotateCcw className="h-3 w-3" /> 重置
              </Button>
            </div>
          </div>

          <div className="max-h-[calc(100vh-330px)] min-h-[520px] overflow-y-auto px-5 py-5">
            {PERMISSION_GROUPS.map((group) => {
              const GroupIcon = group.icon === 'grid' ? Grid3x3 : MousePointerClick
              const selectedCount = group.codes.filter((c) => current.includes(c)).length
              const allOn = selectedCount === group.codes.length
              return (
                <div key={group.key} className="mb-5 overflow-hidden rounded-xl border border-line last:mb-0">
                  <div className="flex items-center gap-3 border-b border-line bg-canvas/60 px-4 py-3">
                    <input
                      type="checkbox"
                      checked={allOn}
                      onChange={(e) => toggleGroup(group.codes, e.target.checked)}
                      className="h-4 w-4 rounded border-line accent-[var(--brand-600)]"
                      aria-label={`${group.label}全选`}
                    />
                    <span
                      className={cn(
                        'flex h-6 w-6 items-center justify-center rounded-md',
                        group.icon === 'grid'
                          ? 'bg-blue-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400'
                          : 'bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-400',
                      )}
                    >
                      <GroupIcon className="h-3 w-3" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[12px] font-semibold text-ink">{group.label}</span>
                        <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[9px] text-muted dark:bg-slate-800">
                          {group.codes.length} 项
                        </span>
                      </div>
                      <div className="mt-0.5 text-[10px] text-soft">{group.desc}</div>
                    </div>
                    <button
                      type="button"
                      className="text-[10.5px] font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400"
                      onClick={() => toggleGroup(group.codes, !allOn)}
                    >
                      {allOn ? '全不选' : '全选'}
                    </button>
                  </div>

                  <div className="grid grid-cols-1 gap-0 p-2 sm:grid-cols-2 xl:grid-cols-3">
                    {group.codes.map((code) => {
                      const checked = current.includes(code)
                      return (
                        <label
                          key={code}
                          className="flex cursor-pointer items-start gap-2.5 rounded-lg px-3 py-2.5 transition hover:bg-hover/60"
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => toggle(code)}
                            className="mt-0.5 h-3.5 w-3.5 rounded border-line accent-[var(--brand-600)]"
                          />
                          <div className="min-w-0">
                            <div className="text-[11.5px] font-medium text-ink">{PERMISSIONS[code]}</div>
                            <div className="mt-0.5 text-[10px] text-soft">{PERMISSION_HINTS[code]}</div>
                          </div>
                        </label>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      </div>

      {/* 新建角色 */}
      <AppDialog open={createOpen} onOpenChange={setCreateOpen} title="新建自定义角色" description="创建后在权限矩阵中勾选授权">
        <div className="space-y-4 pt-2">
          <div>
            <Label>角色名称</Label>
            <Input value={newRole.name} onChange={(e) => setNewRole((f) => ({ ...f, name: e.target.value }))} placeholder="例如：数据标注员" />
          </div>
          <div>
            <Label>描述</Label>
            <Input value={newRole.desc} onChange={(e) => setNewRole((f) => ({ ...f, desc: e.target.value }))} placeholder="角色职责简述" />
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <Button variant="outline" size="sm" onClick={() => setCreateOpen(false)}>取消</Button>
            <Button
              size="sm"
              disabled={!newRole.name.trim()}
              onClick={() => {
                setCreateOpen(false)
                setNewRole({ name: '', desc: '' })
                toast.success('角色已创建（演示）')
              }}
            >
              创建角色
            </Button>
          </div>
        </div>
      </AppDialog>
    </div>
  )
}
