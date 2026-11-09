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
  hasPermission: (code: PermissionCode) => boolean
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

        const user: AuthUser = {
          id: 'usr_demo',
          name: role === 'admin' ? '陈昊' : role === 'operator' ? '林晓' : '访客',
          email,
          role,
          avatarText: role === 'admin' ? 'CH' : role === 'operator' ? 'LX' : 'FG',
          lastLoginAt: new Date().toISOString(),
        }
        // mock JWT：header.payload.signature 形态，仅供演示
        const token = `mock.${btoa(JSON.stringify({ sub: user.id, role, exp: Date.now() + 86400_000 }))}.sig`
        set({ user, token })
        return user
      },

      logout: () => set({ user: null, token: null }),

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
