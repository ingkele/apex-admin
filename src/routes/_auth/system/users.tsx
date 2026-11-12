import * as React from 'react'
import { createFileRoute } from '@tanstack/react-router'
import type { ColumnDef } from '@tanstack/react-table'
import { Mail, MailClock, Search, Shield, Upload, UserCheck, UserPlus, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input, Label } from '@/components/ui/input'
import { AppSelect } from '@/components/ui/select'
import { AppDialog } from '@/components/ui/dialog'
import { DataTable } from '@/components/shared/data-table'
import { PageHeader } from '@/components/shared/page-header'
import { MiniStat } from '@/components/shared/stat-tile'
import { Can } from '@/components/shared/can'
import { useUserActions, useUserStats, useUsers } from '@/api'
import type { UserItem } from '@/mocks/db'
import { toast } from 'sonner'

export const Route = createFileRoute('/_auth/system/users')({
  component: UsersPage,
})

const ROLE_OPTIONS = [
  { value: '超级管理员', label: '超级管理员' },
  { value: '平台运维', label: '平台运维' },
  { value: '模型工程师', label: '模型工程师' },
  { value: '审计员', label: '审计员' },
  { value: '只读访客', label: '只读访客' },
]

/** 角色标签配色（原型 roleStyles 同款） */
const ROLE_STYLE: Record<string, string> = {
  超级管理员: 'bg-blue-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-300',
  平台运维: 'bg-cyan-50 text-cyan-700 dark:bg-cyan-500/10 dark:text-cyan-400',
  模型工程师: 'bg-violet-50 text-violet-700 dark:bg-violet-500/10 dark:text-violet-400',
  审计员: 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400',
  只读访客: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
}

const STATUS_META: Record<string, { label: string; cls: string; dot: string }> = {
  active: { label: '正常', cls: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400', dot: 'bg-emerald-500' },
  invited: { label: '待加入', cls: 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400', dot: 'bg-amber-500' },
  disabled: { label: '已停用', cls: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400', dot: 'bg-slate-400' },
}

function UsersPage() {
  const [keyword, setKeyword] = React.useState('')
  const [roleFilter, setRoleFilter] = React.useState('all')
  const [statusFilter, setStatusFilter] = React.useState('all')
  const [inviteOpen, setInviteOpen] = React.useState(false)
  const [invite, setInvite] = React.useState({ name: '', email: '', role: '只读访客' })
  const [roleTarget, setRoleTarget] = React.useState<UserItem | null>(null)
  const [roleValue, setRoleValue] = React.useState('只读访客')

  const users = useUsers({ page: 1, pageSize: 50 })
  const stats = useUserStats()
  const actions = useUserActions()

  const all = users.data?.items ?? []
  const data = all.filter((u) => {
    const kw = keyword.trim().toLowerCase()
    const okKw = !kw || u.name.toLowerCase().includes(kw) || u.email.toLowerCase().includes(kw)
    const okRole = roleFilter === 'all' || u.roles.includes(roleFilter)
    const okStatus = statusFilter === 'all' || u.status === statusFilter
    return okKw && okRole && okStatus
  })

  const columns: ColumnDef<UserItem, unknown>[] = [
    {
      accessorKey: 'name',
      header: '用户',
      cell: ({ row }) => (
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-brand-700 text-[10.5px] font-semibold text-white">
            {row.original.name.slice(0, 1)}
          </div>
          <div>
            <div className="text-[12.5px] font-medium text-ink">{row.original.name}</div>
            <div className="text-[10.5px] text-soft">{row.original.sub}</div>
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'email',
      header: '邮箱',
      cell: ({ row }) => <span className="font-mono text-[11.5px] text-muted">{row.original.email}</span>,
    },
    {
      id: 'roles',
      header: '角色',
      cell: ({ row }) => (
        <div className="flex flex-wrap gap-1">
          {row.original.roles.map((r) => (
            <span
              key={r}
              className={`rounded-md px-1.5 py-0.5 text-[10.5px] font-medium ${ROLE_STYLE[r] ?? 'bg-slate-100 text-slate-600'}`}
            >
              {r}
            </span>
          ))}
        </div>
      ),
    },
    {
      accessorKey: 'status',
      header: '状态',
      cell: ({ row }) => {
        const meta = STATUS_META[row.original.status] ?? STATUS_META.active
        return (
          <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-[10.5px] font-medium ${meta.cls}`}>
            <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} />
            {meta.label}
          </span>
        )
      },
    },
    {
      accessorKey: 'lastLoginAt',
      header: '最后登录',
      cell: ({ row }) => <span className="font-mono text-[10.5px] text-soft">{row.original.lastLoginAt}</span>,
    },
    {
      id: 'actions',
      header: () => <span className="block text-right">操作</span>,
      cell: ({ row }) => (
        <div className="flex items-center justify-end gap-1 whitespace-nowrap">
          <Can permission="user:manage">
            <button
              type="button"
              className="rounded-md px-1.5 py-1 text-[11px] font-medium text-brand-600 transition hover:bg-brand-50 dark:text-brand-400 dark:hover:bg-brand-500/10"
              onClick={() => {
                setRoleTarget(row.original)
                setRoleValue(row.original.roles[0] ?? '只读访客')
              }}
            >
              分配角色
            </button>
            {row.original.status === 'invited' ? (
              <button
                type="button"
                className="ml-1 rounded-md px-1.5 py-1 text-[11px] font-medium text-muted transition hover:bg-hover hover:text-ink"
                onClick={() => toast.success(`已向 ${row.original.email} 重新发送邀请`)}
              >
                重发邀请
              </button>
            ) : (
              <button
                type="button"
                className={`ml-1 rounded-md px-1.5 py-1 text-[11px] font-medium transition hover:bg-hover ${
                  row.original.status === 'active' ? 'text-muted hover:text-ink' : 'text-emerald-600 dark:text-emerald-400'
                }`}
                onClick={() =>
                  actions.toggleStatus.mutate(
                    { id: row.original.id, status: row.original.status === 'active' ? 'disabled' : 'active' },
                    { onSuccess: () => toast.success('状态已更新') },
                  )
                }
              >
                {row.original.status === 'active' ? '停用' : '启用'}
              </button>
            )}
          </Can>
        </div>
      ),
    },
  ]

  return (
    <div>
      <PageHeader
        title="用户管理"
        description="管理平台成员账号、角色归属与访问状态。"
        actions={
          <Can permission="user:manage">
            <>
              <Button variant="outline" size="sm" onClick={() => toast.success('已生成批量导入模板，请查收邮箱')}>
                <Upload className="h-3.5 w-3.5" /> 批量导入
              </Button>
              <Button size="sm" onClick={() => setInviteOpen(true)}>
                <UserPlus className="h-3.5 w-3.5" /> 邀请用户
              </Button>
            </>
          </Can>
        }
      />

      <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MiniStat
          label="总用户数"
          tone="slate"
          boxed
          icon={<Users className="h-3.5 w-3.5" />}
          value={stats.data?.total ?? '—'}
        />
        <MiniStat
          label="活跃用户"
          tone="green"
          boxed
          icon={<UserCheck className="h-3.5 w-3.5" />}
          value={stats.data?.active ?? '—'}
          unit="过去 30 天"
        />
        <MiniStat
          label="待接受邀请"
          tone="amber"
          boxed
          icon={<MailClock className="h-3.5 w-3.5" />}
          value={stats.data?.invited ?? '—'}
        />
        <MiniStat
          label="管理员账号"
          tone="brand"
          boxed
          icon={<Shield className="h-3.5 w-3.5" />}
          value={stats.data?.admin ?? '—'}
        />
      </div>

      <Card className="overflow-hidden">
        <div className="flex flex-wrap items-center gap-3 border-b border-line px-5 py-3.5">
          <div className="flex h-8 w-[260px] items-center gap-2 rounded-lg border border-line bg-canvas/60 px-2.5 focus-within:border-brand-300 focus-within:bg-surface">
            <Search className="h-3.5 w-3.5 shrink-0 text-soft" />
            <input
              id="user-keyword"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="搜索用户名或邮箱…"
              className="h-full min-w-0 flex-1 bg-transparent text-[12px] text-ink outline-none placeholder:text-soft"
            />
          </div>
          <AppSelect
            value={roleFilter}
            onValueChange={setRoleFilter}
            className="h-8 w-[140px] text-[12px]"
            options={[{ value: 'all', label: '全部角色' }, ...ROLE_OPTIONS]}
          />
          <AppSelect
            value={statusFilter}
            onValueChange={setStatusFilter}
            className="h-8 w-[130px] text-[12px]"
            options={[
              { value: 'all', label: '全部状态' },
              { value: 'active', label: '正常' },
              { value: 'invited', label: '待加入' },
              { value: 'disabled', label: '已停用' },
            ]}
          />
          <div className="ml-auto flex items-center gap-2 text-[10.5px] text-soft">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            最近同步：08:34
          </div>
        </div>

        <DataTable bare columns={columns} data={data} loading={users.isPending} emptyText="没有匹配的用户" />
      </Card>

      {/* 邀请 */}
      <AppDialog open={inviteOpen} onOpenChange={setInviteOpen} title="邀请新成员" description="邀请邮件将发送至填写的邮箱">
        <div className="space-y-4 pt-2">
          <div>
            <Label>姓名</Label>
            <Input value={invite.name} onChange={(e) => setInvite((f) => ({ ...f, name: e.target.value }))} placeholder="成员姓名" />
          </div>
          <div>
            <Label>邮箱</Label>
            <Input value={invite.email} onChange={(e) => setInvite((f) => ({ ...f, email: e.target.value }))} placeholder="name@company.com" />
          </div>
          <div>
            <Label>初始角色</Label>
            <AppSelect value={invite.role} onValueChange={(v) => setInvite((f) => ({ ...f, role: v }))} options={ROLE_OPTIONS} />
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <Button variant="outline" size="sm" onClick={() => setInviteOpen(false)}>取消</Button>
            <Button
              size="sm"
              disabled={!invite.name.trim() || !invite.email.includes('@')}
              onClick={() => {
                actions.invite.mutate(invite, {
                  onSuccess: () => {
                    setInviteOpen(false)
                    setInvite({ name: '', email: '', role: '只读访客' })
                    toast.success(`已向 ${invite.email} 发送邀请`)
                  },
                })
              }}
            >
              <Mail className="h-3.5 w-3.5" /> 发送邀请
            </Button>
          </div>
        </div>
      </AppDialog>

      {/* 分配角色 */}
      <AppDialog
        open={!!roleTarget}
        onOpenChange={(v) => !v && setRoleTarget(null)}
        title="分配角色"
        description={`${roleTarget?.name ?? ''} · ${roleTarget?.email ?? ''}`}
      >
        <div className="space-y-4 pt-2">
          <AppSelect value={roleValue} onValueChange={setRoleValue} options={ROLE_OPTIONS} />
          <div className="flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => setRoleTarget(null)}>取消</Button>
            <Button
              size="sm"
              onClick={() => {
                if (roleTarget) {
                  actions.setRole.mutate({ id: roleTarget.id, role: roleValue }, {
                    onSuccess: () => {
                      setRoleTarget(null)
                      toast.success('角色已更新')
                    },
                  })
                }
              }}
            >
              保存角色
            </Button>
          </div>
        </div>
      </AppDialog>
    </div>
  )
}
