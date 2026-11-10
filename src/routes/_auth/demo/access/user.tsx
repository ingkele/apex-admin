import { createFileRoute } from '@tanstack/react-router'
import { Globe, Users } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { DemoBlock } from '@/components/shared/demo-block'
import { PageHeader } from '@/components/shared/page-header'
import { RoleSwitcher } from '@/components/shared/role-switcher'
import { useAuthStore } from '@/stores/auth.store'

export const Route = createFileRoute('/_auth/demo/access/user')({
  component: Page,
})

function Page() {
  const user = useAuthStore((s) => s.user)

  return (
    <>
      <PageHeader
        eyebrow={<span>演示 › 前端权限</span>}
        title="User 可见"
        description="本菜单项不配 permission —— 所有角色都能看到；无论怎么切换角色，左侧菜单里它一直都在。"
      />

      <RoleSwitcher className="mb-4" />

      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-7">
          <DemoBlock
            title="不设权限 = 全员可见"
            desc="这是菜单可见性的默认档；连续切换三个角色观察左侧菜单 —— 只有本项和「按钮控制」这类公开项不动"
            code={`// app.config.ts
{
  label: 'User 可见',
  to: '/demo/access/user',
  // 无 permission 字段 → filterNav 直接放行
}

// sidebar.tsx filterNav
if (c.permission && !hasPermission(c.permission)) return []
// 没配 permission 的节点，任何角色都保留`}
          >
            <div className="space-y-2.5 text-[12.5px] leading-relaxed text-muted">
              <p>
                当前身份：<span className="font-medium text-ink">{user?.name ?? '未登录'}</span>
                （{user?.role ?? '-'}）—— 本页对它可见。
              </p>
              <div className="flex items-start gap-3 rounded-lg border border-line px-3.5 py-2.5">
                <Globe className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                <div>
                  <div className="text-[12.5px] font-medium text-ink">三档可见性演示凑齐了</div>
                  <div className="mt-0.5 text-[11px] text-muted">
                    Super 可见（单角色）→ Admin 可见（管理员层级）→ User 可见（全员），
                    同一套 permission 字段控制，只是配的码不同 / 不配。
                  </div>
                </div>
              </div>
              <p className="text-[11.5px] text-soft">
                「全员可见」不等于「人人可操作」—— 列表里的高风险按钮仍走{' '}
                <code className="font-mono">&lt;Can&gt;</code> 按钮级权限（见「按钮控制」页）。
              </p>
            </div>
          </DemoBlock>
        </div>

        <div className="col-span-5">
          <Card className="p-5">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-brand-500" />
              <div className="text-[13px] font-semibold text-ink">菜单可见性三档速查</div>
            </div>
            <div className="mt-3 space-y-1.5">
              {[
                ['Super 可见', "permission: 'user:manage'", '仅超级管理员', 'amber'],
                ['Admin 可见', "permission: 'task:retry'", '超级管理员 + 运维操作员', 'brand'],
                ['User 可见', '无 permission 字段', '全部角色', 'emerald'],
              ].map(([label, code, who, tone]) => (
                <div key={label} className="rounded-lg border border-line px-3 py-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[12px] font-medium text-ink">{label}</span>
                    <code className="font-mono text-[9.5px] text-soft">{code}</code>
                  </div>
                  <div className="mt-0.5 text-[10.5px] text-soft">可见角色：{who}</div>
                </div>
              ))}
            </div>
            <p className="mt-3 text-[10.5px] leading-relaxed text-soft">
              把三档与「菜单可见(403)」组合还能玩出第四档：菜单可见但进入后内嵌 403 ——
              适合「让员工知道功能存在但无权使用」的引导场景。
            </p>
          </Card>
        </div>
      </div>
    </>
  )
}
