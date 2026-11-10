import * as React from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { toast } from 'sonner'
import { DemoBlock } from '@/components/shared/demo-block'
import { PageHeader } from '@/components/shared/page-header'
import { Button } from '@/components/ui/button'
import { Input, Label, Textarea } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { X } from 'lucide-react'

export const Route = createFileRoute('/_auth/examples/drawer')({
  component: Page,
})

/** 抽屉 —— 右侧滑出面板；embedded 模式在容器内定位（不遮全屏），默认 fixed 全屏遮罩 */
function AppDrawer({
  open,
  onOpenChange,
  title,
  description,
  children,
  footer,
  embedded = false,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  children: React.ReactNode
  footer?: React.ReactNode
  /** 嵌入式：面板与遮罩都约束在父容器内（父容器需 relative） */
  embedded?: boolean
}) {
  React.useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onOpenChange(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onOpenChange])

  return (
    <div className={cn(embedded ? 'absolute' : 'fixed', 'inset-0 z-40', !open && 'pointer-events-none')}>
      <div
        onClick={() => onOpenChange(false)}
        className={cn(
          'absolute inset-0 bg-slate-900/40 transition-opacity duration-200',
          open ? 'opacity-100' : 'opacity-0',
        )}
      />
      <div
        data-drawer-open={open ? 'true' : 'false'}
        className={cn(
          'absolute right-0 top-0 flex h-full w-[380px] max-w-full flex-col border-l border-line bg-surface shadow-pop transition-transform duration-200 ease-out',
          open ? 'translate-x-0' : 'translate-x-full',
        )}
      >
        <div className="flex items-start justify-between gap-3 border-b border-line px-5 py-4">
          <div>
            <div className="text-[14px] font-semibold text-ink">{title}</div>
            {description ? <p className="mt-1 text-[11px] text-muted">{description}</p> : null}
          </div>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="rounded-md p-1 text-soft transition hover:bg-hover hover:text-ink"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-4">{children}</div>
        {footer ? <div className="border-t border-line px-5 py-3.5">{footer}</div> : null}
      </div>
    </div>
  )
}

function Page() {
  const [basic, setBasic] = React.useState(false)
  const [form, setForm] = React.useState(false)
  const [dynamic, setDynamic] = React.useState(false)
  const [loaded, setLoaded] = React.useState(false)
  const [embedded, setEmbedded] = React.useState(false)

  // 动态内容：打开后模拟异步加载
  React.useEffect(() => {
    if (!dynamic) {
      setLoaded(false)
      return
    }
    const timer = window.setTimeout(() => setLoaded(true), 800)
    return () => window.clearTimeout(timer)
  }, [dynamic])

  return (
    <>
      <PageHeader
        eyebrow={<span>示例 › 抽屉 · 侧滑面板的四种典型用法</span>}
        title="抽屉"
        description="右侧滑出的轻量面板，适合详情、表单、分步操作；Esc / 遮罩 / × 均可关闭。"
      />

      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-6 space-y-4">
          <DemoBlock
            id="drawer-basic"
            title="基础抽屉"
            desc="查看详情类内容，底部固定操作区"
            code={`<AppDrawer open={open} onOpenChange={setOpen}
  title="任务详情" footer={<Button>重试</Button>}>
  …
</AppDrawer>`}
          >
            <Button size="sm" variant="outline" onClick={() => setBasic(true)}>
              查看任务详情
            </Button>
            <AppDrawer
              open={basic}
              onOpenChange={setBasic}
              title="任务详情"
              description="job-2f81 · 知识库增量同步"
              footer={
                <div className="flex justify-end gap-2">
                  <Button variant="outline" size="sm" onClick={() => setBasic(false)}>关闭</Button>
                  <Button size="sm" onClick={() => { setBasic(false); toast.success('已重新下发') }}>重试</Button>
                </div>
              }
            >
              <dl className="space-y-2.5 text-[12px]">
                {[
                  ['触发方式', '定时（每日 02:00）'],
                  ['开始时间', '2026-11-10 02:00:03'],
                  ['耗时', '12.4s'],
                  ['结果', '成功 · 新增 38 条 / 更新 5 条'],
                  ['执行节点', 'worker-cn-south-02'],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between gap-4 border-b border-line/60 pb-2">
                    <dt className="text-muted">{k}</dt>
                    <dd className="text-right text-ink">{v}</dd>
                  </div>
                ))}
              </dl>
            </AppDrawer>
          </DemoBlock>

          <DemoBlock
            id="drawer-form"
            title="表单抽屉"
            desc="窗内表单 + 底部提交/取消，提交成功自动收起"
            code={`<AppDrawer open={form} onOpenChange={setForm} title="编辑模型参数"
  footer={<Button onClick={submit}>保存</Button>}>
  <Input … />
</AppDrawer>`}
          >
            <Button size="sm" variant="outline" onClick={() => setForm(true)}>
              编辑模型参数
            </Button>
            <AppDrawer
              open={form}
              onOpenChange={setForm}
              title="编辑模型参数"
              description="gpt-4o · 渠道 A"
              footer={
                <div className="flex justify-end gap-2">
                  <Button variant="outline" size="sm" onClick={() => setForm(false)}>取消</Button>
                  <Button size="sm" onClick={() => { setForm(false); toast.success('参数已保存') }}>保存</Button>
                </div>
              }
            >
              <div className="space-y-3">
                <div>
                  <Label>温度（temperature）</Label>
                  <Input defaultValue="0.7" />
                </div>
                <div>
                  <Label>最大输出（max tokens）</Label>
                  <Input defaultValue="4096" />
                </div>
                <div>
                  <Label>系统提示词</Label>
                  <Textarea className="min-h-[80px]" defaultValue="你是一个严谨的中文助理。" />
                </div>
              </div>
            </AppDrawer>
          </DemoBlock>
        </div>

        <div className="col-span-6 space-y-4">
          <DemoBlock
            id="drawer-dynamic"
            title="动态内容"
            desc="打开后异步加载内容，加载前展示骨架屏占位"
            code={`useEffect(() => {
  if (open) fetchDetail().then(setData)
}, [open])`}
          >
            <Button size="sm" variant="outline" onClick={() => setDynamic(true)}>
              加载服务日志
            </Button>
            <AppDrawer
              open={dynamic}
              onOpenChange={setDynamic}
              title="服务日志"
              description={loaded ? '加载完成 · 最近 5 条' : '正在加载…'}
            >
              {loaded ? (
                <div className="space-y-2">
                  {[
                    '10:24:03 INFO  probe ok, latency 42ms',
                    '10:23:33 INFO  index segment merged (38 docs)',
                    '10:22:11 WARN  upstream retry 1/3',
                    '10:22:08 INFO  request accepted, trace 8f2c',
                    '10:21:55 INFO  cache warmed (1.2k keys)',
                  ].map((line) => (
                    <div key={line} className="rounded-md bg-canvas/60 px-3 py-2 font-mono text-[10.5px] text-muted">
                      {line}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-2.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-8 w-full" />
                  ))}
                </div>
              )}
            </AppDrawer>
          </DemoBlock>

          <DemoBlock
            id="drawer-embedded"
            title="嵌入式抽屉"
            desc="面板与遮罩约束在容器内部，不影响页面其他区域"
            code={`<div className="relative">
  <AppDrawer embedded open={open} onOpenChange={setOpen} … />
</div>`}
          >
            <Button size="sm" variant="outline" onClick={() => setEmbedded(true)}>
              在容器内打开
            </Button>
            <div className="relative mt-3 h-[180px] overflow-hidden rounded-lg border border-dashed border-line bg-canvas/40">
              <div className="flex h-full items-center justify-center text-[11px] text-muted">
                页面其他区域不受影响 —— 点击右侧面板外的深色区域关闭
              </div>
              <AppDrawer
                open={embedded}
                onOpenChange={setEmbedded}
                embedded
                title="嵌入式面板"
                description="absolute 定位于容器内"
                footer={
                  <div className="flex justify-end">
                    <Button variant="outline" size="sm" onClick={() => setEmbedded(false)}>关闭</Button>
                  </div>
                }
              >
                <p className="text-[12px] leading-relaxed text-muted">
                  嵌入式抽屉把遮罩和面板都约束在父容器（relative）内，适合表单设计器、预览区这类
                  不希望遮住整页的局部交互。
                </p>
              </AppDrawer>
            </div>
          </DemoBlock>
        </div>
      </div>
    </>
  )
}
