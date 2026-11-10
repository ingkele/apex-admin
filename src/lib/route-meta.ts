import { NAV_GROUPS, type NavChild } from '@/app.config'

/**
 * 路由元信息统一解析 —— 顶栏面包屑与多页签栏共用同一份来源，
 * 避免两处各写一套标题导致「页签叫 A、面包屑叫 B」。
 * 支持任意层级嵌套菜单：parents 记录叶子之上的父级链。
 */

export interface RouteMeta {
  /** 所属导航分组（概览页等一级页面可能为空） */
  group?: string
  title: string
  /** 工作台为固定页签，不可关闭 */
  closable: boolean
}

/** 固定首页页签 */
export const HOME_TAB = { path: '/dashboard', title: '工作台' } as const

interface FlatEntry {
  group: string
  /** 父级菜单链（如 ['成员与权限']） */
  parents: string[]
  title: string
}

/** 递归展开导航树：只收叶子节点（有 to 的）；hideChildren 节点自身算叶子，其子级仍登记（供 URL 直达时解析标题/面包屑） */
function flattenNav(children: NavChild[], group: string, parents: string[]): [string, FlatEntry][] {
  const out: [string, FlatEntry][] = []
  for (const c of children) {
    if (c.children?.length) {
      if (c.hideChildren && c.to) out.push([c.to, { group, parents, title: c.label }])
      out.push(...flattenNav(c.children, group, [...parents, c.label]))
    } else if (c.to) {
      out.push([c.to, { group, parents, title: c.label }])
    }
  }
  return out
}

const FLAT = new Map<string, FlatEntry>(
  NAV_GROUPS.flatMap((g) => flattenNav(g.children, g.label, [])),
)

export function resolveRouteMeta(pathname: string): RouteMeta {
  const exact = FLAT.get(pathname)
  if (exact) {
    return { group: exact.group, title: exact.title, closable: pathname !== HOME_TAB.path }
  }

  // 详情页等动态路由
  if (/^\/tasks\/[^/]+$/.test(pathname)) {
    return { group: '任务中心', title: '任务详情', closable: true }
  }
  if (pathname === '/profile') return { title: '个人中心', closable: true }
  if (pathname === '/about') return { title: '关于', closable: true }

  return { title: '未知页面', closable: true }
}

/** 面包屑层级：「其他」组只显示一级，其余「分组 › …父级链 › 页面」 */
export function resolveBreadcrumb(pathname: string): string[] {
  const meta = resolveRouteMeta(pathname)
  const exact = FLAT.get(pathname)
  if (!exact || !meta.group || meta.group === '其他') return [meta.title]
  // 工作台为首页，原型只显示一级
  if (pathname === HOME_TAB.path) return [meta.title]
  if (/^\/tasks\/[^/]+$/.test(pathname)) return ['任务中心', '任务列表', '任务详情']
  return [meta.group, ...exact.parents, meta.title]
}
