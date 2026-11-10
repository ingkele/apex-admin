import * as React from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { StatusBadge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { DemoBlock } from '@/components/shared/demo-block'
import { PageHeader } from '@/components/shared/page-header'
import { toast } from 'sonner'

export const Route = createFileRoute('/_auth/examples/vxe-table/fixed')({
  component: Page,
})

function Page() {
  return (
    <>
      <PageHeader
        eyebrow={<span>示例 › Vxe 表格 › 固定表头/列 · sticky 布局</span>}
        title="固定表头/列"
        description="宽表横向滚动：表头吸顶、首列固定左侧、操作列固定右侧；容器限高纵向滚动。"
      />
      <FixedTable />
    </>
  )
}

const COLS = ['任务', '类型', '状态', '负责人', '优先级', '并发数', '耗时', '重试', '创建时间', '更新时间']

const ROWS = Array.from({ length: 12 }, (_, i) => ({
  id: `task_${(1000 + i).toString(16)}`,
  name: ['产品手册向量化', '客服问答微调', '周报摘要生成', '知识库增量同步', '合同信息抽取', '质检图片打标', '日志异常聚类', '发票识别批处理', '舆情日报', '库存预测', '工单分派', '文档翻译'][i],
  type: ['文档处理', '模型微调', '文本生成', '数据同步', '信息抽取', '图像处理', '数据分析', '信息抽取', '文本生成', '数据分析', '文本生成', '文档处理'][i],
  status: ['running', 'success', 'failed', 'queued', 'success', 'running', 'success', 'cancelled', 'success', 'queued', 'running', 'success'][i],
  owner: ['陈昊', '林晓', '周可', '苏禾', '赵岚', '王宁', '李思', '陈昊', '林晓', '周可', '苏禾', '赵岚'][i],
  priority: i % 3 === 0 ? 'P0' : i % 3 === 1 ? 'P1' : 'P2',
  concurrency: 4 + (i % 5) * 4,
  cost: `${(i * 13) % 60}m${(i * 7) % 60}s`,
  retry: i % 4,
  createdAt: `11-0${(i % 7) + 1} 1${i % 9}:2${i % 6}`,
  updatedAt: `11-0${(i % 7) + 2} 0${i % 9}:1${i % 6}`,
}))

function FixedTable() {
  return (
    <DemoBlock
      id="vxe-fixed"
      title="全量字段宽表（sticky）"
      desc="左右滑动看固定列效果，上下滑动看表头吸顶；固定单元格带阴影分界"
      code={`// 三处 sticky：
thead th        → sticky top-0 z-20        （表头吸顶）
首列 th/td      → sticky left-0 z-10       （左固定）
操作列 th/td    → sticky right-0 z-10      （右固定）
// 固定列需要不透明背景 + box-shadow 分界`}
    >
      <div className="max-h-[380px] overflow-auto rounded-lg border border-line">
        <table className="w-full min-w-[1100px] text-[11px]">
          <thead>
            <tr className="text-left text-soft">
              <th className="sticky left-0 top-0 z-20 bg-canvas px-3 py-2.5 font-medium shadow-[2px_0_4px_rgba(0,0,0,0.06)]">
                ID
              </th>
              {COLS.map((h, i) => (
                <th
                  key={h}
                  className={i === 0 ? 'sticky top-0 z-20 bg-canvas px-3 py-2.5 font-medium' : 'sticky top-0 z-10 bg-canvas px-3 py-2.5 font-medium'}
                >
                  {h}
                </th>
              ))}
              <th className="sticky right-0 top-0 z-20 bg-canvas px-3 py-2.5 font-medium shadow-[-2px_0_4px_rgba(0,0,0,0.06)]">
                操作
              </th>
            </tr>
          </thead>
          <tbody>
            {ROWS.map((r, idx) => (
              <tr key={r.id} className={idx % 2 === 1 ? 'bg-canvas/30' : 'bg-surface'}>
                <td className="sticky left-0 z-10 bg-inherit px-3 py-2 font-mono text-[10px] text-soft shadow-[2px_0_4px_rgba(0,0,0,0.06)]">
                  {r.id}
                </td>
                <td className="px-3 py-2 font-medium text-ink">{r.name}</td>
                <td className="px-3 py-2 text-muted">{r.type}</td>
                <td className="px-3 py-2"><StatusBadge status={r.status} /></td>
                <td className="px-3 py-2 text-muted">{r.owner}</td>
                <td className="px-3 py-2 text-muted">{r.priority}</td>
                <td className="px-3 py-2 text-muted">{r.concurrency}</td>
                <td className="px-3 py-2 text-muted">{r.cost}</td>
                <td className="px-3 py-2 text-muted">{r.retry}</td>
                <td className="px-3 py-2 text-muted">{r.createdAt}</td>
                <td className="px-3 py-2 text-muted">{r.updatedAt}</td>
                <td className="sticky right-0 z-10 bg-inherit px-3 py-2 shadow-[-2px_0_4px_rgba(0,0,0,0.06)]">
                  <Button size="sm" variant="ghost" className="h-6 px-2 text-[10.5px]" onClick={() => toast.info(`查看 ${r.name}`)}>
                    详情
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </DemoBlock>
  )
}
