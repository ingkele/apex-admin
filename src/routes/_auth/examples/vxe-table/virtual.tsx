import * as React from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { StatusBadge } from '@/components/ui/badge'
import { DemoBlock } from '@/components/shared/demo-block'
import { PageHeader } from '@/components/shared/page-header'
import { cn } from '@/lib/utils'

export const Route = createFileRoute('/_auth/examples/vxe-table/virtual')({
  component: Page,
})

function Page() {
  return (
    <>
      <PageHeader
        eyebrow={<span>示例 › Vxe 表格 › 虚拟滚动 · 大数据量渲染</span>}
        title="虚拟滚动"
        description="5000 行数据只渲染可视窗口：滚动实时复用 DOM 行，DOM 节点数恒定不随数据量增长。"
      />
      <VirtualTable />
    </>
  )
}

interface VRow {
  id: string
  name: string
  type: string
  status: string
  owner: string
  createdAt: string
}

const TOTAL = 5000
const ROW_H = 40
const VIEW_H = 420
const OVERSCAN = 6

const TYPES = ['文档处理', '模型微调', '文本生成', '数据同步', '信息抽取', '图像处理', '数据分析']
const STATUSES = ['running', 'success', 'failed', 'queued', 'cancelled']
const OWNERS = ['陈昊', '林晓', '周可', '苏禾', '赵岚', '王宁', '李思']

const ALL: VRow[] = Array.from({ length: TOTAL }, (_, i) => ({
  id: `task_${(0x100000 + i * 7919).toString(16)}`,
  name: `批量任务 #${i + 1} · ${['向量化', '微调', '摘要', '同步', '抽取', '打标', '聚类'][i % 7]}`,
  type: TYPES[i % TYPES.length],
  status: STATUSES[i % STATUSES.length],
  owner: OWNERS[i % OWNERS.length],
  createdAt: `11-${String((i % 28) + 1).padStart(2, '0')} ${String(i % 24).padStart(2, '0')}:${String((i * 7) % 60).padStart(2, '0')}`,
}))

function VirtualTable() {
  const [scrollTop, setScrollTop] = React.useState(0)

  const start = Math.max(0, Math.floor(scrollTop / ROW_H) - OVERSCAN)
  const end = Math.min(TOTAL, Math.ceil((scrollTop + VIEW_H) / ROW_H) + OVERSCAN)
  const visible = ALL.slice(start, end)

  return (
    <DemoBlock
      id="vxe-virtual"
      title="5000 行任务（虚拟滚动）"
      desc="滚动时只有可视区 ±6 行在 DOM 中；上方徽标实时显示渲染行数与滚动位置"
      code={`// 窗口切片：可视区 ± OVERSCAN 行
const start = Math.max(0, Math.floor(scrollTop / ROW_H) - OVERSCAN)
const end = Math.min(TOTAL, Math.ceil((scrollTop + VIEW_H) / ROW_H) + OVERSCAN)
const visible = ALL.slice(start, end)
// 上下用两个 spacer 行撑起总高度：
<tr style={{ height: start * ROW_H }} />        // top spacer
{visible.map(...)}
<tr style={{ height: (TOTAL - end) * ROW_H }} /> // bottom spacer`}
    >
      <div className="mb-3 flex items-center gap-3">
        <span className="rounded-full bg-brand-50 px-2.5 py-0.5 text-[10.5px] text-brand-600 dark:bg-brand-500/10 dark:text-brand-400">
          DOM 行数 {visible.length} / {TOTAL}
        </span>
        <span className="text-[10.5px] text-soft">
          可见窗口 [{start}, {end}) · scrollTop {Math.round(scrollTop)}px
        </span>
        <button
          type="button"
          onClick={() => setScrollTop((s) => Math.min(TOTAL * ROW_H - VIEW_H, s + ROW_H * 10))}
          className="ml-auto rounded-md border border-line px-2.5 py-1 text-[10.5px] text-muted transition-colors hover:bg-hover"
        >
          快进 10 行
        </button>
      </div>

      {/* 定高滚动容器：滚动值驱动窗口切片 */}
      <div
        onScroll={(e) => setScrollTop(e.currentTarget.scrollTop)}
        className="h-[420px] overflow-y-auto rounded-lg border border-line"
        data-testid="virtual-scroller"
      >
        <table className="w-full table-fixed text-[11.5px]">
          <thead className="sticky top-0 z-10">
            <tr className="border-b border-line bg-canvas text-left text-soft">
              <th className="w-[130px] px-4 py-2.5 font-medium">ID</th>
              <th className="px-4 py-2.5 font-medium">任务</th>
              <th className="w-[110px] px-4 py-2.5 font-medium">类型</th>
              <th className="w-[100px] px-4 py-2.5 font-medium">状态</th>
              <th className="w-[90px] px-4 py-2.5 font-medium">负责人</th>
              <th className="w-[120px] px-4 py-2.5 font-medium">创建时间</th>
            </tr>
          </thead>
          <tbody>
            {start > 0 ? (
              <tr aria-hidden style={{ height: start * ROW_H }}>
                <td colSpan={6} />
              </tr>
            ) : null}
            {visible.map((row, i) => (
              <tr
                key={row.id}
                style={{ height: ROW_H }}
                className={cn(
                  'border-b border-line/60',
                  (start + i) % 2 === 1 && 'bg-canvas/30',
                  'hover:bg-hover/50',
                )}
              >
                <td className="px-4 font-mono text-[10.5px] text-soft">{row.id}</td>
                <td className="truncate px-4 font-medium text-ink">{row.name}</td>
                <td className="px-4 text-muted">{row.type}</td>
                <td className="px-4"><StatusBadge status={row.status} /></td>
                <td className="px-4 text-muted">{row.owner}</td>
                <td className="px-4 text-muted">{row.createdAt}</td>
              </tr>
            ))}
            {end < TOTAL ? (
              <tr aria-hidden style={{ height: (TOTAL - end) * ROW_H }}>
                <td colSpan={6} />
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </DemoBlock>
  )
}
