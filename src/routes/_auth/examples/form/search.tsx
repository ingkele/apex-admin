import * as React from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { ChevronDown, ChevronUp, RotateCcw, Search } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { StatusBadge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { AppSelect } from '@/components/ui/select'
import { DemoBlock } from '@/components/shared/demo-block'
import { PageHeader } from '@/components/shared/page-header'
import { INITIAL_ROWS, STATUS_OPTIONS, type RecordRow } from '@/lib/example-data'

export const Route = createFileRoute('/_auth/examples/form/search')({
  component: Page,
})

function Page() {
  return (
    <>
      <PageHeader
        eyebrow={<span>示例 › 表单 › 查询表单 · 折叠筛选 + 结果联动</span>}
        title="查询表单"
        description="列表页标配的筛选区：常用条件平铺、低频条件折叠，查询与重置联动下方结果表格。"
      />
      <SearchForm />
    </>
  )
}

const DEFAULTS = { keyword: '', status: 'all', owner: 'all', type: 'all', createdFrom: '', createdTo: '' }

function SearchForm() {
  const [form, setForm] = React.useState({ ...DEFAULTS })
  const [applied, setApplied] = React.useState({ ...DEFAULTS })
  const [expanded, setExpanded] = React.useState(false)

  const set = (k: keyof typeof DEFAULTS, v: string) => setForm((f) => ({ ...f, [k]: v }))

  const doSearch = (next = form) => {
    setApplied(next)
    toast.success(`查询完成，命中 ${filterRows(next).length} 条记录`)
  }
  const doReset = () => {
    setForm({ ...DEFAULTS })
    setApplied({ ...DEFAULTS })
    toast.info('筛选条件已重置')
  }

  return (
    <DemoBlock
      id="form-search"
      title="任务检索"
      desc="常用条件平铺，「展开筛选」露出低频条件；查询/重置即时联动结果"
      code={`// 查询表单的三件套：
// 1. 双状态：form（编辑中）与 applied（已生效）分离，避免输入即过滤
// 2. 低频条件折叠，折叠时按默认值参与查询
// 3. 重置 = 恢复默认并立即重查`}
    >
      <div className="rounded-lg border border-line bg-canvas/40 p-4">
        <div className="flex flex-wrap items-end gap-x-4 gap-y-3">
          <div className="w-[220px]">
            <p className="mb-1.5 text-[11px] text-soft">关键字</p>
            <Input
              value={form.keyword}
              onChange={(e) => set('keyword', e.target.value)}
              placeholder="任务名称 / ID"
              onKeyDown={(e) => e.key === 'Enter' && doSearch()}
            />
          </div>
          <div className="w-[150px]">
            <p className="mb-1.5 text-[11px] text-soft">状态</p>
            <AppSelect value={form.status} onValueChange={(v) => set('status', v)} options={STATUS_OPTIONS} />
          </div>
          <div className="w-[150px]">
            <p className="mb-1.5 text-[11px] text-soft">负责人</p>
            <AppSelect
              value={form.owner}
              onValueChange={(v) => set('owner', v)}
              options={[
                { value: 'all', label: '全部负责人' },
                { value: '陈昊', label: '陈昊' },
                { value: '林晓', label: '林晓' },
                { value: '周可', label: '周可' },
                { value: '苏禾', label: '苏禾' },
              ]}
            />
          </div>
          <div className="ml-auto flex items-center gap-2">
            <Button size="sm" variant="outline" onClick={doReset}>
              <RotateCcw className="h-3.5 w-3.5" /> 重置
            </Button>
            <Button size="sm" onClick={() => doSearch()}>
              <Search className="h-3.5 w-3.5" /> 查询
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setExpanded((v) => !v)}>
              {expanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
              {expanded ? '收起筛选' : '展开筛选'}
            </Button>
          </div>
        </div>

        {expanded ? (
          <div className="mt-3 flex flex-wrap items-end gap-x-4 gap-y-3 border-t border-dashed border-line pt-3">
            <div className="w-[150px]">
              <p className="mb-1.5 text-[11px] text-soft">任务类型</p>
              <AppSelect
                value={form.type}
                onValueChange={(v) => set('type', v)}
                options={[
                  { value: 'all', label: '全部类型' },
                  { value: '文档处理', label: '文档处理' },
                  { value: '模型微调', label: '模型微调' },
                  { value: '信息抽取', label: '信息抽取' },
                  { value: '文本生成', label: '文本生成' },
                ]}
              />
            </div>
            <div className="w-[150px]">
              <p className="mb-1.5 text-[11px] text-soft">创建起始</p>
              <Input type="date" value={form.createdFrom} onChange={(e) => set('createdFrom', e.target.value)} />
            </div>
            <div className="w-[150px]">
              <p className="mb-1.5 text-[11px] text-soft">创建截止</p>
              <Input type="date" value={form.createdTo} onChange={(e) => set('createdTo', e.target.value)} />
            </div>
          </div>
        ) : null}
      </div>

      <div className="mt-4 overflow-hidden rounded-lg border border-line">
        <table className="w-full text-[11.5px]">
          <thead>
            <tr className="border-b border-line bg-canvas/40 text-left text-soft">
              <th className="px-3 py-2.5 font-medium">任务</th>
              <th className="px-3 py-2.5 font-medium">类型</th>
              <th className="px-3 py-2.5 font-medium">状态</th>
              <th className="px-3 py-2.5 font-medium">负责人</th>
              <th className="px-3 py-2.5 font-medium">创建时间</th>
            </tr>
          </thead>
          <tbody>
            {filterRows(applied).map((row) => (
              <tr key={row.id} className="border-b border-line/60 last:border-0 hover:bg-hover/50">
                <td className="px-3 py-2.5">
                  <div className="font-medium text-ink">{row.name}</div>
                  <div className="font-mono text-[10px] text-soft">{row.id}</div>
                </td>
                <td className="px-3 py-2.5 text-muted">{row.type}</td>
                <td className="px-3 py-2.5"><StatusBadge status={row.status} /></td>
                <td className="px-3 py-2.5 text-muted">{row.owner}</td>
                <td className="px-3 py-2.5 text-muted">{row.createdAt}</td>
              </tr>
            ))}
            {filterRows(applied).length === 0 ? (
              <tr>
                <td colSpan={5} className="px-3 py-8 text-center text-soft">
                  没有匹配的记录，试试放宽筛选条件
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </DemoBlock>
  )
}

/** 按已生效条件过滤 —— 与编辑中的 form 分离 */
function filterRows(f: typeof DEFAULTS): RecordRow[] {
  return INITIAL_ROWS.filter((r) => {
    const kw = f.keyword.trim()
    if (kw && !r.name.includes(kw) && !r.id.includes(kw)) return false
    if (f.status !== 'all' && r.status !== f.status) return false
    if (f.owner !== 'all' && r.owner !== f.owner) return false
    if (f.type !== 'all' && r.type !== f.type) return false
    return true
  })
}
