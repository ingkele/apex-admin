import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { ArrowRight, Layers3, MousePointerClick, Route as RouteIcon, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { DemoBlock } from '@/components/shared/demo-block'
import { PageHeader } from '@/components/shared/page-header'
import { RoleSwitcher } from '@/components/shared/role-switcher'
import { useAuthStore } from '@/stores/auth.store'
import { cn } from '@/lib/utils'

export const Route = createFileRoute('/_auth/demo/access/page')({
  component: Page,
})

const GUARDED_PAGES = [
  { to: '/system/users', label: '用户管理', code: 'user:manage' as const },
  { to: '/demo/access/guarded', label: '受保护页面（守卫）', code: 'user:manage' as const },
  { to: '/tasks', label: '任务列表', code: 'task:view' as const },
  { to: '/system/audit', label: '审计日志', code: 'audit:view' as const },
]

function Page() {
  const navigate = useNavigate()
  const hasPermission = useAuthStore((s) => s.hasPermission)

  return (
    <>
      <PageHeader
        eyebrow={<span>演示 › 前端权限</span>}
        title="页面访问"
        description="前端三层权限体系的总览：菜单过滤、按钮控制、路由守卫；下方「角色模拟器」可实时切换角色看全部联动。"
      />

      <RoleSwitcher className="mb-4" />

      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-7">
          <DemoBlock
            title="三层权限体系"
            desc="前端只做体验优化，最终防线是后端 API 校验（.NET 强制校验权限码）"
            code={`// ① 菜单过滤 —— 侧边栏按权限递归过滤
{ label: '用户管理', to: '/system/users', permission: 'user:manage' }

// ② 按钮控制 —— <Can> 无权限不渲染
<Can permission="user:manage"><Button>删除</Button></Can>

// ③ 路由守卫 —— beforeLoad 无权限跳 403
beforeLoad: () => requirePermission('user:manage')`}
          >
            <div className="space-y-2.5">
              {[
                { icon: Layers3, title: '① 菜单过滤', desc: '无权限的菜单项整个隐藏（含子树），导航里不出现入口' },
                { icon: MousePointerClick, title: '② 按钮控制', desc: '<Can> 包裹高危按钮；可配 fallback 改为禁用态' },
                { icon: RouteIcon, title: '③ 路由守卫', desc: 'URL 直达也拦得住 —— beforeLoad 校验失败直接跳 403' },
              ].map((row) => (
                <div key={row.title} className="flex items-start gap-3 rounded-lg border border-line px-3.5 py-2.5">
                  <row.icon className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" />
                  <div>
                    <div className="text-[12.5px] font-medium text-ink">{row.title}</div>
                    <div className="mt-0.5 text-[11px] text-muted">{row.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </DemoBlock>
        </div>

        <div className="col-span-5">
          <Card className="p-5">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-brand-600" />
              <div className="text-[13px] font-semibold text-ink">实时访问矩阵</div>
            </div>
            <p className="mt-1.5 text-[11px] text-soft">
              随角色模拟器实时变化 —— 切到「只读访客」再看这张表
            </p>
            <div className="mt-3 space-y-1.5">
              {GUARDED_PAGES.map((p) => {
                const ok = hasPermission(p.code)
                return (
                  <button
                    key={p.to}
                    type="button"
                    onClick={() => void navigate({ to: p.to })}
                    className="flex w-full items-center gap-2 rounded-lg border border-line px-3 py-2 text-left text-[12px] transition-colors hover:bg-hover"
                  >
                    <span
                      className={cn(
                        'h-1.5 w-1.5 shrink-0 rounded-full',
                        ok ? 'bg-emerald-500' : 'bg-rose-500',
                      )}
                    />
                    <span className="min-w-0 flex-1 truncate text-ink">{p.label}</span>
                    <code className="shrink-0 font-mono text-[9.5px] text-soft">{p.code}</code>
                    <span className={cn('shrink-0 text-[10.5px]', ok ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400')}>
                      {ok ? '可访问' : '无权限'}
                    </span>
                    <ArrowRight className="h-3 w-3 shrink-0 text-soft" />
                  </button>
                )
              })}
            </div>
            <p className="mt-3 border-t border-line pt-3 text-[10.5px] leading-relaxed text-soft">
              无权限的行也可以点 —— 「受保护页面（守卫）」会把你带到 403 页，这就是路由守卫的效果。
            </p>
          </Card>
        </div>
      </div>
    </>
  )
}
