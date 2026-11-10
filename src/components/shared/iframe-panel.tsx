import * as React from 'react'
import { ExternalLink, Frame, RefreshCw, TriangleAlert } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

/**
 * iframe 内嵌面板 —— 站内嵌第三方页面的通用容器。
 * 注意：目标站点若返回 X-Frame-Options / CSP frame-ancestors 禁止嵌入，
 * 浏览器会白屏且无法用 JS 探测，因此页面固定给出「打不开？新窗口打开」的兜底提示。
 */
export function IframePanel({
  src,
  title,
  height = 'calc(100vh - 15.5rem)',
  className,
}: {
  src: string
  title: string
  height?: string
  className?: string
}) {
  const [nonce, setNonce] = React.useState(0)
  const [loading, setLoading] = React.useState(true)

  return (
    <div className={cn('overflow-hidden rounded-xl border border-line bg-surface', className)}>
      <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-2">
        <div className="flex min-w-0 items-center gap-2 text-[11.5px] text-muted">
          <Frame className="h-3.5 w-3.5 shrink-0" />
          <span className="truncate font-mono">{src}</span>
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              setLoading(true)
              setNonce((n) => n + 1)
            }}
          >
            <RefreshCw className="h-3.5 w-3.5" /> 刷新
          </Button>
          <Button size="sm" variant="outline" onClick={() => window.open(src, '_blank', 'noopener')}>
            <ExternalLink className="h-3.5 w-3.5" /> 新窗口打开
          </Button>
        </div>
      </div>

      <div className="relative" style={{ height }}>
        {loading ? (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-surface text-[12px] text-muted">
            正在加载内嵌页面…
          </div>
        ) : null}
        <iframe
          key={nonce}
          src={src}
          title={title}
          className="h-full w-full border-0"
          onLoad={() => setLoading(false)}
          referrerPolicy="no-referrer"
          sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
        />
      </div>

      <div className="flex items-start gap-2 border-t border-line bg-canvas px-4 py-2.5 text-[10.5px] leading-relaxed text-soft">
        <TriangleAlert className="mt-0.5 h-3 w-3 shrink-0" />
        <span>
          白屏说明目标站点设置了 <code className="font-mono">X-Frame-Options</code> 或 CSP
          <code className="ml-1 font-mono">frame-ancestors</code>
          拒绝被嵌入，这是浏览器安全策略，前端无法绕过——点「新窗口打开」即可。生产环境建议内嵌自有子应用，并让子应用放行该域名。
        </span>
      </div>
    </div>
  )
}
