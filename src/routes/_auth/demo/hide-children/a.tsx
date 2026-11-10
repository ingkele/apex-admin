import { createFileRoute } from '@tanstack/react-router'
import { EyeOff } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { PageHeader } from '@/components/shared/page-header'

export const Route = createFileRoute('/_auth/demo/hide-children/a')({
  component: Page,
})

function Page() {
  return (
    <>
      <PageHeader
        eyebrow={<span>演示 › 功能 › 隐藏子菜单</span>}
        title="子菜单 A（隐藏页）"
        description="这个页面不会出现在左侧菜单里，只能通过 URL 直达 —— 但面包屑与菜单高亮仍然正常。"
      />
      <Card className="p-6">
        <div className="flex items-center gap-2.5">
          <EyeOff className="h-4 w-4 text-brand-600" />
          <div className="text-[13.5px] font-semibold text-ink">隐藏子页面 · A</div>
        </div>
        <p className="mt-3 text-[12.5px] leading-relaxed text-muted">
          路由 <code className="font-mono">/demo/hide-children/a</code>。
          注意顶部面包屑仍显示完整层级「演示 › 功能 › 隐藏子菜单 › 子菜单 A」，
          左侧菜单高亮「隐藏子菜单」—— 这就是 hideChildren 的意义：入口收起，导航链路不丢。
        </p>
      </Card>
    </>
  )
}
