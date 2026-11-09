import * as React from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { WifiOff } from 'lucide-react'
import { ErrorState } from '@/components/shared/error-state'
import { toast } from 'sonner'

export const Route = createFileRoute('/_auth/error/offline')({
  component: () => {
    const [online, setOnline] = React.useState(typeof navigator === 'undefined' ? true : navigator.onLine)
    React.useEffect(() => {
      const on = () => setOnline(true)
      const off = () => setOnline(false)
      window.addEventListener('online', on)
      window.addEventListener('offline', off)
      return () => {
        window.removeEventListener('online', on)
        window.removeEventListener('offline', off)
      }
    }, [])
    return (
      <ErrorState
        code="离线"
        tone="slate"
        icon={<WifiOff className="h-5 w-5" />}
        title={online ? '网络已恢复' : '网络连接已断开'}
        description={
          online
            ? '检测到网络已恢复，可以继续操作了。'
            : '当前设备未连接到网络，页面数据无法加载。请检查网络连接后重试。'
        }
        retryText="重新检测"
        onRetry={() => {
          setOnline(navigator.onLine)
          toast[online ? 'success' : 'error'](online ? '网络正常' : '仍未检测到网络连接')
        }}
        tips={[
          '检查 Wi-Fi / 网线是否正常，或切换到其他网络',
          '公司网络可能限制了对平台的访问，请确认是否需要连接 VPN',
          '离线状态下已加载的页面仍可浏览，但提交操作会失败',
        ]}
      />
    )
  },
})
