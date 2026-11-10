import * as React from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { toast } from 'sonner'
import { DemoBlock } from '@/components/shared/demo-block'
import { PageHeader } from '@/components/shared/page-header'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { MousePointerClick, RefreshCw } from 'lucide-react'

export const Route = createFileRoute('/_auth/examples/captcha/click')({
  component: Page,
})

const CANVAS_W = 520
const CANVAS_H = 240
const R = 26 // 图形命中半径
const SEQ_LEN = 3

type ShapeName = 'circle' | 'star' | 'triangle' | 'heart' | 'diamond'

const SHAPES: { key: ShapeName; label: string; color: string }[] = [
  { key: 'circle', label: '圆形', color: '#3b82f6' },
  { key: 'star', label: '星形', color: '#f59e0b' },
  { key: 'triangle', label: '三角', color: '#10b981' },
  { key: 'heart', label: '心形', color: '#ef4444' },
  { key: 'diamond', label: '菱形', color: '#8b5cf6' },
]

type ShapePos = { key: ShapeName; label: string; color: string; cx: number; cy: number }
type Status = 'idle' | 'picking' | 'success' | 'failed'
type Attempt = { seq: number; ok: boolean; detail: string; at: string }

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

/** 生成互不重叠的图形位置 */
function layoutShapes(): ShapePos[] {
  const pts: ShapePos[] = []
  for (const s of shuffle(SHAPES)) {
    let cx = 0
    let cy = 0
    for (let guard = 0; guard < 80; guard++) {
      cx = 60 + Math.random() * (CANVAS_W - 120)
      cy = 60 + Math.random() * (CANVAS_H - 120)
      if (pts.every((p) => Math.hypot(p.cx - cx, p.cy - cy) > R * 2.6)) break
    }
    pts.push({ ...s, cx, cy })
  }
  return pts
}

/** 单个图形绘制 */
function drawShape(ctx: CanvasRenderingContext2D, s: ShapePos) {
  ctx.save()
  ctx.fillStyle = s.color
  ctx.strokeStyle = 'rgba(255,255,255,0.9)'
  ctx.lineWidth = 2
  ctx.beginPath()
  switch (s.key) {
    case 'circle':
      ctx.arc(s.cx, s.cy, R, 0, Math.PI * 2)
      break
    case 'star': {
      for (let i = 0; i < 10; i++) {
        const r = i % 2 === 0 ? R : R * 0.45
        const ang = (Math.PI / 5) * i - Math.PI / 2
        const x = s.cx + r * Math.cos(ang)
        const y = s.cy + r * Math.sin(ang)
        if (i === 0) ctx.moveTo(x, y)
        else ctx.lineTo(x, y)
      }
      ctx.closePath()
      break
    }
    case 'triangle':
      ctx.moveTo(s.cx, s.cy - R)
      ctx.lineTo(s.cx + R * 0.9, s.cy + R * 0.72)
      ctx.lineTo(s.cx - R * 0.9, s.cy + R * 0.72)
      ctx.closePath()
      break
    case 'heart': {
      const { cx, cy } = s
      ctx.moveTo(cx, cy + R * 0.75)
      ctx.bezierCurveTo(cx - R * 1.2, cy - R * 0.1, cx - R * 0.55, cy - R * 1.1, cx, cy - R * 0.35)
      ctx.bezierCurveTo(cx + R * 0.55, cy - R * 1.1, cx + R * 1.2, cy - R * 0.1, cx, cy + R * 0.75)
      ctx.closePath()
      break
    }
    case 'diamond':
      ctx.moveTo(s.cx, s.cy - R)
      ctx.lineTo(s.cx + R * 0.85, s.cy)
      ctx.lineTo(s.cx, s.cy + R)
      ctx.lineTo(s.cx - R * 0.85, s.cy)
      ctx.closePath()
      break
  }
  ctx.fill()
  ctx.stroke()
  // 名称标签
  ctx.fillStyle = 'rgba(255,255,255,0.95)'
  ctx.font = 'bold 12px sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(s.label, s.cx, s.cy)
  ctx.restore()
}

/** 点选验证：按提示顺序依次点击图形，顺序正确即通过（含键盘备用按钮） */
function Page() {
  const canvasRef = React.useRef<HTMLCanvasElement>(null)
  const [shapes, setShapes] = React.useState<ShapePos[]>(() => layoutShapes())
  const [sequence, setSequence] = React.useState<ShapeName[]>(() =>
    shuffle(SHAPES.map((s) => s.key)).slice(0, SEQ_LEN),
  )
  const [step, setStep] = React.useState(0) // 已完成的点选步数
  const [status, setStatus] = React.useState<Status>('idle')
  const [attempts, setAttempts] = React.useState<Attempt[]>([])
  const [picked, setPicked] = React.useState<ShapeName[]>([])

  const done = status === 'success'

  // 重绘：命中过的图形打勾、当前步目标高亮描边
  React.useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const bg = ctx.createLinearGradient(0, 0, CANVAS_W, CANVAS_H)
    bg.addColorStop(0, '#0f2b4d')
    bg.addColorStop(1, '#245a8f')
    ctx.fillStyle = bg
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H)
    // 网格
    ctx.strokeStyle = 'rgba(255,255,255,0.08)'
    for (let x = 0; x <= CANVAS_W; x += 40) {
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x, CANVAS_H)
      ctx.stroke()
    }
    for (let y = 0; y <= CANVAS_H; y += 40) {
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(CANVAS_W, y)
      ctx.stroke()
    }
    for (const s of shapes) {
      drawShape(ctx, s)
      if (picked.includes(s.key)) {
        // 已点选：绿色勾
        ctx.save()
        ctx.strokeStyle = '#34d399'
        ctx.lineWidth = 3
        ctx.beginPath()
        ctx.arc(s.cx, s.cy, R + 7, 0, Math.PI * 2)
        ctx.stroke()
        ctx.restore()
      }
    }
  }, [shapes, picked])

  const pick = React.useCallback(
    (key: ShapeName) => {
      if (done) return
      const expect = sequence[step]
      if (key !== expect) {
        setStatus('failed')
        setAttempts((prev) => [
          {
            seq: prev.length + 1,
            ok: false,
            detail: `第 ${step + 1} 步点错：应点「${SHAPES.find((s) => s.key === expect)?.label}」，实际点了「${SHAPES.find((s) => s.key === key)?.label}」`,
            at: new Date().toLocaleTimeString(),
          },
          ...prev,
        ])
        toast.error('点选顺序错误，已重置')
        // 重置本轮进度，保留失败态直到下一次点选
        setStep(0)
        setPicked([])
        return
      }
      const nextStep = step + 1
      setPicked((prev) => [...prev, key])
      setStep(nextStep)
      setStatus('picking')
      if (nextStep >= SEQ_LEN) {
        setStatus('success')
        setAttempts((prev) => [
          {
            seq: prev.length + 1,
            ok: true,
            detail: `按序完成 ${SEQ_LEN} 次点选`,
            at: new Date().toLocaleTimeString(),
          },
          ...prev,
        ])
        toast.success('点选验证通过')
      }
    },
    [done, sequence, step],
  )

  const onCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const box = e.currentTarget.getBoundingClientRect()
    const x = ((e.clientX - box.left) / box.width) * CANVAS_W
    const y = ((e.clientY - box.top) / box.height) * CANVAS_H
    const hit = shapes.find((s) => Math.hypot(s.cx - x, s.cy - y) <= R + 6)
    if (hit) pick(hit.key)
    else toast('没有点中图形')
  }

  const regenerate = () => {
    setShapes(layoutShapes())
    setSequence(shuffle(SHAPES.map((s) => s.key)).slice(0, SEQ_LEN))
    setStep(0)
    setPicked([])
    setStatus('idle')
    setAttempts([])
    toast('已生成新的点选题目')
  }

  return (
    <div>
      <PageHeader
        eyebrow="示例 / 验证码"
        title="点选验证"
        description="按提示顺序依次点击画布中的图形，顺序正确即通过；图形与题面均由 canvas 绘制，另备键盘可点按钮。"
        actions={
          <Button variant="outline" size="sm" onClick={regenerate} data-testid="captcha-regen">
            <RefreshCw className="h-3.5 w-3.5" />
            重新生成
          </Button>
        }
      />

      <div className="grid gap-4">
        <DemoBlock
          id="captcha-click"
          title="基础用法"
          desc="依照题面顺序点击图形；点错立即失败并重置题目，点完 3 个即通过。"
        >
          <div className="mx-auto max-w-2xl" data-testid="captcha-click">
            {/* 题面：按序点选 */}
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-[11.5px] text-muted">
                <MousePointerClick className="h-3.5 w-3.5 text-brand-600" />
                请依次点击：
                {sequence.map((k, i) => (
                  <span
                    key={k}
                    className={cn(
                      'rounded-md border border-line px-2 py-0.5 text-[11px]',
                      i < step && 'border-emerald-500/50 bg-emerald-500/10 text-emerald-600 line-through',
                      i === step && 'border-brand-600/60 bg-brand-600/10 font-semibold text-brand-600',
                      i > step && 'text-muted',
                    )}
                  >
                    {SHAPES.find((s) => s.key === k)?.label}
                  </span>
                ))}
              </div>
              <Badge
                variant={done ? 'green' : status === 'failed' ? 'red' : status === 'picking' ? 'brand' : 'gray'}
                data-testid="captcha-status"
              >
                {done ? '验证通过' : status === 'failed' ? '验证失败' : status === 'picking' ? `进行中 ${step}/${SEQ_LEN}` : '待点选'}
              </Badge>
            </div>

            {/* 点选画布 */}
            <canvas
              ref={canvasRef}
              width={CANVAS_W}
              height={CANVAS_H}
              onClick={onCanvasClick}
              data-testid="captcha-click-canvas"
              data-shapes={JSON.stringify(shapes.map(({ key, cx, cy }) => ({ key, cx: Math.round(cx), cy: Math.round(cy) })))}
              data-sequence={JSON.stringify(sequence)}
              className={cn(
                'block w-full cursor-pointer rounded-lg border border-line shadow-sm',
                done && 'ring-2 ring-emerald-500/50',
              )}
            />

            {/* 键盘备用：与画布点击等价的按钮 */}
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span className="text-[10.5px] text-soft">键盘点选：</span>
              {SHAPES.map((s) => (
                <Button
                  key={s.key}
                  size="sm"
                  variant="outline"
                  disabled={done}
                  onClick={() => pick(s.key)}
                  data-testid={`captcha-pick-${s.key}`}
                >
                  {s.label}
                </Button>
              ))}
            </div>

            <div className="mt-2 text-[10.5px] text-soft">
              绿圈表示已点选 · 题面高亮为当前目标 · 点错立即重置 · 也可用下方按钮完成键盘点选
            </div>
          </div>
        </DemoBlock>

        <DemoBlock id="captcha-click-log" title="验证记录" desc="每次点选题目完成/点错都会留痕。">
          {attempts.length === 0 ? (
            <div className="py-4 text-center text-[11.5px] text-soft">暂无记录，按顺序点击图形开始验证</div>
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
