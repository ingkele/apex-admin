import * as React from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { RotateCcw, Search } from 'lucide-react'
import { StatusBadge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { AppSelect } from '@/components/ui/select'
import { DemoBlock } from '@/components/shared/demo-block'
import { PageHeader } from '@/components/shared/page-header'
import { INITIAL_ROWS, STATUS_OPTIONS } from '@/lib/example-data'
import { cn } from '@/lib/utils'

export const Route = createFileRoute('/_auth/examples/vxe-table/form')({
  component: Page,
})

function Page() {
  return (
    <>
      <PageHeader
        eyebrow={<span>示例 › Vxe 表格 › 搜索表单 · 条件过滤表格</span>}
        title="搜索表单"
        description="表单与表格联动：关键字、状态下拉、负责人多选过滤；回车即查，重置一键还原。"
      />
      <FormTable />
    </>
  )
}

const OWNER_OPTIONS = [
  { value: 'all', label: '全部负责人' },
  ...['陈昊', '林晓', '周可', '苏禾', '赵岚', '王宁', '李思'].map((o) => ({ value: o, label: o })),
]

const TYPE_OPTIONS = [
  { value: 'all', label: '全部类型' },
  ...['文档处理', '模型微调', '文本生成', '数据同步', '信息抽取', '图像处理', '数据分析'].map((o) => ({ value: o, label: o })),
]

interface Filters {
  keyword: string
  status: string
  owner: string
  type: string
}

const EMPTY_FILTERS: Filters = { keyword: '', status: 'all', owner: 'all', type: 'all' }

function matchRow(r: (typeof INITIAL_ROWS)[number], f: Filters) {
  const kw = f.keyword.trim().toLowerCase()
  return (
    (!kw || r.name.toLowerCase().includes(kw) || r.id.toLowerCase().includes(kw)) &&
    (f.status === 'all' || r.status === f.status) &&
    (f.owner === 'all' || r.owner === f.owner) &&
    (f.type === 'all' || r.type === f.type)
  )
}

function FormTable() {
  const [draft, setDraft] = React.useState<Filters>(EMPTY_FILTERS)
  const [applied, setApplied] = React.useState<Filters>(EMPTY_FILTERS)

  const rows = INITIAL_ROWS.filter((r) => matchRow(r, applied))
  const dirty = JSON.stringify(draft) !== JSON.stringify(applied)

  const set = (patch: Partial<Filters>) => setDraft((d) => ({ ...d, ...patch }))

  return (
    <DemoBlock
      id="vxe-form"
      title="任务搜索"
      desc="改条件不即时过滤，点「查询」或按回车才生效；有未应用条件时按钮高亮提醒"
      code={`// 表单态（draft）与已应用态（applied）分离：
const rows = INITIAL_ROWS.filter((r) => matchRow(r, applied))
const dirty = JSON.stringify(draft) !== JSON.stringify(applied)
// 查询 → setApplied(draft)；重置 → 双清`}
    >
      <div className="rounded-xl border border-line bg-canvas/40 p-4">
        <div className="flex flex-wrap items-end gap-3">
          <div className="w-[220px]">
            <span className="mb-1.5 block text-[11px] text-soft">关键字</span>
            <div className="relative">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-soft" />
              <Input
                value={draft.keyword}
                onChange={(e) => set({ keyword: e.target.value })}
                onKeyDown={(e) => e.key === 'Enter' && setApplied(draft)}
                placeholder="任务名称 / ID"
                className="h-8 pl-8 text-[12px]"
              />
            </div>
          </div>
          <div className="w-[150px]">
            <span className="mb-1.5 block text-[11px] text-soft">状态</span>
            <AppSelect value={draft.status} onValueChange={(v) => set({ status: v })} options={STATUS_OPTIONS} className="h-8 text-[12px]" />
          </div>
          <div className="w-[150px]">
            <span className="mb-1.5 block text-[11px] text-soft">负责人</span>
            <AppSelect value={draft.owner} onValueChange={(v) => set({ owner: v })} options={OWNER_OPTIONS} className="h-8 text-[12px]" />
          </div>
          <div className="w-[150px]">
            <span className="mb-1.5 block text-[11px] text-soft">任务类型</span>
            <AppSelect value={draft.type} onValueChange={(v) => set({ type: v })} options={TYPE_OPTIONS} className="h-8 text-[12px]" />
          </div>
          <div className="flex gap-2 pb-[1px]">
            <Button size="sm" variant={dirty ? 'primary' : 'outline'} onClick={() => setApplied(draft)}>
              <Search className="h-3.5 w-3.5" /> 查询{dirty ? ' *' : ''}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setDraft(EMPTY_FILTERS)
                setApplied(EMPTY_FILTERS)
              }}
            >
              <RotateCcw className="h-3.5 w-3.5" /> 重置
            </Button>
          </div>
        </div>
        <div className="mt-2.5 flex flex-wrap gap-1.5">
          {(
            [
              applied.keyword && `关键字：${applied.keyword}`,
              applied.status !== 'all' && `状态：${STATUS_OPTIONS.find((o) => o.value === applied.status)?.label}`,
              applied.owner !== 'all' && `负责人：${applied.owner}`,
              applied.type !== 'all' && `类型：${applied.type}`,
            ].filter(Boolean) as string[]
          ).map((chip) => (
            <span key={chip} className="rounded-full bg-brand-50 px-2.5 py-0.5 text-[10.5px] text-brand-600 dark:bg-brand-500/10 dark:text-brand-400">
              {chip}
            </span>
          ))}
          {!applied.keyword && applied.status === 'all' && applied.owner === 'all' && applied.type === 'all' ? (
            <span className="text-[10.5px] text-soft">未应用筛选条件，展示全部 {INITIAL_ROWS.length} 条</span>
          ) : null}
        </div>
      </div>

      <div className="mt-3 overflow-hidden rounded-lg border border-line">
        <table className="w-full text-[11.5px]">
          <thead>
            <tr className="border-b border-line bg-canvas/50 text-left text-soft">
              {['ID', '任务', '类型', '状态', '负责人', '创建时间'].map((h, i) => (
                <th key={h} className={cn('px-4 py-2.5 font-medium', i > 0 && 'border-l border-line')}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="border-b border-line/60 last:border-0 hover:bg-hover/50">
                <td className="px-4 py-2.5 font-mono text-[10.5px] text-soft">{row.id}</td>
                <td className="border-l border-line px-4 py-2.5 font-medium text-ink">{row.name}</td>
                <td className="border-l border-line px-4 py-2.5 text-muted">{row.type}</td>
                <td className="border-l border-line px-4 py-2.5"><StatusBadge status={row.status} /></td>
                <td className="border-l border-line px-4 py-2.5 text-muted">{row.owner}</td>
                <td className="border-l border-line px-4 py-2.5 text-muted">{row.createdAt}</td>
              </tr>
            ))}
            {rows.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-muted">
                  没有匹配的任务，试试放宽筛选条件
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
      <p className="mt-2 text-right text-[10.5px] text-soft">命中 {rows.length} / {INITIAL_ROWS.length} 条</p>
    </DemoBlock>
  )
}
