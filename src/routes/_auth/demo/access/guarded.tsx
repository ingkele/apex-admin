import { createFileRoute, Link } from '@tanstack/react-router'
import { Lock, ShieldCheck } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { PageHeader } from '@/components/shared/page-header'
import { RoleSwitcher } from '@/components/shared/role-switcher'
import { requirePermission } from '@/lib/guard'

export const Route = createFileRoute('/_auth/demo/access/guarded')({
  // 路由级守卫：无 user:manage 权限直接跳 403，页面组件根本不会执行
  beforeLoad: () => requirePermission('user:manage'),
  component: Page,
})

function Page() {
  return (
    <>
      <PageHeader
        eyebrow={<span>演示 › 前端权限 › 页面访问</span>}
        title="受保护页面（守卫）"
        description="本页 beforeLoad 校验 user:manage —— 你能看到它，说明路由守卫放行了。"
      />

      <RoleSwitcher className="mb-4" />

      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-7">
          <Card className="p-6">
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="h-5 w-5 text-emerald-600" />
              <div className="text-[14px] font-semibold text-ink">守卫已放行</div>
            </div>
            <p className="mt-3 text-[12.5px] leading-relaxed text-muted">
              这个页面不在任何人的「默认可见」范围内 —— 只有拥有{' '}
              <code className="font-mono">user:manage</code> 权限码（超级管理员）才能通过 beforeLoad。
              换成「运维操作员 / 只读访客」再从{' '}
              <Link to="/demo/access/page" className="text-brand-600 underline underline-offset-2">页面访问</Link>{' '}
              页跳过来试试，会被扔到 403。
            </p>
          </Card>
        </div>
        <div className="col-span-5">
          <Card className="p-5">
            <div className="flex items-center gap-2">
              <Lock className="h-4 w-4 text-brand-600" />
              <div className="text-[13px] font-semibold text-ink">守卫写法</div>
            </div>
            <pre className="mt-3 overflow-x-auto rounded-lg border border-line bg-canvas px-3.5 py-3 font-mono text-[11px] leading-relaxed text-muted">
{`export const Route = createFileRoute(
  '/_auth/demo/access/guarded',
)({
  beforeLoad: () =>
    requirePermission('user:manage'),
  component: Page,
})`}
            </pre>
            <p className="mt-3 text-[10.5px] leading-relaxed text-soft">
              <code className="font-mono">requirePermission</code> 在{' '}
              <code className="font-mono">src/lib/guard.ts</code>，
              失败时 <code className="font-mono">throw redirect</code> 到 403 —— 不是渲染 403 组件，
              而是整页跳转，URL 里不会留下敏感路径上下文。
            </p>
          </Card>
        </div>
      </div>
    </>
  )
}
