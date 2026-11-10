import * as React from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { Star } from 'lucide-react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { DemoBlock } from '@/components/shared/demo-block'
import { Field, check, rules } from '@/components/shared/form-kit'
import { PageHeader } from '@/components/shared/page-header'
import { cn } from '@/lib/utils'

export const Route = createFileRoute('/_auth/examples/form/custom')({
  component: Page,
})

function Page() {
  return (
    <>
      <PageHeader
        eyebrow={<span>示例 › 表单 › 自定义组件 · value / onChange 协议</span>}
        title="自定义组件"
        description="自定义控件只要遵守 value / onChange 协议就能接入表单：色板、评分、滑块三个手写控件实例。"
      />
      <CustomDemo />
    </>
  )
}

/** 颜色选择器 —— 受控 chips 色板 */
function ColorPicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const colors = ['#2563eb', '#16a34a', '#d97706', '#dc2626', '#7c3aed', '#0891b2', '#334155']
  return (
    <div className="flex flex-wrap gap-2">
      {colors.map((c) => (
        <button
          key={c}
          type="button"
          aria-label={`颜色 ${c}`}
          onClick={() => onChange(c)}
          className={cn(
            'h-7 w-7 rounded-full border-2 transition-transform',
            value === c ? 'scale-110 border-ink' : 'border-transparent hover:scale-105',
          )}
          style={{ background: c }}
        />
      ))}
    </div>
  )
}

/** 评分星级 —— 1-5 星，支持半星清除 */
function StarRating({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button key={n} type="button" aria-label={`${n} 星`} onClick={() => onChange(value === n ? 0 : n)}>
          <Star
            className={cn(
              'h-5 w-5 transition-colors',
              n <= value ? 'fill-amber-400 text-amber-400' : 'text-slate-300 dark:text-slate-600',
            )}
          />
        </button>
      ))}
      <span className="ml-2 text-[11px] text-soft">{value ? `${value} 星` : '未评分'}</span>
    </div>
  )
}

/** 滑块 —— 原生 range 打底 + 轨道着色 */
function Slider({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex items-center gap-3">
      <input
        type="range"
        min={0}
        max={100}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-1.5 w-[220px] cursor-pointer appearance-none rounded-full bg-slate-200 accent-brand-600 dark:bg-slate-700"
      />
      <span className="w-10 text-right font-mono text-[11px] text-ink">{value}%</span>
    </div>
  )
}

function CustomDemo() {
  const [form, setForm] = React.useState({ name: '', color: '#2563eb', stars: 3, quota: 60 })
  const [submitted, setSubmitted] = React.useState<Record<string, unknown> | null>(null)

  const errs = { name: check(form.name, [rules.required('请输入项目名称')]) }
  const valid = !errs.name

  return (
    <div className="grid grid-cols-12 gap-4">
      <div className="col-span-8">
        <DemoBlock
          id="form-custom"
          title="自定义控件接入表单"
          desc="三个手写控件都遵守 value / onChange 协议，和 Input 一样参与收集与校验"
          code={`// 接入协议：value + onChange，任何控件满足即可进表单
<ColorPicker value={form.color} onChange={(v) => setForm({ ...form, color: v })} />
<StarRating value={form.stars} onChange={(v) => setForm({ ...form, stars: v })} />
<Slider     value={form.quota} onChange={(v) => setForm({ ...form, quota: v })} />`}
        >
          <div className="grid grid-cols-2 gap-x-4">
            <Field label="项目名称" required error={errs.name} hint="自定义控件旁的普通输入框">
              <Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="如 星火计划" />
            </Field>
            <Field label="主题色" hint="色板控件，单选">
              <ColorPicker value={form.color} onChange={(v) => setForm((f) => ({ ...f, color: v }))} />
            </Field>
            <Field label="满意度" hint="星级控件，再点同星清除">
              <StarRating value={form.stars} onChange={(v) => setForm((f) => ({ ...f, stars: v }))} />
            </Field>
            <Field label="配额占用" hint="滑块控件，0-100%">
              <Slider value={form.quota} onChange={(v) => setForm((f) => ({ ...f, quota: v }))} />
            </Field>
          </div>

          <div className="mt-2 flex justify-end gap-2 border-t border-line pt-4">
            <Button size="sm" variant="outline" onClick={() => { setForm({ name: '', color: '#2563eb', stars: 3, quota: 60 }); setSubmitted(null) }}>
              重置
            </Button>
            <Button
              size="sm"
              onClick={() => {
                if (!valid) {
                  toast.error('请先修正表单中的错误')
                  return
                }
                setSubmitted(form)
                toast.success('已提交')
              }}
            >
              提交
            </Button>
          </div>
        </DemoBlock>
      </div>

      <div className="col-span-4">
        <Card className="overflow-hidden">
          <CardHeader>
            <CardTitle>收集结果</CardTitle>
            <Badge variant={submitted ? 'green' : 'gray'}>{submitted ? '已提交' : '待提交'}</Badge>
          </CardHeader>
          <pre className="overflow-x-auto px-5 py-4 text-[11px] leading-relaxed text-muted">
            <code>{submitted ? JSON.stringify(submitted, null, 2) : '// 提交后在这里查看'}</code>
          </pre>
        </Card>
      </div>
    </div>
  )
}
