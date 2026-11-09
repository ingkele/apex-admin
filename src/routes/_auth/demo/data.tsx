import * as React from 'react'
import { createFileRoute } from '@tanstack/react-router'
import type { ColumnDef } from '@tanstack/react-table'
import { Layers, Sparkles, Users, X } from 'lucide-react'
import { Badge, StatusBadge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Pagination } from '@/components/ui/pagination'
import { Skeleton, TableSkeleton } from '@/components/ui/skeleton'
import { DataTable } from '@/components/shared/data-table'
import { DemoBlock } from '@/components/shared/demo-block'
import { EmptyState } from '@/components/shared/empty-state'
import { PageHeader } from '@/components/shared/page-header'
import { MiniStat } from '@/components/shared/stat-tile'

export const Route = createFileRoute('/_auth/demo/data')({
  component: Page,
})


interface DemoRow {
  id: string
  name: string
  status: string
  owner: string
  updatedAt: string
}

const DEMO_ROWS: DemoRow[] = [
  { id: 't1', name: '文档向量化 · 批次 04', status: 'running', owner: '陈昊', updatedAt: '11-08 14:32' },
  { id: 't2', name: '客服问答模型微调', status: 'success', owner: '林晓', updatedAt: '11-08 11:05' },
  { id: 't3', name: '周报摘要生成', status: 'failed', owner: '周可', updatedAt: '11-07 22:18' },
  { id: 't4', name: '知识库增量同步', status: 'queued', owner: '苏禾', updatedAt: '11-07 20:44' },
]

const DEMO_COLUMNS: ColumnDef<DemoRow, unknown>[] = [
  {
    accessorKey: 'name',
    header: '任务名称',
    cell: ({ row }) => <span className="text-[12.5px] font-medium text-ink">{row.original.name}</span>,
  },
  {
    accessorKey: 'status',
    header: '状态',
    cell: ({ row }) => <StatusBadge status={row.original.status} />,
  },
  {
    accessorKey: 'owner',
    header: '提交人',
    cell: ({ row }) => <span className="text-[12px] text-muted">{row.original.owner}</span>,
  },
  {
    accessorKey: 'updatedAt',
    header: '更新时间',
    cell: ({ row }) => <span className="text-[12px] tabular-nums text-muted">{row.original.updatedAt}</span>,
  },
]

function Page() {
  const [page, setPage] = React.useState(1)

  return (
    <>
      <PageHeader
        eyebrow={<span>演示 › 数据展示 · 统计卡、表格与状态占位</span>}
        title="数据展示"
        description="统计卡、表格、分页、骨架屏与空状态五件套，列表页按这套组合拼装即可。"
      />

      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-12">
          <DemoBlock
            id="demo-data"
            title="数据展示 Data Display"
            desc="统计卡 / 卡片 / 表格 / 分页 / 骨架屏 / 空状态六件套"
            code={`<MiniStat label="在线服务" value={8} unit="个" icon={<Layers />} boxed />
<DataTable columns={cols} data={rows} total={24} page={1} pageSize={10} />
<Pagination page={p} pageSize={10} total={24} onPageChange={setP} />
<TableSkeleton rows={4} cols={4} />
<EmptyState title="暂无任务" description="…" />`}
          >
            <div className="grid grid-cols-4 gap-3">
              <MiniStat label="在线服务" value={8} unit="个 · 全部就绪" icon={<Layers className="h-3.5 w-3.5" />} boxed dot tone="brand" />
              <MiniStat label="今日任务" value="1,284" unit="+12.4%" icon={<Sparkles className="h-3.5 w-3.5" />} boxed tone="green" />
              <MiniStat label="失败任务" value={18} unit="6 个待处理" icon={<X className="h-3.5 w-3.5" />} boxed tone="rose" />
              <MiniStat label="活跃成员" value={42} unit="过去 30 天" icon={<Users className="h-3.5 w-3.5" />} boxed tone="slate" size="lg" />
            </div>

            <div className="mt-4 grid grid-cols-3 gap-4">
              <Card className="col-span-2 overflow-hidden">
                <CardHeader>
                  <CardTitle>表格 + 分页</CardTitle>
                  <span className="text-[10.5px] text-soft">TanStack Table 封装</span>
                </CardHeader>
                <DataTable bare columns={DEMO_COLUMNS} data={DEMO_ROWS} total={24} page={page} pageSize={10} />
                <div className="border-t border-line px-4 py-3">
                  <Pagination page={page} pageSize={10} total={24} onPageChange={setPage} />
                </div>
              </Card>

              <div className="space-y-4">
                <Card className="overflow-hidden">
                  <CardHeader>
                    <CardTitle>骨架屏</CardTitle>
                    <span className="text-[10.5px] text-soft">加载占位</span>
                  </CardHeader>
                  <TableSkeleton rows={3} cols={3} />
                </Card>
                <Card className="overflow-hidden">
                  <CardHeader>
                    <CardTitle>空状态</CardTitle>
                    <Badge variant="gray">Empty</Badge>
                  </CardHeader>
                  <EmptyState
                    compact
                    title="暂无匹配的任务"
                    description="调整筛选条件或清空关键词后重试"
                    action={
                      <Button size="sm" variant="outline">
                        清空筛选
                      </Button>
                    }
                  />
                </Card>
                <Card className="overflow-hidden">
                  <CardHeader>
                    <CardTitle>卡片骨架</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                  </CardContent>
                </Card>
              </div>
            </div>
          </DemoBlock>
        </div>
      </div>
    </>
  )
}
