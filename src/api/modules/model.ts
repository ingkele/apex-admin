import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { http } from '@/lib/http'
import type { ModelItem } from '@/mocks/db'
import { qk } from '../query-keys'

/** 模型服务 —— 请求地址（后端变动时改这里） */
export const modelUrls = {
  list: '/models',
  setDefault: (id: string) => `/models/${id}/default`,
  test: (id: string) => `/models/${id}/test`,
  params: (id: string) => `/models/${id}/params`,
  sync: '/models/sync',
  status: (id: string) => `/models/${id}/status`,
} as const

export const useModels = () =>
  useQuery({ queryKey: qk.models, queryFn: () => http.get<ModelItem[]>(modelUrls.list) })

export function useModelActions() {
  const qc = useQueryClient()
  const invalidate = () => qc.invalidateQueries({ queryKey: qk.models })
  const setDefault = useMutation({
    mutationFn: (id: string) => http.post(modelUrls.setDefault(id)),
    onSuccess: invalidate,
  })
  const test = useMutation({
    mutationFn: (id: string) => http.post<{ latencyMs: number }>(modelUrls.test(id)),
  })
  const saveParams = useMutation({
    mutationFn: ({ id, params }: { id: string; params: Record<string, number> }) =>
      http.put(modelUrls.params(id), { params }),
    onSuccess: invalidate,
  })
  const sync = useMutation({
    mutationFn: () => http.post(modelUrls.sync),
    onSuccess: invalidate,
  })
  const toggle = useMutation({
    mutationFn: ({ id, enabled }: { id: string; enabled: boolean }) =>
      http.put(modelUrls.status(id), { status: enabled ? 'enabled' : 'disabled' }),
    onSuccess: invalidate,
  })
  return { setDefault, test, saveParams, sync, toggle }
}
