import { createFileRoute } from '@tanstack/react-router'
import { EyeOff } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { PageHeader } from '@/components/shared/page-header'

export const Route = createFileRoute('/_auth/demo/hide-children/b')({
  component: Page,
})

function Page() {
  return (
    <>
      <PageHeader
        eyebrow={<span>演示 › 功能 › 隐藏子菜单</span>}
        title="子菜单 B（隐藏页）"
        description="第二个隐藏子页面，同样只可 URL 直达。"
      />
      <Card className="p-6">
        <div className="flex items-center gap-2.5">
          <EyeOff className="h-4 w-4 text-brand-600" />
          <div className="text-[13.5px] font-semibold text-ink">隐藏子页面 · B</div>
        </div>
        <p className="mt-3 text-[12.5px] leading-relaxed text-muted">
          路由 <code className="font-mono">/demo/hide-children/b</code>。
          适合放回调页、打印页这类「流程中间态」—— 用户不需要从菜单进入，但需要能被链接到。
        </p>
      </Card>
    </>
  )
}
