import * as React from 'react'
import { useLocation, useNavigate } from '@tanstack/react-router'
import { ChevronRight, Info, LogOut, PanelLeft, Palette, Search, UserRound } from 'lucide-react'
import { AppMenu } from '@/components/ui/menu'
import { NotificationBell } from '@/components/shared/notification-bell'
import { useAuthStore } from '@/stores/auth.store'
import { useSidebarStore } from '@/stores/sidebar.store'
import { useTabsStore } from '@/stores/tabs.store'
import { useUiStore } from '@/stores/ui.store'
import { appConfig } from '@/app.config'
import { resolveBreadcrumb } from '@/lib/route-meta'
import { cn } from '@/lib/utils'

/** 顶栏 —— 折叠开关 / 面包屑 / 全局搜索（⌘K）/ 通知 / 主题设置 / 用户菜单 */
export function Topbar({ onOpenTheme }: { onOpenTheme: () => void }) {
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)
  const toggleSidebar = useSidebarStore((s) => s.toggle)
  const openCommand = useUiStore((s) => s.openCommand)
  const pathname = useLocation({ select: (l) => l.pathname })
  const navigate = useNavigate()
  const crumb = resolveBreadcrumb(pathname)

  return (
    <header className="flex h-16 shrink-0 items-center justify-between gap-4 border-b border-line bg-surface/85 px-6 backdrop-blur">
      {/* 左：折叠开关 + 面包屑 */}
      <div className="flex min-w-0 items-center gap-2.5">
        <button
          type="button"
          onClick={toggleSidebar}
          title="折叠/展开侧边栏"
          className="rounded-lg p-2 text-muted transition hover:bg-hover hover:text-ink"
        >
          <PanelLeft className="h-[17px] w-[17px]" />
        </button>
        <nav className="flex min-w-0 items-center gap-1.5 text-[12.5px]">
          <span className="truncate text-muted">{appConfig.shortName}</span>
          {crumb.map((label, i) => (
            <React.Fragment key={label}>
              <ChevronRight className="h-3.5 w-3.5 shrink-0 text-soft" />
              <span
                className={cn(
                  'truncate',
                  i === crumb.length - 1 ? 'font-medium text-ink' : 'text-muted',
                )}
              >
                {label}
              </span>
            </React.Fragment>
          ))}
        </nav>
      </div>

      <div className="flex min-w-0 items-center gap-4">
        {/* 全局搜索（⌘K 命令面板入口） */}
        <button
          type="button"
          onClick={openCommand}
          title="全局搜索（⌘K）"
          className="relative hidden h-9 w-[250px] cursor-pointer rounded-lg border border-line bg-canvas/60 pr-10 pl-8 text-left text-[12.5px] text-soft transition-colors hover:border-brand-500/60 hover:bg-canvas xl:block 2xl:w-[310px]"
        >
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-soft" />
          <span className="absolute left-8 top-1/2 -translate-y-1/2">搜索任务、服务、模型…</span>
          <kbd className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded border border-line bg-surface px-1.5 py-0.5 text-[10px] text-soft">
            ⌘K
          </kbd>
        </button>

        <div className="flex items-center gap-1.5">
          {/* 通知 */}
          <NotificationBell />

          {/* 主题设置 */}
          <button
            type="button"
            onClick={onOpenTheme}
            title="主题设置"
            className="rounded-lg p-2 text-muted transition hover:bg-hover hover:text-ink"
          >
            <Palette className="h-[17px] w-[17px]" />
          </button>

          <div className="mx-1.5 h-5 w-px bg-line" />

          {/* 用户菜单（Trigger 用 render 合并到原生 button 上，避免 button 嵌套） */}
          <AppMenu
            trigger={
              <button
                type="button"
                className="flex cursor-pointer items-center gap-2 rounded-lg p-1 pr-2 transition hover:bg-hover"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-brand-700 text-[11px] font-semibold text-white">
                  {user?.avatarText ?? '??'}
                </span>
                <span className="hidden text-left lg:block">
                  <span className="block text-[11.5px] font-medium leading-tight text-ink">{user?.name ?? '未登录'}</span>
                  <span className="block text-[9.5px] leading-tight text-soft">
                    {appConfig.roles[user?.role ?? 'viewer'].label}
                  </span>
                </span>
              </button>
            }
            items={[
              {
                label: '个人中心',
                icon: <UserRound className="h-3.5 w-3.5" />,
                onSelect: () => void navigate({ to: '/profile' }),
              },
              {
                label: '关于平台',
                icon: <Info className="h-3.5 w-3.5" />,
                onSelect: () => void navigate({ to: '/about' }),
              },
              {
                label: '退出登录',
                icon: <LogOut className="h-3.5 w-3.5" />,
                danger: true,
                onSelect: () => {
                  // 换账号后不残留上一个账号打开的页签
                  useTabsStore.getState().reset()
                  logout()
                  void navigate({ to: '/login' })
                },
              },
            ]}
          />
        </div>
      </div>
    </header>
  )
}
