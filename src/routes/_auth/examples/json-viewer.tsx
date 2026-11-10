import * as React from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { toast } from 'sonner'
import { DemoBlock } from '@/components/shared/demo-block'
import { PageHeader } from '@/components/shared/page-header'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Check, ChevronDown, ChevronRight, Copy, MinusSquare, PlusSquare } from 'lucide-react'

export const Route = createFileRoute('/_auth/examples/json-viewer')({
  component: Page,
})

const SAMPLE = {
  service: 'vector-index-svc',
  healthy: true,
  replicas: 4,
  version: '2.5.1',
  tags: ['search', 'embedding', 'production'],
  resources: { cpu: '2000m', memory: '4Gi', gpu: null },
  endpoints: [
    { path: '/v1/query', method: 'POST', latencyP99: 86.5 },
    { path: '/v1/upsert', method: 'POST', latencyP99: 120.2 },
    { path: '/healthz', method: 'GET', latencyP99: 3.1 },
  ],
  meta: { region: 'cn-south-1', zone: 'gz-1a', createdAt: '2026-09-01T08:00:00Z' },
}

/** 语法高亮着色：键 / 字符串 / 数字 / 布尔 / null */
function JsonValue({ value }: { value: unknown }) {
  if (value === null) return <span className="text-soft italic">null</span>
  switch (typeof value) {
    case 'string':
      return <span className="text-emerald-600 dark:text-emerald-400">"{value}"</span>
    case 'number':
      return <span className="text-amber-600 dark:text-amber-400">{String(value)}</span>
    case 'boolean':
      return <span className="text-violet-600 dark:text-violet-400">{String(value)}</span>
    default:
      return <span>{String(value)}</span>
  }
}

/** 递归 JSON 节点 —— 对象/数组可折叠，带类型着色 */
function JsonNode({
  name,
  value,
  depth,
  defaultOpen,
}: {
  name?: string
  value: unknown
  depth: number
  defaultOpen: boolean
}) {
  const isObj = value !== null && typeof value === 'object'
  const [open, setOpen] = React.useState(defaultOpen)

  if (!isObj) {
    return (
      <div style={{ paddingLeft: depth * 16 }} className="leading-[1.9]">
        {name !== undefined ? (
          <span className="text-brand-600 dark:text-brand-400">"{name}"</span>
        ) : null}
        {name !== undefined ? <span className="text-soft">: </span> : null}
        <JsonValue value={value} />
      </div>
    )
  }

  const entries = Array.isArray(value)
    ? (value as unknown[]).map((v, i) => [String(i), v] as const)
    : Object.entries(value as Record<string, unknown>)
  const opener = Array.isArray(value) ? '[' : '{'
  const closer = Array.isArray(value) ? ']' : '}'

  return (
    <div>
      <div style={{ paddingLeft: depth * 16 }} className="leading-[1.9]">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="mr-1 inline-flex h-4 w-4 items-center justify-center rounded align-middle text-soft transition hover:bg-hover hover:text-ink"
        >
          {open ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
        </button>
        {name !== undefined ? (
          <>
            <span className="text-brand-600 dark:text-brand-400">"{name}"</span>
            <span className="text-soft">: </span>
          </>
        ) : null}
        <span className="text-soft">{opener}</span>
        {!open ? (
          <>
            <span className="mx-1 text-soft">… {entries.length} 项</span>
            <span className="text-soft">{closer}</span>
          </>
        ) : null}
      </div>
      {open ? (
        <>
          {entries.map(([k, v]) => (
            <JsonNode
              key={k}
              name={Array.isArray(value) ? undefined : k}
              value={v}
              depth={depth + 1}
              defaultOpen={depth < 1}
            />
          ))}
          <div style={{ paddingLeft: depth * 16 }} className="leading-[1.9] text-soft">
            {closer}
          </div>
        </>
      ) : null}
    </div>
  )
}

function Page() {
  const [copied, setCopied] = React.useState(false)
  const [resetKey, setResetKey] = React.useState(0)

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(SAMPLE, null, 2))
      setCopied(true)
      toast.success('JSON 已复制到剪贴板')
      window.setTimeout(() => setCopied(false), 1500)
    } catch {
      toast.error('复制失败，请手动选择文本')
    }
  }

  return (
    <>
      <PageHeader
        eyebrow={<span>示例 › JsonViewer · 递归折叠的 JSON 查看器</span>}
        title="JsonViewer"
        description="对象/数组可折叠、值按类型着色、支持复制原文；查看接口响应、配置快照的标配组件。"
      />

      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-7">
          <DemoBlock
            id="json-viewer-tree"
            title="JSON 树"
            desc="点击箭头折叠/展开节点，两层以内默认展开"
            code={`function JsonNode({ name, value, depth }) {
  if (typeof value !== 'object') return <JsonLeaf … />
  return (
    <button onClick={toggle}>▾</button>
    {open && entries.map(… => <JsonNode depth={depth + 1} />)}
  )
}`}
          >
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <Button size="sm" variant="outline" onClick={() => setResetKey((k) => k + 1)}>
                <PlusSquare className="h-3.5 w-3.5" /> 全部展开（重置）
              </Button>
              <Button size="sm" variant="outline" onClick={copy}>
                {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                {copied ? '已复制' : '复制 JSON'}
              </Button>
              <span className="text-[10.5px] text-soft">
                <MinusSquare className="mr-1 inline h-3 w-3" />
                折叠态节点点击箭头展开
              </span>
            </div>
            <div className="max-h-[380px] overflow-auto rounded-lg border border-line bg-canvas/30 px-4 py-3 font-mono text-[11px] text-ink">
              <JsonNode key={resetKey} value={SAMPLE} depth={0} defaultOpen />
            </div>
          </DemoBlock>
        </div>

        <div className="col-span-5">
          <DemoBlock
            id="json-viewer-palette"
            title="类型着色"
            desc="键、字符串、数字、布尔、null 五类各有固定颜色"
            code={`string  → emerald
number  → amber
boolean → violet
null    → muted italic
key     → brand`}
          >
            <div className="space-y-2 font-mono text-[11.5px]">
              {[
                ['键名 key', 'text-brand-600 dark:text-brand-400', '"service"'],
                ['字符串 string', 'text-emerald-600 dark:text-emerald-400', '"vector-index-svc"'],
                ['数字 number', 'text-amber-600 dark:text-amber-400', '86.5'],
                ['布尔 boolean', 'text-violet-600 dark:text-violet-400', 'true'],
                ['空值 null', 'text-soft italic', 'null'],
              ].map(([label, cls, sample]) => (
                <div key={label} className="flex items-center justify-between rounded-lg border border-line px-3.5 py-2">
                  <span className="text-[10.5px] text-muted" style={{ fontFamily: 'inherit' }}>{label}</span>
                  <span className={cls}>{sample}</span>
                </div>
              ))}
            </div>
            <div className={cn('mt-4 rounded-lg border border-line bg-canvas/40 px-4 py-3 text-[10.5px] leading-relaxed text-muted')}>
              着色只做视觉分层，不改变文本本身 —— 复制出来的仍是合法 JSON，
              可直接粘贴进接口调试工具。
            </div>
          </DemoBlock>
        </div>
      </div>
    </>
  )
}
