import * as React from 'react'
import { cn } from '@/lib/utils'

/**
 * 水印 —— canvas 生成单个文字瓦片，平铺为背景层覆盖在内容之上。
 * 不拦截任何交互（pointer-events-none），适合内容防盗、审计留痕场景。
 */
export function Watermark({
  content = 'Apex Admin',
  fontSize = 14,
  color = 'rgba(100, 116, 139, 0.22)',
  gap = 110,
  rotate = -22,
  zIndex = 1,
  className,
  children,
}: {
  content?: string
  fontSize?: number
  /** 支持 rgba 控制透明度 */
  color?: string
  /** 瓦片间距（越大越稀疏） */
  gap?: number
  /** 旋转角度（度，负值向右上倾斜） */
  rotate?: number
  zIndex?: number
  className?: string
  children?: React.ReactNode
}) {
  const tile = React.useMemo(() => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    if (!ctx) return null
    const font = `${fontSize}px ui-sans-serif, system-ui, sans-serif`
    const ratio = Math.max(1, window.devicePixelRatio ?? 1)
    // 先以 1x 量宽高，再按 devicePixelRatio 放大画布，保证高分屏不糊
    ctx.font = font
    const w = Math.ceil(ctx.measureText(content).width) + gap
    const h = Math.ceil(fontSize * 2.6)
    canvas.width = w * ratio
    canvas.height = h * ratio
    ctx.scale(ratio, ratio)
    ctx.font = font
    ctx.fillStyle = color
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.translate(w / 2, h / 2)
    ctx.rotate((rotate * Math.PI) / 180)
    ctx.fillText(content, 0, 0)
    return { url: canvas.toDataURL(), w, h }
  }, [content, fontSize, color, gap, rotate])

  return (
    <div className={cn('relative', className)}>
      {children}
      {tile ? (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            zIndex,
            backgroundImage: `url(${tile.url})`,
            backgroundSize: `${tile.w}px ${tile.h}px`,
            backgroundRepeat: 'repeat',
          }}
        />
      ) : null}
    </div>
  )
}
