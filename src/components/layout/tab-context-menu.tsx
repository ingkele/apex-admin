import * as React from 'react'
import { createPortal } from 'react-dom'
import { cn } from '@/lib/utils'

/**
 * 页签右键菜单 —— 固定定位在最外层，随光标弹出并自动避让视口边界。
 * 交互约定与 vben 一致：点击外部 / Esc / 滚动 / 窗口失焦即关闭，项点击后立即关闭。
 */

export interface TabMenuItem {
  label: string
  icon?: React.ReactNode
  disabled?: boolean
  danger?: boolean
  /** 与上一项之间画分隔线 */
  separatorBefore?: boolean
  onSelect: () => void
}

export function TabContextMenu({
  x,
  y,
  items,
  onClose,
}: {
  x: number
  y: number
  items: TabMenuItem[]
  onClose: () => void
}) {
  const ref = React.useRef<HTMLDivElement>(null)
  const [pos, setPos] = React.useState({ x, y })

  // 先按光标位置渲染，再按实际尺寸收进视口
  React.useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const pad = 8
    setPos({
      x: Math.max(pad, Math.min(x, window.innerWidth - rect.width - pad)),
      y: Math.max(pad, Math.min(y, window.innerHeight - rect.height - pad)),
    })
  }, [x, y])

  React.useEffect(() => {
    const onPointerDown = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) onClose()
    }
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('mousedown', onPointerDown, true)
    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('resize', onClose)
    window.addEventListener('blur', onClose)
    document.addEventListener('scroll', onClose, true)
    return () => {
      window.removeEventListener('mousedown', onPointerDown, true)
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('resize', onClose)
      window.removeEventListener('blur', onClose)
      document.removeEventListener('scroll', onClose, true)
    }
  }, [onClose])

  return createPortal(
    <div
      ref={ref}
      role="menu"
      style={{ left: pos.x, top: pos.y }}
      className="fixed z-[60] min-w-[168px] rounded-xl border border-line bg-elevated p-1 shadow-pop"
      onContextMenu={(e) => e.preventDefault()}
    >
      {items.map((item, i) => (
        <React.Fragment key={item.label}>
          {item.separatorBefore && i > 0 ? <div className="my-1 h-px bg-line" /> : null}
          <button
            type="button"
            role="menuitem"
            disabled={item.disabled}
            onClick={() => {
              onClose()
              item.onSelect()
            }}
            className={cn(
              'flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-[12.5px] outline-none transition-colors',
              item.danger
                ? 'text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10'
                : 'text-ink hover:bg-hover',
              'disabled:pointer-events-none disabled:opacity-40',
            )}
          >
            <span className="flex h-3.5 w-3.5 shrink-0 items-center justify-center text-muted">
              {item.icon}
            </span>
            {item.label}
          </button>
        </React.Fragment>
      ))}
    </div>,
    document.body,
  )
}
