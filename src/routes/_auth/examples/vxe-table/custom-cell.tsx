import * as React from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { toast } from 'sonner'
import { Check, Copy, ExternalLink, TrendingDown, TrendingUp } from 'lucide-react'
import { Badge, StatusBadge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { DemoBlock } from '@/components/shared/demo-block'
import { PageHeader } from '@/components/shared/page-header'
import { INITIAL_ROWS } from '@/lib/example-data'
import { cn } from '@/lib/utils'

export const Route = createFileRoute('/_auth/examples/vxe-table/custom-cell')({
  component: Page,
})

function Page() {
  return (
    <>
      <PageHeader
        eyebrow={<span>示例 › Vxe 表格 › 自定义单元格 · 复杂内容渲染</span>}
        title="自定义单元格"
        description="单元格即组件：头像组合、进度条、多标签、可复制 ID、涨跌数字、链接与操作按钮。"
      />
      <CustomCellTable />
    </>
  )
}

const TAGS: string[][] = [
  ['向量', 'RAG'],
  ['微调', 'LoRA', 'GPU'],
  ['摘要'],
  ['增量'],
  ['OCR', '抽取'],
  ['CV', '打标'],
  ['聚类'],
  ['批量', 'OCR'],
]

const EXTRA = INITIAL_ROWS.map((r, i) => ({
  ...r,
  avatar: ['bg-indigo-500', 'bg-emerald-500', 'bg-amber-500', 'bg-sky-500', 'bg-rose-500', 'bg-violet-500', 'bg-teal-500', 'bg-orange-500'][i],
  progress: [86, 100, 34, 0, 100, 52, 100, 0][i],
  delta: [12.4, -3.1, 8.7, 0.6, -1.2, 5.5, 2.3, -6.8][i],
  tags: TAGS[i],
  docUrl: `https://docs.apex.ai/tasks/${r.id}`,
}))

function CustomCellTable() {
  return (
    <DemoBlock
      id="vxe-custom-cell"
      title="任务列表（自定义渲染）"
      desc="每一列都是自定义渲染函数的产物；点复制图标拷贝 ID，点外链在新窗口打开文档"
      code={`// 单元格 = 渲染函数返回的组件树
columns: [
  { key: 'owner',  render: (r) => <AvatarCell row={r} /> },
  { key: 'status', render: (r) => <ProgressCell value={r.progress} /> },
  { key: 'delta',  render: (r) => <DeltaCell value={r.delta} /> },
  { key: 'tags',   render: (r) => r.tags.map((t) => <Badge>{t}</Badge>) },
]`}
    >
      <div className="overflow-hidden rounded-lg border border-line">
        <table className="w-full text-[11.5px]">
          <thead>
            <tr className="border-b border-line bg-canvas/50 text-left text-soft">
              {['ID', '负责人', '进度', '环比', '标签', '状态', '文档', '操作'].map((h, i) => (
                <th key={h} className={cn('px-4 py-2.5 font-medium', i > 0 && 'border-l border-line')}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {EXTRA.map((row) => (
              <tr key={row.id} className="border-b border-line/60 last:border-0 hover:bg-hover/50">
                {/* 可复制 ID */}
                <td className="px-4 py-2.5">
                  <span className="inline-flex items-center gap-1.5 font-mono text-[10.5px] text-soft">
                    {row.id}
                    <button
                      type="button"
                      aria-label={`复制 ${row.id}`}
                      onClick={() => {
                        navigator.clipboard?.writeText(row.id)
                        toast.success('已复制 ID')
                      }}
                      className="text-soft transition-colors hover:text-brand-600"
                    >
                      <Copy className="h-3 w-3" />
                    </button>
                  </span>
                </td>
                {/* 头像 + 姓名 */}
                <td className="border-l border-line px-4 py-2.5">
                  <span className="flex items-center gap-2">
                    <span className={cn('flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-semibold text-white', row.avatar)}>
                      {row.owner.slice(-2)}
                    </span>
                    <span className="font-medium text-ink">{row.owner}</span>
                  </span>
                </td>
                {/* 进度条 */}
                <td className="border-l border-line px-4 py-2.5">
                  <span className="flex items-center gap-2">
                    <span className="h-1.5 w-24 overflow-hidden rounded-full bg-canvas">
                      <span
                        className={cn('block h-full rounded-full', row.progress === 100 ? 'bg-emerald-500' : row.progress === 0 ? 'bg-slate-300' : 'bg-brand-500')}
                        style={{ width: `${row.progress}%` }}
                      />
                    </span>
                    <span className="w-8 text-[10.5px] text-muted">{row.progress}%</span>
                  </span>
                </td>
                {/* 涨跌数字 */}
                <td className="border-l border-line px-4 py-2.5">
                  <span className={cn('inline-flex items-center gap-1 font-medium', row.delta > 0 ? 'text-rose-600 dark:text-rose-400' : row.delta < 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-muted')}>
                    {row.delta > 0 ? <TrendingUp className="h-3.5 w-3.5" /> : row.delta < 0 ? <TrendingDown className="h-3.5 w-3.5" /> : null}
                    {row.delta > 0 ? '+' : ''}{row.delta.toFixed(1)}%
                  </span>
                </td>
                {/* 多标签 */}
                <td className="border-l border-line px-4 py-2.5">
                  <span className="flex flex-wrap gap-1">
                    {row.tags.map((t, i) => (
                      <Badge key={t} variant={i === 0 ? 'brand' : 'gray'}>{t}</Badge>
                    ))}
                  </span>
                </td>
                <td className="border-l border-line px-4 py-2.5">
                  <StatusBadge status={row.status} />
                </td>
                {/* 外链 */}
                <td className="border-l border-line px-4 py-2.5">
                  <a
                    href={row.docUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-brand-600 hover:underline"
                  >
                    文档 <ExternalLink className="h-3 w-3" />
                  </a>
                </td>
                {/* 操作按钮组 */}
                <td className="border-l border-line px-4 py-2.5">
                  <span className="flex gap-1">
                    <Button size="sm" variant="ghost" className="h-6 px-2 text-[10.5px]" onClick={() => toast.success(`${row.name} 已开始重跑`)}>
                      <Check className="h-3 w-3" /> 重跑
                    </Button>
                    <Button size="sm" variant="ghost" className="h-6 px-2 text-[10.5px]" onClick={() => toast.info(`已归档 ${row.name}`)}>
                      归档
                    </Button>
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </DemoBlock>
  )
}
