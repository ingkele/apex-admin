import { useAuthStore } from '@/stores/auth.store'
import type { PermissionCode } from '@/app.config'

/** 按钮级权限：无权限时不渲染（API 级由 .NET 强制校验，见设计方案 §6.3） */
export function Can({
  permission,
  children,
  fallback = null,
}: {
  permission: PermissionCode
  children: React.ReactNode
  fallback?: React.ReactNode
}) {
  const allowed = useAuthStore((s) => s.hasPermission(permission))
  return allowed ? <>{children}</> : <>{fallback}</>
}

/** 权限判断 hook（需要在属性里用布尔值而非渲染分支时使用） */
export function useCan(permission: PermissionCode) {
  return useAuthStore((s) => s.hasPermission(permission))
}

/** 在事件处理/toggle 场景下取权限（渲染期请优先用 useCan） */
export function hasPermission(permission: PermissionCode) {
  return useAuthStore.getState().hasPermission(permission)
}
