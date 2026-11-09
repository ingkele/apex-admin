import { createFileRoute } from '@tanstack/react-router'
import { ServerCrash } from 'lucide-react'
import { ErrorState } from '@/components/shared/error-state'
import { useAuthStore } from '@/stores/auth.store'

export const Route = createFileRoute('/_auth/error/500')({
  component: () => {
    const user = useAuthStore((s) => s.user)
    return (
      <ErrorState
        code="500"
        tone="rose"
        icon={<ServerCrash className="h-5 w-5" />}
        title="服务暂时不可用"
        description="服务端处理请求时发生异常，本次请求已被记录。请稍后重试，若持续出现请把追踪号提供给运维同学。"
        retryText="重试请求"
        tips={[
          `追踪号：trc_${Date.now().toString(36)} · 操作人 ${user?.name ?? '当前用户'}`,
          '常见原因：下游服务超时、数据库连接池耗尽、发布过程中的实例滚动重启',
          '可在「服务管理 · 服务日志」中按 trace 检索完整调用链',
        ]}
      />
    )
  },
})
