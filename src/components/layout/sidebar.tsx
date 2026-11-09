import * as React from 'react'
import { Link, useLocation } from '@tanstack/react-router'
import {
  Blocks, BookMarked, Brain, ChartNoAxesCombined, CircleAlert, CircleDashed, ClipboardCheck, Component,
  Footprints, Info, KeyRound, Layers, LayoutDashboard, ListChecks, LogOut, Menu, MenuSquare,
  MessageSquareDot, Network, PanelLeftClose, PanelLeftOpen, ScrollText, Server, Settings,
  ShieldCheck, Table2, TextCursorInput, Users,
} from 'lucide-react'
import { appConfig, NAV_GROUPS, type NavIcon } from '@/app.config'
import { useAuthStore } from '@/stores/auth.store'
import { useSidebarStore } from '@/stores/sidebar.store'
import { cn } from '@/lib/utils'

const ICONS: Record<NavIcon, React.ComponentType<{ className?: string }>> = {
  dashboard: LayoutDashboard,
  analytics: ChartNoAxesCombined,
  tasks: ListChecks,
  services: Server,
  models: Brain,
  keys: KeyRound,
  users: Users,
  roles: ShieldCheck,
  menu: MenuSquare,
  dept: Network,
  dict: BookMarked,
  components: Blocks,
  examples: Layers,
  errors: CircleAlert,
  component: Component,
  input: TextCursorInput,
  feedback: MessageSquareDot,
  navigation: Menu,
  table: Table2,
  list: ListChecks,
  form: ClipboardCheck,
  flow: Footprints,
  state: CircleDashed,
  about: Info,
  audit: ScrollText,
  settings: Settings,
}

/** 侧边栏 —— 248px，背景默认跟随明暗模式（原型 bg-surface 机制），主题设置「深色」时强制深色 */
export function Sidebar() {
  const collapsed = useSidebarStore((s) => s.collapsed)
  const toggle = useSidebarStore((s) => s.toggle)
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)
  const hasPermission = useAuthStore((s) => s.hasPermission)
  const { pathname } = useLocation()

  return (
    <aside
      className={cn(
        'flex h-full shrink-0 flex-col border-r border-sidebar-line bg-sidebar-bg transition-[width] duration-200',
        collapsed ? 'w-[64px]' : 'w-[248px]',
      )}
    >
      {/* logo */}
      <div className="flex h-16 shrink-0 items-center gap-2.5 border-b border-sidebar-line px-4">
        <img src="/logo.svg" alt={appConfig.name} className="h-8 w-8 shrink-0" />
        {!collapsed ? (
          <div className="min-w-0 flex-1 truncate text-[14px] font-semibold text-sidebar-ink">
            {appConfig.name}
          </div>
        ) : null}
        <button
          type="button"
          onClick={toggle}
          title={collapsed ? '展开侧边栏' : '折叠侧边栏'}
          className="rounded-md p-1.5 text-sidebar-muted transition hover:bg-sidebar-hover hover:text-sidebar-ink"
        >
          {collapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
        </button>
      </div>

      {/* 导航 */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        {NAV_GROUPS.map((group) => {
          const children = group.children.filter((c) => !c.permission || hasPermission(c.permission))
          if (children.length === 0) return null
          return (
            <div key={group.label} className="mb-4">
              {!collapsed ? (
                <div className="mb-1.5 px-2.5 text-[10.5px] font-medium tracking-wider text-sidebar-muted/80">
                  {group.label}
                </div>
              ) : null}
              <div className="space-y-0.5">
                {children.map((child) => {
                  const Icon = ICONS[child.icon ?? group.icon]
                  const active = child.to === '/dashboard'
                    ? pathname === '/dashboard'
                    : pathname.startsWith(child.to)
                  return (
                    <Link
                      key={child.to}
                      to={child.to}
                      title={child.label}
                      className={cn(
                        'flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] outline-none transition-colors',
                        active
                          ? 'bg-sidebar-active font-medium text-sidebar-active-ink'
                          : 'text-sidebar-muted hover:bg-sidebar-hover hover:text-sidebar-ink',
                        collapsed && 'justify-center px-0',
                      )}
                    >
                      <Icon className="h-[15px] w-[15px] shrink-0" />
                      {!collapsed ? <span className="truncate">{child.label}</span> : null}
                    </Link>
                  )
                })}
              </div>
            </div>
          )
        })}
      </nav>

      {/* 用户卡 */}
      <div className="border-t border-sidebar-line p-3">
        <div className="flex items-center gap-2.5 rounded-lg border border-sidebar-line bg-sidebar-hover/60 p-2">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-brand-700 text-[11px] font-semibold text-white">
            {user?.avatarText ?? '??'}
          </div>
          {!collapsed ? (
            <>
              <div className="min-w-0 flex-1">
                <div className="truncate text-[11.5px] font-medium text-sidebar-ink">{user?.name ?? '未登录'}</div>
                <div className="truncate text-[9.5px] text-soft">
                  {appConfig.roles[user?.role ?? 'viewer'].label}
                </div>
              </div>
              <button
                type="button"
                onClick={logout}
                title="退出登录"
                className="rounded-md p-1 text-soft transition hover:bg-sidebar-hover hover:text-ink"
              >
                <LogOut className="h-3.5 w-3.5" />
              </button>
            </>
          ) : null}
        </div>
      </div>
    </aside>
  )
}
