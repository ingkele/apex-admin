import * as React from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { toast } from 'sonner'
import { Check, Pencil, X } from 'lucide-react'
import { StatusBadge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { DemoBlock } from '@/components/shared/demo-block'
import { PageHeader } from '@/components/shared/page-header'
import { INITIAL_ROWS } from '@/lib/example-data'
import { cn } from '@/lib/utils'

export const Route = createFileRoute('/_auth/examples/vxe-table/edit-row')({
  component: Page,
})

function Page() {
  return (
    <>
      <PageHeader
        eyebrow={<span>示例 › Vxe 表格 › 行编辑 · 整行编辑保存</span>}
        title="行编辑"
        description="整行进入编辑态统一保存：一次只允许编辑一行，保存/取消明确提交；改动行打标记。"
      />
      <EditRowTable />
    </>
  )
}

interface EditRow {
  id: string
  name: string
  owner: string
  status: string
  priority: 'P0' | 'P1' | 'P2'
}

const INITIAL: EditRow[] = INITIAL_ROWS.map((r, i) => ({
  id: r.id,
  name: r.name,
  owner: r.owner,
  status: r.status,
  priority: i % 3 === 0 ? 'P0' : i % 3 === 1 ? 'P1' : 'P2',
}))

const STATUS_LIST = ['running', 'success', 'failed', 'queued', 'cancelled'] as const

function EditRowTable() {
  const [rows, setRows] = React.useState<EditRow[]>(INITIAL)
  const [editId, setEditId] = React.useState<string | null>(null)
  const [draft, setDraft] = React.useState<EditRow | null>(null)
  const [saved, setSaved] = React.useState<Set<string>>(new Set())

  const begin = (row: EditRow) => {
    setEditId(row.id)
    setDraft({ ...row })
  }

  const cancel = () => {
    setEditId(null)
    setDraft(null)
  }

  const save = () => {
    if (!draft) return
    if (!draft.name.trim()) {
      toast.error('任务名称不能为空')
      return
    }
    setRows((rs) => rs.map((r) => (r.id === draft.id ? { ...draft, name: draft.name.trim() } : r)))
    setSaved((s) => new Set(s).add(draft.id))
    cancel()
    toast.success(`已保存 ${draft.name}`)
  }

  return (
    <DemoBlock
      id="vxe-edit-row"
      title="任务列表（行编辑）"
      desc="点「编辑」整行变表单；同一时刻只有一行在编辑，切行自动放弃未保存内容"
      code={`// 编辑态 = 当前行快照（draft），保存时整行替换：
const save = () => {
  setRows((rs) => rs.map((r) => (r.id === draft.id ? draft : r)))
  setSaved((s) => new Set(s).add(draft.id))   // 改动过的行打标记
}
// 其他行点「编辑」→ begin() 直接覆盖 draft（未保存内容丢弃并提示）`}
    >
      <div className="mb-3 flex items-center gap-3">
        <span className="text-[10.5px] text-soft">
          {editId ? '编辑中：改动未保存，点「保存」生效' : `已修改 ${saved.size} 行`}
        </span>
        {saved.size > 0 ? (
          <Button
            size="sm"
            variant="outline"
            className="ml-auto"
            onClick={() => {
              setRows(INITIAL)
              setSaved(new Set())
              cancel()
              toast.info('已还原全部行')
            }}
          >
            还原数据
          </Button>
        ) : null}
      </div>

      <div className="overflow-hidden rounded-lg border border-line">
        <table className="w-full text-[11.5px]">
          <thead>
            <tr className="border-b border-line bg-canvas/50 text-left text-soft">
              {['ID', '任务', '负责人', '优先级', '状态', '操作'].map((h, i) => (
                <th key={h} className={cn('px-4 py-2.5 font-medium', i > 0 && 'border-l border-line')}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const editing = editId === row.id
              const d = editing ? draft! : row
              return (
                <tr
                  key={row.id}
                  className={cn(
                    'border-b border-line/60 last:border-0',
                    editing && 'bg-brand-50/50 dark:bg-brand-500/10',
                    saved.has(row.id) && !editing && 'bg-amber-50/40 dark:bg-amber-500/5',
                  )}
                >
                  <td className="px-4 py-2.5">
                    <span className="flex items-center gap-1.5">
                      {saved.has(row.id) ? <span title="已修改" className="h-1.5 w-1.5 rounded-full bg-amber-400" /> : null}
                      <span className="font-mono text-[10.5px] text-soft">{row.id}</span>
                    </span>
                  </td>
                  <td className="border-l border-line px-4 py-2.5">
                    {editing ? (
                      <input
                        value={d.name}
                        onChange={(e) => setDraft({ ...d, name: e.target.value })}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') save()
                          if (e.key === 'Escape') cancel()
                        }}
                        className="h-7 w-full rounded-md border border-brand-500 bg-surface px-2 text-[11.5px] text-ink outline-none ring-2 ring-brand-500/15"
                      />
                    ) : (
                      <span className="font-medium text-ink">{row.name}</span>
                    )}
                  </td>
                  <td className="border-l border-line px-4 py-2.5">
                    {editing ? (
                      <input
                        value={d.owner}
                        onChange={(e) => setDraft({ ...d, owner: e.target.value })}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') save()
                          if (e.key === 'Escape') cancel()
                        }}
                        className="h-7 w-full rounded-md border border-brand-500 bg-surface px-2 text-[11.5px] text-ink outline-none ring-2 ring-brand-500/15"
                      />
                    ) : (
                      <span className="text-muted">{row.owner}</span>
                    )}
                  </td>
                  <td className="border-l border-line px-4 py-2.5">
                    {editing ? (
                      <select
                        value={d.priority}
                        onChange={(e) => setDraft({ ...d, priority: e.target.value as EditRow['priority'] })}
                        className="h-7 w-full rounded-md border border-brand-500 bg-surface px-2 text-[11.5px] text-ink outline-none ring-2 ring-brand-500/15"
                      >
                        {(['P0', 'P1', 'P2'] as const).map((p) => (
                          <option key={p} value={p}>{p}</option>
                        ))}
                      </select>
                    ) : (
                      <span
                        className={cn(
                          'rounded-md px-1.5 py-0.5 text-[10.5px] font-medium',
                          row.priority === 'P0' ? 'bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400'
                            : row.priority === 'P1' ? 'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400'
                            : 'bg-slate-100 text-slate-600 dark:bg-slate-500/10 dark:text-slate-400',
                        )}
                      >
                        {row.priority}
                      </span>
                    )}
                  </td>
                  <td className="border-l border-line px-4 py-2.5">
                    {editing ? (
                      <select
                        value={d.status}
                        onChange={(e) => setDraft({ ...d, status: e.target.value })}
                        className="h-7 w-full rounded-md border border-brand-500 bg-surface px-2 text-[11.5px] text-ink outline-none ring-2 ring-brand-500/15"
                      >
                        {STATUS_LIST.map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    ) : (
                      <StatusBadge status={row.status} />
                    )}
                  </td>
                  <td className="border-l border-line px-4 py-2.5">
                    <span className="flex gap-1">
                      {editing ? (
                        <>
                          <Button size="sm" variant="primary" className="h-6 px-2 text-[10.5px]" onClick={save}>
                            <Check className="h-3 w-3" /> 保存
                          </Button>
                          <Button size="sm" variant="outline" className="h-6 px-2 text-[10.5px]" onClick={cancel}>
                            <X className="h-3 w-3" /> 取消
                          </Button>
                        </>
                      ) : (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-6 px-2 text-[10.5px]"
                          disabled={editId !== null}
                          onClick={() => {
                            if (editId && editId !== row.id) toast.info('已放弃上一行未保存的修改')
                            begin(row)
                          }}
                        >
                          <Pencil className="h-3 w-3" /> 编辑
                        </Button>
                      )}
                    </span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </DemoBlock>
  )
}
