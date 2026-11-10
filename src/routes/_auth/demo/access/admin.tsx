import { createFileRoute } from '@tanstack/react-router'
import { ShieldCheck, Users } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { DemoBlock } from '@/components/shared/demo-block'
import { PageHeader } from '@/components/shared/page-header'
import { RoleSwitcher } from '@/components/shared/role-switcher'
import { useCan } from '@/components/shared/can'

export const Route = createFileRoute('/_auth/demo/access/admin')({
  component: Page,
})

function Page() {
  const isAdminLevel = useCan('task:retry')

  return (
    <>
      <PageHeader
        eyebrow={<span>演示 › 前端权限</span>}
        title="Admin 可见"
        description="本菜单项配了 permission: 'task:retry' —— 超级管理员与运维操作员可见；只读访客的菜单里没有它（URL 直达仍可打开本页）。"
      />

      <RoleSwitcher className="mb-4" />

      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-7">
          <DemoBlock
            title="多角色可见 = 权限码交集"
            desc="菜单可见性由权限码决定而不是角色名 —— 谁拥有这个码，谁就能看到；把角色切到只读访客看菜单变化"
            code={`// app.config.ts
{
  label: 'Admin 可见',
  to: '/demo/access/admin',
  permission: 'task:retry',   // ← admin + operator 有，viewer 没有
}

// 角色 → 权限码（app.config.ts roles）
admin:    '*'                          → 有 ✅
operator: ['task:*', ...]              → task:retry 有 ✅
viewer:   ['dashboard:view', ...]      → 没有 ❌`}
          >
            <div className="space-y-2.5 text-[12.5px] leading-relaxed text-muted">
              <p>
                当前身份 {isAdminLevel ? '拥有' : '没有'} <code className="font-mono">task:retry</code>：
              </p>
              <div className="flex items-start gap-3 rounded-lg border border-line px-3.5 py-2.5">
                {isAdminLevel ? (
                  <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-brand-500" />
                ) : (
                  <Users className="mt-0.5 h-4 w-4 shrink-0 text-soft" />
                )}
                <div>
                  <div className="text-[12.5px] font-medium text-ink">
                    {isAdminLevel
                      ? '你的菜单里能看到「Admin 可见」—— 说明你拥有 task:retry 这一档权限'
                      : '你的菜单里已经看不到「Admin 可见」了 —— 只读访客没有 task:retry'}
                  </div>
                  <div className="mt-0.5 text-[11px] text-muted">
                    与「Super 可见」对照：那是单角色专属（user:manage），这里是「管理员层级」多角色共享。
                  </div>
                </div>
              </div>
              <p className="text-[11.5px] text-soft">
                新增角色时不需要改组件代码 —— 只要在 <code className="font-mono">app.config.ts</code>{' '}
                的角色权限表里声明它拥有哪些码，菜单过滤自动生效。
              </p>
            </div>
          </DemoBlock>
        </div>

        <div className="col-span-5">
          <Card className="p-5">
            <div className="text-[13px] font-semibold text-ink">三角色权限速览</div>
            <div className="mt-3 space-y-1.5">
              {Object.entries({
                admin: ['*', '全部权限（含 task:retry）'],
                operator: ['task:* service:* model:* key:* audit:view', '运维操作，含 task:retry'],
                viewer: ['*:view', '只读访客，只能看，无 task:retry'],
              }).map(([role, [codes, desc]]) => (
                <div key={role} className="rounded-lg border border-line px-3 py-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[12px] font-medium text-ink">{role}</span>
                    <code className="font-mono text-[9.5px] text-soft">{codes}</code>
                  </div>
                  <div className="mt-0.5 text-[10.5px] text-soft">{desc}</div>
                </div>
              ))}
            </div>
            <p className="mt-3 text-[10.5px] leading-relaxed text-soft">
              权限码表集中在 <code className="font-mono">app.config.ts</code>（PERMISSIONS / PERMISSION_HINTS），
              角色 → 权限码的映射也在同文件，换项目时只改这一处。
            </p>
          </Card>
        </div>
      </div>
    </>
  )
}
