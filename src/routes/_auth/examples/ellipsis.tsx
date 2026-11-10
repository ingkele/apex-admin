import * as React from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { DemoBlock } from '@/components/shared/demo-block'
import { PageHeader } from '@/components/shared/page-header'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export const Route = createFileRoute('/_auth/examples/ellipsis')({
  component: Page,
})

const LONG_TEXT =
  'Apex Admin 是面向 AI 平台运营场景的后台管理模板，覆盖任务调度、服务治理、模型与密钥管理、审计追踪等完整业务链路，支持三角色权限模型与主题定制。'

const LONG_WORD = 'https://api.apex.internal/v1/services/vector-index-svc/instances?region=cn-south-1&verbose=true'

function Page() {
  const [expanded, setExpanded] = React.useState(false)

  return (
    <>
      <PageHeader
        eyebrow={<span>示例 › 文本省略 · 单行 / 多行 / 展开收起三种口径</span>}
        title="文本省略"
        description="窄容器长文本统一省略展示；需要阅读全文的场景用展开收起，不依赖悬浮提示。"
      />

      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-6 space-y-4">
          <DemoBlock
            id="ellipsis-single"
            title="单行省略"
            desc="truncate 溢出显示省略号，完整文本保留在 title 悬浮提示"
            code={`<div className="truncate" title={text}>{text}</div>`}
          >
            <div className="space-y-3">
              <div>
                <div className="mb-1 text-[10.5px] text-soft">容器 240px</div>
                <div
                  className="w-[240px] truncate rounded-lg border border-line bg-canvas/40 px-3 py-2 text-[12px] text-ink"
                  title={LONG_TEXT}
                >
                  {LONG_TEXT}
                </div>
              </div>
              <div>
                <div className="mb-1 text-[10.5px] text-soft">容器 420px</div>
                <div
                  className="w-[420px] max-w-full truncate rounded-lg border border-line bg-canvas/40 px-3 py-2 text-[12px] text-ink"
                  title={LONG_TEXT}
                >
                  {LONG_TEXT}
                </div>
              </div>
              <div>
                <div className="mb-1 text-[10.5px] text-soft">超长 URL（含 break-all 保护）</div>
                <div
                  className="w-[240px] truncate rounded-lg border border-line bg-canvas/40 px-3 py-2 font-mono text-[10.5px] text-muted"
                  title={LONG_WORD}
                >
                  {LONG_WORD}
                </div>
              </div>
            </div>
          </DemoBlock>

          <DemoBlock
            id="ellipsis-clamp"
            title="多行省略"
            desc="line-clamp 按行数截断，适合卡片摘要、描述字段"
            code={`<p className="line-clamp-2">{text}</p>
<p className="line-clamp-3">{text}</p>`}
          >
            <div className="space-y-3">
              <div>
                <div className="mb-1 text-[10.5px] text-soft">line-clamp-2</div>
                <p className="line-clamp-2 text-[12px] leading-relaxed text-muted">{LONG_TEXT}</p>
              </div>
              <div>
                <div className="mb-1 text-[10.5px] text-soft">line-clamp-3</div>
                <p className="line-clamp-3 text-[12px] leading-relaxed text-muted">{LONG_TEXT}</p>
              </div>
            </div>
          </DemoBlock>
        </div>

        <div className="col-span-6 space-y-4">
          <DemoBlock
            id="ellipsis-expand"
            title="展开 / 收起"
            desc="默认收起为 2 行 + 「展开」；展开后全文 + 「收起」"
            code={`<p className={expanded ? '' : 'line-clamp-2'}>{text}</p>
<Button variant="link" size="sm" onClick={toggle}>
  {expanded ? '收起' : '展开'}
</Button>`}
          >
            <div className="rounded-lg border border-line bg-canvas/40 px-4 py-3">
              <p className={cn('text-[12px] leading-relaxed text-muted', !expanded && 'line-clamp-2')}>
                {LONG_TEXT}
                {LONG_TEXT}
              </p>
              <Button
                variant="link"
                size="sm"
                className="mt-1 h-auto px-0 text-[11px]"
                onClick={() => setExpanded((v) => !v)}
              >
                {expanded ? '收起' : '展开'}
              </Button>
            </div>
            <p className="mt-3 text-[10.5px] leading-relaxed text-muted">
              省略只是默认视图，用户想看全文时必须有明确的展开入口；
              表格单元格等极窄场景才只保留悬浮提示。
            </p>
          </DemoBlock>

          <DemoBlock
            id="ellipsis-table"
            title="表格单元格省略"
            desc="列表场景：单元格 truncate + 悬浮 title，行高保持稳定"
            code={`<td className="max-w-[180px] truncate" title={cell}>{cell}</td>`}
          >
            <div className="overflow-hidden rounded-lg border border-line">
              <table className="w-full text-[11.5px]">
                <thead>
                  <tr className="border-b border-line bg-canvas/40 text-left text-soft">
                    <th className="px-3 py-2 font-medium">服务</th>
                    <th className="px-3 py-2 font-medium">描述</th>
                    <th className="px-3 py-2 font-medium">状态</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['vector-index-svc', LONG_TEXT, '健康'],
                    ['audit-log-svc', '审计日志采集与检索，支持按操作人、资源类型、时间范围过滤。', '健康'],
                    ['model-gateway', '统一模型网关，聚合多家上游渠道并做配额与熔断管理。', '降级'],
                  ].map(([name, desc, status]) => (
                    <tr key={name} className="border-b border-line/60 last:border-0">
                      <td className="max-w-[130px] truncate px-3 py-2 font-medium text-ink" title={name}>{name}</td>
                      <td className="max-w-[180px] truncate px-3 py-2 text-muted" title={desc}>{desc}</td>
                      <td className="px-3 py-2 text-muted">{status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </DemoBlock>
        </div>
      </div>
    </>
  )
}
