import * as React from 'react'
import { toast } from 'sonner'
import { Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { appConfig, PERMISSIONS, type PermissionCode } from '@/app.config'
import { useAuthStore, type RoleKey } from '@/stores/auth.store'
import { cn } from '@/lib/utils'

/** 全部权限码（与 app.config 的 PERMISSIONS 同源） */
const ALL_CODES = Object.keys(PERMISSIONS) as PermissionCode[]

/**
 * 角色模拟器 —— 演示页共用：不重新登录直接切换角色，
 * 侧边栏菜单过滤、按钮显隐、路由守卫全部实时联动。
 */
export function RoleSwitcher({ className }: { className?: string }) {
  const user = useAuthStore((s) => s.user)
  const switchRole = useAuthStore((s) => s.switchRole)
  const hasPermission = useAuthStore((s) => s.hasPermission)
  const role = (user?.role ?? 'viewer') as RoleKey

  // 当前角色实际拥有的权限码数（供权限矩阵对照）
  const grantedCount = React.useMemo(
    () => ALL_CODES.filter((code) => hasPermission(code)).length,
    [hasPermission],
  )

  return (
    <div className={cn('rounded-lg border border-line bg-canvas px-3.5 py-3', className)}>
      <div className="flex flex-wrap items-center gap-3">
        <span className="flex items-center gap-1.5 text-[11px] font-medium text-soft">
          <Users className="h-3.5 w-3.5" />
          角色模拟器
        </span>
        {Object.entries(appConfig.roles).map(([key, r]) => (
          <Button
            key={key}
            size="sm"
            variant={role === key ? 'primary' : 'outline'}
            onClick={() => {
              if (role === key) return
              switchRole(key as RoleKey)
              toast.success(`已切换为「${r.label}」`)
            }}
          >
            {r.label}
          </Button>
        ))}
        <span className="ml-auto rounded-md border border-line bg-surface px-2 py-1 font-mono text-[10.5px] text-muted">
          当前 {role} · 权限 {grantedCount}/{ALL_CODES.length}
        </span>
      </div>
    </div>
  )
}
