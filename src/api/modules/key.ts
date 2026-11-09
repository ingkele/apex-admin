import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { http } from '@/lib/http'
import type { ApiKeyItem } from '@/mocks/db'
import { qk } from '../query-keys'

/** API 密钥 —— 请求地址（后端变动时改这里） */
export const keyUrls = {
  list: '/keys',
  revoke: (id: string) => `/keys/${id}/revoke`,
} as const

export const useApiKeys = () =>
  useQuery({ queryKey: qk.keys, queryFn: () => http.get<ApiKeyItem[]>(keyUrls.list) })

export function useKeyActions() {
  const qc = useQueryClient()
  const invalidate = () => qc.invalidateQueries({ queryKey: qk.keys })
  const create = useMutation({
    mutationFn: (body: { name: string; scope?: string }) => http.post<ApiKeyItem & { secret: string }>(keyUrls.list, body),
    onSuccess: invalidate,
  })
  const revoke = useMutation({
    mutationFn: (id: string) => http.post(keyUrls.revoke(id)),
    onSuccess: invalidate,
  })
  return { create, revoke }
}
