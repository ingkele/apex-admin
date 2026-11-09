import { useQuery } from '@tanstack/react-query'
import { http, type PageQuery, type PageResult } from '@/lib/http'
import type { AuditItem } from '@/mocks/db'
import { qk } from '../query-keys'

/** 审计日志 —— 请求地址（后端变动时改这里） */
export const auditUrls = {
  list: '/audit',
  stats: '/audit/stats',
} as const

export const useAuditLogs = (params: PageQuery) =>
  useQuery({ queryKey: qk.audit(params), queryFn: () => http.get<PageResult<AuditItem>>(auditUrls.list, params) })

export const useAuditStats = () =>
  useQuery({ queryKey: qk.auditStats, queryFn: () => http.get<{ total: number; highRisk: number; failed: number; retentionDays: number }>(auditUrls.stats) })
