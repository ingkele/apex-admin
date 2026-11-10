import { createFileRoute, Link, useLocation } from '@tanstack/react-router'
import { EyeOff, Route as RouteIcon } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { DemoBlock } from '@/components/shared/demo-block'
import { PageHeader } from '@/components/shared/page-header'
import { BreadcrumbPreview } from '@/components/shared/breadcrumb-preview'
import { resolveBreadcrumb } from '@/lib/route-meta'

export const Route = createFileRoute('/_auth/demo/breadcrumb/flat-detail')({
  component: Page,
})

function Page() {
  const { pathname } = useLocation()
  const parts = resolveBreadcrumb(pathname)

  return (
    <>
      <PageHeader
        eyebrow={<span>演示 › 面包屑导航</span>}
        title="平级模式详情"
        description="隐藏详情页（hideInMenu）：菜单里没有本页入口；激活时通过 activePath 让渡，侧边栏仍然高亮「平级模式」。"
      />

      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-7">
          <DemoBlock
            title="隐藏页 + 激活让渡"
            desc="本页从「平级模式」页内的链接进入；注意左侧菜单高亮项与面包屑都是平级模式口径"
            code={`// app.config.ts
{
  label: '平级模式详情',
  to: '/demo/breadcrumb/flat-detail',
  hideInMenu: true,          // ← 侧边栏/命令面板均不渲染
  activePath: '/demo/breadcrumb/flat',  // ← 激活让渡
  breadcrumbFlat: true,      // ← 面包屑只显示标题
}

// sidebar.tsx —— 命中隐藏项时把激活态交给 activePath 指向的菜单
resolveActiveAliases(pathname) → {'{'}'/demo/breadcrumb'{'}'…`}
          >
            <BreadcrumbPreview parts={parts} />
            <div className="mt-3 space-y-2.5 text-[11.5px] leading-relaxed text-muted">
              <div className="flex items-start gap-3 rounded-lg border border-line px-3.5 py-2.5">
                <EyeOff className="mt-0.5 h-4 w-4 shrink-0 text-soft" />
                <div>
                  <div className="text-[12.5px] font-medium text-ink">菜单不显示，但页面完全可达</div>
                  <div className="mt-0.5 text-[11px] text-muted">
                    与「隐藏子菜单（hideChildren）」不同：hideChildren 是「折叠为单链接」，
                    hideInMenu 是「彻底不进菜单」—— 详情页、回调页用它保持菜单干净。
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-3 rounded-lg border border-line px-3.5 py-2.5">
                <RouteIcon className="mt-0.5 h-4 w-4 shrink-0 text-brand-500" />
                <div>
                  <div className="text-[12.5px] font-medium text-ink">激活让渡：侧边栏高亮「平级模式」</div>
                  <div className="mt-0.5 text-[11px] text-muted">
                    用户始终知道自己在面包屑模块里，不会因为进入隐藏页而「失去位置感」。
                  </div>
                </div>
              </div>
            </div>
            <p className="mt-3 text-[11.5px] leading-relaxed text-muted">
              返回{' '}
              <Link to="/demo/breadcrumb/flat" className="text-brand-600 underline underline-offset-2">
                平级模式
              </Link>{' '}
              页可再看到入口链接；面包屑在平级模式下始终只有一级。
            </p>
          </DemoBlock>
        </div>

        <div className="col-span-5">
          <Card className="p-5">
            <div className="text-[13px] font-semibold text-ink">hideChildren vs hideInMenu</div>
            <ul className="mt-2.5 space-y-2.5 text-[11.5px] leading-relaxed text-muted">
              <li>
                <span className="font-medium text-ink">hideChildren：</span>
                节点显示为单链接，子页面 URL 直达 —— 菜单里保留入口（见「隐藏子菜单」页）；
              </li>
              <li>
                <span className="font-medium text-ink">hideInMenu：</span>
                节点完全不渲染 —— 菜单里没有入口，靠页内链接 / URL 进入（本页）。
              </li>
            </ul>
            <div className="mt-3 rounded-lg border border-line bg-canvas px-3 py-2.5 font-mono text-[11px] leading-relaxed text-muted">
              resolveBreadcrumb('{pathname}')<br />
              → {JSON.stringify(parts)}
            </div>
            <p className="mt-3 border-t border-line pt-3 text-[10.5px] leading-relaxed text-soft">
              隐藏项仍会登记进 <code className="font-mono">route-meta</code>（FLAT 表），
              所以页签标题、文档标题、面包屑全部照常解析。
            </p>
          </Card>
        </div>
      </div>
    </>
  )
}
