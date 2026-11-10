import { createFileRoute, Link, useLocation } from '@tanstack/react-router'
import { Card } from '@/components/ui/card'
import { DemoBlock } from '@/components/shared/demo-block'
import { PageHeader } from '@/components/shared/page-header'
import { BreadcrumbPreview } from '@/components/shared/breadcrumb-preview'
import { resolveBreadcrumb } from '@/lib/route-meta'

export const Route = createFileRoute('/_auth/demo/breadcrumb/detail')({
  component: Page,
})

function Page() {
  const { pathname } = useLocation()
  const parts = resolveBreadcrumb(pathname)

  return (
    <>
      <PageHeader
        eyebrow={<span>演示 › 面包屑导航 › 层级模式</span>}
        title="层级模式详情"
        description="详情页通过 breadcrumbParents 继承父级链 —— 面包屑显示「层级模式 › 层级模式详情」，可逐级点回。"
      />

      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-7">
          <DemoBlock
            title="实时面包屑（本页）"
            desc="菜单里它是平级项，但面包屑通过 breadcrumbParents 多出「层级模式」一级"
            code={`// app.config.ts
{
  label: '层级模式详情',
  to: '/demo/breadcrumb/detail',
  breadcrumbParents: ['层级模式'],   // ← 追加父级标签
}

// resolveBreadcrumb → ['演示', '面包屑导航',
//                      '层级模式', '层级模式详情']`}
          >
            <BreadcrumbPreview parts={parts} />
            <p className="mt-3 text-[11.5px] leading-relaxed text-muted">
              典型场景：列表页 → 详情页。详情页不在菜单里深挖嵌套，但用户需要知道
              「我在哪个模块的哪个对象里」，并能顺着面包屑跳回{' '}
              <Link to="/demo/breadcrumb/hierarchy" className="text-brand-600 underline underline-offset-2">
                层级模式
              </Link>{' '}
              页。
            </p>
          </DemoBlock>
        </div>

        <div className="col-span-5">
          <Card className="p-5">
            <div className="text-[13px] font-semibold text-ink">两种补齐父级链的方式</div>
            <ul className="mt-2.5 space-y-2.5 text-[11.5px] leading-relaxed text-muted">
              <li>
                <span className="font-medium text-ink">菜单嵌套：</span>
                放进父级 children 里，parents 自动带上 —— 适合菜单上真有层级的页面；
              </li>
              <li>
                <span className="font-medium text-ink">breadcrumbParents：</span>
                菜单保持平级，仅面包屑补层级 —— 适合详情/编辑这类「逻辑从属但入口独立」的页面。
              </li>
            </ul>
            <div className="mt-3 rounded-lg border border-line bg-canvas px-3 py-2.5 font-mono text-[11px] leading-relaxed text-muted">
              resolveBreadcrumb('{pathname}')<br />
              → {JSON.stringify(parts)}
            </div>
          </Card>
        </div>
      </div>
    </>
  )
}
