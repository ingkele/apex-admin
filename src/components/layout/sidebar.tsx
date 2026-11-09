import * as React from 'react'
import { Link, useLocation, useNavigate } from '@tanstack/react-router'
import {
  Blocks, BookMarked, Brain, ChartNoAxesCombined, ChevronDown, CircleAlert, CircleDashed,
  ClipboardCheck, Component, Footprints, Info, KeyRound, Layers, LayoutDashboard, ListChecks,
  LogOut, Menu, MenuSquare, MessageSquareDot, Network, PanelLeftClose, PanelLeftOpen,
  ScrollText, Server, Settings, ShieldCheck, Table2, TextCursorInput, Users,
} from 'lucide-react'
import { appConfig, NAV_GROUPS, type NavChild, type NavIcon, type PermissionCode } from '@/app.config'
import { AppMenu } from '@/components/ui/menu'
import { useAuthStore } from '@/stores/auth.store'
import { useSidebarStore } from '@/stores/sidebar.store'
import { useTabsStore } from '@/stores/tabs.store'
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

/** 激活判断：工作台精确匹配，其余前缀匹配 */
function isActive(pathname: string, to: string) {
  return to === '/dashboard' ? pathname === '/dashboard' : pathname.startsWith(to)
}

/** 按权限递归过滤子树：父级无可见子级时整体隐藏 */
function filterNav(
  children: NavChild[],
  hasPermission: (p: PermissionCode) => boolean,
): NavChild[] {
  return children.flatMap((c) => {
    if (c.permission && !hasPermission(c.permission)) return []
    if (c.children?.length) {
      const kids = filterNav(c.children, hasPermission)
      return kids.length ? [{ ...c, children: kids }] : []
    }
    return [c]
  })
}

/** 收集子树全部叶子（折叠态侧弹菜单用，调用前已按权限过滤） */
function collectLeaves(node: NavChild): { label: string; to: string }[] {
  if (!node.children?.length) return node.to ? [{ label: node.label, to: node.to }] : []
  return node.children.flatMap(collectLeaves)
}

interface NavNodeProps {
  node: NavChild
  /** 图标兜底：沿用分组图标 */
  groupIcon: NavIcon
  /** 展开状态键：分组 › 父级链 拼接 */
  idPath: string
  /** 全局展开集合：每个节点自取 own 状态，任意层级通用 */
  expanded: ReadonlySet<string>
  onToggle: (id: string) => void
  /** 激活链路（含任一后代激活的父级 idPath） */
  activeTrail: ReadonlySet<string>
  pathname: string
  collapsed: boolean
}

/** 单个导航节点：叶子 → 链接；父级 → 展开/收起（折叠态侧弹） */
function NavNode({ node, groupIcon, idPath, expanded, onToggle, activeTrail, pathname, collapsed }: NavNodeProps) {
  const navigate = useNavigate()
  const hasKids = !!node.children?.length
  const open = expanded.has(idPath)
  const childActive = hasKids && activeTrail.has(idPath)
  const selfActive = !hasKids && !!node.to && isActive(pathname, node.to)
  const Icon = ICONS[node.icon ?? groupIcon]

  const rowCls = cn(
    'flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] outline-none transition-colors',
    childActive || selfActive
      ? 'bg-sidebar-active font-medium text-sidebar-active-ink'
      : 'text-sidebar-muted hover:bg-sidebar-hover hover:text-sidebar-ink',
  )

  // —— 折叠态（64px 图标栏）——
  if (collapsed) {
    if (hasKids) {
      return (
        <AppMenu
          side="right"
          align="start"
          trigger={
            <button
              type="button"
              title={node.label}
              className={cn(rowCls, 'w-full justify-center px-0')}
            >
              <Icon className="h-[15px] w-[15px] shrink-0" />
            </button>
          }
          items={collectLeaves(node).map((leaf) => ({
            label: leaf.label,
            onSelect: () => void navigate({ to: leaf.to }),
          }))}
        />
      )
    }
    if (!node.to) return null
    return (
      <Link to={node.to} title={node.label} className={cn(rowCls, 'justify-center px-0')}>
        <Icon className="h-[15px] w-[15px] shrink-0" />
      </Link>
    )
  }

  // —— 展开态：父级节点 ——
  if (hasKids) {
    return (
      <div>
        <button type="button" onClick={() => onToggle(idPath)} className={cn(rowCls, 'w-full')}>
          <Icon className="h-[15px] w-[15px] shrink-0" />
          <span className="min-w-0 flex-1 truncate text-left">{node.label}</span>
          <ChevronDown
            className={cn(
              'h-3.5 w-3.5 shrink-0 text-sidebar-muted/70 transition-transform duration-200',
              open && 'rotate-180',
            )}
          />
        </button>
        {/* grid-rows 动画：0fr ↔ 1fr，高度平滑过渡；左侧引导线对齐父级行图标 */}
        <div
          className={cn(
            'grid transition-[grid-template-rows] duration-200 ease-out',
            open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]',
          )}
        >
          <div className="overflow-hidden">
            <div
              className="mt-0.5 space-y-0.5 border-l border-sidebar-line/80 pl-2"
              style={{ marginLeft: 18 }}
            >
              {node.children?.map((kid) => (
                <NavNode
                  key={kid.label}
                  node={kid}
                  groupIcon={node.icon ?? groupIcon}
                  idPath={`${idPath}/${kid.label}`}
                  expanded={expanded}
                  onToggle={onToggle}
                  activeTrail={activeTrail}
                  pathname={pathname}
                  collapsed={collapsed}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // —— 展开态：叶子 ——
  if (!node.to) return null
  return (
    <Link to={node.to} title={node.label} className={rowCls}>
      <Icon className="h-[15px] w-[15px] shrink-0" />
      <span className="truncate">{node.label}</span>
    </Link>
  )
}

/** 侧边栏 —— 248px，背景默认跟随明暗模式（原型 bg-surface 机制），主题设置「深色」时强制深色 */
export function Sidebar() {
  const navigate = useNavigate()
  const collapsed = useSidebarStore((s) => s.collapsed)
  const toggle = useSidebarStore((s) => s.toggle)
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)
  const hasPermission = useAuthStore((s) => s.hasPermission)
  const { pathname } = useLocation()

  /** 用户手动展开/收起的节点（含激活链路自动展开的） */
  const [expanded, setExpanded] = React.useState<ReadonlySet<string>>(() => new Set())
  const onToggle = React.useCallback((id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [])

  /** 可见树（按权限递归过滤） */
  const visibleGroups = React.useMemo(
    () =>
      NAV_GROUPS.map((g) => ({ ...g, children: filterNav(g.children, hasPermission) })).filter(
        (g) => g.children.length > 0,
      ),
    [hasPermission],
  )

  /** 激活链路：任一后代激活的父级节点集合（键 = 分组/父级链） */
  const activeTrail = React.useMemo(() => {
    const trail = new Set<string>()
    const walk = (children: NavChild[], idPath: string[]): boolean => {
      let hit = false
      for (const c of children) {
        const id = [...idPath, c.label].join('/')
        if (c.children?.length) {
          if (walk(c.children, [...idPath, c.label])) {
            trail.add(id)
            hit = true
          }
        } else if (c.to && isActive(pathname, c.to)) {
          hit = true
        }
      }
      return hit
    }
    for (const g of visibleGroups) walk(g.children, [g.label])
    return trail
  }, [visibleGroups, pathname])

  // 路由变化时自动展开激活链路上的父级（只加不减，用户手动收起的保留）
  React.useEffect(() => {
    setExpanded((prev) => {
      let changed = false
      const next = new Set(prev)
      for (const id of activeTrail) {
        if (!next.has(id)) {
          next.add(id)
          changed = true
        }
      }
      return changed ? next : prev
    })
  }, [activeTrail])

  /** 退出：与顶栏用户菜单同口径（重置页签 + 清会话 + 回登录页） */
  const handleLogout = React.useCallback(() => {
    useTabsStore.getState().reset()
    logout()
    void navigate({ to: '/login' })
  }, [logout, navigate])

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
        {visibleGroups.map((group) => (
          <div key={group.label} className="mb-4">
            {!collapsed ? (
              <div className="mb-1.5 px-2.5 text-[10.5px] font-medium tracking-wider text-sidebar-muted/80">
                {group.label}
              </div>
            ) : null}
            <div className="space-y-0.5">
              {group.children.map((child) => {
                const idPath = `${group.label}/${child.label}`
                return (
                  <NavNode
                    key={child.label}
                    node={child}
                    groupIcon={group.icon}
                    idPath={idPath}
                    expanded={expanded}
                    onToggle={onToggle}
                    activeTrail={activeTrail}
                    pathname={pathname}
                    collapsed={collapsed}
                  />
                )
              })}
            </div>
          </div>
        ))}
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
                onClick={handleLogout}
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
