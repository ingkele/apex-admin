import * as React from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { DemoBlock } from '@/components/shared/demo-block'
import { PageHeader } from '@/components/shared/page-header'
import { Button } from '@/components/ui/button'
import { AppSwitch } from '@/components/ui/switch'
import { cn } from '@/lib/utils'
import { RotateCcw } from 'lucide-react'

export const Route = createFileRoute('/_auth/examples/resize')({
  component: Page,
})

const MIN_W = 160
const MAX_W = 420
const DEFAULT_W = 260

function Page() {
  const [width, setWidth] = React.useState(DEFAULT_W)
  const [enabled, setEnabled] = React.useState(true)
  const [dragging, setDragging] = React.useState(false)
  const containerRef = React.useRef<HTMLDivElement>(null)
  const startRef = React.useRef({ x: 0, w: DEFAULT_W })

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!enabled) return
    startRef.current = { x: e.clientX, w: width }
    setDragging(true)
    e.currentTarget.setPointerCapture(e.pointerId)
  }

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragging) return
    const next = Math.min(MAX_W, Math.max(MIN_W, startRef.current.w + (e.clientX - startRef.current.x)))
    setWidth(next)
  }

  const onPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    setDragging(false)
    e.currentTarget.releasePointerCapture(e.pointerId)
  }

  return (
    <>
      <PageHeader
        eyebrow={<span>示例 › 拖动调整 · 分隔条拖拽改变面板宽度</span>}
        title="拖动调整"
        description="拖动中间分隔条调整左侧面板宽度（160–420px）；pointer 事件实现，支持触屏。"
      />

      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-12">
          <DemoBlock
            id="resize-panel"
            title="面板宽度拖拽"
            desc="拖动分隔条调整左侧面板宽度，范围约束 160–420px，双击分隔条复位"
            code={`onPointerDown → 记录起点；onPointerMove → clamp(160, 420)；onPointerMove → clamp(160, 420)；onPointerUp → 结束
// 约束
const next = Math.min(420, Math.max(160, startW + dx))`}
          >
            <div className="mb-3 flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2 text-[11.5px] text-muted">
                启用拖拽
                <AppSwitch checked={enabled} onCheckedChange={setEnabled} />
              </div>
              <div className="text-[11.5px] text-muted">
                当前宽度：<b className="text-ink">{width}px</b>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setWidth(DEFAULT_W)}
                disabled={width === DEFAULT_W}
              >
                <RotateCcw className="h-3.5 w-3.5" /> 复位
              </Button>
            </div>

            <div
              ref={containerRef}
              className="flex h-[260px] select-none overflow-hidden rounded-lg border border-line bg-canvas/30"
            >
              {/* 左侧面板 */}
              <div
                className="flex shrink-0 flex-col overflow-hidden bg-surface"
                style={{ width: `${width}px` }}
              >
                <div className="border-b border-line px-3.5 py-2.5 text-[11.5px] font-medium text-ink">
                  导航面板
                </div>
                <div className="space-y-1 p-2.5">
                  {['任务列表', '服务实例', '模型配置', '访问密钥', '审计日志'].map((item, i) => (
                    <div
                      key={item}
                      className={cn(
                        'truncate rounded-md px-2.5 py-1.5 text-[11.5px]',
                        i === 0 ? 'bg-brand-50 font-medium text-brand-700 dark:bg-brand-500/10 dark:text-brand-300' : 'text-muted',
                      )}
                    >
                      {item}
                    </div>
                  ))}
                </div>
              </div>

              {/* 分隔条 */}
              <div
                role="separator"
                aria-orientation="vertical"
                aria-label="拖动调整左侧宽度"
                aria-valuenow={width}
                aria-valuemin={MIN_W}
                aria-valuemax={MAX_W}
                onPointerDown={onPointerDown}
                onPointerMove={onPointerMove}
                onPointerUp={onPointerUp}
                onDoubleClick={() => enabled && setWidth(DEFAULT_W)}
                className={cn(
                  'group relative w-[7px] shrink-0 cursor-col-resize touch-none border-x border-line bg-canvas/60 transition-colors',
                  enabled ? 'hover:bg-brand-100 dark:hover:bg-brand-500/20' : 'cursor-not-allowed opacity-50',
                  dragging && 'bg-brand-100 dark:bg-brand-500/20',
                )}
              >
                <div
                  className={cn(
                    'absolute left-1/2 top-1/2 h-8 w-[3px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-slate-300 transition-colors dark:bg-slate-600',
                    (dragging || enabled) && 'group-hover:bg-brand-500',
                  )}
                />
              </div>

              {/* 右侧内容 */}
              <div className="flex min-w-0 flex-1 flex-col">
                <div className="border-b border-line px-4 py-2.5 text-[11.5px] font-medium text-ink">
                  内容区
                </div>
                <div className="flex flex-1 flex-col items-center justify-center gap-1.5 p-4 text-center">
                  <div className="text-[12px] text-muted">
                    拖动中间分隔条 → 左侧宽度实时变化
                  </div>
                  <div className="text-[11px] text-soft">
                    最小 {MIN_W}px · 最大 {MAX_W}px · 双击分隔条复位 {DEFAULT_W}px
                  </div>
                  <div className="mt-2 rounded-md bg-canvas/60 px-3 py-1.5 font-mono text-[11px] text-brand-600 dark:text-brand-400">
                    width: {width}px
                  </div>
                </div>
              </div>
            </div>

            <p className="mt-3 text-[10.5px] leading-relaxed text-muted">
              实现要点：pointer capture 保证拖出分隔条后事件不断；
              <code className="mx-1 rounded bg-surface px-1 py-0.5 text-[10px] text-ink">touch-none</code>
              避免触屏滚动抢占；宽度钳制在最小/最大值之间，防止拖到不可用。
            </p>
          </DemoBlock>
        </div>
      </div>
    </>
  )
}
