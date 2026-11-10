import * as React from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { DemoBlock, Row } from '@/components/shared/demo-block'
import { PageHeader } from '@/components/shared/page-header'
import { Button } from '@/components/ui/button'
import { Skeleton, TableSkeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { LoaderCircle } from 'lucide-react'

export const Route = createFileRoute('/_auth/examples/loading')({
  component: Page,
})

function Page() {
  const [btnLoading, setBtnLoading] = React.useState(false)
  const [overlay, setOverlay] = React.useState(false)
  const [skeletonKey, setSkeletonKey] = React.useState(0)

  const submit = () => {
    setBtnLoading(true)
    window.setTimeout(() => setBtnLoading(false), 1600)
  }

  const toggleOverlay = () => {
    setOverlay(true)
    window.setTimeout(() => setOverlay(false), 2000)
  }

  return (
    <>
      <PageHeader
        eyebrow={<span>示例 › Loading · 加载态的四种形态</span>}
        title="Loading"
        description="按钮加载、区域遮罩、骨架屏、尺寸阶梯 —— 加载态统一用 LoaderCircle 旋转 + 骨架屏占位。"
      />

      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-6 space-y-4">
          <DemoBlock
            id="loading-spinner"
            title="Spinner 尺寸"
            desc="图标型加载指示器，四档尺寸适配按钮、卡片、页面"
            code={`<LoaderCircle className="h-4 w-4 animate-spin" />
<LoaderCircle className="h-5 w-5 animate-spin" />
<LoaderCircle className="h-6 w-6 animate-spin" />
<LoaderCircle className="h-8 w-8 animate-spin" />`}
          >
            <Row label="尺寸阶梯">
              {['h-4 w-4', 'h-5 w-5', 'h-6 w-6', 'h-8 w-8'].map((size) => (
                <div key={size} className="flex flex-col items-center gap-1.5">
                  <LoaderCircle className={cn(size, 'animate-spin text-brand-500')} />
                  <span className="font-mono text-[9px] text-soft">{size.split(' ')[0].slice(2)}px</span>
                </div>
              ))}
            </Row>
            <Row label="语义色">
              {[
                ['text-brand-500', 'brand'],
                ['text-emerald-500', 'success'],
                ['text-amber-500', 'warning'],
                ['text-rose-500', 'danger'],
              ].map(([cls, label]) => (
                <div key={label} className="flex items-center gap-1.5">
                  <LoaderCircle className={cn('h-4 w-4 animate-spin', cls)} />
                  <span className="text-[10px] text-soft">{label}</span>
                </div>
              ))}
            </Row>
          </DemoBlock>

          <DemoBlock
            id="loading-button"
            title="按钮加载"
            desc="提交期间禁用 + spinner + 文案切换，防重复提交"
            code={`<Button disabled={loading} onClick={submit}>
  {loading && <LoaderCircle className="h-3.5 w-3.5 animate-spin" />}
  {loading ? '提交中…' : '提交'}
</Button>`}
          >
            <div className="flex flex-wrap gap-2">
              <Button size="sm" onClick={submit} disabled={btnLoading}>
                {btnLoading ? (
                  <>
                    <LoaderCircle className="h-3.5 w-3.5 animate-spin" /> 提交中…
                  </>
                ) : (
                  '提交'
                )}
              </Button>
              <Button size="sm" variant="danger" onClick={submit} disabled={btnLoading}>
                {btnLoading ? (
                  <>
                    <LoaderCircle className="h-3.5 w-3.5 animate-spin" /> 删除中…
                  </>
                ) : (
                  '删除'
                )}
              </Button>
              <Button size="sm" variant="outline" disabled>
                常规禁用
              </Button>
            </div>
            <p className="mt-3 text-[10.5px] text-muted">
              加载中的按钮同时禁用点击（disabled），从交互层面杜绝重复提交。
            </p>
          </DemoBlock>
        </div>

        <div className="col-span-6 space-y-4">
          <DemoBlock
            id="loading-overlay"
            title="区域遮罩加载"
            desc="内容保留上下文，半透明遮罩 + 居中 spinner"
            code={`<div className="relative">
  {content}
  {loading && (
    <div className="absolute inset-0 flex items-center justify-center bg-surface/60">
      <LoaderCircle className="h-6 w-6 animate-spin text-brand-500" />
    </div>
  )}
</div>`}
          >
            <Button size="sm" variant="outline" onClick={toggleOverlay} disabled={overlay}>
              {overlay ? '刷新中…' : '模拟刷新（2 秒）'}
            </Button>
            <div className="relative mt-3 overflow-hidden rounded-lg border border-line">
              <table className="w-full text-[11px]">
                <thead>
                  <tr className="border-b border-line bg-canvas/40 text-left text-soft">
                    <th className="px-3 py-2 font-medium">服务</th>
                    <th className="px-3 py-2 font-medium">实例</th>
                    <th className="px-3 py-2 font-medium">状态</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['vector-index-svc', '4', '健康'],
                    ['model-gateway', '2', '降级'],
                    ['audit-log-svc', '3', '健康'],
                  ].map(([n, r, s]) => (
                    <tr key={n} className="border-b border-line/60 last:border-0">
                      <td className="px-3 py-2 text-ink">{n}</td>
                      <td className="px-3 py-2 text-muted">{r}</td>
                      <td className="px-3 py-2 text-muted">{s}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {overlay ? (
                <div className="absolute inset-0 flex items-center justify-center bg-surface/60 backdrop-blur-[1px]">
                  <div className="flex flex-col items-center gap-2">
                    <LoaderCircle className="h-6 w-6 animate-spin text-brand-500" />
                    <span className="text-[10.5px] text-muted">加载中…</span>
                  </div>
                </div>
              ) : null}
            </div>
          </DemoBlock>

          <DemoBlock
            id="loading-skeleton"
            title="骨架屏"
            desc="首屏占位保持布局稳定，避免内容加载后的跳动"
            code={`<Skeleton className="h-4 w-[22%]" />
<TableSkeleton rows={3} cols={4} />`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10.5px] text-soft">文本 / 头像 / 表格三种骨架</span>
              <Button size="sm" variant="outline" className="h-7 px-2.5 text-[10.5px]" onClick={() => setSkeletonKey((k) => k + 1)}>
                重播
              </Button>
            </div>
            <div key={skeletonKey} className="mt-3 space-y-4">
              <div className="flex items-center gap-3">
                <Skeleton className="h-9 w-9 rounded-full" />
                <div className="flex-1 space-y-1.5">
                  <Skeleton className="h-3.5 w-[38%]" />
                  <Skeleton className="h-3 w-[62%]" />
                </div>
              </div>
              <div className="rounded-lg border border-line">
                <TableSkeleton rows={3} cols={4} />
              </div>
            </div>
          </DemoBlock>
        </div>
      </div>
    </>
  )
}
