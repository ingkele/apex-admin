import * as React from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { toast } from 'sonner'
import { DemoBlock } from '@/components/shared/demo-block'
import { PageHeader } from '@/components/shared/page-header'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { CheckCircle2, RefreshCw, RotateCw } from 'lucide-react'

export const Route = createFileRoute('/_auth/examples/captcha/rotate')({
  component: Page,
})

const HANDLE_W = 44 // px，与 w-11 对应
const TOLERANCES = [3, 5, 8] as const

type Status = 'idle' | 'dragging' | 'success' | 'failed'
type Attempt = { seq: number; ok: boolean; detail: string; at: string }

/** 画演示底图：指北箭头场景（canvas 手绘，红色箭头指向"上"，转正即验证目标） */
function drawScene(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  const S = canvas.width
  // 底色渐变
  const bg = ctx.createLinearGradient(0, 0, 0, S)
  bg.addColorStop(0, '#0f2b4d')
  bg.addColorStop(0.55, '#2563a8')
  bg.addColorStop(1, '#7db8e8')
  ctx.fillStyle = bg
  ctx.fillRect(0, 0, S, S)
  // 同心圆参考
  ctx.strokeStyle = 'rgba(255,255,255,0.14)'
  ctx.lineWidth = 1
  for (let r = 30; r <= 90; r += 30) {
    ctx.beginPath()
    ctx.arc(S / 2, S / 2, r, 0, Math.PI * 2)
    ctx.stroke()
  }
  // 十字参考线
  ctx.beginPath()
  ctx.moveTo(S / 2, 8)
  ctx.lineTo(S / 2, S - 8)
  ctx.moveTo(8, S / 2)
  ctx.lineTo(S - 8, S / 2)
  ctx.stroke()
  // 指北箭头（红色，指向"上"）
  ctx.fillStyle = '#ef4444'
  ctx.beginPath()
  ctx.moveTo(S / 2, 26)
  ctx.lineTo(S / 2 + 26, 88)
  ctx.lineTo(S / 2 + 10, 78)
  ctx.lineTo(S / 2 + 10, S - 34)
  ctx.lineTo(S / 2 - 10, S - 34)
  ctx.lineTo(S / 2 - 10, 78)
  ctx.lineTo(S / 2 - 26, 88)
  ctx.closePath()
  ctx.fill()
  // "北"字标
  ctx.fillStyle = '#fff'
  ctx.font = 'bold 18px sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText('北', S / 2, 52)
  // 外框
  ctx.strokeStyle = 'rgba(255,255,255,0.35)'
  ctx.lineWidth = 2
  ctx.strokeRect(1, 1, S - 2, S - 2)
}

function normalize(deg: number) {
  return ((deg % 360) + 360) % 360
}

/** 旋转验证：图片被随机旋转，拖动滑块把红色指北箭头转回竖直方向 */
function Page() {
  const canvasRef = React.useRef<HTMLCanvasElement>(null)
  const trackRef = React.useRef<HTMLDivElement>(null)
  const draggingRef = React.useRef(false)
  const [offset, setOffset] = React.useState(() => 30 + Math.random() * 300) // 初始旋转角
  const [user, setUser] = React.useState(0) // 用户旋转量 0~359
  const [tol, setTol] = React.useState<(typeof TOLERANCES)[number]>(5)
  const [status, setStatus] = React.useState<Status>('idle')
  const [attempts, setAttempts] = React.useState<Attempt[]>([])

  const done = status === 'success'
  const displayed = normalize(offset + user)
  const error = Math.min(displayed, 360 - displayed) // 与竖直方向的夹角

  React.useEffect(() => {
    if (canvasRef.current) drawScene(canvasRef.current)
  }, [])

  const verify = React.useCallback(() => {
    const ok = error <= tol
    setStatus(ok ? 'success' : 'failed')
    setAttempts((prev) => [
      {
        seq: prev.length + 1,
        ok,
        detail: ok ? `偏差 ${error.toFixed(1)}°，在容差 ±${tol}° 内` : `偏差 ${error.toFixed(1)}°，超出容差 ±${tol}°`,
        at: new Date().toLocaleTimeString(),
      },
      ...prev,
    ])
    if (ok) toast.success('角度正确，验证通过')
    else toast.error('角度未转正，请继续调整')
    return ok
  }, [error, tol])

  const posFromEvent = (e: React.PointerEvent) => {
    const box = trackRef.current?.getBoundingClientRect()
    if (!box) return 0
    const travel = box.width - HANDLE_W
    const rel = e.clientX - box.left - HANDLE_W / 2
    return Math.min(Math.max(0, (rel / travel) * 359), 359)
  }

  const onDown = (e: React.PointerEvent) => {
    if (done) return
    draggingRef.current = true
    e.currentTarget.setPointerCapture(e.pointerId)
    setStatus('dragging')
  }
  const onMove = (e: React.PointerEvent) => {
    if (!draggingRef.current || done) return
    setUser(posFromEvent(e))
  }
  const onUp = () => {
    if (!draggingRef.current) return
    draggingRef.current = false
    if (!done) setStatus('idle')
  }

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (done) return
    const step = e.shiftKey ? 10 : 2
    let next: number | null = null
    if (e.key === 'ArrowRight' || e.key === 'ArrowUp') next = user + step
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') next = user - step
    else if (e.key === 'Home') next = 0
    else if (e.key === 'End') next = 359
    else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      verify()
      return
    }
    if (next !== null) {
      e.preventDefault()
      setUser(normalize(next))
      if (status !== 'dragging') setStatus('dragging')
    }
  }

  const regenerate = () => {
    setOffset(30 + Math.random() * 300)
    setUser(0)
    setStatus('idle')
    setAttempts([])
    toast('已生成新的随机旋转角')
  }

  return (
    <div>
      <PageHeader
        eyebrow="示例 / 验证码"
        title="旋转验证"
        description="图片被随机旋转，拖动滑块把红色指北箭头转回竖直方向；指北针场景由 canvas 手绘，容差可调。"
        actions={
          <Button variant="outline" size="sm" onClick={regenerate} data-testid="captcha-regen">
            <RefreshCw className="h-3.5 w-3.5" />
            换一张
          </Button>
        }
      />

      <div className="grid gap-4">
        <DemoBlock
          id="captcha-rotate"
          title="基础用法"
          desc="拖动角度滑块实时旋转图片，点击「校验角度」判断是否转正；也可用键盘方向键微调后回车。"
        >
          <div className="mx-auto flex max-w-2xl flex-col items-center" data-testid="captcha-rotate">
            {/* 旋转画布 */}
            <div className="relative h-[200px] w-[200px]">
              <canvas
                ref={canvasRef}
                width={200}
                height={200}
                data-testid="captcha-rotate-canvas"
                data-offset={offset.toFixed(1)}
                className={cn(
                  'h-[200px] w-[200px] rounded-lg border border-line shadow-sm',
                  done && 'ring-2 ring-emerald-500/50',
                )}
                style={{ transform: `rotate(${displayed}deg)`, transition: draggingRef.current ? 'none' : 'transform 80ms linear' }}
              />
            </div>

            {/* 角度读数 */}
            <div className="mt-3 flex items-center gap-3 text-[11.5px]">
              <span className="text-muted">
                当前偏差 <span className={cn('font-semibold text-ink', done && 'text-emerald-600')}>{error.toFixed(1)}°</span>
              </span>
              <Badge variant={done ? 'green' : status === 'failed' ? 'red' : status === 'dragging' ? 'brand' : 'gray'} data-testid="captcha-status">
                {done ? '验证通过' : status === 'failed' ? '验证失败' : status === 'dragging' ? '调整中' : '待校验'}
              </Badge>
            </div>

            {/* 角度滑块 */}
            <div
              ref={trackRef}
              className="relative mt-4 h-10 w-full max-w-md select-none rounded-lg border border-line bg-canvas"
            >
              <div className="absolute inset-y-0 left-0 right-11">
                <div className="absolute inset-y-0 left-0 rounded-l-md bg-brand-600/15" style={{ width: `${(user / 359) * 100}%` }} />
                {/* 竖直（0°/360°）刻度 */}
                <div className="absolute inset-y-1.5 left-0 w-px bg-brand-600/50" />
                <div className="absolute inset-y-1.5 right-0 w-px bg-brand-600/50" />
                <div
                  role="slider"
                  tabIndex={done ? -1 : 0}
                  aria-label="旋转角度"
                  aria-valuemin={0}
                  aria-valuemax={359}
                  aria-valuenow={Math.round(user)}
                  data-testid="captcha-rotate-handle"
                  className={cn(
                    'absolute inset-y-0 left-0 flex w-11 cursor-grab touch-none items-center justify-center rounded-lg border border-line bg-surface shadow-sm active:cursor-grabbing',
                    done && 'cursor-default border-emerald-500/60 bg-emerald-50',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600/40',
                  )}
                  style={{ left: `${(user / 359) * 100}%` }}
                  onPointerDown={onDown}
                  onPointerMove={onMove}
                  onPointerUp={onUp}
                  onKeyDown={onKeyDown}
                >
                  <RotateCw className={cn('h-4 w-4 text-muted', done && 'text-emerald-600')} />
                </div>
              </div>
            </div>

            {/* 容差 + 校验 */}
            <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
              <span className="text-[11px] text-soft">容差</span>
              {TOLERANCES.map((t) => (
                <Button
                  key={t}
                  size="sm"
                  variant={tol === t ? 'primary' : 'ghost'}
                  onClick={() => setTol(t)}
                  data-testid={`captcha-tol-${t}`}
                >
                  ±{t}°
                </Button>
              ))}
              <Button size="sm" variant="primary" onClick={verify} disabled={done} data-testid="captcha-verify">
                <CheckCircle2 className="h-3.5 w-3.5" />
                校验角度
              </Button>
            </div>

            <div className="mt-2 text-[10.5px] text-soft">方向键 ±2°（Shift ±10°）· Enter 校验 · 红色箭头竖直朝上即为正确</div>
          </div>
        </DemoBlock>

        <DemoBlock id="captcha-rotate-log" title="验证记录" desc="每次校验留痕，容差越小难度越高。">
          {attempts.length === 0 ? (
            <div className="py-4 text-center text-[11.5px] text-soft">暂无记录，调整角度后点击「校验角度」</div>
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
