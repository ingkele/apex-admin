import { createFileRoute } from '@tanstack/react-router'
import { FileQuestion } from 'lucide-react'
import { ErrorState } from '@/components/shared/error-state'

export const Route = createFileRoute('/_auth/error/404')({
  component: () => (
    <ErrorState
      code="404"
      tone="brand"
      icon={<FileQuestion className="h-5 w-5" />}
      title="页面不存在"
      description="链接可能已失效，或该资源已被删除。请检查地址是否正确，也可以从工作台重新进入。"
      tips={[
        '任务、服务等详情页需要携带有效的资源 ID',
        '已被删除的资源再次访问会落到本页',
        '如果确认地址无误，请联系管理员确认路由是否调整',
      ]}
    />
  ),
})
