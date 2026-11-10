import { createFileRoute } from '@tanstack/react-router'
import { ShieldAlert, ShieldCheck } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { DemoBlock } from '@/components/shared/demo-block'
import { PageHeader } from '@/components/shared/page-header'
import { RoleSwitcher } from '@/components/shared/role-switcher'
import { useCan } from '@/components/shared/can'

export const Route = createFileRoute('/_auth/demo/access/menu-403')({
  component: Page,
})

function Page() {
  const allowed = useCan('user:manage')

  return (
    <>
      <PageHeader
        eyebrow={<span>演示 › 前端权限</span>}
        title="菜单可见(403)"
        description="菜单项对所有人可见（不配 permission），但页面要求 user:manage —— 无权限时页面内展示 403 态，而不是丢到错误页。"
      />

      <RoleSwitcher className="mb-4" />

      {allowed ? (
        <DemoBlock
          title="正常内容（你有权限）"
          desc="切到「运维操作员 / 只读访客」，本区域会变成内嵌 403 面板"
          code={`// app.config.ts —— 菜单项不配 permission（人人可见入口）
{ label: '菜单可见(403)', to: '/demo/access/menu-403' }

// 页面内 —— 权限判断后渲染 403 态
const allowed = useCan('user:manage')
return allowed ? <Content /> : <ForbiddenPanel />`}
        >
          <div className="flex items-start gap-3 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3.5 dark:border-emerald-500/30 dark:bg-emerald-500/10">
            <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
            <div>
              <div className="text-[13px] font-semibold text-emerald-700 dark:text-emerald-300">权限校验通过</div>
              <p className="mt-1 text-[12px] leading-relaxed text-emerald-700/80 dark:text-emerald-400/80">
                这里是受权限保护的业务内容。与路由守卫的区别：菜单入口始终可见，
                用户能「知道有这个功能」，点进来才被告知需要什么权限 —— 适合引导式开通的场景。
              </p>
            </div>
          </div>
        </DemoBlock>
      ) : (
        <Card className="p-0">
          <div className="flex flex-col items-center px-6 py-14 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-rose-50 dark:bg-rose-500/10">
              <ShieldAlert className="h-7 w-7 text-rose-500" />
            </div>
            <div className="mt-4 text-[16px] font-semibold text-ink">403 · 无访问权限</div>
            <p className="mt-2 max-w-[380px] text-[12px] leading-relaxed text-muted">
              当前角色没有 <code className="font-mono">user:manage</code> 权限码。
              用上方角色模拟器切到「超级管理员」即可看到正常内容 —— 整个过程不用重新登录。
            </p>
            <div className="mt-5 rounded-lg border border-line bg-canvas px-4 py-2.5 text-left font-mono text-[10.5px] leading-relaxed text-soft">
              此模式 = 菜单可见 + 页面内 403（本页）<br />
              对比 = 路由守卫：URL 直达也拦住，整页跳转 /error/403（受保护页面（守卫））
            </div>
          </div>
        </Card>
      )}
    </>
  )
}
