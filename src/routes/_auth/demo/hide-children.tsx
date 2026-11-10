import { createFileRoute } from '@tanstack/react-router'
import { EyeOff, Link2 } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { DemoBlock } from '@/components/shared/demo-block'
import { PageHeader } from '@/components/shared/page-header'

export const Route = createFileRoute('/_auth/demo/hide-children')({
  component: Page,
})

function Page() {
  return (
    <>
      <PageHeader
        eyebrow={<span>演示 › 功能</span>}
        title="隐藏子菜单"
        description="hideChildren：节点拥有子路由，但侧边栏不展开、只显示为单链接；子页面仅能通过 URL 直达（常用于详情页、回调页）。"
      />

      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-7">
          <DemoBlock
            title="配置方式"
            desc="左侧菜单「演示 › 功能 › 隐藏子菜单」就是本页 —— 它下面其实挂了两个子页面，但菜单里看不到"
            code={`{
  label: '隐藏子菜单',
  to: '/demo/hide-children',
  icon: 'hideMenu',
  hideChildren: true,          // ← 关键：折叠为单链接
  children: [
    { label: '子菜单 A（隐藏）', to: '/demo/hide-children/a' },
    { label: '子菜单 B（隐藏）', to: '/demo/hide-children/b' },
  ],
}`}
          >
            <div className="space-y-2.5 text-[12.5px] leading-relaxed text-muted">
              <p>
                看左侧菜单 —— 「隐藏子菜单」没有展开箭头，点击直接进入本页；
                但它确实带着两个子路由，只是不渲染在菜单里。
              </p>
              <p>典型场景：</p>
              <ul className="ml-4 list-disc space-y-1 text-[12px]">
                <li>详情页（<code className="font-mono">/tasks/:id</code> 类动态页，不该出现在菜单）</li>
                <li>OAuth 回调页、打印页等一次性页面</li>
                <li>面包屑仍保留完整层级，URL 直达时不会「迷路」</li>
              </ul>
            </div>
          </DemoBlock>
        </div>

        <div className="col-span-5">
          <Card className="p-5">
            <div className="flex items-center gap-2">
              <EyeOff className="h-4 w-4 text-brand-600" />
              <div className="text-[13px] font-semibold text-ink">直达隐藏子页面</div>
            </div>
            <p className="mt-2 text-[11.5px] leading-relaxed text-muted">
              这两个链接演示「菜单里没有，但 URL 可达」—— 访问后左侧菜单仍高亮「隐藏子菜单」本项。
            </p>
            <div className="mt-3 space-y-2">
              <a
                href="/demo/hide-children/a"
                className="flex items-center gap-2 rounded-lg border border-line px-3 py-2.5 font-mono text-[11.5px] text-brand-600 transition-colors hover:bg-hover"
              >
                <Link2 className="h-3.5 w-3.5" />
                /demo/hide-children/a
              </a>
              <a
                href="/demo/hide-children/b"
                className="flex items-center gap-2 rounded-lg border border-line px-3 py-2.5 font-mono text-[11.5px] text-brand-600 transition-colors hover:bg-hover"
              >
                <Link2 className="h-3.5 w-3.5" />
                /demo/hide-children/b
              </a>
            </div>
          </Card>
        </div>
      </div>
    </>
  )
}
