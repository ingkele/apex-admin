import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { http } from '@/lib/http'
import type { LogLine, ServiceHealth, ServiceItem } from '@/mocks/db'
import { qk } from '../query-keys'

/** 服务与日志 —— 请求地址（后端变动时改这里） */
export const serviceUrls = {
  list: '/services',
  logs: (id: string) => `/services/${id}/logs`,
  restart: (id: string) => `/services/${id}/restart`,
  /** 聚合日志流 */
  logStream: '/logs',
  logStats: '/logs/stats',
} as const

export const useServices = () =>
  useQuery({ queryKey: qk.services, queryFn: () => http.get<ServiceItem[]>(serviceUrls.list) })

export const useServiceLogs = (id: string) =>
  useQuery({ queryKey: qk.serviceLogs(id), queryFn: () => http.get<LogLine[]>(serviceUrls.logs(id)) })

/** 聚合日志流（服务名/级别/关键字由服务端过滤） */
export const useLogs = (filters: { service?: string; level?: string; keyword?: string } = {}) =>
  useQuery({
    queryKey: [...qk.serviceLogs('all'), filters.service ?? 'all', filters.level ?? 'all', filters.keyword ?? ''],
    queryFn: () => http.get<LogLine[]>(serviceUrls.logStream, { ...filters }),
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
  useQuery({ queryKey: [...qk.serviceLogs('all'), 'stats'], queryFn: () => http.get<LogStats>(serviceUrls.logStats) })

export type { ServiceHealth }

export const useRestartService = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => http.post(serviceUrls.restart(id)),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.services }),
  })
}
