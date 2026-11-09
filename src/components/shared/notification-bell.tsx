import * as React from 'react'
import { useNavigate } from '@tanstack/react-router'
import { Popover } from '@base-ui/react/popover'
import { Bell, CircleCheck, CircleDollarSign, CircleAlert, ListChecks } from 'lucide-react'
import {
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useNotifications,
} from '@/api'
import { cn } from '@/lib/utils'
import type { NotificationItem } from '@/mocks/db'

/** 通知铃铛 + 下拉面板：未读数徽标、逐条已读、全部已读 */

const TYPE_META: Record<NotificationItem['type'], { icon: typeof Bell; cls: string }> = {
  task: { icon: ListChecks, cls: 'bg-brand-50 text-brand-600 dark:bg-brand-500/15 dark:text-brand-300' },
  system: { icon: CircleCheck, cls: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400' },
  security: { icon: CircleAlert, cls: 'bg-rose-50 text-rose-600 dark:bg-rose-500/15 dark:text-rose-400' },
  billing: { icon: CircleDollarSign, cls: 'bg-amber-50 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400' },
}

export function NotificationBell() {
  const navigate = useNavigate()
  const { data: items = [] } = useNotifications()
  const markAll = useMarkAllNotificationsRead()
  const markOne = useMarkNotificationRead()
  const unread = items.filter((n) => !n.read).length

  return (
    <Popover.Root>
      <Popover.Trigger
        render={
          <button
            type="button"
            title="通知"
            className="relative cursor-pointer rounded-lg p-2 text-muted transition hover:bg-hover hover:text-ink"
          >
            <Bell className="h-[17px] w-[17px]" />
            {unread > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-[15px] min-w-[15px] items-center justify-center rounded-full bg-rose-500 px-[3px] text-[9px] font-semibold leading-none text-white">
                {unread > 9 ? '9+' : unread}
              </span>
            )}
          </button>
        }
      />
      <Popover.Portal>
        <Popover.Positioner align="end" sideOffset={10} className="z-50">
          <Popover.Popup className="w-[360px] rounded-xl border border-line bg-elevated p-0 shadow-pop">
            {/* 面板头 */}
            <div className="flex items-center justify-between border-b border-line px-3.5 py-2.5">
              <span className="text-[12.5px] font-semibold text-ink">
                通知
                {unread > 0 && <span className="ml-1.5 text-[10.5px] font-normal text-soft">{unread} 条未读</span>}
              </span>
              {unread > 0 && (
                <button
                  type="button"
                  onClick={() => markAll.mutate()}
                  className="cursor-pointer text-[11px] font-medium text-brand-600 transition hover:underline dark:text-brand-300"
                >
                  全部已读
                </button>
              )}
            </div>

            {/* 列表 */}
            <div className="max-h-[320px] overflow-y-auto">
              {items.length === 0 ? (
                <div className="px-3.5 py-10 text-center text-[12px] text-soft">暂无通知</div>
              ) : (
                items.map((n) => {
                  const meta = TYPE_META[n.type]
                  return (
                    <button
                      key={n.id}
                      type="button"
                      onClick={() => {
                        if (!n.read) markOne.mutate(n.id)
                      }}
                      className={cn(
                        'flex w-full cursor-pointer items-start gap-2.5 border-b border-line/60 px-3.5 py-3 text-left transition last:border-b-0 hover:bg-hover',
                        !n.read && 'bg-brand-50/40 dark:bg-brand-500/5',
                      )}
                    >
                      <span className={cn('mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg', meta.cls)}>
                        <meta.icon className="h-3.5 w-3.5" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="flex items-center gap-1.5">
                          <span className={cn('truncate text-[12px]', n.read ? 'text-muted' : 'font-medium text-ink')}>
                            {n.title}
                          </span>
                          {!n.read && <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-brand-500" />}
                        </span>
                        <span className="mt-0.5 block truncate text-[10.5px] leading-relaxed text-soft">{n.desc}</span>
                        <span className="mt-1 block text-[10px] text-soft/80">{n.at}</span>
                      </span>
                    </button>
                  )
                })
              )}
            </div>

            {/* 面板尾：跳转审计日志 */}
            <div className="border-t border-line px-3.5 py-2 text-center">
              <Popover.Close
                render={
                  <button
                    type="button"
                    onClick={() => void navigate({ to: '/system/audit' })}
                    className="cursor-pointer text-[11px] text-muted transition hover:text-brand-600 dark:hover:text-brand-300"
                  >
                    查看审计日志 →
                  </button>
                }
              />
            </div>
          </Popover.Popup>
        </Popover.Positioner>
      </Popover.Portal>
    </Popover.Root>
  )
}
