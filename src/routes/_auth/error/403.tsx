import { createFileRoute } from '@tanstack/react-router'
import { ShieldAlert } from 'lucide-react'
import { ErrorState } from '@/components/shared/error-state'

export const Route = createFileRoute('/_auth/error/403')({
  component: () => (
    <ErrorState
      code="403"
      tone="amber"
      icon={<ShieldAlert className="h-5 w-5" />}
      title="没有访问权限"
      description="当前账号所属角色未被授予该页面的访问权限。如需访问，请联系平台管理员在「角色权限」中调整授权范围。"
      tips={[
        '当前角色为「只读访客」时仅可浏览概览、任务与服务',
        '页面级权限由菜单权限控制，按钮级权限不影响路由可达性',
        '权限变更保存后即时生效，无需重新登录',
      ]}
    />
  ),
})
