import * as React from 'react'
import { Menu } from '@base-ui/react/menu'
import { cn } from '@/lib/utils'

/** 下拉菜单 —— Base UI Menu 底层 */
export function AppMenu({
  trigger,
  items,
  align = 'end',
  side = 'bottom',
}: {
  /** 触发器：用 render 合并到该元素上，避免 Trigger 默认 <button> 再包一层按钮 */
  trigger: React.ReactElement
  items: {
    label: string
    icon?: React.ReactNode
    danger?: boolean
    disabled?: boolean
    /** 与上一项之间画分隔线 */
    separatorBefore?: boolean
    onSelect: () => void
  }[]
  align?: 'start' | 'end'
  /** 弹出方向（折叠侧边栏的侧弹菜单用 right） */
  side?: 'bottom' | 'right' | 'left' | 'top'
}) {
  return (
    <Menu.Root>
      <Menu.Trigger render={trigger} />
      <Menu.Portal>
        <Menu.Positioner sideOffset={6} align={align} side={side} className="z-50">
          <Menu.Popup className="min-w-[160px] rounded-xl border border-line bg-elevated p-1 shadow-pop">
            {items.map((item, i) => (
              <React.Fragment key={i}>
                {item.separatorBefore && i > 0 ? <div className="my-1 h-px bg-line" /> : null}
                <Menu.Item
                  disabled={item.disabled}
                  onClick={item.onSelect}
                  className={cn(
                    'flex cursor-pointer items-center gap-2 rounded-lg px-2.5 py-2 text-[12.5px] outline-none select-none',
                    item.danger
                      ? 'text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10'
                      : 'text-ink hover:bg-hover',
                    'data-[disabled]:pointer-events-none data-[disabled]:opacity-40',
                  )}
                >
                  {item.icon}
                  {item.label}
                </Menu.Item>
              </React.Fragment>
            ))}
          </Menu.Popup>
        </Menu.Positioner>
      </Menu.Portal>
    </Menu.Root>
  )
}
