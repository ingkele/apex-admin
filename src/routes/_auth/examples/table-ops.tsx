import * as React from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { toast } from 'sonner'
import { DemoBlock } from '@/components/shared/demo-block'
import { PageHeader } from '@/components/shared/page-header'
import { StatusBadge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { cn } from '@/lib/utils'
import { INITIAL_ROWS, type RecordRow } from '@/lib/example-data'
import { ChevronDown, ChevronRight, Copy, Eye, MoreHorizontal, Pencil, Trash2 } from 'lucide-react'

export const Route = createFileRoute('/_auth/examples/table-ops')({
  component: Page,
})

function Page() {
  return (
    <>
      <PageHeader
        eyebrow={<span>示例 › 表格操作 · 行操作 / 批量选择 / 行展开</span>}
        title="表格操作"
        description="行内操作列、批量选择与行展开三种高频表格交互；操作列固定右侧，危险操作走二次确认。"
      />
      <TableOpsDemo />
    </>
  )
}

function TableOpsDemo() {
  const [rows, setRows] = React.useState<RecordRow[]>(INITIAL_ROWS)
  const [checked, setChecked] = React.useState<Set<string>>(new Set())
  const [expanded, setExpanded] = React.useState<Set<string>>(new Set(['task_2b7e04dd']))
  const [menuRow, setMenuRow] = React.useState<RecordRow | null>(null)
  const [pendingDelete, setPendingDelete] = React.useState<RecordRow[] | null>(null)

  const allChecked = rows.length > 0 && checked.size === rows.length
  const someChecked = checked.size > 0 && !allChecked
  const headerRef = React.useRef<HTMLInputElement>(null)
  React.useEffect(() => {
    if (headerRef.current) headerRef.current.indeterminate = someChecked
  }, [someChecked])

  const toggleAll = () => {
    setChecked(allChecked ? new Set() : new Set(rows.map((r) => r.id)))
  }
  const toggleOne = (id: string) => {
    setChecked((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }
  const toggleExpand = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const deleteRows = (targets: RecordRow[]) => {
    setRows((prev) => prev.filter((r) => !targets.some((t) => t.id === r.id)))
    setChecked((prev) => {
      const next = new Set(prev)
      targets.forEach((t) => next.delete(t.id))
      return next
    })
    toast.success(`已删除 ${targets.length} 条记录`)
  }

  const selectedRows = rows.filter((r) => checked.has(r.id))

  return (
    <div className="space-y-4">
      <DemoBlock
        id="table-ops-row"
        title="行操作列"
        desc="操作列固定右侧：主要操作直接放，次要操作收进「更多」下拉"
        code={`<td className="sticky right-0">
  <Button size="sm" variant="ghost">编辑</Button>
  <MoreMenu items={[
    { label: '复制 ID', icon: Copy },
    { label: '删除', icon: Trash2, danger: true },
  ]} />
</td>`}
      >
        <div className="overflow-hidden rounded-lg border border-line">
          <table className="w-full text-[11.5px]">
            <thead>
              <tr className="border-b border-line bg-canvas/40 text-left text-soft">
                <th className="w-9 px-3 py-2.5"></th>
                <th className="px-3 py-2.5 font-medium">任务</th>
                <th className="px-3 py-2.5 font-medium">类型</th>
                <th className="px-3 py-2.5 font-medium">状态</th>
                <th className="px-3 py-2.5 font-medium">负责人</th>
                <th className="px-3 py-2.5 text-right font-medium">操作</th>
              </tr>
            </thead>
            <tbody>
              {rows.slice(0, 5).map((row) => {
                const open = expanded.has(row.id)
                return (
                  <React.Fragment key={row.id}>
                    <tr className="border-b border-line/60 transition-colors hover:bg-hover/50">
                      <td className="px-3 py-2">
                        <button
                          type="button"
                          onClick={() => toggleExpand(row.id)}
                          className="rounded p-0.5 text-soft transition hover:bg-hover hover:text-ink"
                          aria-label={open ? '收起详情' : '展开详情'}
                        >
                          {open ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
                        </button>
                      </td>
                      <td className="px-3 py-2">
                        <div className="font-medium text-ink">{row.name}</div>
                        <div className="font-mono text-[9.5px] text-soft">{row.id}</div>
                      </td>
                      <td className="px-3 py-2 text-muted">{row.type}</td>
                      <td className="px-3 py-2"><StatusBadge status={row.status} /></td>
                      <td className="px-3 py-2 text-muted">{row.owner}</td>
                      <td className="px-3 py-2">
                        <div className="flex items-center justify-end gap-1">
                          <Button size="sm" variant="ghost" className="h-7 px-2 text-[11px]" onClick={() => toast.info(`编辑 ${row.name}`)}>
                            <Pencil className="h-3 w-3" /> 编辑
                          </Button>
                          <Button size="sm" variant="ghost" className="h-7 px-2 text-[11px]" onClick={() => toast.info(`预览 ${row.name}`)}>
                            <Eye className="h-3 w-3" /> 预览
                          </Button>
                          <MoreMenu
                            trigger={
                              <Button size="sm" variant="ghost" className="h-7 w-7 p-0" aria-label="更多操作">
                                <MoreHorizontal className="h-3.5 w-3.5" />
                              </Button>
                            }
                            items={[
                              { label: '复制 ID', icon: Copy, onSelect: () => toast.success(`已复制 ${row.id}`) },
                              { label: '删除', icon: Trash2, danger: true, onSelect: () => setPendingDelete([row]) },
                            ]}
                          />
                        </div>
                      </td>
                    </tr>
                    {open ? (
                      <tr className="border-b border-line/60 bg-canvas/30">
                        <td></td>
                        <td colSpan={5} className="px-3 py-2.5">
                          <div className="flex flex-wrap gap-x-6 gap-y-1 text-[10.5px] text-muted">
                            <span>创建时间：<b className="text-ink">{row.createdAt}</b></span>
                            <span>执行节点：<b className="text-ink">worker-cn-south-0{row.id.length % 3 + 1}</b></span>
                            <span>重试次数：<b className="text-ink">{row.status === 'failed' ? 2 : 0}</b></span>
                            <span>备注：<b className="text-ink">{row.type}流水线自动派发</b></span>
                          </div>
                        </td>
                      </tr>
                    ) : null}
                  </React.Fragment>
                )
              })}
            </tbody>
          </table>
        </div>
      </DemoBlock>

      <DemoBlock
        id="table-ops-batch"
        title="批量选择"
        desc="表头全选（含半选态）+ 批量操作条；选中行高亮，清空即收起"
        code={`const allChecked = checked.size === rows.length
headerRef.current.indeterminate = someChecked // 半选
// 批量条：选中 N 条 → 批量删除 / 导出 / 清空`}
      >
        <div
          className={cn(
            'mb-3 flex items-center gap-3 overflow-hidden rounded-lg border px-4 transition-all',
            checked.size > 0
              ? 'h-11 border-brand-200 bg-brand-50 dark:border-brand-500/30 dark:bg-brand-500/10'
              : 'h-0 border-transparent opacity-0',
          )}
        >
          <span className="text-[11.5px] text-brand-700 dark:text-brand-300">
            已选 <b>{checked.size}</b> 条
          </span>
          <Button size="sm" variant="outline" className="h-7 px-2.5 text-[11px]" disabled={!checked.size} onClick={() => toast.info(`导出 ${checked.size} 条`)}>
            批量导出
          </Button>
          <Button size="sm" variant="danger" className="h-7 px-2.5 text-[11px]" disabled={!checked.size} onClick={() => setPendingDelete(selectedRows)}>
            <Trash2 className="h-3 w-3" /> 批量删除
          </Button>
          <button type="button" className="ml-auto text-[11px] text-brand-600 hover:underline dark:text-brand-400" onClick={() => setChecked(new Set())}>
            清空选择
          </button>
        </div>

        <div className="overflow-hidden rounded-lg border border-line">
          <table className="w-full text-[11.5px]">
            <thead>
              <tr className="border-b border-line bg-canvas/40 text-left text-soft">
                <th className="w-10 px-3 py-2.5">
                  <input
                    id="table-ops-select-all"
                    ref={headerRef}
                    type="checkbox"
                    checked={allChecked}
                    onChange={toggleAll}
                    className="h-3.5 w-3.5 rounded border-slate-300 accent-brand-600"
                    aria-label="全选"
                  />
                </th>
                <th className="px-3 py-2.5 font-medium">任务</th>
                <th className="px-3 py-2.5 font-medium">状态</th>
                <th className="px-3 py-2.5 font-medium">负责人</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => {
                const isChecked = checked.has(row.id)
                return (
                  <tr
                    key={row.id}
                    onClick={() => toggleOne(row.id)}
                    className={cn(
                      'cursor-pointer border-b border-line/60 transition-colors last:border-0',
                      isChecked ? 'bg-brand-50/60 dark:bg-brand-500/10' : 'hover:bg-hover/50',
                    )}
                  >
                    <td className="px-3 py-2" onClick={(e) => e.stopPropagation()}>
                      <input
                        name="table-ops-row"
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleOne(row.id)}
                        className="h-3.5 w-3.5 rounded border-slate-300 accent-brand-600"
                        aria-label={`选择 ${row.name}`}
                      />
                    </td>
                    <td className="px-3 py-2 font-medium text-ink">{row.name}</td>
                    <td className="px-3 py-2"><StatusBadge status={row.status} /></td>
                    <td className="px-3 py-2 text-muted">{row.owner}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-[10.5px] leading-relaxed text-muted">
          表头复选框三态：全选 / 半选（<code className="mx-1 rounded bg-surface px-1 py-0.5 text-[10px] text-ink">indeterminate</code>）/ 未选；
          整行可点选，点复选框不触发行点击（stopPropagation）。
        </p>
      </DemoBlock>

      <ConfirmDialog
        open={pendingDelete !== null}
        onOpenChange={(v) => !v && setPendingDelete(null)}
        title={`确认删除 ${pendingDelete?.length ?? 0} 条记录？`}
        description="删除后执行记录与产物将一并清除，且不可恢复。"
        confirmText="确认删除"
        onConfirm={() => pendingDelete && deleteRows(pendingDelete)}
      />
    </div>
  )
}

/** 「更多」下拉菜单 —— 点外部 / Esc 关闭，支持危险项红字 */
function MoreMenu({
  trigger,
  items,
}: {
  trigger: React.ReactNode
  items: { label: string; icon: React.ComponentType<{ className?: string }>; danger?: boolean; onSelect: () => void }[]
}) {
  const [open, setOpen] = React.useState(false)
  const wrapRef = React.useRef<HTMLDivElement>(null)
  React.useEffect(() => {
    if (!open) return
    const onDown = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('mousedown', onDown)
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('mousedown', onDown)
      window.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <div ref={wrapRef} className="relative">
      <span onClick={() => setOpen((v) => !v)} className="inline-flex">{trigger}</span>
      {open ? (
        <div className="absolute right-0 top-full z-30 mt-1 w-[136px] rounded-lg border border-line bg-surface py-1 shadow-pop">
          {items.map((item) => (
            <button
              key={item.label}
              type="button"
              onClick={() => {
                item.onSelect()
                setOpen(false)
              }}
              className={cn(
                'flex w-full items-center gap-2 px-3 py-1.5 text-left text-[11px] transition-colors hover:bg-hover',
                item.danger ? 'text-rose-600 dark:text-rose-400' : 'text-ink',
              )}
            >
              <item.icon className="h-3.5 w-3.5" />
              {item.label}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  )
}
