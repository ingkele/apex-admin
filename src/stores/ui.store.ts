import { create } from 'zustand'

/** 全局 UI 开关（不持久化）：主题抽屉等跨组件能力，页面内也能直接打开 */
interface UiState {
  themeDrawerOpen: boolean
  openThemeDrawer: () => void
  closeThemeDrawer: () => void
  setThemeDrawerOpen: (open: boolean) => void
  /** 全局命令面板（⌘K） */
  commandOpen: boolean
  openCommand: () => void
  closeCommand: () => void
  setCommandOpen: (open: boolean) => void
}

export const useUiStore = create<UiState>()((set) => ({
  themeDrawerOpen: false,
  openThemeDrawer: () => set({ themeDrawerOpen: true }),
  closeThemeDrawer: () => set({ themeDrawerOpen: false }),
  setThemeDrawerOpen: (themeDrawerOpen) => set({ themeDrawerOpen }),

  commandOpen: false,
  openCommand: () => set({ commandOpen: true }),
  closeCommand: () => set({ commandOpen: false }),
  setCommandOpen: (commandOpen) => set({ commandOpen }),
}))
