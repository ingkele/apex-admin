import { createFileRoute } from '@tanstack/react-router'
import * as React from 'react'
import { toast } from 'sonner'
import { RefreshCw, RotateCcw } from 'lucide-react'
import { useQueryClient } from '@tanstack/react-query'
import { Badge, StatusBadge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { DemoBlock } from '@/components/shared/demo-block'
import { PageHeader } from '@/components/shared/page-header'
import { useTaskActions, useTasks } from '@/api'

export const Route = createFileRoute('/_auth/demo/tanstack-query')({
  component: Page,
})

function Page() {
  const qc = useQueryClient()
  // ① 查询：组件挂载自动请求 + 缓存共享（同 key 的组件只发一次）
  const { data, isPending, isFetching, dataUpdatedAt, refetch } = useTasks({ page: 1, pageSize: 5 })
  // ② 变更：成功后 invalidate 同前缀缓存 → 上面的查询自动重取
  const { retry } = useTaskActions()
  const [lastInvalidated, setLastInvalidated] = React.useState<string | null>(null)

  const items = data?.items ?? []

  return (
    <>
      <PageHeader
        eyebrow={<span>演示 › 功能</span>}
        title="TanStack Query"
        description="服务端状态三件套：useQuery（缓存 + 自动重取）、useMutation（变更）、invalidateQueries（精准失效）。"
      />

      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-7">
          <DemoBlock
            title="① useQuery · 服务端状态"
            desc="首次挂载发请求，同 queryKey 的组件共享缓存；refetch 手动重取"
            code={`const { data, isPending, isFetching, refetch } = useTasks({ page: 1, pageSize: 5 })

// queryKey = ['tasks', { page: 1, pageSize: 5 }]
// 参数变 → key 变 → 自动重新请求（无需 useEffect）`}
          >
            <div className="mb-3 flex flex-wrap items-center gap-2">
              {isPending ? <Badge variant="gray">pending · 首次加载</Badge> : <Badge variant="green">success</Badge>}
              {isFetching ? <Badge variant="amber">fetching · 网络中</Badge> : null}
              <Button variant="outline" size="sm" onClick={() => void refetch()}>
                <RefreshCw className="h-3 w-3" />
                手动 refetch
              </Button>
            </div>
            <div className="overflow-hidden rounded-lg border border-line">
              <table className="w-full text-[12px]">
                <thead>
                  <tr className="border-b border-line bg-canvas text-left text-[11px] text-soft">
                    <th className="px-3 py-2 font-medium">任务</th>
                    <th className="px-3 py-2 font-medium">状态</th>
                    <th className="px-3 py-2 font-medium text-right">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((t) => (
                    <tr key={t.id} className="border-b border-line/60 last:border-0">
                      <td className="px-3 py-2 text-ink">{t.name}</td>
                      <td className="px-3 py-2"><StatusBadge status={t.status} /></td>
                      <td className="px-3 py-2 text-right">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            retry.mutate(t.id, {
                              onSuccess: () => {
                                setLastInvalidated(t.id)
                                toast.success(`已重试并自动刷新列表（${t.id}）`)
                              },
                            })
                          }}
                        >
                          <RotateCcw className="h-3 w-3" />
                          重试
                        </Button>
                      </td>
                    </tr>
                  ))}
                  {isPending ? (
                    <tr>
                      <td colSpan={3} className="px-3 py-6 text-center text-[11.5px] text-soft">
                        加载中…
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>
            <p className="mt-3 text-[10.5px] text-soft">
              最近一次数据更新：{dataUpdatedAt ? new Date(dataUpdatedAt).toLocaleTimeString() : '—'}
            </p>
          </DemoBlock>
        </div>

        <div className="col-span-5 space-y-4">
          <DemoBlock
            title="② useMutation + 失效"
            desc="变更成功后 invalidate 同前缀缓存，所有订阅该数据的组件自动重取"
          >
            <div className="space-y-2.5 text-[12px] leading-relaxed text-muted">
              <p>
                点左侧表格任意行的「重试」→ <code className="font-mono">POST /tasks/:id/retry</code> 成功后
                invalidate <code className="font-mono">['tasks']</code> 前缀 → 表格与工作台统计同时刷新。
              </p>
              {lastInvalidated ? (
                <div className="rounded-lg border border-line bg-canvas px-3 py-2 font-mono text-[11px] text-ink">
                  最近重试：{lastInvalidated} · 已触发自动重取
                </div>
              ) : null}
            </div>
          </DemoBlock>

          <Card className="p-5">
            <div className="flex items-center justify-between">
              <div className="text-[13px] font-semibold text-ink">缓存观察</div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  qc.invalidateQueries()
                  toast.success('已失效全部缓存')
                }}
              >
                失效全部
              </Button>
            </div>
            <div className="mt-2.5 rounded-lg border border-line bg-canvas px-3 py-2.5 font-mono text-[11px] leading-relaxed text-muted">
              tasks 缓存条数：
              {qc.getQueryCache().getAll().filter((q) => q.queryKey[0] === 'tasks').length}
              <br />
              全部缓存条数：{qc.getQueryCache().getAll().length}
            </div>
            <p className="mt-2.5 text-[10.5px] leading-relaxed text-soft">
              hooks 的 queryKey 统一登记在 <code className="font-mono">src/api/query-keys.ts</code>，
              跨模块失效（如重试后刷新工作台徽标）直接引用 <code className="font-mono">qk.tasks</code> 前缀。
            </p>
          </Card>
        </div>
      </div>
    </>
  )
}
