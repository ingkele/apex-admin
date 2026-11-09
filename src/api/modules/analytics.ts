import { useQuery } from '@tanstack/react-query'
import { http } from '@/lib/http'
import type { AnalyticsKpi, AnalyticsPoint } from '@/mocks/db'
import { qk } from '../query-keys'

/** 分析页 —— 请求地址（后端变动时改这里） */
export const analyticsUrls = {
  overview: '/analytics',
} as const

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
    queryFn: () => http.get<AnalyticsData>(analyticsUrls.overview, { range }),
  })
