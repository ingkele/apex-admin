import * as React from 'react'
import { useLocation, useNavigate } from '@tanstack/react-router'
import { useQueryClient } from '@tanstack/react-query'
import {
  ChevronDown, ChevronFirst, ChevronLast, CircleSlash, Link2, RotateCw, Trash2, X,
} from 'lucide-react'
import { toast } from 'sonner'
import { AppMenu } from '@/components/ui/menu'
import { TabContextMenu, type TabMenuItem } from '@/components/layout/tab-context-menu'
import { useTabsStore } from '@/stores/tabs.store'
import { HOME_TAB, resolveRouteMeta } from '@/lib/route-meta'
import { cn } from '@/lib/utils'

/**
 * 多页签栏 —— 打开过的页面在这里留一个标签，点击切换、可单独关闭。
 * 右键页签弹出常用操作（刷新 / 关闭 / 关闭左侧 / 关闭右侧 / 关闭其他 / 关闭全部），
 * 右侧「更多」下拉提供同一组操作，作用于当前页签。
 * 工作台为固定页签（关不掉），关闭当前页后自动落到相邻页签。
 */
export function TabBar() {
  const pathname = useLocation({ select: (l) => l.pathname })
  const navigate = useNavigate()
  const qc = useQueryClient()
  const tabs = useTabsStore((s) => s.tabs)
  const open = useTabsStore((s) => s.open)
  const close = useTabsStore((s) => s.close)
  const closeLeft = useTabsStore((s) => s.closeLeft)
  const closeRight = useTabsStore((s) => s.closeRight)
  const closeOthers = useTabsStore((s) => s.closeOthers)
  const closeAll = useTabsStore((s) => s.closeAll)
  const listRef = React.useRef<HTMLDivElement>(null)
  const [menu, setMenu] = React.useState<{ x: number; y: number; path: string } | null>(null)

  // 路由变化 → 登记页签
  React.useEffect(() => {
    const meta = resolveRouteMeta(pathname)
    open({ path: pathname, title: meta.title })
  }, [pathname, open])

  // 激活页签滚动进视野（页签多时横向滚动）
  React.useEffect(() => {
    const el = listRef.current?.querySelector<HTMLElement>(`[data-tab-path="${CSS.escape(pathname)}"]`)
    el?.scrollIntoView({ block: 'nearest', inline: 'nearest' })
  }, [pathname, tabs.length])

  const go = React.useCallback(
    (path: string) => {
      if (path !== pathname) void navigate({ to: path })
    },
    [navigate, pathname],
  )

  const refreshTab = React.useCallback(
    (path: string) => {
      go(path)
      void qc.invalidateQueries()
      toast.success('页签数据已刷新')
    },
    [go, qc],
  )

  /** 批量关闭后若当前页签已被关掉，落到 target（通常是右键的那个页签） */
  const settle = (target: string) => {
    const alive = useTabsStore.getState().tabs.some((t) => t.path === pathname)
    if (!alive) go(target)
  }

  /** 页签菜单项：右键菜单与「更多」下拉共用，target 为被操作的页签 */
  const buildItems = (target: string): TabMenuItem[] => {
    const idx = tabs.findIndex((t) => t.path === target)
    const pinned = target === HOME_TAB.path
    return [
      {
        label: '刷新页签',
        icon: <RotateCw className="h-3.5 w-3.5" />,
        onSelect: () => refreshTab(target),
      },
      {
        label: '关闭页签',
        icon: <X className="h-3.5 w-3.5" />,
        disabled: pinned,
        onSelect: () => {
          const fallback = close(target)
          if (target === pathname && fallback) go(fallback)
        },
      },
      {
        label: '关闭左侧页签',
        icon: <ChevronFirst className="h-3.5 w-3.5" />,
        disabled: idx <= 1,
        separatorBefore: true,
        onSelect: () => {
          closeLeft(target)
          settle(target)
          toast.success('已关闭左侧页签')
        },
      },
      {
        label: '关闭右侧页签',
        icon: <ChevronLast className="h-3.5 w-3.5" />,
        disabled: idx < 0 || idx >= tabs.length - 1,
        onSelect: () => {
          closeRight(target)
          settle(target)
          toast.success('已关闭右侧页签')
        },
      },
      {
        label: '关闭其他页签',
        icon: <CircleSlash className="h-3.5 w-3.5" />,
        disabled: tabs.length <= 1,
        onSelect: () => {
          closeOthers(target)
          go(target)
          toast.success('已关闭其他页签')
        },
      },
      {
        label: '关闭全部页签',
        icon: <Trash2 className="h-3.5 w-3.5" />,
        disabled: tabs.length <= 1,
        onSelect: () => {
          closeAll()
          go(HOME_TAB.path)
          toast.success('已关闭全部页签')
        },
      },
      {
        label: '复制页面路径',
        icon: <Link2 className="h-3.5 w-3.5" />,
        separatorBefore: true,
        onSelect: () => {
          const url = `${window.location.origin}${target}`
          void navigator.clipboard
            .writeText(url)
            .then(() => toast.success('路径已复制', { description: url }))
            .catch(() => toast.error('复制失败，请手动复制', { description: url }))
        },
      },
    ]
  }

  return (
    <div className="flex h-[42px] shrink-0 items-center gap-2 border-b border-line bg-canvas/70 px-3">
      {/* 页签列表 */}
      <div
        ref={listRef}
        className="flex min-w-0 flex-1 items-center gap-1.5 overflow-x-auto scrollbar-none"
      >
        {tabs.map((tab) => {
          const active = tab.path === pathname
          const closable = tab.path !== HOME_TAB.path
          return (
            <div
              key={tab.path}
              data-tab-path={tab.path}
              onClick={() => go(tab.path)}
              onContextMenu={(e) => {
                e.preventDefault()
                setMenu({ x: e.clientX, y: e.clientY, path: tab.path })
              }}
              className={cn(
                'group flex h-[28px] shrink-0 cursor-pointer items-center gap-1 rounded-lg border pr-1.5 pl-3 text-[12.5px] transition-colors select-none',
                active
                  ? 'border-brand-200 bg-brand-50 font-medium text-brand-700 dark:border-brand-500/30 dark:bg-brand-500/10 dark:text-brand-300'
                  : 'border-line bg-surface text-muted hover:border-brand-200 hover:text-ink dark:hover:border-brand-500/30',
              )}
            >
              <span className="whitespace-nowrap">{tab.title}</span>
              {closable ? (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    const fallback = close(tab.path)
                    if (tab.path === pathname && fallback) go(fallback)
                  }}
                  title="关闭页签"
                  className={cn(
                    'flex h-4 w-4 items-center justify-center rounded transition-colors',
                    'text-soft hover:bg-slate-200/80 hover:text-ink dark:hover:bg-slate-700',
                    active ? 'opacity-100' : 'opacity-0 group-hover:opacity-100',
                  )}
                >
                  <X className="h-3 w-3" />
                </button>
              ) : (
                <span className="w-1" />
              )}
            </div>
          )
        })}
      </div>

      {/* 右侧操作 */}
      <div className="flex shrink-0 items-center gap-1 border-l border-line pl-2">
        <button
          type="button"
          onClick={() => refreshTab(pathname)}
          title="刷新当前页数据"
          className="rounded-md p-1.5 text-muted transition hover:bg-hover hover:text-ink"
        >
          <RotateCw className="h-3.5 w-3.5" />
        </button>
        <AppMenu
          align="end"
          trigger={
            <button
              type="button"
              title="页签操作"
              className="flex items-center gap-0.5 rounded-md p-1.5 text-muted transition hover:bg-hover hover:text-ink"
            >
              <ChevronDown className="h-3.5 w-3.5" />
            </button>
          }
          items={buildItems(pathname)}
        />
      </div>

      {/* 右键菜单 */}
      {menu ? (
        <TabContextMenu
          x={menu.x}
          y={menu.y}
          items={buildItems(menu.path)}
          onClose={() => setMenu(null)}
        />
      ) : null}
    </div>
  )
}
