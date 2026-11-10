import { createFileRoute } from '@tanstack/react-router'
import { IframePanel } from '@/components/shared/iframe-panel'
import { PageHeader } from '@/components/shared/page-header'

export const Route = createFileRoute('/_auth/demo/iframe/tailwind')({
  component: Page,
})

function Page() {
  return (
    <>
      <PageHeader
        eyebrow={<span>演示 › 外部页面 · 内嵌</span>}
        title="内嵌 · Tailwindcss"
        description="演示内嵌第三方站点。第三方若设置了 X-Frame-Options 拒绝嵌入会白屏——这是浏览器安全策略，用「新窗口打开」兜底。"
      />
      <IframePanel src="https://tailwindcss.com" title="Tailwindcss 官网" />
    </>
  )
}
