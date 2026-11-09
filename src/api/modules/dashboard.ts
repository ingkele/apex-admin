import { useMutation, useQuery } from '@tanstack/react-query'
import { http } from '@/lib/http'
import type { HealthTone, Task } from '@/mocks/db'
import { qk } from '../query-keys'

/** 工作台 —— 请求地址（后端变动时改这里；含工作台布局的用户偏好接口） */
export const dashboardUrls = {
  overview: '/dashboard/overview',
  trend: '/dashboard/trend',
  layoutPref: '/user/preferences/dashboard-layout',
} as const

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
  useQuery({ queryKey: qk.dashboard, queryFn: () => http.get<DashboardOverview>(dashboardUrls.overview) })

export const useTaskTrend = () =>
  useQuery({
    queryKey: [...qk.dashboard, 'trend'],
    queryFn: () => http.get<{ day: string; total: number; success: number; failed: number }[]>(dashboardUrls.trend),
  })

// —— 工作台布局持久化（§6.6）——
export interface DashboardLayoutPref {
  version: number
  layouts: Record<string, { i: string; x: number; y: number; w: number; h: number }[]> | null
}

export const useDashboardLayoutPref = () =>
  useQuery({ queryKey: qk.dashboardLayout, queryFn: () => http.get<DashboardLayoutPref>(dashboardUrls.layoutPref) })

export const useSaveDashboardLayout = () =>
  useMutation({
    mutationFn: (layouts: DashboardLayoutPref['layouts']) =>
      http.put(dashboardUrls.layoutPref, { layouts }),
  })
