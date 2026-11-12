import { createFileRoute } from '@tanstack/react-router'
import { IframePanel } from '@/components/shared/iframe-panel'
import { PageHeader } from '@/components/shared/page-header'
import { withBase } from '@/lib/utils'

export const Route = createFileRoute('/_auth/demo/iframe/local')({
  component: Page,
})

function Page() {
  return (
    <>
      <PageHeader
        eyebrow={<span>演示 › 外部页面 · 内嵌</span>}
        title="内嵌 · 本地演示页"
        description="iframe 承载与主应用独立的子页面（这里是 public/iframe-demo.html），共享主应用外壳与登录态。"
      />
      <IframePanel src={withBase('iframe-demo.html')} title="内嵌子页面演示" />
    </>
  )
}
