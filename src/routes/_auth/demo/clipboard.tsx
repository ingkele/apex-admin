import { createFileRoute } from '@tanstack/react-router'
import * as React from 'react'
import { toast } from 'sonner'
import { ClipboardPaste, Copy } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { DemoBlock } from '@/components/shared/demo-block'
import { PageHeader } from '@/components/shared/page-header'

export const Route = createFileRoute('/_auth/demo/clipboard')({
  component: Page,
})

/** execCommand 兜底：非安全上下文（http://内网 IP）没有 navigator.clipboard */
async function legacyCopy(text: string): Promise<boolean> {
  const ta = document.createElement('textarea')
  ta.value = text
  ta.style.position = 'fixed'
  ta.style.opacity = '0'
  document.body.appendChild(ta)
  ta.select()
  const ok = document.execCommand('copy')
  document.body.removeChild(ta)
  return ok
}

function Page() {
  const [source, setSource] = React.useState('Apex Admin · 剪贴板演示文本')
  const [readBack, setReadBack] = React.useState<string | null>(null)
  const [secure] = React.useState(() => !!navigator.clipboard)

  const copy = async () => {
    try {
      if (secure) await navigator.clipboard.writeText(source)
      else if (!(await legacyCopy(source))) throw new Error('fallback failed')
      toast.success('已复制到剪贴板')
      setReadBack(null)
    } catch {
      toast.error('复制失败：浏览器未授权或非安全上下文')
    }
  }

  const read = async () => {
    try {
      const text = await navigator.clipboard.readText()
      setReadBack(text || '（剪贴板为空）')
    } catch {
      toast.error('读取失败：需要授权，且仅在安全上下文可用')
    }
  }

  return (
    <>
      <PageHeader
        eyebrow={<span>演示 › 功能</span>}
        title="剪贴板"
        description="navigator.clipboard 的写入与读取；非安全上下文（http 内网地址）需要 execCommand 兜底。"
      />

      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-7">
          <DemoBlock
            title="复制 / 读取"
            desc="写入 clipboard.writeText；读取 clipboard.readText 需要用户授权（首次会弹权限请求）"
            code={`// 写入（安全上下文优先，execCommand 兜底）
await navigator.clipboard.writeText(text)

// 读取（必须授权；粘贴到输入框时更推荐 paste 事件拿 clipboardData）`}
          >
            <div className="space-y-3">
              <Input value={source} onChange={(e) => setSource(e.target.value)} placeholder="要复制的文本" />
              <div className="flex flex-wrap gap-2.5">
                <Button onClick={copy}>
                  <Copy className="h-3.5 w-3.5" />
                  复制到剪贴板
                </Button>
                <Button variant="outline" onClick={read}>
                  <ClipboardPaste className="h-3.5 w-3.5" />
                  从剪贴板读取
                </Button>
              </div>
              {readBack !== null ? (
                <div className="rounded-lg border border-line bg-canvas px-3 py-2.5">
                  <div className="text-[10.5px] text-soft">剪贴板内容：</div>
                  <div className="mt-1 break-all font-mono text-[11.5px] text-ink">{readBack}</div>
                </div>
              ) : null}
            </div>
          </DemoBlock>
        </div>

        <div className="col-span-5">
          <Card className="p-5">
            <div className="text-[13px] font-semibold text-ink">兼容性要点</div>
            <ul className="mt-2.5 space-y-2 text-[11.5px] leading-relaxed text-muted">
              <li>
                · <span className="font-medium text-ink">安全上下文：</span>
                <code className="font-mono">navigator.clipboard</code> 只在 https 或 localhost 可用；
                当前环境 <span className={secure ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}>
                {secure ? '✔ 可用' : '✘ 不可用（将走 execCommand 兜底）'}</span>
              </li>
              <li>· <span className="font-medium text-ink">读取需授权：</span>readText 首次调用触发权限弹窗，拒绝后再调用直接 reject；</li>
              <li>· <span className="font-medium text-ink">输入框粘贴：</span>场景允许时优先用 <code className="font-mono">onPaste</code> 事件拿 <code className="font-mono">clipboardData</code>，无权限问题；</li>
              <li>· <span className="font-medium text-ink">execCommand 已废弃：</span>兜底方案够用，但别在新代码里当首选。</li>
            </ul>
          </Card>
        </div>
      </div>
    </>
  )
}
