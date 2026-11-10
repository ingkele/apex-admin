import * as React from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { ArrowLeftRight } from 'lucide-react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { AppSwitch } from '@/components/ui/switch'
import { DemoBlock } from '@/components/shared/demo-block'
import { Field } from '@/components/shared/form-kit'
import { PageHeader } from '@/components/shared/page-header'

export const Route = createFileRoute('/_auth/examples/form/value-format')({
  component: Page,
})

function Page() {
  return (
    <>
      <PageHeader
        eyebrow={<span>示例 › 表单 › 值格式化 · 界面值 ↔ 存储值</span>}
        title="值格式化"
        description="界面展示格式与接口存储格式分离：左侧是用户看到的值，右侧是实时转换后的提交载荷，支持反向回填。"
      />
      <FormatDemo />
    </>
  )
}

/** 存储格式：金额=分、标签=数组、日期=毫秒时间戳、开关=Y/N */
interface Store {
  amountFen: number
  tags: string[]
  dueAt: number
  active: 'Y' | 'N'
}

/** 存储值 → 界面值（回填用） */
function toUI(s: Store) {
  return {
    amount: (s.amountFen / 100).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ','),
    tags: s.tags.join('，'),
    due: new Date(s.dueAt).toISOString().slice(0, 10),
    active: s.active === 'Y',
  }
}

const INITIAL: Store = {
  amountFen: 123456,
  tags: ['合同', '高优', 'Q4'],
  dueAt: new Date('2026-12-31').getTime(),
  active: 'Y',
}

function FormatDemo() {
  const [ui, setUI] = React.useState(() => toUI(INITIAL))

  /** 界面值 → 存储值（提交前转换） */
  const store: Store = {
    amountFen: Math.round(Number(ui.amount.replace(/,/g, '')) * 100) || 0,
    tags: ui.tags.split(/[，,]/).map((t) => t.trim()).filter(Boolean),
    dueAt: ui.due ? new Date(ui.due).getTime() : 0,
    active: ui.active ? 'Y' : 'N',
  }

  return (
    <div className="grid grid-cols-12 gap-4">
      <div className="col-span-7">
        <DemoBlock
          id="form-format-ui"
          title="界面值（用户输入）"
          desc="用户按人类习惯输入：千分位金额、中文逗号标签、日期选择器、开关"
          code={`// 提交前：界面值 → 存储值
amountFen = Math.round(Number(ui.amount.replace(/,/g, '')) * 100)
tags      = ui.tags.split(/[，,]/).map((t) => t.trim()).filter(Boolean)
dueAt     = new Date(ui.due).getTime()
active    = ui.active ? 'Y' : 'N'`}
        >
          <div className="grid grid-cols-2 gap-x-4">
            <Field label="合同金额" hint="千分位展示，存储为「分」">
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[11.5px] text-soft">¥</span>
                <Input
                  aria-label="合同金额"
                  value={ui.amount}
                  onChange={(e) => setUI((u) => ({ ...u, amount: e.target.value }))}
                  className="pl-7"
                />
              </div>
            </Field>
            <Field label="截止日期" hint="日期控件，存储为毫秒时间戳">
              <Input type="date" value={ui.due} onChange={(e) => setUI((u) => ({ ...u, due: e.target.value }))} />
            </Field>
            <Field label="标签" hint="支持中文/英文逗号分隔，存储为数组" className="col-span-2">
              <Input value={ui.tags} onChange={(e) => setUI((u) => ({ ...u, tags: e.target.value }))} />
            </Field>
            <Field label="启用" hint="布尔值，存储为 Y / N 枚举">
              <div className="pt-1.5">
                <AppSwitch checked={ui.active} onCheckedChange={(v) => setUI((u) => ({ ...u, active: v }))} />
              </div>
            </Field>
          </div>

          <div className="mt-2 flex justify-end border-t border-line pt-4">
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setUI(toUI(INITIAL))
                toast.info('已按存储值回填界面值')
              }}
            >
              <ArrowLeftRight className="h-3.5 w-3.5" /> 回填演示（存储 → 界面）
            </Button>
          </div>
        </DemoBlock>
      </div>

      <div className="col-span-5">
        <Card className="overflow-hidden">
          <CardHeader>
            <CardTitle>提交载荷（存储值）</CardTitle>
            <Badge variant="green">实时转换</Badge>
          </CardHeader>
          <pre className="overflow-x-auto px-5 py-4 text-[11px] leading-relaxed text-muted">
            <code>{JSON.stringify(store, null, 2)}</code>
          </pre>
          <div className="border-t border-line px-5 py-3 text-[10.5px] leading-relaxed text-soft">
            界面「{ui.amount || '0'}」→ 存储 {store.amountFen}（分）；
            标签拆出 {store.tags.length} 个元素；日期转 {store.dueAt}；开关映射 {store.active}。
          </div>
        </Card>
      </div>
    </div>
  )
}
