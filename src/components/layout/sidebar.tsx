import * as React from 'react'
import { Link, useLocation, useNavigate } from '@tanstack/react-router'
import {
  AppWindow, Blocks, BookMarked, Brain, Braces, ChartNoAxesCombined, ChevronDown, CircleAlert,
  CircleDashed, ClipboardCheck, ClipboardCopy, Component, Download, Droplets, ExternalLink,
  EyeOff, FlaskConical, Footprints, Frame, Info, KeyRound, Layers, LayoutDashboard, Link2,
  ListChecks, ListTree, LogOut, Maximize, Menu, MenuSquare, MessageSquareDot, Network, Palette,
  PanelLeftClose, ScrollText, Server, Settings, ShieldCheck, SlidersHorizontal, Sparkles,
  SquareArrowOutUpRight, Table2, Tag, TextCursorInput, TimerOff, Users, Zap,
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
  demo: FlaskConical,
  badge: Tag,
  sparkles: Sparkles,
  external: ExternalLink,
  nested: ListTree,
  embed: Frame,
  feature: Zap,
  expired: TimerOff,
  palette: Palette,
  watermark: Droplets,
  preference: SlidersHorizontal,
  tabs: AppWindow,
  hideMenu: EyeOff,
  fullscreen: Maximize,
  download: Download,
  clipboard: ClipboardCopy,
  param: Link2,
  newWindow: SquareArrowOutUpRight,
  tanstack: Zap,
  serialize: Braces,
}

/** 激活判断：工作台精确匹配，其余前缀匹配 */
function isActive(pathname: string, to: string) {
  return to === '/dashboard' ? pathname === '/dashboard' : pathname.startsWith(to)
}

/** 菜单徽标（数字 / 短文本，多色调） */
function NavBadge({ badge }: { badge: NonNullable<NavChild['badge']> }) {
  const tone = badge.tone ?? 'brand'
  const skin: Record<string, string> = {
    brand: 'bg-brand-500 text-white',
    rose: 'bg-rose-500 text-white',
    amber: 'bg-amber-500 text-white',
    slate: 'bg-slate-500/90 text-white',
  }
  const isNumeric = /^\d+$/.test(badge.text)
  return (
    <span
      className={cn(
        'ml-auto shrink-0 rounded-full text-[10px] font-semibold leading-none',
        isNumeric ? 'min-w-[16px] px-1 py-[3px] text-center' : 'px-1.5 py-[3px]',
        skin[tone],
      )}
    >
      {badge.text}
    </span>
  )
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

/** 收集子树全部叶子（折叠态侧弹菜单用，调用前已按权限过滤）；hideChildren 节点按单链接返回 */
function collectLeaves(node: NavChild): { label: string; to: string; query?: Record<string, string | number> }[] {
  if (!node.children?.length || node.hideChildren)
    return node.to ? [{ label: node.label, to: node.to, query: node.query }] : []
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
  // hideChildren：有 children 但折叠为单链接，子页面仅 URL 直达
  const hasKids = !!node.children?.length && !node.hideChildren
  const open = expanded.has(idPath)
  const childActive = hasKids && activeTrail.has(idPath)
  const selfActive = !hasKids && !!node.to && isActive(pathname, node.to)
  const active = childActive || selfActive
  // 激活态可换图标（activeIcon）
  const Icon = ICONS[active && node.activeIcon ? node.activeIcon : (node.icon ?? groupIcon)]

  const rowCls = cn(
    'flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] outline-none transition-colors',
    active
      ? 'bg-sidebar-active font-medium text-sidebar-active-ink'
      : 'text-sidebar-muted hover:bg-sidebar-hover hover:text-sidebar-ink',
  )

  // —— 站内路由 · 新窗口打开（target: '_blank'）：不参与站内激活态 ——
  if (node.target === '_blank' && node.to && !hasKids) {
    return (
      <a
        href={node.to}
        target="_blank"
        rel="noreferrer noopener"
        title={node.label}
        className={cn(rowCls, collapsed && 'justify-center px-0')}
      >
        <Icon className="h-[15px] w-[15px] shrink-0" />
        {!collapsed && (
          <>
            <span className="truncate">{node.label}</span>
            <SquareArrowOutUpRight className="ml-auto h-3 w-3 shrink-0 text-sidebar-muted/60" />
          </>
        )}
      </a>
    )
  }

  // —— 外链：新窗口打开，不参与站内激活态 ——
  if (node.external && !hasKids) {
    return (
      <a
        href={node.external}
        target="_blank"
        rel="noreferrer noopener"
        title={node.label}
        className={cn(rowCls, collapsed && 'justify-center px-0')}
      >
        <Icon className="h-[15px] w-[15px] shrink-0" />
        {!collapsed && (
          <>
            <span className="truncate">{node.label}</span>
            <ExternalLink className="ml-auto h-3 w-3 shrink-0 text-sidebar-muted/60" />
          </>
        )}
      </a>
    )
  }

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
            onSelect: () => void navigate({ to: leaf.to, search: leaf.query }),
          }))}
        />
      )
    }
    if (!node.to) return null
    return (
      <Link
        to={node.to}
        search={node.query}
        title={node.label}
        className={cn(rowCls, 'justify-center px-0')}
      >
        <Icon className="h-[15px] w-[15px] shrink-0" />
      </Link>
    )
  }

  // —— 展开态：父级节点 ——
  if (hasKids) {
    return (
      <div>
        <button
          type="button"
          onClick={() => onToggle(idPath)}
          data-nav-active={active ? 'true' : undefined}
          className={cn(rowCls, 'w-full')}
        >
          <Icon className="h-[15px] w-[15px] shrink-0" />
          <span className="min-w-0 flex-1 truncate text-left">{node.label}</span>
          {node.badge ? <NavBadge badge={node.badge} /> : null}
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
    <Link
      to={node.to}
      search={node.query}
      title={node.label}
      data-nav-active={selfActive ? 'true' : undefined}
      className={rowCls}
    >
      <Icon className="h-[15px] w-[15px] shrink-0" />
      <span className="min-w-0 flex-1 truncate">{node.label}</span>
      {node.badge ? <NavBadge badge={node.badge} /> : null}
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
        // hideChildren 节点按叶子对待（点击即跳转，不展开）
        if (c.children?.length && !c.hideChildren) {
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

  /** 激活项滚入视野：菜单变长后，深层页面激活项可能在可视区外 */
  const navRef = React.useRef<HTMLElement>(null)
  React.useEffect(() => {
    if (collapsed) return
    // 等展开动画（200ms）结束后再量位置，否则算出来是收起态高度
    const timer = window.setTimeout(() => {
      const nodes = navRef.current?.querySelectorAll<HTMLElement>('[data-nav-active="true"]')
      nodes?.item(nodes.length - 1)?.scrollIntoView({ block: 'nearest' })
    }, 240)
    return () => window.clearTimeout(timer)
  }, [pathname, collapsed, activeTrail])

  return (
    <aside
      className={cn(
        'flex h-full shrink-0 flex-col border-r border-sidebar-line bg-sidebar-bg transition-[width] duration-200',
        collapsed ? 'w-[64px]' : 'w-[248px]',
      )}
    >
      {/* logo —— 折叠态只有 64px，容纳不下 logo + 开关，此时开关交给顶栏 */}
      <div
        className={cn(
          'flex h-16 shrink-0 items-center gap-2.5 border-b border-sidebar-line px-4',
          collapsed && 'justify-center',
        )}
      >
        <img src="/logo.svg" alt={appConfig.name} className="h-8 w-8 shrink-0" />
        {!collapsed ? (
          <>
            <div className="min-w-0 flex-1 truncate text-[14px] font-semibold text-sidebar-ink">
              {appConfig.name}
            </div>
            <button
              type="button"
              onClick={toggle}
              title="折叠侧边栏"
              className="rounded-md p-3.5 text-sidebar-muted transition hover:bg-sidebar-hover hover:text-sidebar-ink"
            >
              <PanelLeftClose className="h-4 w-4" />
            </button>
          </>
        ) : null}
      </div>

      {/* 导航 */}
      <nav ref={navRef} className="flex-1 overflow-y-auto px-3 py-4">
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
