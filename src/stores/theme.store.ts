import { create } from 'zustand'
import { persist } from 'zustand/middleware'

/**
 * 主题引擎 —— 与墨刀原型 apexTheme 同源。
 * 8 套 ACCENTS 色阶（50~900 十档）+ 明暗模式 / 密度 / 圆角 / 侧边栏风格，
 * 设置实时生效并持久化到 localStorage（键 apex-admin-theme）。
 */

export const ACCENTS = {
  blue: ['#eff6ff', '#dbeafe', '#bfdbfe', '#93c5fd', '#60a5fa', '#3b82f6', '#2563eb', '#1d4ed8', '#1e40af', '#1e3a8a'],
  indigo: ['#eef2ff', '#e0e7ff', '#c7d2fe', '#a5b4fc', '#818cf8', '#6366f1', '#4f46e5', '#4338ca', '#3730a3', '#312e81'],
  purple: ['#faf5ff', '#f3e8ff', '#e9d5ff', '#d8b4fe', '#c084fc', '#a855f7', '#9333ea', '#7e22ce', '#6b21a8', '#581c87'],
  green: ['#f0fdf4', '#dcfce7', '#bbf7d0', '#86efac', '#4ade80', '#22c55e', '#16a34a', '#15803d', '#166534', '#14532d'],
  cyan: ['#ecfeff', '#cffafe', '#a5f3fc', '#67e8f9', '#22d3ee', '#06b6d4', '#0891b2', '#0e7490', '#155e75', '#164e63'],
  orange: ['#fff7ed', '#ffedd5', '#fed7aa', '#fdba74', '#fb923c', '#f97316', '#ea580c', '#c2410c', '#9a3412', '#7c2d12'],
  red: ['#fef2f2', '#fee2e2', '#fecaca', '#fca5a5', '#f87171', '#ef4444', '#dc2626', '#b91c1c', '#991b1b', '#7f1d1d'],
  slate: ['#f8fafc', '#f1f5f9', '#e2e8f0', '#cbd5e1', '#94a3b8', '#64748b', '#52525b', '#3f3f46', '#27272a', '#18181b'],
} as const

export const ACCENT_LABELS: Record<AccentKey, string> = {
  blue: '默认蓝',
  indigo: '靛蓝',
  purple: '紫',
  green: '绿',
  cyan: '青',
  orange: '橙',
  red: '红',
  slate: '灰',
}

export type AccentKey = keyof typeof ACCENTS
export type ThemeMode = 'light' | 'dark' | 'system'
export type Density = 'comfortable' | 'compact'
export type RadiusSize = 'small' | 'medium' | 'large'
export type SidebarStyle = 'light' | 'dark'

/** 主题色 hex 白名单校验（防偏好接口注入任意值，见设计方案 §4.4） */
const ACCENT_HEX_SET = new Set(Object.values(ACCENTS).flat() as string[])

export function isSafeAccent(accent: string): accent is AccentKey {
  return accent in ACCENTS
}

export interface ThemeState {
  mode: ThemeMode
  accent: AccentKey
  density: Density
  radius: RadiusSize
  sidebar: SidebarStyle
  setMode: (mode: ThemeMode) => void
  setAccent: (accent: AccentKey) => void
  setDensity: (density: Density) => void
  setRadius: (radius: RadiusSize) => void
  setSidebar: (sidebar: SidebarStyle) => void
  reset: () => void
}

export const DEFAULT_THEME: Pick<ThemeState, 'mode' | 'accent' | 'density' | 'radius' | 'sidebar'> = {
  mode: 'light',
  accent: 'blue',
  density: 'comfortable',
  radius: 'medium',
  sidebar: 'light',
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      ...DEFAULT_THEME,
      setMode: (mode) => set({ mode }),
      setAccent: (accent) => {
        if (!isSafeAccent(accent)) return
        set({ accent })
      },
      setDensity: (density) => set({ density }),
      setRadius: (radius) => set({ radius }),
      setSidebar: (sidebar) => set({ sidebar }),
      reset: () => set({ ...DEFAULT_THEME }),
    }),
    { name: 'apex-admin-theme' },
  ),
)

const BRAND_STEPS = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900]

function isSystemDark(): boolean {
  return typeof window !== 'undefined'
    && !!window.matchMedia
    && window.matchMedia('(prefers-color-scheme: dark)').matches
}

/** 把主题状态写入 documentElement（CSS 变量 + 属性），与墨刀 applyTheme 一致 */
export function applyTheme(t: Pick<ThemeState, 'mode' | 'accent' | 'density' | 'radius' | 'sidebar'>): void {
  const root = document.documentElement
  const dark = t.mode === 'dark' || (t.mode === 'system' && isSystemDark())
  root.classList.toggle('dark', dark)

  const scale = ACCENTS[t.accent] ?? ACCENTS.blue
  scale.forEach((color, i) => {
    root.style.setProperty(`--brand-${BRAND_STEPS[i]}`, color)
  })

  root.style.setProperty('--app-radius-lg', t.radius === 'small' ? '4px' : t.radius === 'large' ? '12px' : '8px')
  root.style.setProperty('--app-radius-xl', t.radius === 'small' ? '6px' : t.radius === 'large' ? '16px' : '12px')
  root.setAttribute('data-density', t.density)
  root.setAttribute('data-sidebar', t.sidebar)
}

let engineStarted = false

/** 启动主题引擎：初始应用 + 跟随 store 变化 + 跟随系统明暗（system 模式） */
export function initThemeEngine(): void {
  if (engineStarted) return
  engineStarted = true

  applyTheme(useThemeStore.getState())
  useThemeStore.subscribe(applyTheme)

  if (typeof window !== 'undefined' && window.matchMedia) {
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
      const s = useThemeStore.getState()
      if (s.mode === 'system') applyTheme(s)
    })
  }
}

export { ACCENT_HEX_SET }
