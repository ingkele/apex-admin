import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { http } from '@/lib/http'
import type { DeptNode, DictType, MenuNode } from '@/mocks/db'
import { qk } from '../query-keys'

/** 系统管理（菜单 / 部门 / 字典）—— 请求地址（后端变动时改这里） */
export const systemUrls = {
  menus: {
    list: '/system/menus',
    create: '/system/menus',
    toggleStatus: (id: string) => `/system/menus/${id}/status`,
    remove: (id: string) => `/system/menus/${id}`,
  },
  depts: {
    list: '/system/depts',
    create: '/system/depts',
  },
  dicts: {
    list: '/system/dicts',
    createItem: (code: string) => `/system/dicts/${code}/items`,
  },
} as const

// —— 菜单管理 ——
export const useSystemMenus = () =>
  useQuery({
    queryKey: qk.systemMenus,
    queryFn: () => http.get<{ items: MenuNode[]; stats: { total: number; dirs: number; menus: number; buttons: number; hidden: number } }>(systemUrls.menus.list),
  })

export const useCreateMenu = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: Partial<MenuNode>) => http.post<MenuNode>(systemUrls.menus.create, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.systemMenus }),
  })
}

export const useToggleMenuStatus = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => http.put<MenuNode>(systemUrls.menus.toggleStatus(id), {}),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.systemMenus }),
  })
}

export const useDeleteMenu = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => http.del(systemUrls.menus.remove(id)),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.systemMenus }),
  })
}

// —— 部门管理 ——
export const useDepts = () =>
  useQuery({
    queryKey: qk.depts,
    queryFn: () => http.get<{ items: DeptNode[]; stats: { total: number; members: number; active: number; disabled: number } }>(systemUrls.depts.list),
  })

export const useCreateDept = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: Partial<DeptNode>) => http.post<DeptNode>(systemUrls.depts.create, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.depts }),
  })
}

// —— 字典管理 ——
export const useDicts = () =>
  useQuery({ queryKey: qk.dicts, queryFn: () => http.get<DictType[]>(systemUrls.dicts.list) })

export const useCreateDictItem = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ code, body }: { code: string; body: Record<string, unknown> }) =>
      http.post(systemUrls.dicts.createItem(code), body),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.dicts }),
  })
}
