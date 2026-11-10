import * as React from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { Check } from 'lucide-react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import { Input, Label, Textarea } from '@/components/ui/input'
import { AppSelect } from '@/components/ui/select'
import { PageHeader } from '@/components/shared/page-header'
import { cn } from '@/lib/utils'

export const Route = createFileRoute('/_auth/examples/form/validation')({
  component: Page,
})

function Page() {
  return (
    <>
      <PageHeader
        eyebrow={<span>示例 › 表单 › 表单校验 · 即时校验 + 提交载荷预览</span>}
        title="表单校验"
        description="校验规则与提交按钮联动：错误信息贴在对应字段下方，提交后右侧实时显示请求载荷。"
      />

      <FormDemo />
    </>
  )
}

function FormDemo() {
  const [name, setName] = React.useState('')
  const [type, setType] = React.useState('doc')
  const [model, setModel] = React.useState('gpt-4o')
  const [concurrency, setConcurrency] = React.useState('8')
  const [remark, setRemark] = React.useState('')
  const [submitted, setSubmitted] = React.useState<Record<string, string> | null>(null)

  const errors = {
    name: !name.trim() ? '任务名称不能为空' : name.trim().length < 4 ? '名称至少 4 个字符' : '',
    concurrency: Number(concurrency) < 1 || Number(concurrency) > 64 ? '并发数需在 1 - 64 之间' : '',
    remark: remark.length > 120 ? '备注不超过 120 字' : '',
  }
  const valid = !errors.name && !errors.concurrency && !errors.remark

  return (
    <div className="grid grid-cols-12 gap-4">
      <Card className="col-span-8 overflow-hidden">
        <CardHeader>
          <CardTitle>任务配置表单</CardTitle>
          <Badge variant={valid ? 'green' : 'amber'}>{valid ? '校验通过' : '存在校验错误'}</Badge>
        </CardHeader>
        <div className="space-y-4 p-5">
          <div className="grid grid-cols-2 gap-x-4 gap-y-4">
            <div>
              <Label>
                任务名称 <span className="text-rose-500">*</span>
              </Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="至少 4 个字符"
                className={cn(errors.name && 'border-rose-400 focus:border-rose-500 focus:ring-rose-500/15')}
              />
              <p className={cn('mt-1 text-[10.5px]', errors.name ? 'text-rose-600 dark:text-rose-400' : 'text-soft')}>
                {errors.name || '用于在任务列表中辨识，建议包含业务对象'}
              </p>
            </div>
            <div>
              <Label>任务类型</Label>
              <AppSelect
                value={type}
                onValueChange={setType}
                options={[
                  { value: 'doc', label: '文档处理' },
                  { value: 'finetune', label: '模型微调' },
                  { value: 'extract', label: '信息抽取' },
                ]}
              />
              <p className="mt-1 text-[10.5px] text-soft">类型决定默认的执行参数模板</p>
            </div>
            <div>
              <Label>执行模型</Label>
              <AppSelect
                value={model}
                onValueChange={setModel}
                options={[
                  { value: 'gpt-4o', label: 'gpt-4o' },
                  { value: 'qwen-max', label: 'qwen-max' },
                  { value: 'deepseek-v3', label: 'deepseek-v3' },
                ]}
              />
            </div>
            <div>
              <Label>
                并发数 <span className="text-rose-500">*</span>
              </Label>
              <div className="relative">
                <Input
                  value={concurrency}
                  onChange={(e) => setConcurrency(e.target.value.replace(/[^\d]/g, ''))}
                  className={cn('pr-16', errors.concurrency && 'border-rose-400 focus:border-rose-500 focus:ring-rose-500/15')}
                />
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[11.5px] text-soft">
                  个 / 工作区
                </span>
              </div>
              <p className={cn('mt-1 text-[10.5px]', errors.concurrency ? 'text-rose-600 dark:text-rose-400' : 'text-soft')}>
                {errors.concurrency || '上限 64，超出后任务排队'}
              </p>
            </div>
            <div className="col-span-2">
              <Label>备注</Label>
              <Textarea
                value={remark}
                onChange={(e) => setRemark(e.target.value)}
                placeholder="补充输入数据来源、预期产物与验收标准…"
              />
              <p className={cn('mt-1 text-[10.5px]', errors.remark ? 'text-rose-600 dark:text-rose-400' : 'text-soft')}>
                {errors.remark || `已输入 ${remark.length} / 120 字`}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 border-t border-line pt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setName('')
                setRemark('')
                setConcurrency('8')
                setSubmitted(null)
              }}
            >
              重置
            </Button>
            <Button
              size="sm"
              onClick={() => {
                if (!valid) {
                  toast.error('请先修正表单中的错误')
                  return
                }
                setSubmitted({ name, type, model, concurrency, remark: remark || '（无）' })
                toast.success('表单校验通过，已提交')
              }}
            >
              提交任务
            </Button>
          </div>
        </div>
      </Card>

      <div className="col-span-4 space-y-4">
        <Card className="overflow-hidden">
          <CardHeader>
            <CardTitle>提交结果</CardTitle>
            <Badge variant="gray">JSON</Badge>
          </CardHeader>
          <pre className="overflow-x-auto px-5 py-4 text-[11px] leading-relaxed text-muted">
            <code>{submitted ? JSON.stringify(submitted, null, 2) : '// 提交后在这里查看载荷'}</code>
          </pre>
        </Card>
        <Card className="overflow-hidden">
          <CardHeader>
            <CardTitle>校验规则</CardTitle>
          </CardHeader>
          <div className="space-y-2 px-5 py-4 text-[11.5px] text-muted">
            {[
              '名称为空 → 必填提示',
              '名称少于 4 字 → 长度提示',
              '并发数非数字 → 输入时过滤',
              '并发数越界 → 范围提示',
              '备注超 120 字 → 长度提示',
            ].map((rule) => (
              <div key={rule} className="flex items-start gap-2">
                <Check className="mt-0.5 h-3 w-3 shrink-0 text-emerald-500" />
                <span>{rule}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}
