import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { appConfig, type PermissionCode } from '@/app.config'

export type RoleKey = keyof typeof appConfig.roles

export interface AuthUser {
  id: string
  name: string
  email: string
  role: RoleKey
  avatarText: string
  lastLoginAt: string
}

interface AuthState {
  user: AuthUser | null
  token: string | null
  login: (email: string, password: string) => Promise<AuthUser>
  logout: () => void
  /** 角色模拟器：不重新登录直接切换角色（演示菜单过滤/按钮权限/路由守卫） */
  switchRole: (role: RoleKey) => void
  hasPermission: (code: PermissionCode) => boolean
}

/** 演示身份：切换角色时同步展示名与头像字，模拟三个不同账号 */
const DEMO_IDENTITIES: Record<RoleKey, { name: string; avatarText: string }> = {
  admin: { name: '陈昊', avatarText: 'CH' },
  operator: { name: '林晓', avatarText: 'LX' },
  viewer: { name: '访客', avatarText: 'FG' },
}

/** 权限通配匹配：'*' 全通过；'task:*' 匹配 'task:view' */
function matchPermission(granted: string, code: string): boolean {
  if (granted === '*') return true
  if (granted === code) return true
  if (granted.endsWith(':*')) return code.startsWith(granted.slice(0, -1))
  return false
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,

      /** Mock 登录（模板阶段：任意邮箱+密码即过，演示三种角色切换） */
      login: async (email: string, password: string) => {
        await new Promise((r) => setTimeout(r, 400))
        if (!email.includes('@') || password.length < 4) {
          throw new Error('邮箱或密码不正确（演示环境：任意邮箱 + 至少 4 位密码）')
        }
        let role: RoleKey = 'viewer'
        if (email.startsWith('admin')) role = 'admin'
        else if (email.startsWith('ops')) role = 'operator'

        const identity = DEMO_IDENTITIES[role]
        const user: AuthUser = {
          id: 'usr_demo',
          name: identity.name,
          email,
          role,
          avatarText: identity.avatarText,
          lastLoginAt: new Date().toISOString(),
        }
        // mock JWT：header.payload.signature 形态，仅供演示
        const token = `mock.${btoa(JSON.stringify({ sub: user.id, role, exp: Date.now() + 86400_000 }))}.sig`
        set({ user, token })
        return user
      },

      logout: () => set({ user: null, token: null }),

      switchRole: (role) =>
        set((s) => {
          if (!s.user) return s
          const identity = DEMO_IDENTITIES[role]
          return {
            user: { ...s.user, role, name: identity.name, avatarText: identity.avatarText },
          }
        }),

      hasPermission: (code) => {
        const { user } = get()
        if (!user) return false
        const role = appConfig.roles[user.role]
        const granted = role.permissions as string[] | '*'
        if (granted === '*') return true
        return granted.some((g) => matchPermission(g, code))
      },
    }),
    { name: 'apex-admin-auth' },
  ),
)
