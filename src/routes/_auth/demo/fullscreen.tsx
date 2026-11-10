import { createFileRoute } from '@tanstack/react-router'
import * as React from 'react'
import { toast } from 'sonner'
import { Maximize, Minimize, Scan } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { DemoBlock } from '@/components/shared/demo-block'
import { PageHeader } from '@/components/shared/page-header'

export const Route = createFileRoute('/_auth/demo/fullscreen')({
  component: Page,
})

function Page() {
  const [isFullscreen, setIsFullscreen] = React.useState(() => !!document.fullscreenElement)

  React.useEffect(() => {
    const onChange = () => setIsFullscreen(!!document.fullscreenElement)
    document.addEventListener('fullscreenchange', onChange)
    return () => document.removeEventListener('fullscreenchange', onChange)
  }, [])

  const togglePage = async () => {
    try {
      if (document.fullscreenElement) await document.exitFullscreen()
      else await document.documentElement.requestFullscreen()
    } catch {
      toast.error('浏览器拒绝了全屏请求')
    }
  }

  const toggleElement = async (el: HTMLElement | null) => {
    if (!el) return
    try {
      if (document.fullscreenElement === el) await document.exitFullscreen()
      else await el.requestFullscreen()
    } catch {
      toast.error('浏览器拒绝了全屏请求')
    }
  }

  const cardRef = React.useRef<HTMLDivElement>(null)

  return (
    <>
      <PageHeader
        eyebrow={<span>演示 › 功能</span>}
        title="全屏"
        description="Fullscreen API 的两种粒度：整页全屏（大屏投放/专注模式）与元素级全屏（图片、报表、播放器）。"
      />

      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-7">
          <DemoBlock
            title="① 整页全屏"
            desc="document.documentElement.requestFullscreen()，Esc 或调用 exitFullscreen 退出"
            code={`const enter = () => document.documentElement.requestFullscreen()
const exit  = () => document.exitFullscreen()

// 状态监听：进出全屏都会触发
document.addEventListener('fullscreenchange', () => {
  setIsFullscreen(!!document.fullscreenElement)
})`}
          >
            <div className="flex flex-wrap items-center gap-3">
              <Button onClick={togglePage}>
                {isFullscreen ? <Minimize className="h-3.5 w-3.5" /> : <Maximize className="h-3.5 w-3.5" />}
                {isFullscreen ? '退出全屏' : '进入全屏'}
              </Button>
              <span className="rounded-md border border-line bg-canvas px-2.5 py-1 font-mono text-[11px] text-muted">
                fullscreenElement = {isFullscreen ? '<html>' : 'null'}
              </span>
            </div>
            <p className="mt-3 text-[11px] leading-relaxed text-soft">
              进入全屏后整个应用（含侧边栏/页签）都在全屏画布里；按 Esc 退出时上面的状态徽标会同步变化（fullscreenchange 监听）。
            </p>
          </DemoBlock>
        </div>

        <div className="col-span-5">
          <DemoBlock
            title="② 元素级全屏"
            desc="只把某个元素放大到全屏，常用于图表钻取 / 图片查看"
          >
            <div
              ref={cardRef}
              className="flex min-h-[180px] flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-line bg-canvas p-4"
            >
              <Scan className="h-8 w-8 text-brand-500/70" />
              <div className="text-center text-[11.5px] leading-relaxed text-muted">
                这个虚线卡片可以被单独全屏 ——<br />
                侧边栏和页签不会出现，只有它自己。
              </div>
              <Button variant="outline" size="sm" onClick={() => toggleElement(cardRef.current)}>
                <Maximize className="h-3 w-3" />
                全屏此卡片
              </Button>
            </div>
          </DemoBlock>
        </div>
      </div>

      <Card className="mt-4 p-5">
        <div className="text-[13px] font-semibold text-ink">注意事项</div>
        <ul className="mt-2.5 grid gap-2 text-[11.5px] leading-relaxed text-muted md:grid-cols-2">
          <li>· requestFullscreen 必须在用户手势里调用（点击/按键），页面加载时自动全屏会被浏览器拦截；</li>
          <li>· 部分浏览器返回的是 Promise，失败（如 iframe 无 allow="fullscreen"）要 catch；</li>
          <li>· iOS Safari 对元素级全屏支持有限（video 除外），投放场景建议做能力检测；</li>
          <li>· 全屏中浏览器自身的 UI（地址栏/标签栏）默认隐藏，Esc 是用户的第一退出方式，不要拦截。</li>
        </ul>
      </Card>
    </>
  )
}
