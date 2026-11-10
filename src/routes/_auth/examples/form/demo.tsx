import * as React from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { Check, ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Input, Textarea } from '@/components/ui/input'
import { AppSelect } from '@/components/ui/select'
import { AppSwitch } from '@/components/ui/switch'
import { DemoBlock } from '@/components/shared/demo-block'
import { Field, check, rules } from '@/components/shared/form-kit'
import { PageHeader } from '@/components/shared/page-header'
import { cn } from '@/lib/utils'

export const Route = createFileRoute('/_auth/examples/form/demo')({
  component: Page,
})

function Page() {
  return (
    <>
      <PageHeader
        eyebrow={<span>示例 › 表单 › Demo · 分步向导综合演练</span>}
        title="Demo"
        description="把前面各页的能力串起来：分步向导 + 每步校验拦截 + 确认页汇总 + 提交载荷预览。"
      />
      <WizardDemo />
    </>
  )
}

const STEPS = ['基础信息', '成员与配额', '确认提交']

function WizardDemo() {
  const [step, setStep] = React.useState(0)
  const [info, setInfo] = React.useState({ name: '', code: 'WS-001', env: 'prod', desc: '' })
  const [quota, setQuota] = React.useState({ members: '5', storage: '20', monitor: true, channels: ['email'] as string[] })
  const [done, setDone] = React.useState<Record<string, unknown> | null>(null)

  const errs = {
    name: check(info.name, [rules.required('请输入工作区名称'), rules.minLen(2)]),
    desc: check(info.desc, [rules.maxLen(200)]),
    members: check(quota.members, [rules.required('请输入成员数'), rules.range(1, 50)]),
    storage: check(quota.storage, [rules.required('请输入存储配额'), rules.range(1, 500)]),
  }
  const stepValid = [
    !errs.name && !errs.desc,
    !errs.members && !errs.storage && quota.channels.length > 0,
    true,
  ]

  const next = () => {
    if (!stepValid[step]) {
      toast.error('当前步骤还有未通过的校验')
      return
    }
    setStep((s) => Math.min(s + 1, STEPS.length - 1))
  }
  const prev = () => setStep((s) => Math.max(s - 1, 0))

  const submit = () => {
    setDone({ info, quota })
    toast.success('工作区创建成功（演示）')
  }

  return (
    <DemoBlock
      id="form-demo-wizard"
      title="创建工作区（三步向导）"
      desc="每步独立校验拦截下一步；最后一步汇总确认；提交后展示合并载荷"
      code={`// 向导骨架：step 状态 + 每步校验数组
const stepValid = [校验第 1 步, 校验第 2 步, true]
next: if (!stepValid[step]) 拦截; else setStep(step + 1)
// 确认页只读展示已填值 → submit 合并 info + quota`}
    >
      {/* 步骤条 */}
      <div className="mb-6 flex items-center">
        {STEPS.map((title, i) => (
          <React.Fragment key={title}>
            <div className="flex items-center gap-2">
              <div
                className={cn(
                  'flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-semibold transition-colors',
                  i < step ? 'bg-emerald-500 text-white' : i === step ? 'bg-brand-600 text-white' : 'bg-slate-100 text-soft dark:bg-slate-800',
                )}
              >
                {i < step ? <Check className="h-3.5 w-3.5" /> : i + 1}
              </div>
              <span className={cn('text-[12px]', i === step ? 'font-semibold text-ink' : 'text-soft')}>{title}</span>
            </div>
            {i < STEPS.length - 1 ? <div className={cn('mx-3 h-px w-16', i < step ? 'bg-emerald-400' : 'bg-line')} /> : null}
          </React.Fragment>
        ))}
      </div>

      {/* 步骤内容 */}
      {step === 0 ? (
        <div className="grid grid-cols-2 gap-x-4">
          <Field label="工作区名称" required error={errs.name} hint="2-32 个字符">
            <Input value={info.name} onChange={(e) => setInfo((s) => ({ ...s, name: e.target.value }))} placeholder="如 北极星项目" />
          </Field>
          <Field label="工作区编码" hint="系统预分配">
            <Input value={info.code} onChange={(e) => setInfo((s) => ({ ...s, code: e.target.value }))} />
          </Field>
          <Field label="运行环境">
            <AppSelect
              value={info.env}
              onValueChange={(v) => setInfo((s) => ({ ...s, env: v }))}
              options={[
                { value: 'prod', label: '生产' },
                { value: 'staging', label: '预发' },
                { value: 'dev', label: '开发' },
              ]}
            />
          </Field>
          <Field label="描述" error={errs.desc} hint={`${info.desc.length} / 200 字`} className="col-span-2">
            <Textarea value={info.desc} onChange={(e) => setInfo((s) => ({ ...s, desc: e.target.value }))} placeholder="这个工作区用来做什么" />
          </Field>
        </div>
      ) : step === 1 ? (
        <div className="grid grid-cols-2 gap-x-4">
          <Field label="成员上限" required error={errs.members} hint="1 - 50 人">
            <Input value={quota.members} onChange={(e) => setQuota((s) => ({ ...s, members: e.target.value.replace(/[^\d]/g, '') }))} />
          </Field>
          <Field label="存储配额（GB）" required error={errs.storage} hint="1 - 500 GB">
            <Input value={quota.storage} onChange={(e) => setQuota((s) => ({ ...s, storage: e.target.value.replace(/[^\d]/g, '') }))} />
          </Field>
          <Field label="监控告警">
            <div className="pt-1.5">
              <AppSwitch checked={quota.monitor} onCheckedChange={(v) => setQuota((s) => ({ ...s, monitor: v }))} />
            </div>
          </Field>
          <Field label="通知渠道" required hint={quota.channels.length ? `已选 ${quota.channels.length} 项` : '至少选一项'}>
            <div className="flex flex-wrap gap-4 pt-1.5">
              {[
                { k: 'email', label: '邮件' },
                { k: 'sms', label: '短信' },
                { k: 'wecom', label: '企业微信' },
              ].map((c) => (
                <Checkbox
                  key={c.k}
                  checked={quota.channels.includes(c.k)}
                  onCheckedChange={() =>
                    setQuota((s) => ({
                      ...s,
                      channels: s.channels.includes(c.k) ? s.channels.filter((x) => x !== c.k) : [...s.channels, c.k],
                    }))
                  }
                  label={c.label}
                />
              ))}
            </div>
          </Field>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          <Card className="overflow-hidden">
            <CardHeader>
              <CardTitle>基础信息</CardTitle>
              <Badge variant="gray">第 1 步</Badge>
            </CardHeader>
            <div className="space-y-1.5 px-5 py-4 text-[11.5px] text-muted">
              <p>名称：<span className="text-ink">{info.name || '—'}</span></p>
              <p>编码：<span className="text-ink">{info.code}</span></p>
              <p>环境：<span className="text-ink">{info.env}</span></p>
              <p>描述：<span className="text-ink">{info.desc || '—'}</span></p>
            </div>
          </Card>
          <Card className="overflow-hidden">
            <CardHeader>
              <CardTitle>成员与配额</CardTitle>
              <Badge variant="gray">第 2 步</Badge>
            </CardHeader>
            <div className="space-y-1.5 px-5 py-4 text-[11.5px] text-muted">
              <p>成员上限：<span className="text-ink">{quota.members} 人</span></p>
              <p>存储配额：<span className="text-ink">{quota.storage} GB</span></p>
              <p>监控告警：<span className="text-ink">{quota.monitor ? '开' : '关'}</span></p>
              <p>通知渠道：<span className="text-ink">{quota.channels.join('、') || '—'}</span></p>
            </div>
          </Card>
        </div>
      )}

      {/* 底部操作 */}
      <div className="mt-5 flex items-center justify-between border-t border-line pt-4">
        <Button size="sm" variant="ghost" onClick={() => { setStep(0); setDone(null); setInfo({ name: '', code: 'WS-001', env: 'prod', desc: '' }); setQuota({ members: '5', storage: '20', monitor: true, channels: ['email'] }) }}>
          <RotateCcw className="h-3.5 w-3.5" /> 重来
        </Button>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={prev} disabled={step === 0}>
            <ChevronLeft className="h-3.5 w-3.5" /> 上一步
          </Button>
          {step < STEPS.length - 1 ? (
            <Button size="sm" onClick={next}>
              下一步 <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          ) : (
            <Button size="sm" onClick={submit}>
              <Check className="h-3.5 w-3.5" /> 确认提交
            </Button>
          )}
        </div>
      </div>

      {done ? (
        <pre className="mt-4 overflow-x-auto rounded-lg border border-line bg-canvas px-4 py-3 text-[11px] leading-relaxed text-muted">
          <code>{JSON.stringify(done, null, 2)}</code>
        </pre>
      ) : null}
    </DemoBlock>
  )
}
