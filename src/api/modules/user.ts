import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { http, type PageQuery, type PageResult } from '@/lib/http'
import type { UserItem } from '@/mocks/db'
import { qk } from '../query-keys'

/** 用户 —— 请求地址（后端变动时改这里） */
export const userUrls = {
  list: '/users',
  stats: '/users/stats',
  invite: '/users/invite',
  role: (id: string) => `/users/${id}/role`,
  status: (id: string) => `/users/${id}/status`,
} as const

export const useUsers = (params: PageQuery) =>
  useQuery({ queryKey: qk.users(params), queryFn: () => http.get<PageResult<UserItem>>(userUrls.list, params) })

export const useUserStats = () =>
  useQuery({ queryKey: qk.userStats, queryFn: () => http.get<{ total: number; active: number; invited: number; disabled: number; admin: number }>(userUrls.stats) })

export function useUserActions() {
  const qc = useQueryClient()
  const invalidate = () => qc.invalidateQueries({ queryKey: ['users'] })
  const invite = useMutation({
    mutationFn: (body: { name: string; email: string; role: string }) => http.post(userUrls.invite, body),
    onSuccess: invalidate,
  })
  const setRole = useMutation({
    mutationFn: ({ id, role }: { id: string; role: string }) => http.put(userUrls.role(id), { role }),
    onSuccess: invalidate,
  })
  const toggleStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => http.post(userUrls.status(id), { status }),
    onSuccess: invalidate,
  })
  return { invite, setRole, toggleStatus }
}
