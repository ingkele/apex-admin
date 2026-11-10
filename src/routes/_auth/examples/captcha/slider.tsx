import * as React from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { toast } from 'sonner'
import { DemoBlock } from '@/components/shared/demo-block'
import { PageHeader } from '@/components/shared/page-header'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { GripVertical, RefreshCw, ShieldCheck, Target } from 'lucide-react'

export const Route = createFileRoute('/_auth/examples/captcha/slider')({
  component: Page,
})

const HANDLE_W = 56 // px，与 w-14 对应
const ZONE_PCT = 12 // 目标区宽度（占行程区的 %）

type Status = 'idle' | 'dragging' | 'success' | 'failed'
type Attempt = { seq: number; ok: boolean; detail: string; at: string }

/** 滑块验证：拖动滑块使把手停在随机目标区内（Pointer Events + 键盘可达） */
function Page() {
  const [target, setTarget] = React.useState(() => 58 + Math.random() * 28)
  const [pct, setPct] = React.useState(0)
  const [status, setStatus] = React.useState<Status>('idle')
  const [attempts, setAttempts] = React.useState<Attempt[]>([])
  const trackRef = React.useRef<HTMLDivElement>(null)
  const draggingRef = React.useRef(false)

  const done = status === 'success'

  const verify = React.useCallback(
    (pos: number) => {
      const ok = Math.abs(pos - target) <= ZONE_PCT / 2
      setStatus(ok ? 'success' : 'failed')
      setAttempts((prev) => [
        {
          seq: prev.length + 1,
          ok,
          detail: ok
            ? `落在目标区（偏差 ${Math.abs(pos - target).toFixed(1)}%）`
            : `偏差 ${Math.abs(pos - target).toFixed(1)}%，超出容差`,
          at: new Date().toLocaleTimeString(),
        },
        ...prev,
      ])
      if (ok) toast.success('验证通过')
      else toast.error('未对准目标区，请重试')
      return ok
    },
    [target],
  )

  /** 行程区坐标：pct 为把手左边缘占「轨道宽 - 把手宽」的百分比 */
  const posFromEvent = (e: React.PointerEvent) => {
    const box = trackRef.current?.getBoundingClientRect()
    if (!box) return 0
    const travel = box.width - HANDLE_W
    const rel = e.clientX - box.left - HANDLE_W / 2
    return Math.min(Math.max(0, (rel / travel) * 100), 100)
  }

  const onDown = (e: React.PointerEvent) => {
    if (done) return
    draggingRef.current = true
    e.currentTarget.setPointerCapture(e.pointerId)
    setStatus('dragging')
  }

  const onMove = (e: React.PointerEvent) => {
    if (!draggingRef.current || done) return
    setPct(posFromEvent(e))
  }

  const onUp = (e: React.PointerEvent) => {
    if (!draggingRef.current) return
    draggingRef.current = false
    if (done) return
    const pos = posFromEvent(e)
    setPct(pos)
    verify(pos)
  }

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (done) return
    const step = e.shiftKey ? 8 : 2
    let next: number | null = null
    if (e.key === 'ArrowRight' || e.key === 'ArrowUp') next = pct + step
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') next = pct - step
    else if (e.key === 'Home') next = 0
    else if (e.key === 'End') next = 100
    else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      verify(pct)
      return
    }
    if (next !== null) {
      e.preventDefault()
      setPct(Math.min(Math.max(0, next), 100))
      if (status !== 'dragging') setStatus('dragging')
    }
  }

  const regenerate = () => {
    setTarget(58 + Math.random() * 28)
    setPct(0)
    setStatus('idle')
    setAttempts([])
    toast('已生成新的目标区')
  }

  return (
    <div>
      <PageHeader
        eyebrow="示例 / 验证码"
        title="滑块验证"
        description="按住滑块拖到随机目标区内松手即通过；支持键盘方向键微调、Enter 校验，全部图形本地绘制零依赖。"
        actions={
          <Button variant="outline" size="sm" onClick={regenerate} data-testid="captcha-regen">
            <RefreshCw className="h-3.5 w-3.5" />
            重新生成
          </Button>
        }
      />

      <div className="grid gap-4">
        <DemoBlock
          id="captcha-slider"
          title="基础用法"
          desc="拖拽滑块对准高亮目标区；拖动结束自动校验，失败可继续调整后再次松手。"
        >
          <div className="mx-auto max-w-2xl" data-testid="captcha-slider">
            {/* 状态行 */}
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2 text-[11.5px] text-muted">
                <ShieldCheck className="h-3.5 w-3.5 text-brand-600" />
                请将滑块拖动到目标区内
              </div>
              <Badge
                variant={done ? 'green' : status === 'failed' ? 'red' : status === 'dragging' ? 'brand' : 'gray'}
                data-testid="captcha-status"
              >
                {done ? '验证通过' : status === 'failed' ? '验证失败' : status === 'dragging' ? '拖动中' : '待验证'}
              </Badge>
            </div>

            {/* 轨道（内层 right-14 为行程区，坐标以「轨道宽 - 把手宽」为 100%） */}
            <div
              ref={trackRef}
              className="relative h-12 select-none rounded-lg border border-line bg-canvas"
              data-target={target.toFixed(1)}
            >
              <div className="absolute inset-y-0 left-0 right-14">
                {/* 进度填充 */}
                <div
                  className="absolute inset-y-0 left-0 rounded-l-md bg-brand-600/15"
                  style={{ width: `${pct}%` }}
                />
                {/* 目标区 */}
                <div
                  className={cn(
                    'absolute inset-y-1 rounded-md border-2 border-dashed border-brand-600/60 bg-brand-600/10',
                    done && 'border-emerald-500/70 bg-emerald-500/15',
                  )}
                  style={{ left: `${target - ZONE_PCT / 2}%`, width: `${ZONE_PCT}%` }}
                >
                  <div className="flex h-full items-center justify-center">
                    <Target className={cn('h-3.5 w-3.5 text-brand-600', done && 'text-emerald-600')} />
                  </div>
                </div>
                {/* 把手 */}
                <div
                  role="slider"
                  tabIndex={done ? -1 : 0}
                  aria-label="滑块验证"
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={Math.round(pct)}
                  data-testid="captcha-slider-handle"
                  className={cn(
                    'absolute inset-y-0 left-0 flex w-14 cursor-grab touch-none items-center justify-center rounded-lg border border-line bg-surface shadow-sm active:cursor-grabbing',
                    done && 'cursor-default border-emerald-500/60 bg-emerald-50',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600/40',
                  )}
                  style={{ left: `${pct}%` }}
                  onPointerDown={onDown}
                  onPointerMove={onMove}
                  onPointerUp={onUp}
                  onKeyDown={onKeyDown}
                >
                  <GripVertical className={cn('h-4 w-4 text-muted', done && 'text-emerald-600')} />
                </div>
              </div>
            </div>

            <div className="mt-2 flex items-center justify-between text-[10.5px] text-soft">
              <span>方向键 ±2%（Shift ±8%）· Enter 校验 · Home/End 两端</span>
              <span>目标区宽度 {ZONE_PCT}%（容差 ±{(ZONE_PCT / 2).toFixed(0)}%）</span>
            </div>
          </div>
        </DemoBlock>

        <DemoBlock id="captcha-slider-log" title="验证记录" desc="每次松手/Enter 校验都会留痕，方便观察容差与偏差。">
          {attempts.length === 0 ? (
            <div className="py-4 text-center text-[11.5px] text-soft">暂无记录，拖动滑块开始验证</div>
          ) : (
            <div className="divide-y divide-line" data-testid="captcha-log">
              {attempts.map((a) => (
                <div key={a.seq} className="flex items-center gap-3 py-2 text-[11.5px]">
                  <span className="w-8 text-soft">#{a.seq}</span>
                  <Badge variant={a.ok ? 'green' : 'red'}>{a.ok ? '通过' : '失败'}</Badge>
                  <span className="flex-1 text-muted">{a.detail}</span>
                  <span className="text-soft">{a.at}</span>
                </div>
              ))}
            </div>
          )}
        </DemoBlock>
      </div>
    </div>
  )
}
