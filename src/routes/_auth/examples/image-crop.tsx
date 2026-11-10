import * as React from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { toast } from 'sonner'
import { DemoBlock } from '@/components/shared/demo-block'
import { PageHeader } from '@/components/shared/page-header'
import { Button } from '@/components/ui/button'
import { AppSwitch } from '@/components/ui/switch'
import { cn } from '@/lib/utils'
import { Check, RotateCcw, Scissors } from 'lucide-react'

export const Route = createFileRoute('/_auth/examples/image-crop')({
  component: Page,
})

const SRC_W = 640
const SRC_H = 400

/** 演示底图 —— canvas 画渐变风景（零外部图片依赖，裁剪坐标即源图像素坐标） */
function useDemoImage(): string {
  const [url, setUrl] = React.useState('')
  React.useEffect(() => {
    const canvas = document.createElement('canvas')
    canvas.width = SRC_W
    canvas.height = SRC_H
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    // 天空渐变
    const sky = ctx.createLinearGradient(0, 0, 0, SRC_H)
    sky.addColorStop(0, '#1e3a8a')
    sky.addColorStop(0.45, '#60a5fa')
    sky.addColorStop(0.62, '#fde68a')
    sky.addColorStop(1, '#f59e0b')
    ctx.fillStyle = sky
    ctx.fillRect(0, 0, SRC_W, SRC_H)
    // 远山
    ctx.fillStyle = 'rgba(30,41,82,0.55)'
    ctx.beginPath()
    ctx.moveTo(0, 250)
    ctx.lineTo(140, 160)
    ctx.lineTo(280, 240)
    ctx.lineTo(430, 150)
    ctx.lineTo(640, 250)
    ctx.lineTo(640, 400)
    ctx.lineTo(0, 400)
    ctx.closePath()
    ctx.fill()
    // 湖面
    ctx.fillStyle = 'rgba(96,165,250,0.75)'
    ctx.fillRect(0, 300, SRC_W, 100)
    // 太阳
    ctx.beginPath()
    ctx.arc(500, 110, 42, 0, Math.PI * 2)
    ctx.fillStyle = '#fff7d6'
    ctx.fill()
    // 网格参考线
    ctx.strokeStyle = 'rgba(255,255,255,0.12)'
    ctx.lineWidth = 1
    for (let x = 0; x <= SRC_W; x += 80) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, SRC_H); ctx.stroke()
    }
    for (let y = 0; y <= SRC_H; y += 80) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(SRC_W, y); ctx.stroke()
    }
    setUrl(canvas.toDataURL('image/png'))
  }, [])
  return url
}

type Rect = { x: number; y: number; w: number; h: number }

function clampRect(r: Rect): Rect {
  const w = Math.min(Math.max(60, r.w), SRC_W)
  const h = Math.min(Math.max(60, r.h), SRC_H)
  return {
    x: Math.min(Math.max(0, r.x), SRC_W - w),
    y: Math.min(Math.max(0, r.y), SRC_H - h),
    w,
    h,
  }
}

function Page() {
  const img = useDemoImage()
  const [rect, setRect] = React.useState<Rect>({ x: 140, y: 90, w: 320, h: 200 })
  const [ratioLock, setRatioLock] = React.useState(true)
  const [ratio, setRatio] = React.useState(16 / 10)
  const [cropped, setCropped] = React.useState<string | null>(null)
  const wrapRef = React.useRef<HTMLDivElement>(null)
  const dragRef = React.useRef<{ mode: string; sx: number; sy: number; start: Rect } | null>(null)

  const toSource = (e: React.PointerEvent) => {
    const box = wrapRef.current?.getBoundingClientRect()
    if (!box) return { x: 0, y: 0 }
    return {
      x: ((e.clientX - box.left) / box.width) * SRC_W,
      y: ((e.clientY - box.top) / box.height) * SRC_H,
    }
  }

  const onDown = (mode: string) => (e: React.PointerEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const p = toSource(e)
    dragRef.current = { mode, sx: p.x, sy: p.y, start: rect }
    ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
  }

  const onMove = (e: React.PointerEvent) => {
    const d = dragRef.current
    if (!d) return
    const p = toSource(e)
    const dx = p.x - d.sx
    const dy = p.y - d.sy
    const s = d.start
    if (d.mode === 'move') {
      setRect(clampRect({ ...s, x: s.x + dx, y: s.y + dy }))
      return
    }
    let { x, y, w, h } = s
    if (d.mode.includes('e')) w = s.w + dx
    if (d.mode.includes('s')) h = s.h + dy
    if (d.mode.includes('w')) { x = s.x + dx; w = s.w - dx }
    if (d.mode.includes('n')) { y = s.y + dy; h = s.h - dy }
    if (ratioLock) {
      // 锁定比例：以变化较大的一边为准
      if (Math.abs(w - s.w) >= Math.abs(h - s.h)) h = w / ratio
      else w = h * ratio
    }
    setRect(clampRect({ x, y, w, h }))
  }

  const onUp = () => {
    dragRef.current = null
  }

  const doCrop = () => {
    if (!img) return
    const src = new Image()
    src.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = Math.round(rect.w)
      canvas.height = Math.round(rect.h)
      const ctx = canvas.getContext('2d')
      if (!ctx) return
      ctx.drawImage(src, rect.x, rect.y, rect.w, rect.h, 0, 0, rect.w, rect.h)
      setCropped(canvas.toDataURL('image/png'))
      toast.success('裁剪完成，右侧为输出预览')
    }
    src.src = img
  }

  const HANDLES = ['nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w'] as const
  const handlePos: Record<string, string> = {
    nw: 'left-0 top-0 -translate-x-1/2 -translate-y-1/2 cursor-nwse-resize',
    n: 'left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 cursor-ns-resize',
    ne: 'right-0 top-0 translate-x-1/2 -translate-y-1/2 cursor-nesw-resize',
    e: 'right-0 top-1/2 translate-x-1/2 -translate-y-1/2 cursor-ew-resize',
    se: 'right-0 bottom-0 translate-x-1/2 translate-y-1/2 cursor-nwse-resize',
    s: 'left-1/2 bottom-0 -translate-x-1/2 translate-y-1/2 cursor-ns-resize',
    sw: 'left-0 bottom-0 -translate-x-1/2 translate-y-1/2 cursor-nesw-resize',
    w: 'left-0 top-1/2 -translate-x-1/2 -translate-y-1/2 cursor-ew-resize',
  }

  return (
    <>
      <PageHeader
        eyebrow={<span>示例 › 图片裁剪 · 拖拽裁剪框 + 实时输出</span>}
        title="图片裁剪"
        description="拖动裁剪框移动位置、拖八向手柄缩放；可锁定宽高比，点「裁剪」输出到预览（canvas drawImage，零依赖）。"
      />

      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-7">
          <DemoBlock
            id="crop-stage"
            title="裁剪区"
            desc="暗色遮罩显示被裁掉的区域；八向手柄缩放，框内拖动移动"
            code={`onPointerDown → 记录起点与模式（move / nw / n / ne / …）
onPointerMove → dx/dy 作用到 rect，clamp 到图内
onPointerUp   → 结束
// 输出：canvas.drawImage(img, x, y, w, h, 0, 0, w, h)`}
          >
            <div className="mb-3 flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 text-[11.5px] text-muted">
                锁定比例
                <AppSwitch
                  checked={ratioLock}
                  onCheckedChange={(v) => {
                    setRatioLock(v)
                    if (v) setRect((r) => clampRect({ ...r, h: r.w / ratio }))
                  }}
                />
              </div>
              {ratioLock ? (
                <div className="flex items-center gap-1.5">
                  {[
                    { label: '16:10', v: 16 / 10 },
                    { label: '4:3', v: 4 / 3 },
                    { label: '1:1', v: 1 },
                  ].map((opt) => (
                    <button
                      key={opt.label}
                      type="button"
                      onClick={() => {
                        setRatio(opt.v)
                        setRect((r) => clampRect({ ...r, h: r.w / opt.v }))
                      }}
                      className={cn(
                        'rounded-md border px-2 py-1 text-[10.5px] transition-colors',
                        ratio === opt.v
                          ? 'border-brand-500 bg-brand-50 font-medium text-brand-700 dark:bg-brand-500/10 dark:text-brand-300'
                          : 'border-line text-muted hover:bg-hover hover:text-ink',
                      )}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              ) : null}
              <Button
                size="sm"
                variant="outline"
                className="ml-auto"
                onClick={() => setRect({ x: 140, y: 90, w: 320, h: 200 })}
              >
                <RotateCcw className="h-3.5 w-3.5" /> 复位
              </Button>
              <Button size="sm" onClick={doCrop}>
                <Scissors className="h-3.5 w-3.5" /> 裁剪
              </Button>
            </div>

            <div
              ref={wrapRef}
              onPointerMove={onMove}
              onPointerUp={onUp}
              className="relative select-none overflow-hidden rounded-lg border border-line bg-slate-900"
              style={{ aspectRatio: `${SRC_W} / ${SRC_H}` }}
            >
              {img ? <img src={img} alt="裁剪底图" className="absolute inset-0 h-full w-full" draggable={false} /> : null}

              {/* 四向遮罩：被裁掉区域 */}
              {[
                { style: { left: 0, top: 0, width: '100%', height: `${(rect.y / SRC_H) * 100}%` } },
                { style: { left: 0, top: `${((rect.y + rect.h) / SRC_H) * 100}%`, width: '100%', right: 0, bottom: 0 } },
                { style: { left: 0, top: `${(rect.y / SRC_H) * 100}%`, width: `${(rect.x / SRC_W) * 100}%`, height: `${(rect.h / SRC_H) * 100}%` } },
                { style: { left: `${((rect.x + rect.w) / SRC_W) * 100}%`, top: `${(rect.y / SRC_H) * 100}%`, right: 0, height: `${(rect.h / SRC_H) * 100}%` } },
              ].map((m, i) => (
                <div key={i} className="absolute bg-slate-900/55" style={m.style} />
              ))}

              {/* 裁剪框 */}
              <div
                onPointerDown={onDown('move')}
                className="absolute cursor-move border-2 border-white/90 shadow-[0_0_0_1px_rgba(0,0,0,0.35)]"
                style={{
                  left: `${(rect.x / SRC_W) * 100}%`,
                  top: `${(rect.y / SRC_H) * 100}%`,
                  width: `${(rect.w / SRC_W) * 100}%`,
                  height: `${(rect.h / SRC_H) * 100}%`,
                }}
              >
                {/* 三分线 */}
                <div className="pointer-events-none absolute inset-0">
                  {[33.33, 66.66].map((p) => (
                    <React.Fragment key={p}>
                      <div className="absolute top-0 h-full border-l border-white/35" style={{ left: `${p}%` }} />
                      <div className="absolute left-0 w-full border-t border-white/35" style={{ top: `${p}%` }} />
                    </React.Fragment>
                  ))}
                </div>
                {/* 八向手柄 */}
                {HANDLES.map((h) => (
                  <div
                    key={h}
                    onPointerDown={onDown(h)}
                    className={cn('absolute h-2.5 w-2.5 rounded-sm border border-slate-800 bg-white shadow', handlePos[h])}
                  />
                ))}
              </div>

              {/* 尺寸标签 */}
              <div className="pointer-events-none absolute bottom-2 left-2 rounded bg-slate-900/75 px-2 py-1 font-mono text-[10px] text-white">
                {Math.round(rect.w)} × {Math.round(rect.h)} · x:{Math.round(rect.x)} y:{Math.round(rect.y)}
              </div>
            </div>
          </DemoBlock>
        </div>

        <div className="col-span-5">
          <DemoBlock
            id="crop-output"
            title="输出预览"
            desc="canvas.drawImage 按裁剪矩形输出 PNG；尺寸即裁剪框像素"
            code={`ctx.drawImage(img,
  rect.x, rect.y, rect.w, rect.h, // 源区域
  0, 0, rect.w, rect.h)           // 目标
setCropped(canvas.toDataURL('image/png'))`}
          >
            {cropped ? (
              <div className="space-y-3">
                <div className="overflow-hidden rounded-lg border border-line bg-canvas/40">
                  <img src={cropped} alt="裁剪输出" className="mx-auto max-h-[220px] w-auto" />
                </div>
                <div className="flex items-center justify-between rounded-lg border border-line bg-canvas/40 px-3.5 py-2.5">
                  <span className="text-[10.5px] text-muted">输出尺寸</span>
                  <span className="font-mono text-[11px] text-ink">
                    {Math.round(rect.w)} × {Math.round(rect.h)} px
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-[10.5px] text-emerald-600 dark:text-emerald-400">
                  <Check className="h-3.5 w-3.5" /> 已生成裁剪图（base64 PNG，可接上传）
                </div>
              </div>
            ) : (
              <div className="flex h-[220px] flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-line text-soft">
                <Scissors className="h-6 w-6" />
                <div className="text-[11px]">调整好裁剪框后点「裁剪」</div>
                <div className="text-[10px] text-soft/80">输出会显示在这里</div>
              </div>
            )}
            <p className="mt-3 text-[10.5px] leading-relaxed text-muted">
              完整实现可接真实文件：<code className="mx-1 rounded bg-surface px-1 py-0.5 text-[10px] text-ink">input[type=file]</code>
              读图 + objectURL；本页用 canvas 生成的渐变风景当底图，避免外部图片依赖。
            </p>
          </DemoBlock>
        </div>
      </div>
    </>
  )
}
