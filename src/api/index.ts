import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { http, type PageQuery, type PageResult } from '@/lib/http'
import type {
  AnalyticsKpi, AnalyticsPoint,
  ApiKeyItem, AuditItem, DeptNode, DictType, HealthTone, LogLine, MenuNode, ModelItem,
  NotificationItem, RoleItem, ServiceHealth, ServiceItem, Settings, Task, UserItem,
} from '@/mocks/db'
/**
 * 数据请求层 —— TanStack Query hooks + queryKeys。
 * 页面只消费 hooks；换后端时 hooks 内部的 http 调用路径不变（adapter 见 lib/http.ts）。
 */

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

// —— 工作台 ——
export interface DashboardOverview {
  taskSummary: { total: number; running: number; failed: number; queued: number }
  serviceStats: { total: number; healthy: number; abnormal: number; availability: number; namespaces: number }
  userStats: { total: number; active: number; invited: number; disabled: number; admin: number }
  auditStats: { total: number; highRisk: number; failed: number; retentionDays: number }
  /** 4 张统计卡（原型口径：今日任务数 / 成功率 / 失败数 / 运行中） */
  dashboardStats: {
    today: { value: number; yesterday: number; delta: string; trend: 'up' | 'down'; bars: number[] }
    success: { value: number; target: number; delta: string; trend: 'up' | 'down'; note: string; verdict: string }
    failed: { value: number; compare: string; delta: string; trend: 'up' | 'down'; pending: number; oldest: string }
    running: { value: number; queue: number; breakdown: { label: string; value: number }[] }
  }
  /** 服务健康 6 宫格 */
  dashboardHealth: { name: string; metric: string; value: string; tone: HealthTone }[]
  failedTasks: Task[]
  updatedAt: string
}

export const useDashboardOverview = () =>
  useQuery({ queryKey: qk.dashboard, queryFn: () => http.get<DashboardOverview>('/dashboard/overview') })

export const useTaskTrend = () =>
  useQuery({
    queryKey: [...qk.dashboard, 'trend'],
    queryFn: () => http.get<{ day: string; total: number; success: number; failed: number }[]>('/dashboard/trend'),
  })

// —— 任务 ——
export const useTasks = (params: PageQuery) =>
  useQuery({ queryKey: qk.tasks(params), queryFn: () => http.get<PageResult<Task>>('/tasks', params) })

export const useTaskSummary = () =>
  useQuery({ queryKey: qk.taskSummary, queryFn: () => http.get<{ total: number; running: number; failed: number; queued: number }>('/tasks/summary') })

export const useTask = (id: string) =>
  useQuery({ queryKey: qk.task(id), queryFn: () => http.get<Task>(`/tasks/${id}`) })

export function useTaskActions() {
  const qc = useQueryClient()
  const invalidate = () => qc.invalidateQueries({ queryKey: ['tasks'] })
  const retry = useMutation({
    mutationFn: (id: string) => http.post(`/tasks/${id}/retry`),
    onSuccess: invalidate,
  })
  const cancel = useMutation({
    mutationFn: (id: string) => http.post(`/tasks/${id}/cancel`),
    onSuccess: invalidate,
  })
  const create = useMutation({
    mutationFn: (body: Record<string, unknown>) => http.post<Task>('/tasks', body),
    onSuccess: invalidate,
  })
  return { retry, cancel, create }
}

// —— 服务 ——
export const useServices = () =>
  useQuery({ queryKey: qk.services, queryFn: () => http.get<ServiceItem[]>('/services') })

export const useServiceLogs = (id: string) =>
  useQuery({ queryKey: qk.serviceLogs(id), queryFn: () => http.get<LogLine[]>(`/services/${id}/logs`) })

/** 聚合日志流（服务名/级别/关键字由服务端过滤） */
export const useLogs = (filters: { service?: string; level?: string; keyword?: string } = {}) =>
  useQuery({
    queryKey: [...qk.serviceLogs('all'), filters.service ?? 'all', filters.level ?? 'all', filters.keyword ?? ''],
    queryFn: () => http.get<LogLine[]>('/logs', { ...filters }),
  })

export interface LogStats {
  throughput: string
  throughputUnit: string
  errorFatal: number
  errorDelta: string
  warn: number
  warnAttention: number
  latency: string
  latencyNote: string
}

export const useLogStats = () =>
  useQuery({ queryKey: [...qk.serviceLogs('all'), 'stats'], queryFn: () => http.get<LogStats>('/logs/stats') })

export type { ServiceHealth }

export const useRestartService = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => http.post(`/services/${id}/restart`),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.services }),
  })
}

// —— 模型 ——
export const useModels = () =>
  useQuery({ queryKey: qk.models, queryFn: () => http.get<ModelItem[]>('/models') })

export function useModelActions() {
  const qc = useQueryClient()
  const invalidate = () => qc.invalidateQueries({ queryKey: qk.models })
  const setDefault = useMutation({
    mutationFn: (id: string) => http.post(`/models/${id}/default`),
    onSuccess: invalidate,
  })
  const test = useMutation({
    mutationFn: (id: string) => http.post<{ latencyMs: number }>(`/models/${id}/test`),
  })
  const saveParams = useMutation({
    mutationFn: ({ id, params }: { id: string; params: Record<string, number> }) =>
      http.put(`/models/${id}/params`, { params }),
    onSuccess: invalidate,
  })
  const sync = useMutation({
    mutationFn: () => http.post('/models/sync'),
    onSuccess: invalidate,
  })
  const toggle = useMutation({
    mutationFn: ({ id, enabled }: { id: string; enabled: boolean }) =>
      http.put(`/models/${id}/status`, { status: enabled ? 'enabled' : 'disabled' }),
    onSuccess: invalidate,
  })
  return { setDefault, test, saveParams, sync, toggle }
}

// —— API Key ——
export const useApiKeys = () =>
  useQuery({ queryKey: qk.keys, queryFn: () => http.get<ApiKeyItem[]>('/keys') })

export function useKeyActions() {
  const qc = useQueryClient()
  const invalidate = () => qc.invalidateQueries({ queryKey: qk.keys })
  const create = useMutation({
    mutationFn: (body: { name: string; scope?: string }) => http.post<ApiKeyItem & { secret: string }>('/keys', body),
    onSuccess: invalidate,
  })
  const revoke = useMutation({
    mutationFn: (id: string) => http.post(`/keys/${id}/revoke`),
    onSuccess: invalidate,
  })
  return { create, revoke }
}

// —— 用户 ——
export const useUsers = (params: PageQuery) =>
  useQuery({ queryKey: qk.users(params), queryFn: () => http.get<PageResult<UserItem>>('/users', params) })

export const useUserStats = () =>
  useQuery({ queryKey: qk.userStats, queryFn: () => http.get<{ total: number; active: number; invited: number; disabled: number; admin: number }>('/users/stats') })

export function useUserActions() {
  const qc = useQueryClient()
  const invalidate = () => qc.invalidateQueries({ queryKey: ['users'] })
  const invite = useMutation({
    mutationFn: (body: { name: string; email: string; role: string }) => http.post('/users/invite', body),
    onSuccess: invalidate,
  })
  const setRole = useMutation({
    mutationFn: ({ id, role }: { id: string; role: string }) => http.put(`/users/${id}/role`, { role }),
    onSuccess: invalidate,
  })
  const toggleStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => http.post(`/users/${id}/status`, { status }),
    onSuccess: invalidate,
  })
  return { invite, setRole, toggleStatus }
}

// —— 角色 ——
export const useRoles = () =>
  useQuery({ queryKey: qk.roles, queryFn: () => http.get<RoleItem[]>('/roles') })

export const useSaveRolePermissions = () =>
  useMutation({
    mutationFn: ({ id, permissions }: { id: string; permissions: string[] }) =>
      http.put(`/roles/${id}/permissions`, { permissions }),
  })

// —— 审计 ——
export const useAuditLogs = (params: PageQuery) =>
  useQuery({ queryKey: qk.audit(params), queryFn: () => http.get<PageResult<AuditItem>>('/audit', params) })

export const useAuditStats = () =>
  useQuery({ queryKey: qk.auditStats, queryFn: () => http.get<{ total: number; highRisk: number; failed: number; retentionDays: number }>('/audit/stats') })

// —— 系统参数 ——
export const useSettings = () =>
  useQuery({ queryKey: qk.settings, queryFn: () => http.get<Settings>('/settings') })

export const useSaveSettings = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (settings: Settings) => http.put('/settings', { settings }),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.settings }),
  })
}

// —— 工作台布局持久化（§6.6）——
export interface DashboardLayoutPref {
  version: number
  layouts: Record<string, { i: string; x: number; y: number; w: number; h: number }[]> | null
}

export const useDashboardLayoutPref = () =>
  useQuery({ queryKey: qk.dashboardLayout, queryFn: () => http.get<DashboardLayoutPref>('/user/preferences/dashboard-layout') })

export const useSaveDashboardLayout = () =>
  useMutation({
    mutationFn: (layouts: DashboardLayoutPref['layouts']) =>
      http.put('/user/preferences/dashboard-layout', { layouts }),
  })

// —— 菜单管理 ——
export const useSystemMenus = () =>
  useQuery({
    queryKey: qk.systemMenus,
    queryFn: () => http.get<{ items: MenuNode[]; stats: { total: number; dirs: number; menus: number; buttons: number; hidden: number } }>('/system/menus'),
  })

export const useCreateMenu = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: Partial<MenuNode>) => http.post<MenuNode>('/system/menus', body),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.systemMenus }),
  })
}

export const useToggleMenuStatus = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => http.put<MenuNode>(`/system/menus/${id}/status`, {}),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.systemMenus }),
  })
}

export const useDeleteMenu = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => http.del(`/system/menus/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.systemMenus }),
  })
}

// —— 部门管理 ——
export const useDepts = () =>
  useQuery({
    queryKey: qk.depts,
    queryFn: () => http.get<{ items: DeptNode[]; stats: { total: number; members: number; active: number; disabled: number } }>('/system/depts'),
  })

export const useCreateDept = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: Partial<DeptNode>) => http.post<DeptNode>('/system/depts', body),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.depts }),
  })
}

// —— 字典管理 ——
export const useDicts = () =>
  useQuery({ queryKey: qk.dicts, queryFn: () => http.get<DictType[]>('/system/dicts') })

export const useCreateDictItem = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ code, body }: { code: string; body: Record<string, unknown> }) =>
      http.post(`/system/dicts/${code}/items`, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.dicts }),
  })
}

// —— 分析页 ——
export interface AnalyticsData {
  range: '7d' | '30d'
  kpis: AnalyticsKpi[]
  trend: AnalyticsPoint[]
  sources: { name: string; value: number; color: string }[]
  latency: { service: string; p50: number; p95: number }[]
  errors: { type: string; count: number; share: number; tone: 'rose' | 'amber' | 'brand' | 'slate' }[]
  heat: number[][]
  models: { name: string; provider: string; calls: number; latency: string; success: string; cost: string; share: number }[]
  insights: { title: string; value: string; note: string; tone: 'brand' | 'amber' | 'rose' }[]
  updatedAt: string
}

export const useAnalytics = (range: '7d' | '30d') =>
  useQuery({
    queryKey: qk.analytics(range),
    queryFn: () => http.get<AnalyticsData>('/analytics', { range }),
  })

// —— 通知 ——
export const useNotifications = () =>
  useQuery({ queryKey: qk.notifications, queryFn: () => http.get<NotificationItem[]>('/notifications') })

export const useMarkAllNotificationsRead = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () => http.post<{ ok: boolean }>('/notifications/read-all'),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.notifications }),
  })
}

export const useMarkNotificationRead = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => http.post<NotificationItem>(`/notifications/${id}/read`),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.notifications }),
  })
}
