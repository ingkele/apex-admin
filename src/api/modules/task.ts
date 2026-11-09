import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { http, type PageQuery, type PageResult } from '@/lib/http'
import type { Task } from '@/mocks/db'
import { qk } from '../query-keys'

/** 任务 —— 请求地址（后端变动时改这里；动态路径用工厂函数） */
export const taskUrls = {
  list: '/tasks',
  summary: '/tasks/summary',
  detail: (id: string) => `/tasks/${id}`,
  retry: (id: string) => `/tasks/${id}/retry`,
  cancel: (id: string) => `/tasks/${id}/cancel`,
} as const

export const useTasks = (params: PageQuery) =>
  useQuery({ queryKey: qk.tasks(params), queryFn: () => http.get<PageResult<Task>>(taskUrls.list, params) })

export const useTaskSummary = () =>
  useQuery({ queryKey: qk.taskSummary, queryFn: () => http.get<{ total: number; running: number; failed: number; queued: number }>(taskUrls.summary) })

export const useTask = (id: string) =>
  useQuery({ queryKey: qk.task(id), queryFn: () => http.get<Task>(taskUrls.detail(id)) })

export function useTaskActions() {
  const qc = useQueryClient()
  const invalidate = () => qc.invalidateQueries({ queryKey: ['tasks'] })
  const retry = useMutation({
    mutationFn: (id: string) => http.post(taskUrls.retry(id)),
    onSuccess: invalidate,
  })
  const cancel = useMutation({
    mutationFn: (id: string) => http.post(taskUrls.cancel(id)),
    onSuccess: invalidate,
  })
  const create = useMutation({
    mutationFn: (body: Record<string, unknown>) => http.post<Task>(taskUrls.list, body),
    onSuccess: invalidate,
  })
  return { retry, cancel, create }
}
