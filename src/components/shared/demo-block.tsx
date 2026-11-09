import * as React from 'react'
import { Code2 } from 'lucide-react'
import { Card } from '@/components/ui/card'

/** 组件演示外壳 —— 标题 / 说明 / 可展开的示例代码，演示页各子页共用 */
export function DemoBlock({
  id,
  title,
  desc,
  code,
  children,
}: {
  id?: string
  title: string
  desc: string
  code?: string
  children: React.ReactNode
}) {
  const [showCode, setShowCode] = React.useState(false)
  return (
    <Card id={id} className="scroll-mt-4 overflow-hidden">
      <div className="flex items-start justify-between gap-3 border-b border-line px-5 py-3.5">
        <div>
          <div className="text-[13.5px] font-semibold text-ink">{title}</div>
          <p className="mt-0.5 text-[10.5px] text-muted">{desc}</p>
        </div>
        {code ? (
          <button
            type="button"
            onClick={() => setShowCode((v) => !v)}
            className="flex items-center gap-1 rounded-md border border-line px-2 py-1 text-[10.5px] text-muted transition-colors hover:bg-hover hover:text-ink"
          >
            <Code2 className="h-3 w-3" />
            {showCode ? '收起代码' : '查看代码'}
          </button>
        ) : null}
      </div>
      <div className="px-5 py-5">{children}</div>
      {showCode && code ? (
        <pre className="overflow-x-auto border-t border-line bg-canvas px-5 py-4 text-[11px] leading-relaxed text-muted">
          <code>{code}</code>
        </pre>
      ) : null}
    </Card>
  )
}

/** 演示块内的一行：左侧定宽标签 + 右侧组件群 */
export function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-center gap-3 py-2">
      <span className="w-[86px] shrink-0 text-[11px] text-soft">{label}</span>
      <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2.5">{children}</div>
    </div>
  )
}
