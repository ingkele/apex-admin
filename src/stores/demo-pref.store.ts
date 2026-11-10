import { create } from 'zustand'
import { persist } from 'zustand/middleware'

/**
 * 演示用「扩展偏好」store —— 偏好扩展示例页专用。
 *
 * 模板自带的偏好都在 theme.store（主题/密度/圆角/侧边栏），
 * 业务项目要加自己的偏好时，照这个模式建独立 store 即可：
 * - persist 到 localStorage（键名带 apex- 前缀避免冲突）
 * - 默认值集中成 DEFAULT 对象，reset 可一键还原
 * - 接后端时可再挂「保存到 /user/preferences」的同步逻辑
 */
export type BannerPosition = 'top' | 'bottom'

export interface DemoPrefState {
  /** 演示横幅开关 */
  bannerEnabled: boolean
  /** 横幅位置 */
  bannerPosition: BannerPosition
  /** 示例表格行高 */
  tableSize: 'compact' | 'default' | 'roomy'
  setBannerEnabled: (v: boolean) => void
  setBannerPosition: (v: BannerPosition) => void
  setTableSize: (v: DemoPrefState['tableSize']) => void
  reset: () => void
}

export const DEFAULT_DEMO_PREF = {
  bannerEnabled: true,
  bannerPosition: 'top' as BannerPosition,
  tableSize: 'default' as const,
}

export const useDemoPrefStore = create<DemoPrefState>()(
  persist(
    (set) => ({
      ...DEFAULT_DEMO_PREF,
      setBannerEnabled: (bannerEnabled) => set({ bannerEnabled }),
      setBannerPosition: (bannerPosition) => set({ bannerPosition }),
      setTableSize: (tableSize) => set({ tableSize }),
      reset: () => set({ ...DEFAULT_DEMO_PREF }),
    }),
    { name: 'apex-demo-pref' },
  ),
)
