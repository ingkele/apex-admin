import * as React from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { DemoBlock } from '@/components/shared/demo-block'
import { PageHeader } from '@/components/shared/page-header'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Info, MessageSquareMore } from 'lucide-react'

export const Route = createFileRoute('/_auth/examples/tippy')({
  component: Page,
})

type Dir = 'top' | 'bottom' | 'left' | 'right'

/** 轻提示 —— 纯 CSS 悬浮气泡（group-hover），零依赖等价 vben Tippy 用法 */
function Tooltip({
  text,
  dir = 'top',
  children,
}: {
  text: string
  dir?: Dir
  children: React.ReactNode
}) {
  const pos: Record<Dir, string> = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  }
  const arrow: Record<Dir, string> = {
    top: 'top-full left-1/2 -translate-x-1/2 border-t-slate-800',
    bottom: 'bottom-full left-1/2 -translate-x-1/2 border-b-slate-800',
    left: 'left-full top-1/2 -translate-y-1/2 border-l-slate-800',
    right: 'right-full top-1/2 -translate-y-1/2 border-r-slate-800',
  }
  return (
    <span className="group relative inline-flex">
      {children}
      <span
        role="tooltip"
        className={cn(
          'pointer-events-none absolute z-30 w-max max-w-[220px] rounded-md bg-slate-800 px-2.5 py-1.5 text-[11px] leading-snug text-white opacity-0 shadow-lg transition-opacity duration-150 group-hover:opacity-100 dark:bg-slate-700',
          pos[dir],
        )}
      >
        {text}
        <span
          className={cn(
            'absolute h-0 w-0 border-4 border-transparent',
            arrow[dir],
          )}
        />
      </span>
    </span>
  )
}

/** 点击弹出层 —— 受控 popover，点外部关闭 */
function Popover({
  title,
  children,
  trigger,
}: {
  title: string
  children: React.ReactNode
  trigger: React.ReactNode
}) {
  const [open, setOpen] = React.useState(false)
  const wrapRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    if (!open) return
    const onDown = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('mousedown', onDown)
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('mousedown', onDown)
      window.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <div ref={wrapRef} className="relative inline-flex">
      <span onClick={() => setOpen((v) => !v)} className="inline-flex cursor-pointer">
        {trigger}
      </span>
      {open ? (
        <div className="absolute left-1/2 top-full z-30 mt-2 w-[240px] -translate-x-1/2 rounded-lg border border-line bg-surface p-3 shadow-pop">
          <div className="text-[12px] font-semibold text-ink">{title}</div>
          <div className="mt-1.5 text-[11px] leading-relaxed text-muted">{children}</div>
          <div className="mt-2.5 flex justify-end">
            <Button size="sm" variant="outline" className="h-6 px-2 text-[10.5px]" onClick={() => setOpen(false)}>
              知道了
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  )
}

function Page() {
  return (
    <>
      <PageHeader
        eyebrow={<span>示例 › Tippy · 悬浮提示与点击弹层（CSS 实现，零依赖）</span>}
        title="Tippy"
        description="悬浮提示四方向 + 点击弹层；vben 用 Tippy.js，这里用纯 CSS group-hover / 受控 popover 等价实现。"
      />

      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-6">
          <DemoBlock
            id="tippy-hover"
            title="悬浮提示（四方向）"
            desc="hover 触发，自动淡入；支持 top / bottom / left / right"
            code={`<Tooltip text="这是提示" dir="top">
  <Button>悬浮我</Button>
</Tooltip>
// 实现：group-hover + absolute 气泡 + CSS 箭头`}
          >
            <div className="flex flex-wrap items-center gap-3">
              <Tooltip text="上方提示：部署于今晚 02:00 进行">
                <Button size="sm" variant="outline">上</Button>
              </Tooltip>
              <Tooltip text="下方提示：当前配额剩余 18%" dir="bottom">
                <Button size="sm" variant="outline">下</Button>
              </Tooltip>
              <Tooltip text="左侧提示：点击查看调用链" dir="left">
                <Button size="sm" variant="outline">左</Button>
              </Tooltip>
              <Tooltip text="右侧提示：共 12 条记录" dir="right">
                <Button size="sm" variant="outline">右</Button>
              </Tooltip>
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <Tooltip text="图标 + 提示：健康检查已通过，全部实例正常">
                <span className="inline-flex cursor-help items-center gap-1.5 text-[11.5px] text-brand-600 dark:text-brand-400">
                  <Info className="h-3.5 w-3.5" /> 服务状态
                </span>
              </Tooltip>
              <Tooltip text="disabled 元素用 span 包裹后再挂提示（原生 disabled 不触发鼠标事件）">
                <span className="inline-flex">
                  <Button size="sm" variant="outline" disabled>禁用按钮</Button>
                </span>
              </Tooltip>
            </div>
            <p className="mt-4 text-[10.5px] leading-relaxed text-muted">
              提示气泡是纯样式实现：父容器 <code className="mx-1 rounded bg-surface px-1 py-0.5 text-[10px] text-ink">group</code>，
              气泡 <code className="mx-1 rounded bg-surface px-1 py-0.5 text-[10px] text-ink">group-hover:opacity-100</code> 淡入，
              箭头用 border 透明边拼三角。
            </p>
          </DemoBlock>
        </div>

        <div className="col-span-6">
          <DemoBlock
            id="tippy-popover"
            title="点击弹层"
            desc="点击触发、点外部或 Esc 关闭；适合放说明、操作入口"
            code={`<Popover title="配额说明" trigger={<Button>点击我</Button>}>
  长文本说明……
</Popover>`}
          >
            <div className="flex flex-wrap items-center gap-3">
              <Popover
                title="本月调用配额"
                trigger={
                  <Button size="sm" variant="outline">
                    <MessageSquareMore className="h-3.5 w-3.5" /> 查看配额说明
                  </Button>
                }
              >
                总配额 500 万 tokens，已使用 410 万（82%）。按当前速率预计 11 天后耗尽，
                可在「系统参数 › 配额管理」申请提升。
              </Popover>
              <Popover
                title="字段说明"
                trigger={<Button size="sm" variant="link" className="px-0">什么是幂等键？</Button>}
              >
                幂等键（Idempotency Key）用于防止重复提交：同一键的请求只执行一次，
                重复调用直接返回首次结果。
              </Popover>
            </div>

            <div className="mt-5 space-y-2 rounded-lg border border-line bg-canvas/40 px-4 py-3">
              <div className="text-[11px] font-medium text-ink">与悬浮提示的分工</div>
              <ul className="space-y-1 text-[10.5px] leading-relaxed text-muted">
                <li>· <b className="text-ink">悬浮提示</b>：纯说明性短文本，鼠标移开即消失</li>
                <li>· <b className="text-ink">点击弹层</b>：含长文本 / 链接 / 操作，需要用户停留阅读</li>
                <li>· 触屏设备没有 hover，重要说明优先用点击弹层</li>
              </ul>
            </div>
          </DemoBlock>
        </div>
      </div>
    </>
  )
}
