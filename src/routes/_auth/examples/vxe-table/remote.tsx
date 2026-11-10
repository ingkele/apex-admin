import * as React from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { Loader2, RefreshCw } from 'lucide-react'
import { StatusBadge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { DemoBlock } from '@/components/shared/demo-block'
import { PageHeader } from '@/components/shared/page-header'
import { INITIAL_ROWS, type RecordRow } from '@/lib/example-data'
import { cn } from '@/lib/utils'

export const Route = createFileRoute('/_auth/examples/vxe-table/remote')({
  component: Page,
})

function Page() {
  return (
    <>
      <PageHeader
        eyebrow={<span>示例 › Vxe 表格 › 远程加载 · 分页 + loading + 失败重试</span>}
        title="远程加载"
        description="模拟服务端分页：翻页重新拉取、加载中遮罩、失败可重试，请求过期自动丢弃。"
      />
      <RemoteTable />
    </>
  )
}

const PAGE_SIZE = 4

/** 模拟接口：700ms 延迟分页返回，failNext 为 true 时抛错 */
function fetchPage(page: number, fail: boolean): Promise<{ list: RecordRow[]; total: number }> {
  return new Promise((resolve, reject) =>
    setTimeout(() => {
      if (fail) return reject(new Error('HTTP 500'))
      const all = [...INITIAL_ROWS, ...INITIAL_ROWS.map((r) => ({ ...r, id: r.id + '_b' }))]
      resolve({
        list: all.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
        total: all.length,
      })
    }, 700),
  )
}

function RemoteTable() {
  const [page, setPage] = React.useState(1)
  const [rows, setRows] = React.useState<RecordRow[]>([])
  const [total, setTotal] = React.useState(0)
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState(false)
  const [failNext, setFailNext] = React.useState(false)
  const reqSeq = React.useRef(0)

  const load = (p: number, fail = failNext) => {
    const seq = ++reqSeq.current
    setLoading(true)
    setError(false)
    fetchPage(p, fail)
      .then((res) => {
        if (seq !== reqSeq.current) return // 过期响应丢弃
        setRows(res.list)
        setTotal(res.total)
        setLoading(false)
      })
      .catch(() => {
        if (seq !== reqSeq.current) return
        setError(true)
        setLoading(false)
      })
  }

  React.useEffect(() => {
    load(page)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page])

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  return (
    <DemoBlock
      id="vxe-remote"
      title="远程分页表格"
      desc="每页 4 条模拟接口 700ms；勾选「模拟失败」后刷新走失败路径"
      code={`const load = (p, fail) => {
  const seq = ++reqSeq.current
  setLoading(true)
  fetchPage(p, fail).then((res) => {
    if (seq !== reqSeq.current) return // 翻页快过响应时丢弃过期数据
    setRows(res.list); setTotal(res.total); setLoading(false)
  }).catch(() => { … setError(true) })
}
useEffect(() => { load(page) }, [page])`}
    >
      <div className="mb-3 flex items-center justify-between">
        <label className="flex cursor-pointer items-center gap-2 text-[11px] text-muted">
          <input type="checkbox" checked={failNext} onChange={(e) => setFailNext(e.target.checked)} className="accent-rose-600" />
          模拟失败（下一次请求返回 500）
        </label>
        <Button size="sm" variant="outline" onClick={() => load(page)}>
          <RefreshCw className="h-3.5 w-3.5" /> 刷新
        </Button>
      </div>

      <div className="relative overflow-hidden rounded-lg border border-line">
        <table className="w-full text-[11.5px]">
          <thead>
            <tr className="border-b border-line bg-canvas/50 text-left text-soft">
              <th className="px-4 py-2.5 font-medium">ID</th>
              <th className="px-4 py-2.5 font-medium">任务</th>
              <th className="px-4 py-2.5 font-medium">状态</th>
              <th className="px-4 py-2.5 font-medium">负责人</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="border-b border-line/60 last:border-0 hover:bg-hover/50">
                <td className="px-4 py-2.5 font-mono text-[10.5px] text-soft">{row.id}</td>
                <td className="px-4 py-2.5 font-medium text-ink">{row.name}</td>
                <td className="px-4 py-2.5"><StatusBadge status={row.status} /></td>
                <td className="px-4 py-2.5 text-muted">{row.owner}</td>
              </tr>
            ))}
            {error ? (
              <tr>
                <td colSpan={4} className="px-4 py-10 text-center">
                  <p className="text-[12px] text-rose-600 dark:text-rose-400">加载失败（模拟 HTTP 500）</p>
                  <Button size="sm" variant="outline" className="mt-2" onClick={() => load(page, false)}>
                    <RefreshCw className="h-3.5 w-3.5" /> 重试
                  </Button>
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>

        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-surface/60 backdrop-blur-[1px]">
            <span className="flex items-center gap-2 text-[11.5px] text-muted">
              <Loader2 className="h-4 w-4 animate-spin" /> 加载中…
            </span>
          </div>
        ) : null}
      </div>

      <div className="mt-3 flex items-center justify-between">
        <span className="text-[11px] text-soft">共 {total} 条 · 第 {page}/{totalPages} 页</span>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" disabled={page <= 1 || loading} onClick={() => setPage((p) => p - 1)}>
            上一页
          </Button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPage(p)}
              className={cn(
                'h-8 w-8 rounded-md text-[11px] transition-colors',
                p === page ? 'bg-brand-600 text-white' : 'border border-line text-muted hover:bg-hover',
              )}
            >
              {p}
            </button>
          ))}
          <Button size="sm" variant="outline" disabled={page >= totalPages || loading} onClick={() => setPage((p) => p + 1)}>
            下一页
          </Button>
        </div>
      </div>
    </DemoBlock>
  )
}
