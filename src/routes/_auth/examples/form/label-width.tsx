import * as React from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { Input } from '@/components/ui/input'
import { AppSelect } from '@/components/ui/select'
import { DemoBlock } from '@/components/shared/demo-block'
import { PageHeader } from '@/components/shared/page-header'
import { cn } from '@/lib/utils'

export const Route = createFileRoute('/_auth/examples/form/label-width')({
  component: Page,
})

function Page() {
  return (
    <>
      <PageHeader
        eyebrow={<span>示例 › 表单 › Label 自动宽度 · 三种标签排版</span>}
        title="Label 自动宽度"
        description="标签宽度三种策略对比：自动适配最长标签、固定宽度可调、标签置顶；同一份数据换排版。"
      />
      <div className="space-y-4">
        <AutoDemo />
        <FixedDemo />
        <TopDemo />
      </div>
    </>
  )
}

const ROWS = [
  { label: '名称', control: <Input defaultValue="订单同步任务" /> },
  { label: '负责人', control: <Input defaultValue="张三" /> },
  { label: '执行环境', control: <AppSelect value="prod" onValueChange={() => {}} options={[{ value: 'prod', label: '生产环境' }]} /> },
  { label: '任务描述', control: <Input defaultValue="每小时同步一次订单数据" /> },
]

/** ① 自动宽度：每个 label 按自身文本撑开，整列以最长 label 对齐 */
function AutoDemo() {
  return (
    <DemoBlock
      id="form-label-auto"
      title="自动宽度（auto）"
      desc="不设固定宽度，列宽由最长标签决定；适合标签长短不一的配置表单"
      code={`// 标签不定宽，flex 行内按内容撑开：
<div className="flex items-center gap-3">
  <label className="text-[11px] text-soft">…</label>
  {/* 列对齐：同列取最长 label 的宽度 */}
</div>`}
    >
      <div className="max-w-[480px] space-y-2.5">
        {ROWS.map((r) => (
          <div key={r.label} className="flex items-center gap-3">
            <label className="w-[64px] shrink-0 text-right text-[11px] text-soft">{r.label}</label>
            <div className="min-w-0 flex-1">{r.control}</div>
          </div>
        ))}
      </div>
    </DemoBlock>
  )
}

/** ② 固定宽度：按钮组切换 80 / 120 / 160 */
function FixedDemo() {
  const [w, setW] = React.useState(80)
  return (
    <DemoBlock
      id="form-label-fixed"
      title="固定宽度（px 可调）"
      desc="标签列定宽右对齐，切换宽度观察对齐线移动；适合标签可枚举的场景"
      code={`<label style={{ width: ${'$'}{w}px }} className="shrink-0 text-right">…</label>`}
    >
      <div className="mb-3 flex items-center gap-2">
        <span className="text-[11px] text-soft">标签宽度</span>
        {[80, 120, 160].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => setW(n)}
            className={cn(
              'rounded-md px-3 py-1 text-[11px] transition-colors',
              w === n ? 'bg-brand-600 text-white' : 'border border-line text-muted hover:bg-hover',
            )}
          >
            {n}px
          </button>
        ))}
      </div>
      <div className="max-w-[480px] space-y-2.5">
        {ROWS.map((r) => (
          <div key={r.label} className="flex items-center gap-3">
            <label style={{ width: w }} className="shrink-0 text-right text-[11px] text-soft">
              {r.label}
            </label>
            <div className="min-w-0 flex-1">{r.control}</div>
          </div>
        ))}
      </div>
    </DemoBlock>
  )
}

/** ③ 标签置顶 */
function TopDemo() {
  return (
    <DemoBlock
      id="form-label-top"
      title="标签置顶（top）"
      desc="标签在控件上方，控件占满整行；适合窄容器或移动端"
      code={`<div>
  <label className="block text-[11px]">…</label>
  <input className="mt-1.5 w-full" />
</div>`}
    >
      <div className="grid max-w-[480px] grid-cols-2 gap-x-4 gap-y-3">
        {ROWS.map((r) => (
          <div key={r.label}>
            <label className="block text-[11px] text-soft">{r.label}</label>
            <div className="mt-1.5">{r.control}</div>
          </div>
        ))}
      </div>
    </DemoBlock>
  )
}
