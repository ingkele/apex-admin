import { useMutation, useQuery } from '@tanstack/react-query'
import { http } from '@/lib/http'
import type { RoleItem } from '@/mocks/db'
import { qk } from '../query-keys'

/** 角色 —— 请求地址（后端变动时改这里） */
export const roleUrls = {
  list: '/roles',
  permissions: (id: string) => `/roles/${id}/permissions`,
} as const

export const useRoles = () =>
  useQuery({ queryKey: qk.roles, queryFn: () => http.get<RoleItem[]>(roleUrls.list) })

export const useSaveRolePermissions = () =>
  useMutation({
    mutationFn: ({ id, permissions }: { id: string; permissions: string[] }) =>
      http.put(roleUrls.permissions(id), { permissions }),
  })
