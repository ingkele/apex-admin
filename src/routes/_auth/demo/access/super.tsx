import { createFileRoute } from '@tanstack/react-router'
import { Crown, EyeOff } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { DemoBlock } from '@/components/shared/demo-block'
import { PageHeader } from '@/components/shared/page-header'
import { RoleSwitcher } from '@/components/shared/role-switcher'
import { useCan } from '@/components/shared/can'

export const Route = createFileRoute('/_auth/demo/access/super')({
  component: Page,
})

function Page() {
  const isSuper = useCan('user:manage')

  return (
    <>
      <PageHeader
        eyebrow={<span>演示 › 前端权限</span>}
        title="Super 可见"
        description="本菜单项配了 permission: 'user:manage' —— 只有超级管理员能在左侧菜单看到它；其他角色通过 URL 直达可以打开本页（页面自身不设防）。"
      />

      <RoleSwitcher className="mb-4" />

      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-7">
          <DemoBlock
            title="菜单过滤 = 不是权限边界"
            desc="菜单隐藏只是「不给入口」，页面与 API 仍需各自的守卫；把角色切到访客，注意左侧菜单的变化"
            code={`// app.config.ts
{
  label: 'Super 可见',
  to: '/demo/access/super',
  permission: 'user:manage',   // ← 菜单过滤：无权限整个隐藏
}

// filterNav 递归过滤：父级无可见子级时整组隐藏
// → 运维操作员 / 只读访客的菜单里看不到「Super 可见」`}
          >
            <div className="space-y-2.5 text-[12.5px] leading-relaxed text-muted">
              <p>
                当前身份 {isSuper ? '拥有' : '没有'} <code className="font-mono">user:manage</code>：
              </p>
              <div className="flex items-start gap-3 rounded-lg border border-line px-3.5 py-2.5">
                {isSuper ? <Crown className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" /> : <EyeOff className="mt-0.5 h-4 w-4 shrink-0 text-soft" />}
                <div>
                  <div className="text-[12.5px] font-medium text-ink">
                    {isSuper ? '你在超级管理员身份下，左侧能看到「Super 可见」菜单项' : '你的左侧菜单里已经看不到「Super 可见」菜单项了'}
                  </div>
                  <div className="mt-0.5 text-[11px] text-muted">
                    但本页仍然可以打开 —— 因为它没有挂路由守卫。对比「受保护页面（守卫）」：URL 直达会被 beforeLoad 拦到 403。
                  </div>
                </div>
              </div>
              <p className="text-[11.5px] text-soft">
                结论：菜单过滤提升体验，路由守卫 + API 校验才是边界。三层可以自由组合：
                入口隐藏（本页）、页面拦截（受保护页面）、字段级（后端 DTO）。
              </p>
            </div>
          </DemoBlock>
        </div>

        <div className="col-span-5">
          <Card className="p-5">
            <div className="text-[13px] font-semibold text-ink">三角色权限速览</div>
            <div className="mt-3 space-y-1.5">
              {Object.entries({
                admin: ['*', '全部权限（含 user:manage）'],
                operator: ['task:* service:* model:* key:* audit:view', '运维操作，无用户/角色管理'],
                viewer: ['*:view', '只读访客，只能看'],
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
