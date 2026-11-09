import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { http } from '@/lib/http'
import type { NotificationItem } from '@/mocks/db'
import { qk } from '../query-keys'

/** 通知 —— 请求地址（后端变动时改这里） */
export const notificationUrls = {
  list: '/notifications',
  readAll: '/notifications/read-all',
  read: (id: string) => `/notifications/${id}/read`,
} as const

export const useNotifications = () =>
  useQuery({ queryKey: qk.notifications, queryFn: () => http.get<NotificationItem[]>(notificationUrls.list) })

export const useMarkAllNotificationsRead = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () => http.post<{ ok: boolean }>(notificationUrls.readAll),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.notifications }),
  })
}

export const useMarkNotificationRead = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => http.post<NotificationItem>(notificationUrls.read(id)),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.notifications }),
  })
}
