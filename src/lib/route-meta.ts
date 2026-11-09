import { NAV_GROUPS } from '@/app.config'

/**
 * 路由元信息统一解析 —— 顶栏面包屑与多页签栏共用同一份来源，
 * 避免两处各写一套标题导致「页签叫 A、面包屑叫 B」。
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

const FLAT: Record<string, { group: string; title: string }> = Object.fromEntries(
  NAV_GROUPS.flatMap((g) => g.children.map((c) => [c.to, { group: g.label, title: c.label }])),
)

export function resolveRouteMeta(pathname: string): RouteMeta {
  const exact = FLAT[pathname]
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

/** 面包屑层级：概览、「其他」组只显示一级，其余「分组 > 页面」两级 */
export function resolveBreadcrumb(pathname: string): string[] {
  const meta = resolveRouteMeta(pathname)
  if (!meta.group || meta.group === '其他') return [meta.title]
  // 工作台为首页，原型只显示一级；其余（含分析页）显示「分组 › 页面」
  if (pathname === HOME_TAB.path) return [meta.title]
  if (/^\/tasks\/[^/]+$/.test(pathname)) return ['任务中心', '任务列表', '任务详情']
  return [meta.group, meta.title]
}
