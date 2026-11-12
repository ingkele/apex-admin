import * as React from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { toast } from 'sonner'
import { StatusBadge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { DemoBlock } from '@/components/shared/demo-block'
import { PageHeader } from '@/components/shared/page-header'
import { INITIAL_ROWS } from '@/lib/example-data'
import { cn } from '@/lib/utils'

export const Route = createFileRoute('/_auth/examples/vxe-table/edit-cell')({
  component: Page,
})

function Page() {
  return (
    <>
      <PageHeader
        eyebrow={<span>示例 › Vxe 表格 › 单元格编辑 · 点击即改</span>}
        title="单元格编辑"
        description="点击可编辑单元格进入编辑态：Enter/失焦提交、Esc 取消；改过的单元格打黄点标记。"
      />
      <EditCellTable />
    </>
  )
}

type EditableKey = 'name' | 'concurrency' | 'priority'

interface EditRow {
  id: string
  name: string
  status: string
  owner: string
  concurrency: number
  priority: 'P0' | 'P1' | 'P2'
}

const PRIORITY_OPTIONS: EditRow['priority'][] = ['P0', 'P1', 'P2']

const INITIAL: EditRow[] = INITIAL_ROWS.map((r, i) => ({
  id: r.id,
  name: r.name,
  status: r.status,
  owner: r.owner,
  concurrency: 4 + (i % 5) * 4,
  priority: i % 3 === 0 ? 'P0' : i % 3 === 1 ? 'P1' : 'P2',
}))

const COLS: { key: EditableKey; label: string; width: string }[] = [
  { key: 'name', label: '任务', width: 'w-[220px]' },
  { key: 'concurrency', label: '并发数', width: 'w-[110px]' },
  { key: 'priority', label: '优先级', width: 'w-[110px]' },
]

function EditCellTable() {
  const [rows, setRows] = React.useState<EditRow[]>(INITIAL)
  const [editing, setEditing] = React.useState<{ id: string; key: EditableKey } | null>(null)
  const [draft, setDraft] = React.useState('')
  const [touched, setTouched] = React.useState<Set<string>>(new Set())
  const inputRef = React.useRef<HTMLInputElement | HTMLSelectElement>(null)

  React.useEffect(() => {
    if (editing) inputRef.current?.focus()
  }, [editing])

  const begin = (row: EditRow, key: EditableKey) => {
    setEditing({ id: row.id, key })
    setDraft(String(row[key]))
  }

  const commit = (cancel = false) => {
    if (!editing) return
    if (!cancel) {
      const { id, key } = editing
      setRows((rs) =>
        rs.map((r) => {
          if (r.id !== id) return r
          if (key === 'concurrency') {
            const n = Number(draft)
            return Number.isFinite(n) && n >= 0 ? { ...r, concurrency: Math.round(n) } : r
          }
          if (key === 'priority') return { ...r, priority: draft as EditRow['priority'] }
          return draft.trim() ? { ...r, name: draft.trim() } : r
        }),
      )
      setTouched((s) => new Set(s).add(`${id}:${key}`))
    }
    setEditing(null)
  }

  return (
    <DemoBlock
      id="vxe-edit-cell"
      title="任务列表（单元格编辑）"
      desc="点「任务 / 并发数 / 优先级」列任意单元格编辑；文本与数字用输入框，优先级用下拉"
      code={`// 编辑态只存「行 id + 列 key」，输入值放 draft：
const [editing, setEditing] = useState<{ id, key } | null>(null)
onKeyDown: Enter → commit()；Escape → commit(true 取消)
onBlur → commit()        // 失焦也提交
// 提交后把 \`\${id}:\${key}\` 加进 touched 集合 → 单元格打黄点`}
    >
      <div className="mb-3 flex items-center gap-3">
        <span className="text-[10.5px] text-soft">已修改 {touched.size} 个单元格</span>
        <Button
          size="sm"
          variant="outline"
          className="ml-auto"
          disabled={touched.size === 0}
          onClick={() => {
            setRows(INITIAL)
            setTouched(new Set())
            setEditing(null)
            toast.info('已还原全部修改')
          }}
        >
          还原数据
        </Button>
      </div>

      <div className="overflow-hidden rounded-lg border border-line">
        <table className="w-full text-[11.5px]">
          <thead>
            <tr className="border-b border-line bg-canvas/50 text-left text-soft">
              <th className="px-4 py-2.5 font-medium">ID</th>
              {COLS.map((c) => (
                <th key={c.key} className={cn('border-l border-line px-4 py-2.5 font-medium', c.width)}>
                  {c.label}
                </th>
              ))}
              <th className="border-l border-line px-4 py-2.5 font-medium">状态</th>
              <th className="border-l border-line px-4 py-2.5 font-medium">负责人</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="border-b border-line/60 last:border-0">
                <td className="px-4 py-2.5 font-mono text-[10.5px] text-soft">{row.id}</td>
                {COLS.map((c) => {
                  const isEditing = editing?.id === row.id && editing.key === c.key
                  const dirty = touched.has(`${row.id}:${c.key}`)
                  return (
                    <td
                      key={c.key}
                      className={cn('relative border-l border-line px-4 py-2.5', !isEditing && 'cursor-pointer hover:bg-hover/50')}
                      onClick={() => !isEditing && begin(row, c.key)}
                    >
                      {isEditing ? (
                        c.key === 'priority' ? (
                          <select
                            name="edit-cell-value"
                            ref={inputRef as React.RefObject<HTMLSelectElement>}
                            value={draft}
                            onChange={(e) => setDraft(e.target.value)}
                            onBlur={() => commit()}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') commit()
                              if (e.key === 'Escape') commit(true)
                            }}
                            className="h-7 w-full rounded-md border border-brand-500 bg-surface px-2 text-[11.5px] text-ink outline-none ring-2 ring-brand-500/15"
                          >
                            {PRIORITY_OPTIONS.map((p) => (
                              <option key={p} value={p}>{p}</option>
                            ))}
                          </select>
                        ) : (
                          <input
                            name="edit-cell-value"
                            ref={inputRef as React.RefObject<HTMLInputElement>}
                            value={draft}
                            type={c.key === 'concurrency' ? 'number' : 'text'}
                            onChange={(e) => setDraft(e.target.value)}
                            onBlur={() => commit()}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') commit()
                              if (e.key === 'Escape') commit(true)
                            }}
                            className="h-7 w-full rounded-md border border-brand-500 bg-surface px-2 text-[11.5px] text-ink outline-none ring-2 ring-brand-500/15"
                          />
                        )
                      ) : (
                        <span className={cn(c.key === 'name' ? 'font-medium text-ink' : 'text-muted')}>
                          {c.key === 'priority' ? (
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
                          ) : (
                            row[c.key]
                          )}
                        </span>
                      )}
                      {dirty && !isEditing ? (
                        <span title="已修改" className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-amber-400" />
                      ) : null}
                    </td>
                  )
                })}
                <td className="border-l border-line px-4 py-2.5"><StatusBadge status={row.status} /></td>
                <td className="border-l border-line px-4 py-2.5 text-muted">{row.owner}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </DemoBlock>
  )
}
