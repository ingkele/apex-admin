import * as React from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { toast } from 'sonner'
import { DemoBlock } from '@/components/shared/demo-block'
import { PageHeader } from '@/components/shared/page-header'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { GripHorizontal, RefreshCw, Puzzle } from 'lucide-react'

export const Route = createFileRoute('/_auth/examples/captcha/puzzle')({
  component: Page,
})

const SCENE_W = 480
const SCENE_H = 220
const PIECE = 52 // 拼块边长
const PIECE_Y = 80 // 拼块/缺口纵坐标
const MIN_X = 80
const MAX_X = SCENE_W - PIECE - 80
const HANDLE_W = 48 // px，与 w-12 对应
const TOLERANCE = 8 // 对位容差（px）

type Status = 'idle' | 'dragging' | 'success' | 'failed'
type Attempt = { seq: number; ok: boolean; detail: string; at: string }

/** 画演示场景：渐变天空 + 远山 + 湖面（canvas 手绘，零图片依赖） */
function paintScene(ctx: CanvasRenderingContext2D) {
  const sky = ctx.createLinearGradient(0, 0, 0, SCENE_H)
  sky.addColorStop(0, '#1e3a8a')
  sky.addColorStop(0.5, '#60a5fa')
  sky.addColorStop(0.75, '#fde68a')
  sky.addColorStop(1, '#f59e0b')
  ctx.fillStyle = sky
  ctx.fillRect(0, 0, SCENE_W, SCENE_H)
  // 远山
  ctx.fillStyle = 'rgba(30,41,82,0.55)'
  ctx.beginPath()
  ctx.moveTo(0, 150)
  ctx.lineTo(110, 82)
  ctx.lineTo(220, 142)
  ctx.lineTo(330, 74)
  ctx.lineTo(440, 138)
  ctx.lineTo(SCENE_W, 100)
  ctx.lineTo(SCENE_W, SCENE_H)
  ctx.lineTo(0, SCENE_H)
  ctx.closePath()
  ctx.fill()
  // 湖面
  ctx.fillStyle = 'rgba(96,165,250,0.7)'
  ctx.fillRect(0, 168, SCENE_W, SCENE_H - 168)
  // 太阳
  ctx.beginPath()
  ctx.arc(390, 52, 30, 0, Math.PI * 2)
  ctx.fillStyle = '#fff7d6'
  ctx.fill()
  // 云
  ctx.fillStyle = 'rgba(255,255,255,0.75)'
  for (const [cx, cy, r] of [
    [110, 46, 16],
    [132, 42, 20],
    [156, 48, 14],
  ] as const) {
    ctx.beginPath()
    ctx.arc(cx, cy, r, 0, Math.PI * 2)
    ctx.fill()
  }
}

/** 拼块外形：方形 + 右侧凸圆（简化拼图块），返回 path */
function piecePath(ctx: CanvasRenderingContext2D, x: number, y: number) {
  const s = PIECE
  const knob = 9
  ctx.beginPath()
  ctx.moveTo(x, y)
  ctx.lineTo(x + s * 0.38, y)
  ctx.arc(x + s * 0.5, y, knob, Math.PI, 0, true) // 上凸
  ctx.lineTo(x + s, y)
  ctx.lineTo(x + s, y + s)
  ctx.lineTo(x, y + s)
  ctx.closePath()
}

/** 拼图滑块验证：拖动滑块把拼块送进缺口，水平对位即通过 */
function Page() {
  const bgRef = React.useRef<HTMLCanvasElement>(null)
  const pieceRef = React.useRef<HTMLCanvasElement>(null)
  const trackRef = React.useRef<HTMLDivElement>(null)
  const draggingRef = React.useRef(false)
  const [targetX, setTargetX] = React.useState(() => 180 + Math.random() * 140)
  const [pieceX, setPieceX] = React.useState(0)
  const [status, setStatus] = React.useState<Status>('idle')
  const [attempts, setAttempts] = React.useState<Attempt[]>([])

  const done = status === 'success'

  // 背景：场景 + 缺口阴影
  React.useEffect(() => {
    const canvas = bgRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    paintScene(ctx)
    // 缺口：暗色挖空 + 白描边
    ctx.save()
    piecePath(ctx, targetX, PIECE_Y)
    ctx.fillStyle = 'rgba(15,23,42,0.55)'
    ctx.fill()
    ctx.strokeStyle = 'rgba(255,255,255,0.85)'
    ctx.lineWidth = 2
    ctx.stroke()
    ctx.restore()
  }, [targetX])

  // 拼块：从场景截取目标区域图形
  React.useEffect(() => {
    const canvas = pieceRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.clearRect(0, 0, PIECE + 12, PIECE + 12)
    ctx.save()
    ctx.translate(6, 6)
    piecePath(ctx, 0, 0)
    ctx.clip()
    const scene = document.createElement('canvas')
    scene.width = SCENE_W
    scene.height = SCENE_H
    paintScene(scene.getContext('2d') as CanvasRenderingContext2D)
    ctx.drawImage(scene, -targetX, -PIECE_Y)
    ctx.restore()
    // 描边 + 阴影感
    ctx.save()
    ctx.translate(6, 6)
    piecePath(ctx, 0, 0)
    ctx.strokeStyle = 'rgba(255,255,255,0.9)'
    ctx.lineWidth = 2
    ctx.stroke()
    ctx.restore()
  }, [targetX])

  const verify = React.useCallback(
    (pos: number) => {
      const ok = Math.abs(pos - targetX) <= TOLERANCE
      setStatus(ok ? 'success' : 'failed')
      setAttempts((prev) => [
        {
          seq: prev.length + 1,
          ok,
          detail: ok ? `对位成功（偏差 ${Math.abs(pos - targetX).toFixed(0)}px）` : `偏差 ${Math.abs(pos - targetX).toFixed(0)}px，超出 ±${TOLERANCE}px`,
          at: new Date().toLocaleTimeString(),
        },
        ...prev,
      ])
      if (ok) toast.success('拼图对位成功')
      else toast.error('未对准缺口，请重试')
      return ok
    },
    [targetX],
  )

  /** pct（0~100）→ 像素 x */
  const pctToX = (pct: number) => (pct / 100) * MAX_X

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
    setPieceX(pctToX(posFromEvent(e)))
  }
  const onUp = (e: React.PointerEvent) => {
    if (!draggingRef.current) return
    draggingRef.current = false
    if (done) return
    const x = pctToX(posFromEvent(e))
    setPieceX(x)
    verify(x)
  }

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (done) return
    const step = e.shiftKey ? 12 : 3
    let next: number | null = null
    if (e.key === 'ArrowRight' || e.key === 'ArrowUp') next = pieceX + step
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') next = pieceX - step
    else if (e.key === 'Home') next = 0
    else if (e.key === 'End') next = MAX_X
    else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      verify(pieceX)
      return
    }
    if (next !== null) {
      e.preventDefault()
      setPieceX(Math.min(Math.max(0, next), MAX_X))
      if (status !== 'dragging') setStatus('dragging')
    }
  }

  const regenerate = () => {
    setTargetX(180 + Math.random() * 140)
    setPieceX(0)
    setStatus('idle')
    setAttempts([])
    toast('已生成新的拼图缺口')
  }

  const pct = (pieceX / MAX_X) * 100

  return (
    <div>
      <PageHeader
        eyebrow="示例 / 验证码"
        title="拼图滑块验证"
        description="拖动滑块把拼块送进缺口完成对位；场景、缺口与拼块全部由 canvas 绘制，松手即校验。"
        actions={
          <Button variant="outline" size="sm" onClick={regenerate} data-testid="captcha-regen">
            <RefreshCw className="h-3.5 w-3.5" />
            重新生成
          </Button>
        }
      />

      <div className="grid gap-4">
        <DemoBlock
          id="captcha-puzzle"
          title="基础用法"
          desc="拖拽滑块移动拼块，与背景缺口水平对齐即通过（容差 ±8px）；失败可继续微调后再次松手。"
        >
          <div className="mx-auto max-w-2xl" data-testid="captcha-puzzle">
            {/* 状态行 */}
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2 text-[11.5px] text-muted">
                <Puzzle className="h-3.5 w-3.5 text-brand-600" />
                拖动下方滑块，将拼块补齐到缺口处
              </div>
              <Badge
                variant={done ? 'green' : status === 'failed' ? 'red' : status === 'dragging' ? 'brand' : 'gray'}
                data-testid="captcha-status"
              >
                {done ? '验证通过' : status === 'failed' ? '验证失败' : status === 'dragging' ? '拖动中' : '待验证'}
              </Badge>
            </div>

            {/* 场景容器：背景画布 + 浮动拼块 */}
            <div
              className="relative select-none overflow-hidden rounded-lg border border-line shadow-sm"
              style={{ width: SCENE_W, height: SCENE_H }}
              data-target={targetX.toFixed(0)}
            >
              <canvas ref={bgRef} width={SCENE_W} height={SCENE_H} className="block" data-testid="captcha-puzzle-bg" />
              {/* 浮动拼块 */}
              <canvas
                ref={pieceRef}
                width={PIECE + 12}
                height={PIECE + 12}
                data-testid="captcha-puzzle-piece"
                className={cn('absolute', done && 'drop-shadow-[0_0_6px_rgba(16,185,129,0.6)]')}
                style={{
                  left: pieceX - 6,
                  top: PIECE_Y - 6,
                  transition: draggingRef.current ? 'none' : 'left 80ms linear',
                }}
              />
            </div>

            {/* 滑块轨道 */}
            <div
              ref={trackRef}
              className="relative mt-4 h-11 select-none rounded-lg border border-line bg-canvas"
            >
              <div className="absolute inset-y-0 left-0 right-12">
                <div className="absolute inset-y-0 left-0 rounded-l-md bg-brand-600/15" style={{ width: `${pct}%` }} />
                <div
                  role="slider"
                  tabIndex={done ? -1 : 0}
                  aria-label="拼图位置"
                  aria-valuemin={0}
                  aria-valuemax={Math.round(MAX_X)}
                  aria-valuenow={Math.round(pieceX)}
                  data-testid="captcha-puzzle-handle"
                  className={cn(
                    'absolute inset-y-0 left-0 flex w-12 cursor-grab touch-none items-center justify-center rounded-lg border border-line bg-surface shadow-sm active:cursor-grabbing',
                    done && 'cursor-default border-emerald-500/60 bg-emerald-50',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600/40',
                  )}
                  style={{ left: `${pct}%` }}
                  onPointerDown={onDown}
                  onPointerMove={onMove}
                  onPointerUp={onUp}
                  onKeyDown={onKeyDown}
                >
                  <GripHorizontal className={cn('h-4 w-4 text-muted', done && 'text-emerald-600')} />
                </div>
              </div>
            </div>

            <div className="mt-2 flex items-center justify-between text-[10.5px] text-soft">
              <span>方向键 ±3px（Shift ±12px）· Enter 校验</span>
              <span>
                当前偏差 {Math.abs(pieceX - targetX).toFixed(0)}px（容差 ±{TOLERANCE}px）
              </span>
            </div>
          </div>
        </DemoBlock>

        <DemoBlock id="captcha-puzzle-log" title="验证记录" desc="每次松手/Enter 校验都会留痕。">
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
