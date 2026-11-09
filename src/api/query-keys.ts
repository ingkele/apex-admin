/**
 * queryKeys —— TanStack Query 缓存键统一登记处。
 * 与 hooks 分离，便于跨模块做缓存失效（invalidateQueries）时引用。
 */
import type { PageQuery } from '@/lib/http'

export const qk = {
  dashboard: ['dashboard'] as const,
  tasks: (params?: PageQuery) => ['tasks', params] as const,
  taskSummary: ['tasks', 'summary'] as const,
  task: (id: string) => ['tasks', id] as const,
  services: ['services'] as const,
  serviceLogs: (id: string) => ['services', id, 'logs'] as const,
  models: ['models'] as const,
  keys: ['keys'] as const,
  users: (params?: PageQuery) => ['users', params] as const,
  userStats: ['users', 'stats'] as const,
  roles: ['roles'] as const,
  audit: (params?: PageQuery) => ['audit', params] as const,
  auditStats: ['audit', 'stats'] as const,
  settings: ['settings'] as const,
  dashboardLayout: ['user', 'preferences', 'dashboard-layout'] as const,
  systemMenus: ['system', 'menus'] as const,
  depts: ['system', 'depts'] as const,
  dicts: ['system', 'dicts'] as const,
  analytics: (range: string) => ['analytics', range] as const,
  notifications: ['notifications'] as const,
}
