import { createFileRoute } from '@tanstack/react-router'
import { SquareArrowOutUpRight } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { DemoBlock } from '@/components/shared/demo-block'
import { PageHeader } from '@/components/shared/page-header'

export const Route = createFileRoute('/_auth/demo/new-window')({
  component: Page,
})

/** 站内路由新窗口打开：完整加载（新窗口是独立会话，SPA 状态不共享） */
const TARGETS = [
  { path: '/dashboard', label: '工作台' },
  { path: '/tasks', label: '任务列表' },
  { path: '/analytics', label: '分析页' },
  { path: '/about', label: '关于' },
]

function Page() {
  return (
    <>
      <PageHeader
        eyebrow={<span>演示 › 功能</span>}
        title="新窗口打开"
        description="菜单项配置 target: '_blank' 以新窗口打开站内路由；页面里也可用 window.open 打开任意页面。"
      />

      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-7">
          <DemoBlock
            title="菜单配置"
            desc="左侧菜单「演示 › 功能 › 新窗口打开」本身就是一个 target 菜单项 —— 点击它时本页开在新窗口里"
            code={`{
  label: '新窗口打开',
  to: '/demo/new-window',
  icon: 'newWindow',
  target: '_blank',   // ← 站内路由以新窗口打开
}`}
          >
            <p className="text-[12.5px] leading-relaxed text-muted">
              如果你正是从左侧菜单点进来的，会注意到浏览器开了个新标签页 ——
              这就是 <code className="font-mono">target: '_blank'</code> 的效果。
              与外链（external）的区别：它走站内路由地址，只是不挤掉当前工作区；
              适合「对照操作」场景，比如一边看分析页一边操作任务。
            </p>
          </DemoBlock>

          <DemoBlock
            title="页面内打开新窗口"
            desc="window.open(location.origin + path)，新窗口是独立会话，重新走一遍加载"
          >
            <div className="flex flex-wrap gap-2.5">
              {TARGETS.map((t) => (
                <button
                  key={t.path}
                  type="button"
                  onClick={() => window.open(t.path, '_blank', 'noopener')}
                  className="flex items-center gap-2 rounded-lg border border-line bg-surface px-3.5 py-2.5 text-[12.5px] text-ink transition-colors hover:border-brand-300 hover:bg-brand-50/60 dark:hover:border-brand-500/40 dark:hover:bg-brand-500/10"
                >
                  <SquareArrowOutUpRight className="h-3.5 w-3.5 text-muted" />
                  {t.label}
                  <code className="font-mono text-[10px] text-soft">{t.path}</code>
                </button>
              ))}
            </div>
          </DemoBlock>
        </div>

        <div className="col-span-5">
          <Card className="p-5">
            <div className="text-[13px] font-semibold text-ink">行为说明</div>
            <ul className="mt-2.5 space-y-2 text-[11.5px] leading-relaxed text-muted">
              <li>· <span className="font-medium text-ink">独立会话：</span>新窗口整页加载，localStorage（主题/登录态）共享，但内存态（页签栏、表单草稿）不共享；</li>
              <li>· <span className="font-medium text-ink">noopener：</span>window.open 第三参带 <code className="font-mono">noopener</code>，防止新窗口反向操作 <code className="font-mono">window.opener</code>；</li>
              <li>· <span className="font-medium text-ink">多页签也独立：</span>新窗口的页签栏从工作台重新开始（sessionStorage 按标签页隔离），这正是预期行为。</li>
            </ul>
          </Card>
        </div>
      </div>
    </>
  )
}
