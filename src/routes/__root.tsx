import { createRootRoute, Outlet } from '@tanstack/react-router'
import { FileQuestion } from 'lucide-react'
import { ErrorState } from '@/components/shared/error-state'

export const Route = createRootRoute({
  component: () => <Outlet />,
  notFoundComponent: () => (
    <div className="min-h-screen bg-canvas px-6">
      <ErrorState
        code="404"
        tone="brand"
        icon={<FileQuestion className="h-5 w-5" />}
        title="页面不存在"
        description="访问的地址没有对应的页面，可能是链接已失效或路由已调整。"
      />
    </div>
  ),
})
