import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { http } from '@/lib/http'
import type { Settings } from '@/mocks/db'
import { qk } from '../query-keys'

/** 系统参数 —— 请求地址（后端变动时改这里） */
export const settingsUrls = {
  get: '/settings',
  save: '/settings',
} as const

export const useSettings = () =>
  useQuery({ queryKey: qk.settings, queryFn: () => http.get<Settings>(settingsUrls.get) })

export const useSaveSettings = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (settings: Settings) => http.put(settingsUrls.save, { settings }),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.settings }),
  })
}
