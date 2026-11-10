import { createFileRoute, useLocation, useNavigate } from '@tanstack/react-router'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { DemoBlock } from '@/components/shared/demo-block'
import { PageHeader } from '@/components/shared/page-header'
import { BreadcrumbPreview } from '@/components/shared/breadcrumb-preview'
import { resolveBreadcrumb } from '@/lib/route-meta'

export const Route = createFileRoute('/_auth/demo/breadcrumb/hierarchy')({
  component: Page,
})

function Page() {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const parts = resolveBreadcrumb(pathname)

  return (
    <>
      <PageHeader
        eyebrow={<span>演示 › 面包屑导航</span>}
        title="层级模式"
        description="默认模式：面包屑渲染「分组 › …父级链 › 页面」完整层级，层级来自导航树嵌套结构。"
      />

      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-7">
          <DemoBlock
            title="实时面包屑（本页）"
            desc="本页挂在「演示 › 面包屑导航」下，父级链自动进面包屑"
            code={`// 默认（不配 breadcrumbFlat）即层级模式：
// resolveBreadcrumb → [分组, ...父级链, 页面标题]

// 父级链来自导航树嵌套：
// 演示
//  └─ 面包屑导航      ← parents
//      └─ 层级模式    ← title`}
          >
            <BreadcrumbPreview parts={parts} />
            <div className="mt-3 flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => void navigate({ to: '/demo/breadcrumb/detail' })}
              >
                看层级模式详情
                <ArrowRight className="h-3 w-3" />
              </Button>
              <span className="text-[11px] text-soft">详情页会在这条链后面再加一级</span>
            </div>
          </DemoBlock>
        </div>

        <div className="col-span-5">
          <Card className="p-5">
            <div className="text-[13px] font-semibold text-ink">层级怎么算出来</div>
            <p className="mt-2 text-[11.5px] leading-relaxed text-muted">
              <code className="font-mono">flattenNav</code> 递归展开导航树时把父级标签逐层传下去，
              叶子节点登记完整 <code className="font-mono">parents</code> 链；
              菜单加一级嵌套，面包屑自动多一级 —— 不需要在页面里手写面包屑。
            </p>
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
