import { redirect } from '@tanstack/react-router'
import { useAuthStore } from '@/stores/auth.store'
import type { PermissionCode } from '@/app.config'

/**
 * 路由级权限守卫 —— 在路由 beforeLoad 中调用：
 *
 *   beforeLoad: () => requirePermission('user:manage'),
 *
 * 无权限时 throw redirect 到 403 页（不进入页面组件）。
 * 与「菜单过滤」（侧边栏不显示）、「按钮控制」（<Can>）构成三层权限体系；
 * 最终防线是后端 API 校验，前端三层只是体验优化。
 */
export function requirePermission(code: PermissionCode): void {
  if (!useAuthStore.getState().hasPermission(code)) {
    throw redirect({ to: '/error/403' })
  }
}
