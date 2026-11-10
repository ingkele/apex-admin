import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { HOME_TAB } from '@/lib/route-meta'

/**
 * 多页签状态 —— 会话级持久化（sessionStorage）：
 * 刷新保持已打开的页签，关掉浏览器标签后重新从工作台开始。
 */

export interface AppTab {
  path: string
  title: string
}

/** 同组页签数量上限（对齐 vben 路由 maxNumOfOpenTab）：路径前缀分组，超出时自动关闭最早的 */
const TAB_GROUP_LIMITS: { prefix: string; max: number }[] = [
  { prefix: '/demo/tabs/detail', max: 3 },
]

interface TabsState {
  tabs: AppTab[]
  /** 登记/更新页签（标题可能因路由元信息变化而更新） */
  open: (tab: AppTab) => void
  /** 关闭页签，返回关闭后应跳转的路径（关闭非当前页时返回 null） */
  close: (path: string) => string | null
  /** 关闭目标页签左侧的所有页签（固定页签保留） */
  closeLeft: (path: string) => void
  /** 关闭目标页签右侧的所有页签（固定页签保留） */
  closeRight: (path: string) => void
  closeOthers: (path: string) => void
  closeAll: () => void
  reset: () => void
}

export const useTabsStore = create<TabsState>()(
  persist(
    (set, get) => ({
      tabs: [{ ...HOME_TAB }],

      open: (tab) =>
        set((s) => {
          const exist = s.tabs.find((t) => t.path === tab.path)
          if (exist) {
            if (exist.title === tab.title) return s
            return { tabs: s.tabs.map((t) => (t.path === tab.path ? { ...t, title: tab.title } : t)) }
          }
          let next = s.tabs
          // 页签上限：同组已满时先淘汰最早的（固定页签的路径不会命中任何分组前缀）
          const limit = TAB_GROUP_LIMITS.find((l) => tab.path.startsWith(l.prefix))
          if (limit) {
            const group = next.filter((t) => t.path.startsWith(limit.prefix))
            for (const evict of group.slice(0, Math.max(0, group.length - limit.max + 1))) {
              next = next.filter((t) => t.path !== evict.path)
            }
          }
          return { tabs: [...next, tab] }
        }),

      close: (path) => {
        if (path === HOME_TAB.path) return null
        const { tabs } = get()
        const idx = tabs.findIndex((t) => t.path === path)
        if (idx < 0) return null
        const next = tabs.filter((t) => t.path !== path)
        set({ tabs: next })
        // 关闭后落到右侧邻居，没有则落到左侧
        const fallback = next[Math.min(idx, next.length - 1)] ?? { ...HOME_TAB }
        return fallback.path
      },

      closeLeft: (path) =>
        set((s) => {
          const idx = s.tabs.findIndex((t) => t.path === path)
          if (idx <= 0) return s
          return { tabs: s.tabs.filter((t, i) => i >= idx || t.path === HOME_TAB.path) }
        }),

      closeRight: (path) =>
        set((s) => {
          const idx = s.tabs.findIndex((t) => t.path === path)
          if (idx < 0 || idx === s.tabs.length - 1) return s
          return { tabs: s.tabs.filter((t, i) => i <= idx || t.path === HOME_TAB.path) }
        }),

      closeOthers: (path) =>
        set(() => {
          const keep = get().tabs.filter((t) => t.path === HOME_TAB.path || t.path === path)
          const home = keep.find((t) => t.path === HOME_TAB.path) ?? { ...HOME_TAB }
          const rest = keep.filter((t) => t.path !== HOME_TAB.path)
          return { tabs: [home, ...rest] }
        }),

      closeAll: () => set({ tabs: [{ ...HOME_TAB }] }),

      reset: () => set({ tabs: [{ ...HOME_TAB }] }),
    }),
    {
      name: 'apex-tabs',
      storage: createJSONStorage(() => sessionStorage),
      partialize: (s) => ({ tabs: s.tabs }) as never,
    },
  ),
)
