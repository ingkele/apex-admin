import * as React from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { toast } from 'sonner'
import { StatusBadge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { DemoBlock } from '@/components/shared/demo-block'
import { PageHeader } from '@/components/shared/page-header'
import { INITIAL_ROWS } from '@/lib/example-data'
import { cn } from '@/lib/utils'

export const Route = createFileRoute('/_auth/examples/vxe-table/basic')({
  component: Page,
})

function Page() {
  return (
    <>
      <PageHeader
        eyebrow={<span>示例 › Vxe 表格 › 基础表格 · 表格外观开关</span>}
        title="基础表格"
        description="表格最常用的外观开关：边框、斑马纹、紧凑密度、悬停高亮；支持行点击选中。"
      />
      <BasicTable />
    </>
  )
}

function BasicTable() {
  const [border, setBorder] = React.useState(true)
  const [stripe, setStripe] = React.useState(false)
  const [dense, setDense] = React.useState(false)
  const [selected, setSelected] = React.useState<string | null>(null)

  const toggles = [
    { label: '边框', on: border, set: setBorder },
    { label: '斑马纹', on: stripe, set: setStripe },
    { label: '紧凑密度', on: dense, set: setDense },
  ]

  return (
    <DemoBlock
      id="vxe-basic"
      title="任务列表（外观开关）"
      desc="切换开关即时改变表格外观；点行选中（再次点击取消）"
      code={`// 外观开关即 className 组合：
border ? 'border-line' : 'border-transparent'   // 单元格边框
stripe && 'odd:bg-canvas/30'                    // 斑马纹
dense ? 'py-1.5' : 'py-2.5'                     // 密度`}
    >
      <div className="mb-3 flex items-center gap-2">
        {toggles.map((t) => (
          <button
            key={t.label}
            type="button"
            onClick={() => t.set((v) => !v)}
            className={cn(
              'rounded-md px-3 py-1 text-[11px] transition-colors',
              t.on ? 'bg-brand-600 text-white' : 'border border-line text-muted hover:bg-hover',
            )}
          >
            {t.label}：{t.on ? '开' : '关'}
          </button>
        ))}
        <span className="ml-auto text-[10.5px] text-soft">
          {selected ? `已选中：${INITIAL_ROWS.find((r) => r.id === selected)?.name}` : '未选中行'}
        </span>
      </div>

      <div className="overflow-hidden rounded-lg border border-line">
        <table className="w-full text-[11.5px]">
          <thead>
            <tr className="border-b border-line bg-canvas/50 text-left text-soft">
              {['ID', '任务', '类型', '状态', '负责人', '创建时间'].map((h, i) => (
                <th key={h} className={cn('px-4 font-medium', dense ? 'py-2' : 'py-3', i > 0 && border && 'border-l border-line')}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {INITIAL_ROWS.map((row, idx) => {
              const active = selected === row.id
              return (
                <tr
                  key={row.id}
                  onClick={() => setSelected(active ? null : row.id)}
                  className={cn(
                    'cursor-pointer transition-colors',
                    stripe && idx % 2 === 1 && 'bg-canvas/30',
                    active ? 'bg-brand-50/70 dark:bg-brand-500/15' : 'hover:bg-hover/60',
                  )}
                >
                  <td className={cn('px-4 font-mono text-[10.5px] text-soft', dense ? 'py-1.5' : 'py-2.5', border && 'border-b border-line')}>
                    {row.id}
                  </td>
                  <td className={cn('px-4 font-medium text-ink', dense ? 'py-1.5' : 'py-2.5', border && 'border-b border-l border-line')}>
                    {row.name}
                  </td>
                  <td className={cn('px-4 text-muted', dense ? 'py-1.5' : 'py-2.5', border && 'border-b border-l border-line')}>
                    {row.type}
                  </td>
                  <td className={cn('px-4', dense ? 'py-1.5' : 'py-2.5', border && 'border-b border-l border-line')}>
                    <StatusBadge status={row.status} />
                  </td>
                  <td className={cn('px-4 text-muted', dense ? 'py-1.5' : 'py-2.5', border && 'border-b border-l border-line')}>
                    {row.owner}
                  </td>
                  <td className={cn('px-4 text-muted', dense ? 'py-1.5' : 'py-2.5', border && 'border-b border-l border-line')}>
                    {row.createdAt}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <div className="mt-3 flex justify-end">
        <Button size="sm" variant="outline" onClick={() => { setSelected(null); toast.info('已清除选中') }}>
          清除选中
        </Button>
      </div>
    </DemoBlock>
  )
}
