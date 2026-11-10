import { createFileRoute, useLocation } from '@tanstack/react-router'
import { Card } from '@/components/ui/card'
import { DemoBlock } from '@/components/shared/demo-block'
import { PageHeader } from '@/components/shared/page-header'
import { BreadcrumbPreview } from '@/components/shared/breadcrumb-preview'
import { resolveBreadcrumb } from '@/lib/route-meta'

export const Route = createFileRoute('/_auth/demo/breadcrumb/flat')({
  component: Page,
})

function Page() {
  const { pathname } = useLocation()
  const parts = resolveBreadcrumb(pathname)

  return (
    <>
      <PageHeader
        eyebrow={<span>演示 › 面包屑导航</span>}
        title="平级模式"
        description="导航节点配 breadcrumbFlat: true 后，面包屑只显示当前页标题，不带分组与父级链。"
      />

      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-7">
          <DemoBlock
            title="实时面包屑（本页）"
            desc="下方预览条就是顶栏此刻渲染的内容 —— 平级模式下只有一级"
            code={`// app.config.ts
{ label: '平级模式', to: '/demo/breadcrumb/flat',
  breadcrumbFlat: true }

// route-meta.ts
if (exact.flat) return [meta.title]  // 只返回标题`}
          >
            <BreadcrumbPreview parts={parts} />
            <p className="mt-3 text-[11.5px] leading-relaxed text-muted">
              适合「独立工具页」—— 与主业务层级无关的页面（如个人中心、关于），
              显示完整层级反而误导时用平级模式。
            </p>
          </DemoBlock>
        </div>

        <div className="col-span-5">
          <Card className="p-5">
            <div className="text-[13px] font-semibold text-ink">面包屑数据来源</div>
            <p className="mt-2 text-[11.5px] leading-relaxed text-muted">
              顶栏面包屑与多页签标题共用 <code className="font-mono">resolveRouteMeta</code>{' '}
              同一份解析（<code className="font-mono">src/lib/route-meta.ts</code>），
              不存在「页签叫 A、面包屑叫 B」的错位。
            </p>
            <div className="mt-3 rounded-lg border border-line bg-canvas px-3 py-2.5 font-mono text-[11px] leading-relaxed text-muted">
              resolveBreadcrumb('/demo/breadcrumb/flat')<br />
              → {JSON.stringify(parts)}
            </div>
          </Card>
        </div>
      </div>
    </>
  )
}
