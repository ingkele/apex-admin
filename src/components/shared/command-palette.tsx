import * as React from 'react'
import { useNavigate } from '@tanstack/react-router'
import { Dialog } from '@base-ui/react/dialog'
import { Command } from 'cmdk'
import { useQueryClient } from '@tanstack/react-query'
import { LogOut, MoonStar, Palette, Plus, Search } from 'lucide-react'
import { NAV_GROUPS, type NavChild } from '@/app.config'
import { useTasks } from '@/api'
import { useAuthStore } from '@/stores/auth.store'
import { useThemeStore } from '@/stores/theme.store'
import { useTabsStore } from '@/stores/tabs.store'
import { useUiStore } from '@/stores/ui.store'

/**
 * 全局命令面板（⌘K / Ctrl+K）：页面跳转、任务直达、快速操作。
 * 搜索范围按当前角色权限过滤，与侧边栏一致。
 */
export function CommandPalette() {
  const navigate = useNavigate()
  const commandOpen = useUiStore((s) => s.commandOpen)
  const setCommandOpen = useUiStore((s) => s.setCommandOpen)
  const openThemeDrawer = useUiStore((s) => s.openThemeDrawer)
  const hasPermission = useAuthStore((s) => s.hasPermission)
  const logout = useAuthStore((s) => s.logout)
  const themeMode = useThemeStore((s) => s.mode)
  const setThemeMode = useThemeStore((s) => s.setMode)
  const qc = useQueryClient()

  // ⌘K / Ctrl+K 全局唤起
  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setCommandOpen(!useUiStore.getState().commandOpen)
      }
    }
    window.addEventListener('keydown', down)
    return () => window.removeEventListener('keydown', down)
  }, [setCommandOpen])

  // 页面清单（与侧边栏同口径：递归展开叶子 + 按权限过滤；hideChildren 只显示节点本身）
  const pages = React.useMemo(() => {
    const out: { trail: string; label: string; to: string; query?: Record<string, string | number> }[] = []
    const walk = (children: NavChild[], trail: string[]) => {
      for (const c of children) {
        if (c.permission && !hasPermission(c.permission)) continue
        if (c.children?.length && !c.hideChildren) {
          walk(c.children, [...trail, c.label])
          continue
        }
        if (c.to) out.push({ trail: trail.join(' › '), label: c.label, to: c.to, query: c.query })
      }
    }
    for (const g of NAV_GROUPS) walk(g.children, [g.label])
    return out
  }, [hasPermission])

  // 任务直达（前 50 条，够用了）
  const { data: tasks } = useTasks({ page: 1, pageSize: 50 })

  const go = (to: string, query?: Record<string, string | number>) => {
    setCommandOpen(false)
    void navigate({ to, search: query })
  }

  return (
    <Dialog.Root open={commandOpen} onOpenChange={setCommandOpen}>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-[1px]" />
        <Dialog.Popup className="fixed left-1/2 top-[14%] z-50 w-[min(92vw,560px)] -translate-x-1/2 overflow-hidden rounded-xl border border-line bg-elevated shadow-pop outline-none">
          <Command loop shouldFilter className="[&_[cmdk-group-heading]]:px-3.5 [&_[cmdk-group-heading]]:py-1.5">
            {/* 搜索框 */}
            <div className="flex items-center gap-2.5 border-b border-line px-3.5">
              <Search className="h-4 w-4 shrink-0 text-soft" />
              <Command.Input
                autoFocus
                placeholder="搜索页面、任务，或执行操作…"
                className="h-12 w-full bg-transparent text-[13px] text-ink outline-none placeholder:text-soft"
              />
              <kbd className="shrink-0 rounded border border-line bg-surface px-1.5 py-0.5 text-[10px] text-soft">Esc</kbd>
            </div>

            <Command.List className="max-h-[380px] overflow-y-auto p-1.5">
              <Command.Empty className="px-3.5 py-10 text-center text-[12px] text-soft">
                没有匹配的结果
              </Command.Empty>

              {/* 快速操作 */}
              <Command.Group heading="快速操作" className="text-ink">
                <Item icon={<Plus className="h-3.5 w-3.5" />} label="新建任务" hint="前往任务中心" onSelect={() => go('/tasks')} />
                <Item
                  icon={<MoonStar className="h-3.5 w-3.5" />}
                  label={themeMode === 'dark' ? '切换到浅色模式' : '切换到深色模式'}
                  hint="主题"
                  onSelect={() => {
                    setThemeMode(themeMode === 'dark' ? 'light' : 'dark')
                    setCommandOpen(false)
                  }}
                />
                <Item
                  icon={<Palette className="h-3.5 w-3.5" />}
                  label="打开主题设置"
                  hint="主题色 / 密度 / 圆角"
                  onSelect={() => {
                    setCommandOpen(false)
                    openThemeDrawer()
                  }}
                />
                <Item
                  icon={<LogOut className="h-3.5 w-3.5" />}
                  label="退出登录"
                  hint="会话"
                  danger
                  onSelect={() => {
                    setCommandOpen(false)
                    useTabsStore.getState().reset()
                    qc.clear()
                    logout()
                    void navigate({ to: '/login' })
                  }}
                />
              </Command.Group>

              {/* 页面跳转 */}
              <Command.Group heading="页面" className="text-ink">
                {pages.map((p) => (
                  <Item key={p.to} label={p.label} hint={p.trail} onSelect={() => go(p.to, p.query)} />
                ))}
              </Command.Group>

              {/* 任务直达 */}
              <Command.Group heading="任务" className="text-ink">
                {(tasks?.items ?? []).map((t) => (
                  <Item key={t.id} label={t.name} hint={`任务详情 · ${t.id}`} onSelect={() => go(`/tasks/${t.id}`)} />
                ))}
              </Command.Group>
            </Command.List>
          </Command>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

function Item({
  icon,
  label,
  hint,
  danger,
  onSelect,
}: {
  icon?: React.ReactNode
  label: string
  hint?: string
  danger?: boolean
  onSelect: () => void
}) {
  return (
    <Command.Item
      onSelect={onSelect}
      value={`${label} ${hint ?? ''}`}
      className="flex cursor-pointer items-center gap-2.5 rounded-lg px-3 py-2 text-[12.5px] outline-none select-none data-[selected=true]:bg-hover data-[selected=true]:outline-none"
    >
      {icon && <span className="shrink-0 text-muted">{icon}</span>}
      <span className={danger ? 'text-rose-600 dark:text-rose-400' : 'text-ink'}>{label}</span>
      {hint && <span className="ml-auto shrink-0 text-[10.5px] text-soft">{hint}</span>}
    </Command.Item>
  )
}
